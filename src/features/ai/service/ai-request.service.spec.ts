import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

vi.mock('@/features/ai/repository/ai-result.repository', () => ({
  aiResultRepository: { findByCacheKey: vi.fn(), create: vi.fn(), findRecentByUserAndKind: vi.fn() },
}));
vi.mock('@/features/ai/repository/ai-usage.repository', () => ({
  aiUsageRepository: { findByUserAndDay: vi.fn(), reserve: vi.fn(), release: vi.fn() },
}));
vi.mock('@/features/membership/service/access.service', () => ({ getBillingAccessService: vi.fn() }));
vi.mock('@/shared/lib/openrouter', () => ({ openRouter: { isConfigured: true, generateJson: vi.fn() } }));

import { aiResultRepository } from '@/features/ai/repository/ai-result.repository';
import { aiUsageRepository } from '@/features/ai/repository/ai-usage.repository';
import { listSavedAiResultsService, runAiRequestService } from '@/features/ai/service/ai-request.service';
import { getBillingAccessService } from '@/features/membership/service/access.service';
import { openRouter } from '@/shared/lib/openrouter';

const schema = z.strictObject({ answer: z.string() });
const userId = new mongoose.Types.ObjectId().toString();
const request = {
  userId, kind: 'fitness-question' as const, scope: 'user' as const, cacheInput: 'how many sets?',
  label: 'How many sets?', schema, schemaName: 'answer', system: 'system', user: 'user',
};
const savedDoc = (result: string) => ({
  _id: new mongoose.Types.ObjectId(), userId, kind: 'fitness-question', cacheKey: 'k', label: 'How many sets?',
  result, model: 'm', createdAt: new Date('2026-11-14T10:00:00Z'), updatedAt: new Date(),
});

const access = (plan: 'free' | 'premium') =>
  vi.mocked(getBillingAccessService).mockResolvedValue({ data: { plan } as never, status: 200 });

describe('runAiRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    access('free');
    vi.mocked(aiUsageRepository.findByUserAndDay).mockResolvedValue(null);
    vi.mocked(aiResultRepository.findByCacheKey).mockResolvedValue(null);
    vi.mocked(aiUsageRepository.reserve).mockResolvedValue({ count: 1 } as never);
    vi.mocked(openRouter.generateJson).mockResolvedValue({ ok: true, data: { answer: '3 sets' }, model: 'm' });
  });

  it('returns a saved answer without spending a request or calling the model', async () => {
    vi.mocked(aiResultRepository.findByCacheKey).mockResolvedValue(savedDoc('{"answer":"saved"}') as never);

    const result = await runAiRequestService(request);

    expect(result).toEqual({ data: { source: 'saved', data: { answer: 'saved' }, usage: { used: 0, limit: 5 } }, status: 200 });
    expect(aiUsageRepository.reserve).not.toHaveBeenCalled();
    expect(openRouter.generateJson).not.toHaveBeenCalled();
  });

  it('calls the model, saves the validated result, and reports usage', async () => {
    const result = await runAiRequestService(request);

    expect(result).toEqual({ data: { source: 'ai', data: { answer: '3 sets' }, usage: { used: 1, limit: 5 } }, status: 200 });
    expect(aiResultRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId, kind: 'fitness-question', result: '{"answer":"3 sets"}' }));
  });

  it('gives Premium members the higher daily limit', async () => {
    access('premium');
    await runAiRequestService(request);
    expect(aiUsageRepository.reserve).toHaveBeenCalledWith(userId, expect.any(String), 50, expect.any(Date));
  });

  it('refuses with 429 once the daily limit is used up', async () => {
    vi.mocked(aiUsageRepository.reserve).mockRejectedValue(Object.assign(new Error('dup'), { code: 11000 }));

    const result = await runAiRequestService(request);

    expect(result).toEqual({ data: { error: 'AI_DAILY_LIMIT_REACHED' }, status: 429 });
    expect(openRouter.generateJson).not.toHaveBeenCalled();
  });

  it('refunds the request slot when the model fails', async () => {
    vi.mocked(openRouter.generateJson).mockResolvedValue({ ok: false, error: 'AI_TIMEOUT' });

    const result = await runAiRequestService(request);

    expect(result).toEqual({ data: { error: 'AI_TIMEOUT' }, status: 504 });
    expect(aiUsageRepository.release).toHaveBeenCalledWith(userId, expect.any(String));
    expect(aiResultRepository.create).not.toHaveBeenCalled();
  });

  it('stores shared results without a user id and keys them independently of the user', async () => {
    await runAiRequestService({ ...request, scope: 'global' });
    const otherUser = new mongoose.Types.ObjectId().toString();
    await runAiRequestService({ ...request, scope: 'global', userId: otherUser });

    const [first, second] = vi.mocked(aiResultRepository.create).mock.calls.map(([data]) => data);
    expect(first.userId).toBeUndefined();
    expect(first.cacheKey).toBe(second.cacheKey);
  });

  it('uses a different saved-answer key when the prompt changes', async () => {
    await runAiRequestService(request);
    await runAiRequestService({ ...request, system: 'updated system prompt' });

    const [first, second] = vi.mocked(aiResultRepository.create).mock.calls.map(([data]) => data.cacheKey);
    expect(first).not.toBe(second);
  });

  it('ignores a saved result that no longer matches the schema', async () => {
    vi.mocked(aiResultRepository.findByCacheKey).mockResolvedValue(savedDoc('{"wrong":true}') as never);
    const result = await runAiRequestService(request);
    expect(result.data).toMatchObject({ source: 'ai' });
  });
});

describe('listSavedAiResultsService', () => {
  it('returns only results that still validate, newest first as stored', async () => {
    vi.mocked(aiResultRepository.findRecentByUserAndKind).mockResolvedValue([
      savedDoc('{"answer":"one"}'), savedDoc('not json'),
    ] as never);

    const result = await listSavedAiResultsService(userId, 'fitness-question', schema);

    expect(result.status).toBe(200);
    expect(Array.isArray(result.data) && result.data.map((item) => item.data.answer)).toEqual(['one']);
  });
});

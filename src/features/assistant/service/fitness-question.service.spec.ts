import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/ai/service/ai-request.service', () => ({
  runAiRequestService: vi.fn(),
  getAiUsageService: vi.fn(),
  listSavedAiResultsService: vi.fn(),
}));
vi.mock('@/features/fitness/service/fitness-profile.service', () => ({ getFitnessProfileService: vi.fn() }));

import { getAiUsageService, listSavedAiResultsService, runAiRequestService } from '@/features/ai/service/ai-request.service';
import { askFitnessQuestionService, listFitnessQuestionsService } from '@/features/assistant/service/fitness-question.service';
import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';

const userId = '507f1f77bcf86cd799439011';
const answer = { answer: 'Aim for 2–3 sets.', keyPoints: ['Start light'], seeProfessional: false, followUpQuestions: [] };

describe('askFitnessQuestionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFitnessProfileService).mockResolvedValue({
      data: { goal: 'build-muscle', experience: 'beginner', availableEquipment: ['dumbbells', 'bodyweight'], trainingDaysPerWeek: 3, weightKg: 80, age: 30 },
      status: 200,
    } as never);
    vi.mocked(runAiRequestService).mockResolvedValue({ data: { source: 'ai', data: answer, usage: { used: 1, limit: 5 } }, status: 200 });
  });

  it('shares training context but never body measurements with the AI', async () => {
    await askFitnessQuestionService(userId, { question: 'How many sets should I do?' });

    const request = vi.mocked(runAiRequestService).mock.calls[0][0];
    expect(request.user).toContain('build-muscle');
    expect(request.user).not.toContain('80');
    expect(request.user).not.toContain('weightKg');
    expect(request).toMatchObject({ kind: 'fitness-question', scope: 'user' });
  });

  it('treats differently punctuated or cased repeats as the same saved question', async () => {
    await askFitnessQuestionService(userId, { question: 'How many sets should I do?' });
    await askFitnessQuestionService(userId, { question: '  how many   SETS should I do' });

    const [first, second] = vi.mocked(runAiRequestService).mock.calls.map(([call]) => call.cacheInput);
    expect(first).toBe(second);
  });

  it('returns the answer with the original question', async () => {
    const result = await askFitnessQuestionService(userId, { question: 'How many sets should I do?' });
    expect(result.data).toEqual({ source: 'ai', question: 'How many sets should I do?', answer, usage: { used: 1, limit: 5 } });
  });

  it('passes AI errors through', async () => {
    vi.mocked(runAiRequestService).mockResolvedValue({ data: { error: 'AI_PROVIDER_BUSY' }, status: 503 });
    expect(await askFitnessQuestionService(userId, { question: 'Is creatine safe?' })).toEqual({ data: { error: 'AI_PROVIDER_BUSY' }, status: 503 });
  });
});

describe('listFitnessQuestionsService', () => {
  it('returns saved questions with today\'s usage', async () => {
    vi.mocked(listSavedAiResultsService).mockResolvedValue({ data: [], status: 200 });
    vi.mocked(getAiUsageService).mockResolvedValue({ data: { used: 2, limit: 5 }, status: 200 });
    expect(await listFitnessQuestionsService(userId)).toEqual({ data: { history: [], usage: { used: 2, limit: 5 } }, status: 200 });
  });
});

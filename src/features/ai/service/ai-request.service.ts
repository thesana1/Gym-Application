import { createHash } from 'node:crypto';


import { aiResultRepository } from '@/features/ai/repository/ai-result.repository';
import { aiUsageRepository } from '@/features/ai/repository/ai-usage.repository';
import { AiResultDocument } from '@/features/ai/schema/ai-result.schema';
import { getBillingAccessService } from '@/features/membership/service/access.service';
import { AI_DAILY_LIMITS, AI_USAGE_RETENTION_MS, type AiRequestKind } from '@/shared/const/ai.const';
import { openRouter } from '@/shared/lib/openrouter';
import type { AiSource, AiUsage } from '@/shared/types/ai';
import type { ServiceResult } from '@/shared/types/common';

import type { z } from 'zod';

export type AiRequest<T> = {
  userId: string;
  kind: AiRequestKind;
  // 'global' results are shared by every user (no personal data in the prompt).
  scope: 'user' | 'global';
  // Canonical description of the request; identical keys return the saved result.
  cacheInput: string;
  label: string;
  schema: z.ZodType<T>;
  schemaName: string;
  system: string;
  user: string;
};

export type AiOutcome<T> = { source: Extract<AiSource, 'ai' | 'saved'>; data: T; usage: AiUsage };

export type SavedAiResult<T> = { id: string; label: string; createdAt: string; data: T };

const utcDay = () => new Date().toISOString().slice(0, 10);

// The system prompt is part of the key, so editing a prompt stops serving answers produced by the old one.
const buildCacheKey = (request: Pick<AiRequest<unknown>, 'kind' | 'scope' | 'userId' | 'cacheInput' | 'system'>) =>
  createHash('sha256')
    .update([request.kind, request.scope === 'user' ? request.userId : 'global', request.system, request.cacheInput].join('\n'))
    .digest('hex');

export const parseSavedResult = <T>(document: AiResultDocument, schema: z.ZodType<T>): SavedAiResult<T> | null => {
  try {
    const parsed = schema.safeParse(JSON.parse(document.result));
    if (!parsed.success) return null;
    return { id: document._id.toString(), label: document.label, createdAt: new Date(document.createdAt).toISOString(), data: parsed.data };
  } catch {
    return null;
  }
};

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;

export async function getAiUsageService(userId: string): Promise<ServiceResult<AiUsage>> {
  const access = await getBillingAccessService(userId);
  const limit = !('error' in access.data) && access.data.plan === 'premium' ? AI_DAILY_LIMITS.premium : AI_DAILY_LIMITS.free;
  const usage = await aiUsageRepository.findByUserAndDay(userId, utcDay());
  return { data: { used: usage?.count ?? 0, limit }, status: 200 };
}

export async function runAiRequestService<T>(request: AiRequest<T>): Promise<ServiceResult<AiOutcome<T>>> {
  const cacheKey = buildCacheKey(request);
  const current = await getAiUsageService(request.userId);
  if ('error' in current.data) return { data: current.data, status: current.status };
  const { limit } = current.data;

  const saved = await aiResultRepository.findByCacheKey(cacheKey);
  const savedResult = saved ? parseSavedResult(saved, request.schema) : null;
  if (savedResult) return { data: { source: 'saved', data: savedResult.data, usage: current.data }, status: 200 };

  if (!openRouter.isConfigured) return { data: { error: 'AI_NOT_CONFIGURED' }, status: 503 };

  const day = utcDay();
  let used: number;
  try {
    const reservation = await aiUsageRepository.reserve(request.userId, day, limit, new Date(Date.now() + AI_USAGE_RETENTION_MS));
    used = reservation?.count ?? limit;
  } catch (error) {
    if (isDuplicateKeyError(error)) return { data: { error: 'AI_DAILY_LIMIT_REACHED' }, status: 429 };
    throw error;
  }

  const result = await openRouter.generateJson({
    system: request.system,
    user: request.user,
    schema: request.schema,
    schemaName: request.schemaName,
  });
  if (!result.ok) {
    // Users are not charged for provider failures.
    await aiUsageRepository.release(request.userId, day);
    return { data: { error: result.error }, status: result.error === 'AI_TIMEOUT' ? 504 : 503 };
  }

  try {
    await aiResultRepository.create({
      userId: request.scope === 'user' ? request.userId : undefined,
      kind: request.kind,
      cacheKey,
      label: request.label.slice(0, 600),
      result: JSON.stringify(result.data),
      model: result.model,
    });
  } catch (error) {
    // A concurrent identical request already saved this answer.
    if (!isDuplicateKeyError(error)) throw error;
  }

  return { data: { source: 'ai', data: result.data, usage: { used, limit } }, status: 200 };
}

export async function listSavedAiResultsService<T>(
  userId: string,
  kind: AiRequestKind,
  schema: z.ZodType<T>,
  limit = 20
): Promise<ServiceResult<SavedAiResult<T>[]>> {
  const documents = await aiResultRepository.findRecentByUserAndKind(userId, kind, limit);
  const items = documents.map((document) => parseSavedResult(document, schema)).filter((item): item is SavedAiResult<T> => item !== null);
  return { data: items, status: 200 };
}

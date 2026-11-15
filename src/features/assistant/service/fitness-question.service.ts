import {
  getAiUsageService,
  listSavedAiResultsService,
  runAiRequestService,
  type SavedAiResult,
} from '@/features/ai/service/ai-request.service';
import {
  FitnessAnswerSchema,
  type FitnessAnswer,
  type FitnessQuestionRequestType,
} from '@/features/assistant/validations/fitness-question.validation';
import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';
import { AI_PROMPTS } from '@/shared/const/ai.const';
import type { AiSource, AiUsage } from '@/shared/types/ai';
import type { ServiceResult } from '@/shared/types/common';

export type FitnessAnswerResponse = { source: AiSource; question: string; answer: FitnessAnswer; usage: AiUsage };
export type FitnessQuestionHistory = { history: SavedAiResult<FitnessAnswer>[]; usage: AiUsage };

const normalizeQuestion = (question: string) => question.toLowerCase().replace(/\s+/g, ' ').replace(/[?!.\s]+$/, '').trim();

export async function askFitnessQuestionService(
  userId: string,
  input: FitnessQuestionRequestType
): Promise<ServiceResult<FitnessAnswerResponse>> {
  const profileResult = await getFitnessProfileService(userId);
  const profile = profileResult.data && !('error' in profileResult.data) ? profileResult.data : null;
  // Only training context is shared with the AI provider; body measurements stay private.
  const context = profile
    ? {
      goal: profile.goal,
      experience: profile.experience,
      availableEquipment: [...profile.availableEquipment].sort(),
      trainingDaysPerWeek: profile.trainingDaysPerWeek ?? null,
    }
    : null;

  const result = await runAiRequestService({
    userId,
    kind: 'fitness-question',
    scope: 'user',
    cacheInput: JSON.stringify({ question: normalizeQuestion(input.question), context }),
    label: input.question,
    schema: FitnessAnswerSchema,
    schemaName: 'fitness_answer',
    system: AI_PROMPTS.fitnessQuestion,
    user: `<user_input>${JSON.stringify({ question: input.question, profile: context })}</user_input>`,
  });
  if ('error' in result.data) return { data: result.data, status: result.status };
  return {
    data: { source: result.data.source, question: input.question, answer: result.data.data, usage: result.data.usage },
    status: 200,
  };
}

export async function listFitnessQuestionsService(userId: string): Promise<ServiceResult<FitnessQuestionHistory>> {
  const [history, usage] = await Promise.all([
    listSavedAiResultsService(userId, 'fitness-question', FitnessAnswerSchema, 20),
    getAiUsageService(userId),
  ]);
  if ('error' in history.data) return { data: history.data, status: history.status };
  if ('error' in usage.data) return { data: usage.data, status: usage.status };
  return { data: { history: history.data, usage: usage.data }, status: 200 };
}

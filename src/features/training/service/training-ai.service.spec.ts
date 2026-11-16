import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/ai/service/ai-request.service', () => ({ runAiRequestService: vi.fn(), getAiUsageService: vi.fn() }));
vi.mock('@/features/fitness/service/fitness-profile.service', () => ({ getFitnessProfileService: vi.fn() }));

import { getAiUsageService, runAiRequestService } from '@/features/ai/service/ai-request.service';
import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';
import { suggestTrainingPlanService } from '@/features/training/service/training-ai.service';

const priorities = { goal: 'muscle-building' as const, focusAreas: [], weekdays: [3, 1] };
const usage = { used: 1, limit: 5 };
const ai = (workouts: { name: string; exerciseIds: string[] }[]) =>
  vi.mocked(runAiRequestService).mockResolvedValue({ data: { source: 'ai', data: { summary: 'Two full body days.', workouts }, usage }, status: 200 } as never);

describe('suggestTrainingPlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFitnessProfileService).mockResolvedValue({ data: { experience: 'beginner', availableEquipment: [] } as never, status: 200 });
    vi.mocked(getAiUsageService).mockResolvedValue({ data: usage, status: 200 });
  });

  it('keeps AI structure but sets the numbers from research rules and the chosen days', async () => {
    ai([{ name: 'Day one', exerciseIds: ['push-up', 'bodyweight-squat'] }, { name: 'Day two', exerciseIds: ['reverse-lunge', 'push-up'] }]);
    const result = await suggestTrainingPlanService('user', priorities);
    expect(result.data).toMatchObject({ source: 'ai', summary: 'Two full body days.' });
    const plan = 'error' in result.data ? null : result.data.plan;
    expect(plan?.workouts.map(({ weekday }) => weekday)).toEqual([1, 3]);
    expect(plan?.workouts[0].exercises[0]).toEqual({ exerciseId: 'push-up', sets: 2, repMin: 8, repMax: 12, restSeconds: 90 });
  });

  it('drops exercises the person cannot do and falls back when too few are left', async () => {
    ai([{ name: 'A', exerciseIds: ['barbell-bench-press', 'made-up'] }, { name: 'B', exerciseIds: ['push-up', 'step-up'] }]);
    const result = await suggestTrainingPlanService('user', priorities);
    expect(result.data).toMatchObject({ source: 'library', notice: 'AI_INVALID_OUTPUT' });
  });

  it('builds a library plan when the AI is unavailable', async () => {
    vi.mocked(runAiRequestService).mockResolvedValue({ data: { error: 'AI_PROVIDER_BUSY' }, status: 503 });
    const result = await suggestTrainingPlanService('user', priorities);
    expect(result.data).toMatchObject({ source: 'library', notice: 'AI_PROVIDER_BUSY', usage });
  });

  it('asks for a profile first', async () => {
    vi.mocked(getFitnessProfileService).mockResolvedValue({ data: null, status: 200 });
    expect(await suggestTrainingPlanService('user', priorities)).toEqual({ data: { error: 'PROFILE_REQUIRED' }, status: 409 });
  });
});

import { describe, expect, it } from 'vitest';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import { summarizeWeek } from '@/features/training/service/training-week.service';

const workout = (id: string, weekday: number) => ({ id, name: id, weekday, exercises: [] });
const plan = { goal: 'general-fitness' as const, focusAreas: [], source: 'manual' as const, workouts: [workout('mon', 1), workout('wed', 3), workout('fri', 5)] };
const log = (date: Date): WorkoutLog => ({ id: date.toISOString(), title: 'x', completedAt: date.toISOString(), exercises: [] });
const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

describe('summarizeWeek', () => {
  it('marks done, missed, today and coming-up days from Monday to Sunday', () => {
    const now = at(2026, 11, 18); // Wednesday
    const week = summarizeWeek(plan, [log(at(2026, 11, 16))], now);
    expect(week.days.map(({ status }) => status)).toEqual(['done', 'rest', 'today', 'rest', 'upcoming', 'rest', 'rest']);
    expect(week).toMatchObject({ done: 1, planned: 3, streakWeeks: 0 });
  });

  it('counts missed workouts and extra workouts on rest days', () => {
    const week = summarizeWeek(plan, [log(at(2026, 11, 17))], at(2026, 11, 20));
    expect(week.days[0].status).toBe('missed');
    expect(week.days[1].status).toBe('extra');
  });

  it('counts full weeks in a row, and rest days never break the streak', () => {
    const lastWeek = [at(2026, 11, 9), at(2026, 11, 11), at(2026, 11, 13)].map(log);
    expect(summarizeWeek(plan, lastWeek, at(2026, 11, 16)).streakWeeks).toBe(1);
  });
});

describe('summarizeWeek with linked logs and a new plan', () => {
  it('counts a plan workout done on a different day of the same week', () => {
    const moved: WorkoutLog = { ...log(at(2026, 11, 17)), planWorkoutId: 'mon' };
    const week = summarizeWeek(plan, [moved], at(2026, 11, 18));
    expect(week.days[0].status).toBe('done');
    expect(week.days[1].status).toBe('rest');
    expect(week.done).toBe(1);
  });

  it('does not mark days before the plan was made as missed or count them', () => {
    const week = summarizeWeek(plan, [], at(2026, 11, 20), at(2026, 11, 19).toISOString());
    expect(week.days.slice(0, 5).map(({ status }) => status)).toEqual(['before', 'rest', 'before', 'rest', 'today']);
    expect(week).toMatchObject({ done: 0, planned: 1 });
  });
});

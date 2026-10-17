import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  summarizeWeeklyConsistency,
  WeeklyConsistencyCard,
} from '@/features/dashboard/components/weekly-consistency-card';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { NutritionEntry } from '@/features/nutrition/service/nutrition.service';

describe('summarizeWeeklyConsistency', () => {
  it('counts logged workouts and entries across the last seven local days', () => {
    const now = new Date('2025-02-16T12:00:00');
    const workouts: WorkoutLog[] = [
      {
        id: 'w1',
        title: 'Leg day',
        completedAt: '2025-02-12T12:30:00Z',
        exercises: [],
      },
      {
        id: 'w2',
        title: 'Upper day',
        completedAt: '2025-02-14T15:00:00Z',
        exercises: [],
      },
      {
        id: 'w3',
        title: 'Cardio',
        completedAt: '2025-02-16T07:00:00Z',
        exercises: [],
      },
    ];
    const entries: NutritionEntry[] = [
      { id: 'e1', date: '2025-02-10', mealType: 'breakfast', foodName: 'Oats', calories: 300, proteinGrams: 10, carbohydrateGrams: 40, fatGrams: 6, fiberGrams: 4 },
      { id: 'e2', date: '2025-02-12', mealType: 'lunch', foodName: 'Chicken rice', calories: 700, proteinGrams: 40, carbohydrateGrams: 70, fatGrams: 12, fiberGrams: 5 },
      { id: 'e3', date: '2025-02-15', mealType: 'dinner', foodName: 'Salmon', calories: 600, proteinGrams: 35, carbohydrateGrams: 20, fatGrams: 18, fiberGrams: 3 },
      { id: 'e4', date: '2025-02-16', mealType: 'snack', foodName: 'Yogurt', calories: 200, proteinGrams: 15, carbohydrateGrams: 10, fatGrams: 3, fiberGrams: 1 },
    ];

    const summary = summarizeWeeklyConsistency({ workouts, entries, now });

    expect(summary.workoutDays).toBe(3);
    expect(summary.nutritionDays).toBe(4);
    expect(summary.overlapDays).toBe(2);
    expect(summary.days[0].key).toBe('2025-02-10');
    expect(summary.days[6].key).toBe('2025-02-16');
  });

  it('renders a weekly consistency summary for the current local week', () => {
    const now = new Date('2025-02-16T12:00:00');
    const workouts: WorkoutLog[] = [
      {
        id: 'w1',
        title: 'Leg day',
        completedAt: '2025-02-14T12:00:00Z',
        exercises: [],
      },
    ];
    const entries: NutritionEntry[] = [
      {
        id: 'e1',
        date: '2025-02-14',
        mealType: 'lunch',
        foodName: 'Chicken',
        calories: 600,
        proteinGrams: 35,
        carbohydrateGrams: 20,
        fatGrams: 12,
        fiberGrams: 5,
      },
    ];

    render(<WeeklyConsistencyCard workouts={workouts} entries={entries} now={now} />);

    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getAllByText('1/7 days')).toHaveLength(2);
    expect(
      screen.getByText('1 day included both a logged workout and a food/water entry.')
    ).toBeInTheDocument();
  });
});

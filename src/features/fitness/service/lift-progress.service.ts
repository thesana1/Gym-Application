import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';

export type LiftPoint = { date: string; value: number };

export type LiftProgress = {
  exerciseId: string;
  exerciseName: string;
  // Lifts with any saved weight are tracked in kg; bodyweight moves are tracked in reps.
  unit: 'kg' | 'reps';
  points: LiftPoint[];
  first: number;
  best: number;
  latest: number;
  gain: number;
  gainPercent: number;
};

const toDateKey = (iso: string) => {
  const date = new Date(iso);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};

type Session = { date: string; topKg: number; topReps: number };

// One point per day: the heaviest set (or most reps for bodyweight moves) that day.
export const buildLiftProgress = (logs: WorkoutLog[]): LiftProgress[] => {
  const sessions = new Map<string, { name: string; days: Map<string, Session> }>();
  for (const log of logs) {
    const date = toDateKey(log.completedAt);
    for (const exercise of log.exercises) {
      const entry = sessions.get(exercise.exerciseId) ?? { name: exercise.exerciseName, days: new Map<string, Session>() };
      const day = entry.days.get(date) ?? { date, topKg: 0, topReps: 0 };
      for (const set of exercise.sets) {
        day.topKg = Math.max(day.topKg, set.weightKg ?? 0);
        day.topReps = Math.max(day.topReps, set.repetitions);
      }
      entry.days.set(date, day);
      sessions.set(exercise.exerciseId, entry);
    }
  }

  return [...sessions.entries()]
    .map(([exerciseId, { name, days }]): LiftProgress => {
      const ordered = [...days.values()].toSorted((left, right) => left.date.localeCompare(right.date));
      const unit = ordered.some(({ topKg }) => topKg > 0) ? 'kg' : 'reps';
      const points = ordered
        .map(({ date, topKg, topReps }) => ({ date, value: unit === 'kg' ? topKg : topReps }))
        .filter(({ value }) => value > 0);
      const values = points.map(({ value }) => value);
      const first = values[0] ?? 0;
      const best = Math.max(0, ...values);
      return {
        exerciseId,
        exerciseName: name,
        unit,
        points,
        first,
        best,
        latest: values.at(-1) ?? 0,
        gain: best - first,
        gainPercent: first > 0 ? Math.round(((best - first) / first) * 100) : 0,
      };
    })
    .filter(({ points }) => points.length > 0)
    .toSorted((left, right) => right.points.length - left.points.length || right.gainPercent - left.gainPercent);
};

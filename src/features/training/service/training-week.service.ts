import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';

// before: a planned day that passed before the plan existed, shown without a badge.
export type DayStatus = 'done' | 'missed' | 'today' | 'upcoming' | 'rest' | 'extra' | 'before';

export type WeekDay = {
  date: string;
  weekday: number;
  workout: { id: string; name: string } | null;
  status: DayStatus;
};

export type WeekSummary = { days: WeekDay[]; done: number; planned: number; streakWeeks: number };

const STREAK_LOOKBACK_WEEKS = 12;

export const toDateKey = (value: Date) =>
  [value.getFullYear(), String(value.getMonth() + 1).padStart(2, '0'), String(value.getDate()).padStart(2, '0')].join('-');

export const startOfWeek = (now: Date) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
};

const daysOf = (start: Date) => Array.from({ length: 7 }, (_, index) => {
  const day = new Date(start);
  day.setDate(start.getDate() + index);
  return day;
});

const inWeek = (logs: WorkoutLog[], start: Date) => {
  const from = toDateKey(start);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const to = toDateKey(end);
  return logs.filter((log) => {
    const key = toDateKey(new Date(log.completedAt));
    return key >= from && key <= to;
  });
};

// A plan workout counts as done if it was logged any day that week, or if any workout was logged on its day.
const doneWorkouts = (plan: TrainingPlanType, logs: WorkoutLog[], start: Date) => {
  const weekLogs = inWeek(logs, start);
  const loggedDays = new Set(weekLogs.filter(({ planWorkoutId }) => !planWorkoutId).map((log) => toDateKey(new Date(log.completedAt))));
  const linked = new Set(weekLogs.flatMap(({ planWorkoutId }) => (planWorkoutId ? [planWorkoutId] : [])));
  return new Set(daysOf(start).flatMap((day) => {
    const workout = plan.workouts.find(({ weekday }) => weekday === day.getDay());
    return workout && (linked.has(workout.id) || loggedDays.has(toDateKey(day))) ? [workout.id] : [];
  }));
};

// Builds the Monday-to-Sunday view in the person's own timezone from their plan and saved workouts.
// Days before the plan was made are never shown as missed.
export const summarizeWeek = (plan: TrainingPlanType | null, logs: WorkoutLog[], now = new Date(), planStart?: string): WeekSummary => {
  const start = startOfWeek(now);
  const today = toDateKey(now);
  const startKey = planStart ? toDateKey(new Date(planStart)) : '';
  const done = plan ? doneWorkouts(plan, logs, start) : new Set<string>();
  const planIds = new Set(plan?.workouts.map(({ id }) => id) ?? []);
  const extraDays = new Set(inWeek(logs, start).filter(({ planWorkoutId }) => !planWorkoutId || !planIds.has(planWorkoutId))
    .map((log) => toDateKey(new Date(log.completedAt))));
  const scheduled = (weekday: number) => plan?.workouts.find((workout) => workout.weekday === weekday) ?? null;

  const days = daysOf(start).map((day): WeekDay => {
    const date = toDateKey(day);
    const planned = scheduled(day.getDay());
    const counted = planned !== null && date >= startKey;
    let status: DayStatus = extraDays.has(date) ? 'extra' : 'rest';
    if (planned && done.has(planned.id)) status = 'done';
    else if (counted) status = date === today ? 'today' : date < today ? 'missed' : 'upcoming';
    else if (planned) status = date < today ? 'before' : 'upcoming';
    return { date, weekday: day.getDay(), workout: planned ? { id: planned.id, name: planned.name } : null, status };
  });

  const countedDays = days.filter(({ workout, date }) => workout && (date >= startKey || done.has(workout.id)));
  const plannedPerWeek = plan?.workouts.filter(({ weekday }) => weekday !== null).length ?? 0;
  let streakWeeks = 0;
  if (plan && plannedPerWeek > 0) {
    for (let back = 1; back <= STREAK_LOOKBACK_WEEKS; back += 1) {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() - back * 7);
      if (doneWorkouts(plan, logs, weekStart).size < plannedPerWeek) break;
      streakWeeks += 1;
    }
  }
  const planned = countedDays.length;
  const doneCount = countedDays.filter(({ workout }) => workout && done.has(workout.id)).length;
  if (planned > 0 && doneCount === planned) streakWeeks += 1;
  return { days, done: doneCount, planned, streakWeeks };
};

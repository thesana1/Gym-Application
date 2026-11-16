import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { APP_NAME } from '@/shared/const/app.const';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// iCalendar lines must be folded at 75 characters, continuing with a leading space.
const fold = (line: string) => line.match(/.{1,74}/g)?.join('\r\n ') ?? line;

const dateKey = (date: Date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
const stamp = (date: Date) => `${date.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;

const nextOccurrence = (weekday: number, now: Date) => {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7));
  return date;
};

// Weekly all-day events that phone calendars (Google, Apple, Outlook) can import from one file.
export const buildPlanCalendar = (plan: TrainingPlanType, now = new Date()) => {
  const events = plan.workouts.filter((workout) => workout.weekday !== null).flatMap((workout) => {
    const lines = workout.exercises.map((exercise) => {
      const name = WORKOUT_EXERCISE_LIBRARY.find(({ id }) => id === exercise.exerciseId)?.name ?? exercise.exerciseId;
      return TRAINING_COPY.calendar.line(name, exercise.sets, exercise.repMin, exercise.repMax);
    });
    return [
      'BEGIN:VEVENT',
      `UID:${workout.id}-${plan.goal}@gym-application`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${dateKey(nextOccurrence(workout.weekday ?? 0, now))}`,
      'RRULE:FREQ=WEEKLY',
      `SUMMARY:${escapeText(TRAINING_COPY.calendar.title(workout.name))}`,
      `DESCRIPTION:${escapeText(lines.join('\n'))}`,
      'END:VEVENT',
    ];
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${APP_NAME}//Training plan//EN`, 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR']
    .map(fold).join('\r\n');
};

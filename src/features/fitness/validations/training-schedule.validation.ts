import { z } from 'zod';

export const TrainingScheduleSchema = z.strictObject({
  assignments: z
    .array(
      z.strictObject({
        weekday: z.number().int().min(0).max(6),
        sessionIndex: z.number().int().min(0).max(2),
      })
    )
    .max(3)
    .superRefine((assignments, context) => {
      const weekdays = new Set<number>();
      const sessions = new Set<number>();

      assignments.forEach(({ weekday, sessionIndex }, index) => {
        if (weekdays.has(weekday)) {
          context.addIssue({
            code: 'custom',
            message: 'Each weekday can have at most one workout session',
            path: [index, 'weekday'],
          });
        }
        if (sessions.has(sessionIndex)) {
          context.addIssue({
            code: 'custom',
            message: 'Each plan session can be scheduled only once',
            path: [index, 'sessionIndex'],
          });
        }
        weekdays.add(weekday);
        sessions.add(sessionIndex);
      });
    }),
});

export type TrainingScheduleInput = z.infer<typeof TrainingScheduleSchema>;

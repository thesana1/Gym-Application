import { z } from 'zod';

import {
  PERSONAL_WORKOUT_CHALLENGES,
  type PersonalWorkoutChallenge,
} from '@/shared/const/personal-challenges.const';

export const ChallengeEnrollmentSchema = z.strictObject({
  challengeId: z.enum(
    PERSONAL_WORKOUT_CHALLENGES.map(({ id }) => id) as [
      PersonalWorkoutChallenge['id'],
      ...PersonalWorkoutChallenge['id'][],
    ]
  ),
});

export type ChallengeEnrollmentType = z.infer<
  typeof ChallengeEnrollmentSchema
>;

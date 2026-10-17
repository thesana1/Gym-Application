import { challengeRepository } from '@/features/challenges/repository/challenge.repository';
import { workoutLogRepository } from '@/features/fitness/repository/workout-log.repository';
import type { WorkoutLogQuery } from '@/features/fitness/validations/workout-log.validation';
import {
  PERSONAL_WORKOUT_CHALLENGES,
  type PersonalWorkoutChallenge,
} from '@/shared/const/personal-challenges.const';
import type { ServiceResult } from '@/shared/types/common';

export type PersonalChallenge = {
  id: PersonalWorkoutChallenge['id'];
  title: string;
  description: string;
  durationDays: number;
  targetWorkouts: number;
  status: 'not-joined' | 'in-progress' | 'completed' | 'expired';
  completedWorkouts: number;
  joinedAt?: string;
  endsAt?: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function listPersonalChallengesService(
  userId: string,
  now = new Date()
): Promise<ServiceResult<PersonalChallenge[]>> {
  const enrollments = await challengeRepository.findByUserId(userId);
  const joinedByChallengeId = new Map(
    enrollments.map((enrollment) => [enrollment.challengeId, enrollment])
  );
  const workoutCounts = new Map<string, number>();
  await Promise.all(
    enrollments.map(async (enrollment) => {
      const challenge = PERSONAL_WORKOUT_CHALLENGES.find(
        ({ id }) => id === enrollment.challengeId
      );
      if (!challenge) return;

      const endsAt = new Date(
        enrollment.joinedAt.getTime() + challenge.durationDays * DAY_IN_MS
      );
      const countedThrough = now < endsAt ? now : endsAt;
      if (enrollment.joinedAt > countedThrough) {
        workoutCounts.set(enrollment.challengeId, 0);
        return;
      }

      const query: WorkoutLogQuery = {
        from: enrollment.joinedAt.toISOString(),
        to: countedThrough.toISOString(),
      };
      const logs = await workoutLogRepository.findByUserId(userId, query);
      workoutCounts.set(
        enrollment.challengeId,
        logs.filter(
          ({ completedAt }) =>
            completedAt >= enrollment.joinedAt &&
            completedAt < endsAt &&
            completedAt <= now
        ).length
      );
    })
  );

  const challenges = PERSONAL_WORKOUT_CHALLENGES.map((challenge) => {
    const enrollment = joinedByChallengeId.get(challenge.id);
    if (!enrollment) {
      return {
        ...challenge,
        status: 'not-joined' as const,
        completedWorkouts: 0,
      };
    }

    const joinedAt = enrollment.joinedAt;
    const endsAt = new Date(
      joinedAt.getTime() + challenge.durationDays * DAY_IN_MS
    );
    const completedWorkouts = workoutCounts.get(challenge.id) ?? 0;
    const status: PersonalChallenge['status'] =
      completedWorkouts >= challenge.targetWorkouts
        ? 'completed'
        : now >= endsAt
          ? 'expired'
          : 'in-progress';

    return {
      ...challenge,
      status,
      completedWorkouts,
      joinedAt: joinedAt.toISOString(),
      endsAt: endsAt.toISOString(),
    };
  });

  return { data: challenges, status: 200 };
}

export async function joinPersonalChallengeService(
  userId: string,
  challengeId: PersonalWorkoutChallenge['id'],
  joinedAt = new Date()
): Promise<ServiceResult<{ challengeId: PersonalWorkoutChallenge['id']; joinedAt: string }>> {
  const enrollment = await challengeRepository.join(
    userId,
    challengeId,
    joinedAt
  );
  if (!enrollment) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return {
    data: {
      challengeId,
      joinedAt: enrollment.joinedAt.toISOString(),
    },
    status: 200,
  };
}

export async function leavePersonalChallengeService(
  userId: string,
  challengeId: PersonalWorkoutChallenge['id']
): Promise<ServiceResult<{ left: true }>> {
  const deleted = await challengeRepository.leave(userId, challengeId);
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { left: true }, status: 200 };
}

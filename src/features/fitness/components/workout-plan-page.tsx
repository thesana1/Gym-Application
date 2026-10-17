import Link from 'next/link';

import { WorkoutPlanPersonalizer } from '@/features/fitness/components/workout-plan-personalizer';
import { WorkoutPlanView } from '@/features/fitness/components/workout-plan-view';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import {
  createWorkoutPlanService,
  type WorkoutPlan,
} from '@/features/fitness/service/workout-plan.service';
import { Button } from '@/shared/components/ui/button';

type WorkoutPlanPageProps = {
  profile: FitnessProfile | null;
  startSessionIndex?: number;
};

export const WorkoutPlanPage = ({
  profile,
  startSessionIndex,
}: WorkoutPlanPageProps) => {
  let plan: WorkoutPlan | null = null;
  if (profile) {
    const result = createWorkoutPlanService(profile);
    if ('error' in result.data) {
      throw new Error('Could not create a workout plan');
    }
    plan = result.data;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Train with direction
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Workout plan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Exercises, form notes, and a flexible starting schedule.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/profile">Edit fitness profile</Link>
        </Button>
      </header>
      {plan ? (
        <WorkoutPlanPersonalizer
          initialPlan={plan}
          startSessionIndex={startSessionIndex}
        />
      ) : (
        <WorkoutPlanView plan={null} />
      )}
    </div>
  );
};

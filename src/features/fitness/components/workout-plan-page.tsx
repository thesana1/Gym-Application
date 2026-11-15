import { WorkoutPlanPersonalizer, type WorkoutTab } from '@/features/fitness/components/workout-plan-personalizer';
import { WorkoutPlanView } from '@/features/fitness/components/workout-plan-view';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import { createWorkoutPlanService, type WorkoutPlan } from '@/features/fitness/service/workout-plan.service';
import { PageHeader } from '@/shared/components/layout/page-header';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';

type WorkoutPlanPageProps = {
  profile: FitnessProfile | null;
  startSessionIndex?: number;
  initialTab?: WorkoutTab;
};

export const WorkoutPlanPage = ({ profile, startSessionIndex, initialTab }: WorkoutPlanPageProps) => {
  let plan: WorkoutPlan | null = null;
  if (profile) {
    const result = createWorkoutPlanService(profile);
    if ('error' in result.data) {
      throw new Error('Could not create a workout plan');
    }
    plan = result.data;
  }

  return (
    <div className="animate-rise">
      <PageHeader title={WORKOUTS_COPY.title} description={WORKOUTS_COPY.description} />
      {plan ? (
        <WorkoutPlanPersonalizer initialPlan={plan} startSessionIndex={startSessionIndex} initialTab={initialTab} />
      ) : (
        <WorkoutPlanView plan={null} />
      )}
    </div>
  );
};

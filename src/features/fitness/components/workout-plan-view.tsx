import Link from 'next/link';

import type {
  WorkoutPlan,
  WorkoutSession,
} from '@/features/fitness/service/workout-plan.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { FITNESS_GOALS } from '@/shared/const/fitness.const';

type WorkoutPlanViewProps = {
  plan: WorkoutPlan | null;
};

const ExerciseDetails = ({
  exercise,
}: {
  exercise: WorkoutSession['exercises'][number];
}) => (
  <li className="rounded-md border border-border p-4">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <h3 className="font-semibold">{exercise.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Targets: {exercise.targetMuscles}
        </p>
      </div>
      <p className="shrink-0 rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
        {exercise.sets} sets · {exercise.repetitions} reps · {exercise.restSeconds}s rest
      </p>
    </div>
    <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
      {exercise.instructions.map((instruction) => (
        <li key={instruction}>{instruction}</li>
      ))}
    </ol>
    <details className="mt-4 border-t border-border pt-3">
      <summary className="cursor-pointer text-sm font-medium">
        Form and safety notes
      </summary>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-medium">Common mistake</dt>
          <dd className="mt-1 text-muted-foreground">{exercise.commonMistake}</dd>
        </div>
        <div>
          <dt className="font-medium">Easier variation</dt>
          <dd className="mt-1 text-muted-foreground">{exercise.regression}</dd>
        </div>
        <div>
          <dt className="font-medium">Safety cue</dt>
          <dd className="mt-1 text-muted-foreground">{exercise.safetyCue}</dd>
        </div>
      </dl>
    </details>
  </li>
);

export const WorkoutPlanView = ({ plan }: WorkoutPlanViewProps) => {
  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up a fitness profile first</CardTitle>
          <CardDescription>
            Choose a goal and experience level to see a starting workout plan.
            Measurements are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/profile">Set up fitness profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const goalLabel =
    FITNESS_GOALS.find(({ value }) => value === plan.goal)?.label ?? 'your goal';

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">A starting point for {goalLabel.toLowerCase()}</CardTitle>
          <CardDescription>
            A conservative, general template based on your experience and saved
            equipment. Adjust the plan to your comfort and schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This plan includes up to {plan.weeklySessionLimit} sessions. It
            supports a maximum of three sessions weekly; extra available days are
            not a recommendation to train every day.
          </p>
          <p>
            {plan.equipmentPersonalized
              ? 'Bodyweight movements and exercises matching your selected equipment are included.'
              : 'No equipment preference is saved, so this plan uses bodyweight movements. Add equipment in your profile to tailor it.'}
          </p>
          <p>
            General fitness information only, not medical advice. Warm up, use
            controlled movements, and stop if you feel pain, dizziness, or
            unusual discomfort. Ask a qualified professional for guidance,
            especially if you have an injury or health concern.
          </p>
        </CardContent>
      </Card>

      {plan.sessions.map((session, index) => (
        <Card key={`${session.title}-${index}`}>
          <CardHeader>
            <CardTitle className="text-base">
              Session {index + 1}: {session.title}
            </CardTitle>
            <CardDescription>
              Leave recovery time between harder sessions and keep at least one
              rest day each week. Prioritize controlled technique over adding
              weight or repetitions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {session.exercises.map((exercise) => (
                <ExerciseDetails key={exercise.id} exercise={exercise} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

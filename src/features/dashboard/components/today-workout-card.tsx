import { ArrowRight, Dumbbell } from 'lucide-react';
import Link from 'next/link';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type TodayWorkoutCardProps = {
  workouts: WorkoutLog[];
  plannedSession: { sessionTitle: string; sessionIndex: number } | null;
};

export const TodayWorkoutCard = ({
  workouts,
  plannedSession,
}: TodayWorkoutCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Dumbbell className="size-4 text-primary" />
        Workout log
      </CardTitle>
      <CardDescription>
        {workouts.length
          ? `${workouts.length} completed workout${workouts.length === 1 ? '' : 's'} logged today.`
          : 'No completed workouts logged today.'}
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-3">
      {plannedSession ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Planned session · not completed
          </p>
          <p className="mt-1 text-sm font-medium">
            {plannedSession.sessionTitle}
          </p>
          <Link
            href={`/dashboard/workouts?session=${plannedSession.sessionIndex}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Log completed session <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No session is scheduled for today.
        </p>
      )}
      {workouts.length > 0 && (
        <ul className="grid gap-2">
          {workouts.map((workout) => (
            <li key={workout.id} className="rounded-md border p-3">
              <p className="text-sm font-medium">{workout.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {workout.exercises.length} exercise
                {workout.exercises.length === 1 ? '' : 's'} recorded
              </p>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/dashboard/workouts"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        View workout plan and logs <ArrowRight className="size-4" />
      </Link>
    </CardContent>
  </Card>
);

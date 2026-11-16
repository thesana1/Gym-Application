import { WorkoutSession } from '@/features/training/components/workout-session';

type WorkoutSessionPageProps = { params: Promise<{ workoutId: string }> };

export default async function WorkoutSessionPage({ params }: WorkoutSessionPageProps) {
  const { workoutId } = await params;
  return <WorkoutSession workoutId={decodeURIComponent(workoutId)} />;
}

import { WorkoutPlanPage } from '@/features/fitness/components/workout-plan-page';
import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = {
  id?: string;
};

type WorkoutsPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function WorkoutsPage({ searchParams }: WorkoutsPageProps) {
  const query = await searchParams;
  const sessionIndex =
    query.session !== undefined && /^\d+$/.test(query.session)
      ? Number(query.session)
      : undefined;
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    throw new Error('Authenticated session is missing the user id');
  }

  const result = await getFitnessProfileService(user.id);
  if (result.data && 'error' in result.data) {
    throw new Error('Could not load the fitness profile');
  }

  return (
    <WorkoutPlanPage
      profile={result.data}
      startSessionIndex={sessionIndex}
    />
  );
}

import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';
import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';
import { recommendFoodService } from '@/features/nutrition/service/food-picks.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = {
  id?: string;
  name?: string | null;
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    throw new Error('Authenticated session is missing the user id');
  }

  const result = await getFitnessProfileService(user.id);
  if (result.data && 'error' in result.data) {
    throw new Error('Could not load the fitness profile');
  }

  const foodPicks = recommendFoodService(result.data?.goal);
  if ('error' in foodPicks.data) {
    throw new Error('Could not load food picks');
  }

  return (
    <DashboardOverview userName={user.name ?? ''} profile={result.data} foodPicks={foodPicks.data} />
  );
}

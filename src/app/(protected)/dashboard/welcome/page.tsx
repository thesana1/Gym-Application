import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';
import { PremiumPitch } from '@/features/membership/components/premium-pitch';
import { FITNESS_GOALS } from '@/shared/const/fitness.const';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export default async function WelcomePage() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) throw new Error('Authenticated session is missing the user id');

  const result = await getFitnessProfileService(user.id);
  const profile = result.data && !('error' in result.data) ? result.data : null;
  const goal = FITNESS_GOALS.find(({ value }) => value === profile?.goal)?.label;
  return <PremiumPitch goal={goal} trainingDays={profile?.trainingDaysPerWeek ?? undefined} />;
}

import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';
import { TrainingPage } from '@/features/training/components/training-page';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };
type WorkoutsPageProps = { searchParams: Promise<{ tab?: string }> };

const TABS = ['week', 'plan', 'history'] as const;

export default async function WorkoutsPage({ searchParams }: WorkoutsPageProps) {
  const query = await searchParams;
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) throw new Error('Authenticated session is missing the user id');

  const result = await getFitnessProfileService(user.id);
  if (result.data && 'error' in result.data) throw new Error('Could not load the fitness profile');

  const tab = TABS.find((value) => value === query.tab);
  return <TrainingPage profile={result.data} initialTab={tab} />;
}

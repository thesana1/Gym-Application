import { FitnessProfileForm } from '@/features/fitness/components/fitness-profile-form';
import { auth } from '@/shared/lib/auth';

export default async function FitnessProfilePage() {
  const session = await auth();
  const userName = session?.user?.name ?? '';

  return <FitnessProfileForm userName={userName} />;
}

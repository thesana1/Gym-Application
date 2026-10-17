import { CoachDirectory } from '@/features/coaches/components/coach-directory';
import { auth } from '@/shared/lib/auth';

type SessionUser = {
  role?: 'admin' | 'user';
};

export default async function CoachesPage() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  return <CoachDirectory isAdmin={user?.role === 'admin'} />;
}

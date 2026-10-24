import { MembershipPage } from '@/features/membership/components/membership-page';
import { getMembershipService } from '@/features/membership/service/membership.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = {
  id?: string;
};

export default async function MembershipPageRoute() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) {
    throw new Error('Authenticated session is missing the user id');
  }

  const result = await getMembershipService(user.id);
  if (result.status !== 200 || result.data && 'error' in result.data) {
    throw new Error('Could not load membership');
  }

  return <MembershipPage membership={result.data} />;
}

import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';
import { auth } from '@/shared/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? 'User';

  return <DashboardOverview userName={userName} />;
}

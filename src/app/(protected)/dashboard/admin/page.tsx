import { notFound } from 'next/navigation';

import { AdminDashboard } from '@/features/admin/components/admin-dashboard';
import { getAdminStatsService } from '@/features/admin/service/admin.service';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ADMIN_COPY } from '@/shared/const/copy-admin.const';
import { auth } from '@/shared/lib/auth';

type SessionUser = { role?: string };

export default async function AdminPage() {
  const session = await auth();
  // Non-admins get a plain 404 so the page does not reveal that it exists.
  if ((session?.user as SessionUser | undefined)?.role !== 'admin') notFound();

  const result = await getAdminStatsService();
  return 'error' in result.data ? <EmptyState message={ADMIN_COPY.loadError} /> : <AdminDashboard stats={result.data} />;
}

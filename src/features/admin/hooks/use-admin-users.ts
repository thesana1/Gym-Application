import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import type { AdminUserRow } from '@/features/admin/types/admin.types';
import type { AdminMembershipType } from '@/features/admin/validations/admin.validation';
import { ADMIN_COPY } from '@/shared/const/copy-admin.const';
import { http } from '@/shared/lib/http';

export type AdminAction = AdminMembershipType['action'] | 'delete';

const errorMessage = (error: unknown) => (error instanceof Error ? ADMIN_COPY.errors[error.message] : undefined) ?? ADMIN_COPY.errors.default;

export const useAdminUsers = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await http.get<AdminUserRow[]>(`/admin/users?q=${encodeURIComponent(search)}`));
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(query);
  }, [load, query]);

  const run = async (userId: string, action: AdminAction, body?: AdminMembershipType) => {
    setBusyId(userId);
    setError(null);
    setNotice(null);
    try {
      if (action === 'delete') await http.delete(`/admin/users/${userId}`);
      else await http.patch(`/admin/users/${userId}`, body);
      setNotice(ADMIN_COPY.people.done[action]);
      await load(query);
      // Refreshes the numbers at the top of the page.
      router.refresh();
    } catch (actionError) {
      setError(errorMessage(actionError));
    } finally {
      setBusyId(null);
    }
  };

  return { users, loading, busyId, error, notice, search: setQuery, run };
};

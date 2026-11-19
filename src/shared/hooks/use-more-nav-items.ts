import { useSession } from 'next-auth/react';

import { ADMIN_NAV_ITEM, MORE_NAV_ITEMS, type NavItem } from '@/shared/const/navigation.const';

type SessionUser = { role?: string };

// The Admin link only shows for admins; the admin page checks the role again on the server.
export const useMoreNavItems = (): NavItem[] => {
  const { data } = useSession();
  return (data?.user as SessionUser | undefined)?.role === 'admin' ? [...MORE_NAV_ITEMS, ADMIN_NAV_ITEM] : MORE_NAV_ITEMS;
};

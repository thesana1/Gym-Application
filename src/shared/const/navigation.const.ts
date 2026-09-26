export type SidebarNavItem = {
  href: string;
  label: string;
  icon: 'dashboard';
};

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
];

export type NavIcon = 'home' | 'dumbbell' | 'apple' | 'chart' | 'message' | 'trophy' | 'user-round' | 'badge-check' | 'shield' | 'medal';

export type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: NavIcon;
  // Other pages that belong to this section, so its tab stays highlighted there.
  matches?: string[];
};

export type SectionTab = { href: string; label: string };

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Today', description: 'Your one thing for today.', icon: 'home' },
  { href: '/dashboard/workouts', label: 'Workouts', description: 'Your plan and every workout you did.', icon: 'dumbbell' },
  {
    href: '/dashboard/nutrition', label: 'Food', description: 'What you ate and drank today.', icon: 'apple',
    matches: ['/dashboard/food-generator'],
  },
  {
    href: '/dashboard/progress', label: 'Progress', description: 'Watch yourself get stronger.', icon: 'chart',
    matches: ['/dashboard/records', '/dashboard/activity'],
  },
];

export const MORE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/assistant', label: 'Ask Coach', description: 'Ask anything about training or food.', icon: 'message' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', description: 'See how you rank against other members.', icon: 'medal' },
  { href: '/dashboard/challenges', label: 'My challenges', description: 'Small goals you set for yourself.', icon: 'trophy' },
  { href: '/dashboard/profile', label: 'My profile', description: 'Your goal, days and gear.', icon: 'user-round' },
  { href: '/dashboard/membership', label: 'Premium', description: 'More coaching and progress photos.', icon: 'badge-check' },
];

export const ADMIN_NAV_ITEM: NavItem = { href: '/dashboard/admin', label: 'Admin', description: 'Members, Premium and activity.', icon: 'shield' };

export const ALL_NAV_ITEMS: NavItem[] = [...MAIN_NAV_ITEMS, ...MORE_NAV_ITEMS];

export const FOOD_TABS: SectionTab[] = [
  { href: '/dashboard/nutrition', label: 'Today' },
  { href: '/dashboard/food-generator', label: 'Meal ideas' },
];

export const PROGRESS_TABS: SectionTab[] = [
  { href: '/dashboard/progress', label: 'Body' },
  { href: '/dashboard/records', label: 'Best lifts' },
  { href: '/dashboard/activity', label: 'Activity' },
];

export const NAV_COPY = {
  mainLabel: 'Main menu',
  more: 'More',
  moreTitle: 'More',
  moreDescription: 'The rest of your club.',
  close: 'Close',
  sidebarMoreHeading: 'More',
  sectionTabsLabel: 'Pages in this section',
} as const;

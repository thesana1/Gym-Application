export type NavIcon = 'home' | 'dumbbell' | 'apple' | 'chart' | 'message' | 'trophy' | 'user-round' | 'badge-check';

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
  { href: '/dashboard', label: 'Home', description: 'See what to do today.', icon: 'home' },
  { href: '/dashboard/workouts', label: 'Workouts', description: 'Follow your plan and save workouts.', icon: 'dumbbell' },
  {
    href: '/dashboard/nutrition', label: 'Food', description: 'See what you ate today.', icon: 'apple',
    matches: ['/dashboard/food-generator'],
  },
  {
    href: '/dashboard/progress', label: 'Progress', description: 'See how you are doing.', icon: 'chart',
    matches: ['/dashboard/records', '/dashboard/activity'],
  },
];

export const MORE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/assistant', label: 'Ask Coach', description: 'Quick answers from our AI coach.', icon: 'message' },
  { href: '/dashboard/challenges', label: 'My challenges', description: 'Pick a small goal and keep going.', icon: 'trophy' },
  { href: '/dashboard/profile', label: 'My profile', description: 'Your goal, training days and equipment.', icon: 'user-round' },
  { href: '/dashboard/membership', label: 'My plan', description: 'See your plan and payments.', icon: 'badge-check' },
];

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
  moreDescription: 'Everything else in one place.',
  close: 'Close',
  sidebarMoreHeading: 'More',
  sectionTabsLabel: 'Pages in this section',
} as const;

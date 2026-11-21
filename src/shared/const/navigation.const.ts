export type NavIcon = 'home' | 'dumbbell' | 'apple' | 'chart' | 'message' | 'trophy' | 'user-round' | 'badge-check' | 'shield' | 'medal';

export type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: NavIcon;
  // Other pages that belong to this section, so it stays highlighted there.
  matches?: string[];
};

export type SectionTab = { href: string; label: string };

// The four main sections in the burger menu, in this order.
export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/workouts', label: 'Today’s workout', description: 'Follow your plan and save workouts.', icon: 'dumbbell' },
  {
    href: '/dashboard/progress', label: 'My progress', description: 'See how you are doing.', icon: 'chart',
    matches: ['/dashboard/records', '/dashboard/activity'],
  },
  { href: '/dashboard/assistant', label: 'Ask AI', description: 'Quick answers from our AI coach.', icon: 'message' },
  {
    href: '/dashboard/nutrition', label: 'Everything about food', description: 'Meals, calories and meal ideas.', icon: 'apple',
    matches: ['/dashboard/food-generator'],
  },
];

// Smaller links under the main sections.
export const MORE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home', description: 'Gyms near you and food ideas.', icon: 'home' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', description: 'See how you rank against other members.', icon: 'medal' },
  { href: '/dashboard/challenges', label: 'My challenges', description: 'Pick a small goal and keep going.', icon: 'trophy' },
  { href: '/dashboard/profile', label: 'My profile', description: 'Your goal, training days and equipment.', icon: 'user-round' },
  { href: '/dashboard/membership', label: 'Premium', description: 'More coaching and progress photos.', icon: 'badge-check' },
];

// Only shown to admins (see useMoreNavItems).
export const ADMIN_NAV_ITEM: NavItem = { href: '/dashboard/admin', label: 'Admin', description: 'Members, Premium and activity.', icon: 'shield' };

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
  openMenu: 'Open menu',
  menuTitle: 'Menu',
  menuDescription: 'Go anywhere in GainBase.',
  moreHeading: 'More',
  close: 'Close',
  sectionTabsLabel: 'Pages in this section',
} as const;

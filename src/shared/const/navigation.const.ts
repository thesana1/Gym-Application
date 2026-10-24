export type SidebarNavItem = {
  href: string;
  label: string;
  icon:
    | 'dashboard'
    | 'user-round'
    | 'dumbbell'
    | 'apple'
    | 'salad'
    | 'activity'
    | 'map-pin'
    | 'users'
    | 'trophy'
    | 'book-open'
    | 'medal'
    | 'chart'
    | 'badge-check';
};

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/dashboard/workouts', label: 'Workout plan', icon: 'dumbbell' },
  { href: '/dashboard/records', label: 'Personal records', icon: 'medal' },
  { href: '/dashboard/activity', label: 'Training activity', icon: 'chart' },
  { href: '/dashboard/equipment', label: 'Equipment guide', icon: 'book-open' },
  { href: '/dashboard/nutrition', label: 'Nutrition', icon: 'apple' },
  { href: '/dashboard/food-generator', label: 'Meal ideas', icon: 'salad' },
  { href: '/dashboard/progress', label: 'Measurements', icon: 'activity' },
  { href: '/dashboard/gyms', label: 'Nearby gyms', icon: 'map-pin' },
  { href: '/dashboard/coaches', label: 'Coaches', icon: 'users' },
  { href: '/dashboard/challenges', label: 'Challenges', icon: 'trophy' },
  { href: '/dashboard/profile', label: 'Fitness profile', icon: 'user-round' },
  { href: '/dashboard/membership', label: 'Membership', icon: 'badge-check' },
];

export type DashboardNextStep = {
  title: string;
  description: string;
  icon: 'workout' | 'nutrition' | 'progress';
  href: string | null;
};

export const DASHBOARD_NEXT_STEPS: DashboardNextStep[] = [
  {
    title: 'Training plans',
    description: 'Build a workout around your goal, experience, and available equipment.',
    icon: 'workout',
    href: '/dashboard/workouts',
  },
  {
    title: 'Nutrition',
    description: 'Set practical nutrition targets and keep track of what you eat.',
    icon: 'nutrition',
    href: '/dashboard/nutrition',
  },
  {
    title: 'Meal ideas',
    description: 'Find recipe ideas from ingredients you already have.',
    icon: 'nutrition',
    href: '/dashboard/food-generator',
  },
  {
    title: 'Progress tracking',
    description: 'Review your training and measurements as you build consistency.',
    icon: 'progress',
    href: '/dashboard/progress',
  },
];

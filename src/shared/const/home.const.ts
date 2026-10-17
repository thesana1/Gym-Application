export type FeatureCard = {
  label: string;
  title: string;
  description: string;
  icon: 'activity' | 'utensils' | 'target';
};

export const HOME_FEATURES: FeatureCard[] = [
  {
    label: 'Training',
    title: 'A plan with direction',
    description:
      'Build toward your strength, muscle, endurance, or general fitness goals with a workout structure that can grow with you.',
    icon: 'activity',
  },
  {
    label: 'Nutrition',
    title: 'Make food work for you',
    description:
      'Understand nutrition targets and find practical meal ideas around the foods and preferences that matter to you.',
    icon: 'utensils',
  },
  {
    label: 'Progress',
    title: 'Notice the changes',
    description:
      'Keep your training and progress in one place so you can see what is working and decide what to focus on next.',
    icon: 'target',
  },
];

export type HomeStat = {
  value: string;
  label: string;
};

export const HOME_STATS: HomeStat[] = [
  { value: '01', label: 'Understand your goals' },
  { value: '02', label: 'Build a steady routine' },
  { value: '03', label: 'Track and adjust' },
];

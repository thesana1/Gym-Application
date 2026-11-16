import { AI_DAILY_LIMITS } from '@/shared/const/ai.const';

export const PREMIUM_PITCH_COPY = {
  ready: 'Profile done',
  readyGoal: (goal: string) => `Your plan to ${goal.toLowerCase()} is ready`,
  title: 'Get there faster with Premium',
  subtitle: 'Free gives you everything to start. Premium gives you a coach in your pocket.',
  commitment: (days: number) =>
    `You said you can train ${days} day${days === 1 ? '' : 's'} a week. Premium helps you make every one of them count.`,
  price: (monthly: string) => `${monthly} a month`,
  perDay: (daily: string) => `About ${daily} a day`,
  start: 'Start Premium',
  starting: 'Opening payment…',
  continueFree: 'Continue with Free',
  cancelAnyTime: 'Cancel any time. No contract.',
  taxNote: 'Paid every month. Tax is added at checkout.',
  compareTitle: 'Free or Premium?',
  feature: 'What you get',
  free: 'Free',
  premium: 'Premium',
  included: 'Included',
  notIncluded: 'Not included',
  rows: [
    { label: 'Your own workout plan and checklist', free: true, premium: true },
    { label: 'Strength graph and best lifts', free: true, premium: true },
    { label: 'Food log and targets', free: true, premium: true },
    {
      label: 'AI questions a day',
      help: 'Used for plan ideas, meal ideas, Ask Coach and workout tips.',
      free: String(AI_DAILY_LIMITS.free),
      premium: String(AI_DAILY_LIMITS.premium),
    },
    { label: 'Private progress photos', free: false, premium: true },
  ],
  benefitsTitle: 'What changes with Premium',
  benefits: [
    {
      title: `${AI_DAILY_LIMITS.premium / AI_DAILY_LIMITS.free}× more coaching`,
      body: `Ask Coach ${AI_DAILY_LIMITS.premium} questions a day about form, food or your plan, instead of ${AI_DAILY_LIMITS.free}.`,
    },
    { title: 'See your change', body: 'Save private progress photos. They show changes the scale cannot.' },
    { title: 'Fresh plans when you need them', body: 'Ask AI for a new plan or meal ideas whenever you get bored.' },
  ],
} as const;

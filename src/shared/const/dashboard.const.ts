export type DashboardMetric = {
  title: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
  icon: 'activity' | 'clock' | 'trending-up' | 'users';
};

export const DASHBOARD_METRICS: DashboardMetric[] = [
  {
    title: 'Total users',
    value: '1,234',
    delta: '+12%',
    trend: 'up',
    icon: 'users',
  },
  {
    title: 'Active sessions',
    value: '56',
    delta: '+4',
    trend: 'up',
    icon: 'activity',
  },
  {
    title: 'Growth rate',
    value: '8.2%',
    delta: '+1.1%',
    trend: 'up',
    icon: 'trending-up',
  },
  {
    title: 'Avg. session',
    value: '24m',
    delta: '-2m',
    trend: 'down',
    icon: 'clock',
  },
];

export type DashboardActivity = {
  title: string;
  detail: string;
  time: string;
};

export const DASHBOARD_ACTIVITY: DashboardActivity[] = [
  { title: 'New user registered', detail: 'jordan@acme.co', time: '2m ago' },
  { title: 'Subscription upgraded', detail: 'Pro · annual', time: '40m ago' },
  { title: 'API key created', detail: 'production', time: '1h ago' },
  { title: 'Password reset', detail: 'sam@acme.co', time: '3h ago' },
];

export type DashboardChannel = {
  label: string;
  share: number;
};

export const DASHBOARD_CHANNELS: DashboardChannel[] = [
  { label: 'Direct', share: 48 },
  { label: 'Organic', share: 27 },
  { label: 'Referral', share: 16 },
  { label: 'Social', share: 9 },
];

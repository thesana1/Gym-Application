export type AdminDailySignups = { day: string; count: number };

export type AdminStats = {
  users: { total: number; last7Days: number; last30Days: number; finishedProfile: number };
  premium: { active: number; gifted: number; cancelling: number; everBought: number; conversionPercent: number; monthlyRevenue: number };
  activity: { activeUsers7Days: number; workouts7Days: number; meals7Days: number };
  signups: AdminDailySignups[];
};

// 'paid' is a real Dodo subscription, 'gift' is Premium given by an admin.
export type AdminUserPlan = 'paid' | 'gift' | 'free';

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  plan: AdminUserPlan;
  premiumUntil: string | null;
  cancelling: boolean;
  isAdmin: boolean;
};

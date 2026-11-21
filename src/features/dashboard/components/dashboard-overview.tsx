import { TodayOverview } from '@/features/dashboard/components/today-overview';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import { NearbyGyms } from '@/features/gyms/components/nearby-gyms';
import { FoodPicks } from '@/features/nutrition/components/food-picks';
import type { FoodPicks as FoodPicksData } from '@/features/nutrition/service/food-picks.service';
import { PageHeader } from '@/shared/components/layout/page-header';
import { HOME_COPY } from '@/shared/const/copy-home.const';
import { FITNESS_GOALS } from '@/shared/const/fitness.const';

type DashboardOverviewProps = {
  userName: string;
  profile: FitnessProfile | null;
  foodPicks: FoodPicksData;
};

// Home after sign-in: today's plan first, then gyms nearby, then food picks.
export const DashboardOverview = ({ userName, profile, foodPicks }: DashboardOverviewProps) => {
  const goalLabel = FITNESS_GOALS.find(({ value }) => value === profile?.goal)?.label;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader className="mb-0 animate-rise" title={HOME_COPY.greeting(userName)} description={HOME_COPY.description} />
      <div className="animate-rise animate-rise-1"><TodayOverview hasProfile={profile !== null} /></div>
      <div className="animate-rise animate-rise-2"><NearbyGyms /></div>
      <div className="animate-rise animate-rise-3"><FoodPicks picks={foodPicks} goalLabel={goalLabel} /></div>
    </div>
  );
};

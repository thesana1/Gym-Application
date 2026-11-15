import { TodayOverview } from '@/features/dashboard/components/today-overview';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import { PageHeader } from '@/shared/components/layout/page-header';
import { HOME_COPY } from '@/shared/const/copy-home.const';

type DashboardOverviewProps = {
  userName: string;
  profile: FitnessProfile | null;
};

export const DashboardOverview = ({ userName, profile }: DashboardOverviewProps) => (
  <div className="animate-rise">
    <PageHeader title={HOME_COPY.greeting(userName)} description={HOME_COPY.description} />
    <TodayOverview hasProfile={profile !== null} />
  </div>
);

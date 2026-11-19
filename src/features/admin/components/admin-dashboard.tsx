import { AdminMembers } from '@/features/admin/components/admin-members';
import { AdminSignupChart } from '@/features/admin/components/admin-signup-chart';
import { AdminStatList } from '@/features/admin/components/admin-stat-list';
import type { AdminStats } from '@/features/admin/types/admin.types';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Field } from '@/shared/components/ui/field';
import { ADMIN_COPY } from '@/shared/const/copy-admin.const';

const copy = ADMIN_COPY;
const money = (amount: number) => `$${amount.toLocaleString('en-US')}`;

export const AdminDashboard = ({ stats }: { stats: AdminStats }) => {
  const { users, premium, activity } = stats;
  return (
    <div className="flex animate-rise flex-col gap-6">
      <PageHeader title={copy.title} description={copy.description} className="mb-0" />

      <div className="grid gap-4 lg:grid-cols-5">
        <Field aria-labelledby="admin-members" className="lg:col-span-3">
          <h2 id="admin-members" className="text-xl">{copy.members.title}</h2>
          <p className="flex flex-col gap-1">
            <span className="font-heading text-7xl font-extrabold leading-none tabular-nums tracking-display">{users.total}</span>
            <span className="text-lg">{copy.members.total(users.total)}</span>
          </p>
          <AdminStatList stats={[
            { value: String(users.last7Days), label: copy.members.week },
            { value: String(users.last30Days), label: copy.members.month },
            { value: String(users.finishedProfile), label: copy.members.profile },
          ]} />
        </Field>

        <section aria-labelledby="admin-premium" className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h2 id="admin-premium" className="text-xl">{copy.premium.title}</h2>
          <p className="flex flex-col gap-1">
            <span className="font-heading text-6xl font-extrabold leading-none tabular-nums tracking-display text-pool">{premium.active}</span>
            <span className="text-base text-muted-foreground">
              {copy.premium.active} · {copy.premium.conversion(premium.conversionPercent)}
            </span>
          </p>
          <AdminStatList stats={[
            { value: money(premium.monthlyRevenue), label: copy.premium.revenue },
            { value: String(premium.gifted), label: copy.premium.gifted },
            { value: String(premium.cancelling), label: copy.premium.cancelling },
            { value: String(premium.everBought), label: copy.premium.everBought },
          ]} />
        </section>
      </div>

      <section aria-labelledby="admin-activity" className="flex flex-col gap-2">
        <h2 id="admin-activity" className="text-xl">{copy.activity.title}</h2>
        <AdminStatList className="sm:grid sm:grid-cols-3 sm:divide-y-0" stats={[
          { value: String(activity.activeUsers7Days), label: copy.activity.activeUsers },
          { value: String(activity.workouts7Days), label: copy.activity.workouts },
          { value: String(activity.meals7Days), label: copy.activity.meals },
        ]} />
      </section>

      <AdminSignupChart days={stats.signups} />
      <AdminMembers />
    </div>
  );
};

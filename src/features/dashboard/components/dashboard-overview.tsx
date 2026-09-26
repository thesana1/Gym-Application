import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Plus,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  DASHBOARD_ACTIVITY,
  DASHBOARD_CHANNELS,
  DASHBOARD_METRICS,
  type DashboardMetric,
} from '@/shared/const/dashboard.const';
import { cn } from '@/shared/lib/utils';

const DASHBOARD_ICON_MAP: Record<DashboardMetric['icon'], LucideIcon> = {
  activity: Activity,
  clock: Clock,
  'trending-up': TrendingUp,
  users: Users,
};

const METER_CELLS = 24;

type DashboardOverviewProps = {
  userName: string;
};

export const DashboardOverview = ({ userName }: DashboardOverviewProps) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Welcome back, {userName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is how your workspace is doing today.
          </p>
        </div>
        <Button className="w-full font-semibold sm:w-auto">
          <Plus className="size-4" />
          New project
        </Button>
      </header>

      <section
        aria-label="Key metrics"
        className="animate-rise animate-rise-1 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {DASHBOARD_METRICS.map(({ title, value, delta, trend, icon }) => {
          const Icon = DASHBOARD_ICON_MAP[icon];
          const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;

          return (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {value}
                  </span>
                </div>
                <span
                  className={cn(
                    'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    trend === 'up'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <TrendIcon className="size-3" />
                  {delta}
                  <span className="text-muted-foreground">vs last month</span>
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="animate-rise animate-rise-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {DASHBOARD_ACTIVITY.map(({ title, detail, time }) => (
                <li
                  key={`${title}-${detail}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-2 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{title}</p>
                      <p className="truncate text-xs text-muted-foreground">{detail}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic by channel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {DASHBOARD_CHANNELS.map(({ label, share }) => {
              const filled = Math.round((share / 100) * METER_CELLS);

              return (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {share}%
                    </span>
                  </div>
                  <div
                    className="flex gap-px"
                    role="img"
                    aria-label={`${label}: ${share} percent`}
                  >
                    {Array.from({ length: METER_CELLS }).map((_, cell) => (
                      <span
                        key={cell}
                        className={cn(
                          'h-2 flex-1 rounded-sm',
                          cell < filled ? 'bg-primary' : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

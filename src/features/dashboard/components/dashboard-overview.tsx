import {
  Activity,
  Apple,
  ArrowRight,
  ChartNoAxesCombined,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { ImageUpload } from '@/features/dashboard/components/image-upload';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { DASHBOARD_NEXT_STEPS, type DashboardNextStep } from '@/shared/const/dashboard.const';
import {
  AVAILABLE_EQUIPMENT,
  TRAINING_EXPERIENCE_LEVELS,
  type FitnessGoal,
} from '@/shared/const/fitness.const';
import { cn } from '@/shared/lib/utils';

import type { ReactNode } from 'react';

const NEXT_STEP_ICON_MAP: Record<DashboardNextStep['icon'], LucideIcon> = {
  workout: Dumbbell,
  nutrition: Apple,
  progress: ChartNoAxesCombined,
};

const GOAL_LABELS: Record<FitnessGoal, string> = {
  'muscle-building': 'Build muscle',
  'fat-loss': 'Lose body fat',
  'general-fitness': 'Improve general fitness',
  strength: 'Get stronger',
  endurance: 'Improve endurance',
  'athletic-performance': 'Improve athletic performance',
};

type DashboardOverviewProps = {
  userName: string;
  profile: FitnessProfile | null;
  todayOverview: ReactNode;
};

const getProfileDetails = (profile: FitnessProfile) => {
  const details = [
    { label: 'Goal', value: GOAL_LABELS[profile.goal] },
    {
      label: 'Experience',
      value:
        TRAINING_EXPERIENCE_LEVELS.find(({ value }) => value === profile.experience)?.label ??
        profile.experience,
    },
    profile.trainingDaysPerWeek
      ? {
        label: 'Training days',
        value: `${profile.trainingDaysPerWeek} per week`,
      }
      : null,
    profile.heightCm ? { label: 'Height', value: `${profile.heightCm} cm` } : null,
    profile.weightKg ? { label: 'Weight', value: `${profile.weightKg} kg` } : null,
    profile.age ? { label: 'Age', value: `${profile.age}` } : null,
    profile.availableEquipment.length
      ? {
        label: 'Equipment',
        value: profile.availableEquipment
          .map(
            (equipment) =>
              AVAILABLE_EQUIPMENT.find(({ value }) => value === equipment)?.label ??
                equipment
          )
          .join(', '),
      }
      : null,
  ];

  return details.filter((detail) => detail !== null);
};

export const DashboardOverview = ({
  userName,
  profile,
  todayOverview,
}: DashboardOverviewProps) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your fitness
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Welcome{userName ? `, ${userName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A steady plan starts with knowing what you want to work toward.
          </p>
        </div>
        <Link
          href="/dashboard/profile"
          className={cn(
            'inline-flex h-10 items-center justify-center gap-2 rounded-md',
            'bg-primary px-4 text-sm font-semibold text-primary-foreground',
            'transition-colors hover:bg-primary/90'
          )}
        >
          {profile ? 'Update fitness profile' : 'Set up your profile'}
          <ArrowRight className="size-4" />
        </Link>
      </header>

      {todayOverview}

      <section aria-label="Fitness profile" className="animate-rise animate-rise-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {profile ? 'Your starting point' : 'Start with your goals'}
            </CardTitle>
            <CardDescription>
              {profile
                ? 'Your saved profile is private to your account. ' +
                  'Update it whenever your goals change.'
                : 'Your fitness profile is optional. Add a goal and experience level ' +
                  'to personalize future guidance.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile ? (
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {getProfileDetails(profile).map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                You can explore the dashboard without sharing measurements.
                Only provide optional details if they are useful to you.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Fitness features" className="animate-rise animate-rise-2">
        <h2 className="mb-4 text-lg font-semibold">Your fitness journey</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {DASHBOARD_NEXT_STEPS.map(({ title, description, icon, href }) => {
            const Icon = NEXT_STEP_ICON_MAP[icon];

            return (
              <Card key={title}>
                <CardHeader>
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  {href ? (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      View plan
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Activity className="size-3.5" />
                      Coming next
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-label="Image uploads">
        <ImageUpload />
      </section>
    </div>
  );
};

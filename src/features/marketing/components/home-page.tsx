import { Activity, ArrowRight, Target, Utensils, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { HOME_FEATURES, HOME_STATS, type FeatureCard } from '@/shared/const/home.const';

const FEATURE_ICON_MAP: Record<FeatureCard['icon'], LucideIcon> = {
  activity: Activity,
  utensils: Utensils,
  target: Target,
};

export const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 pb-16 pt-20 sm:px-10 sm:pt-28">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Fitness, with direction
            </span>
          </div>

          <h1 className="animate-rise animate-rise-1 mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            A clearer path to better{' '}
            <span className="text-primary">fitness.</span>
          </h1>

          <p className="animate-rise animate-rise-2 mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Bring training, nutrition, and progress together around your goals.
            Start with a plan, build consistency, and adjust as you go.
          </p>

          <div className="animate-rise animate-rise-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" asChild className="font-semibold">
              <Link href="/sign-up">
                Start your journey
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>

          <dl className="animate-rise animate-rise-4 mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {HOME_STATS.map(({ value, label }) => (
              <div key={label} className="bg-background px-5 py-4">
                <dt className="font-heading text-xl font-bold tracking-tight">{value}</dt>
                <dd className="mt-0.5 text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-label="What's included"
          className="mx-auto w-full max-w-5xl px-6 pb-24 sm:px-10"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            A practical place to start
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {HOME_FEATURES.map((feature) => {
              const Icon = FEATURE_ICON_MAP[feature.icon];

              return (
                <Card
                  key={feature.title}
                  className="gap-0 transition-colors duration-300 hover:border-primary/40"
                >
                  <CardHeader className="pb-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {feature.label}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

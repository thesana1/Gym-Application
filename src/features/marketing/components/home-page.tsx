import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { LandingDemo } from '@/features/marketing/components/landing-demo';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { Button } from '@/shared/components/ui/button';
import { LaneRope } from '@/shared/components/ui/lane-rope';
import { LANDING_COPY } from '@/shared/const/copy-public.const';

const copy = LANDING_COPY;

export const HomePage = () => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <Header />
    <main className="flex-1">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-14 pt-8 sm:px-8 lg:grid-cols-12 lg:items-center lg:pb-24 lg:pt-16">
        <div className="flex animate-rise flex-col gap-6 lg:col-span-7">
          <h1 className="text-5xl leading-none sm:text-7xl">
            {copy.title.map((line) => <span key={line} className="block">{line}</span>)}
          </h1>
          <p className="max-w-lg text-xl text-muted-foreground">{copy.subtitle}</p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/sign-up">{copy.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
            </Button>
            <Button variant="link" asChild className="px-1">
              <Link href="/sign-in">{copy.signIn}</Link>
            </Button>
          </div>
        </div>
        <div className="animate-rise animate-rise-2 lg:col-span-5"><LandingDemo /></div>
      </section>

      <section aria-labelledby="steps-title" className="bg-primary text-primary-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-8 lg:grid-cols-12 lg:py-20">
          <h2 id="steps-title" className="text-4xl leading-none lg:col-span-4 lg:text-5xl">{copy.stepsTitle}</h2>
          <ol className="flex flex-col gap-6 lg:col-span-8">
            {copy.steps.map(({ title, body }, index) => (
              <li key={title} className="flex flex-col gap-2 border-t border-current/15 pt-5 sm:flex-row sm:items-start sm:gap-6">
                <LaneRope total={copy.steps.length} filled={index + 1} label={copy.stepLabel(index + 1, copy.steps.length)} className="sm:mt-2 sm:w-24" />
                <span className="flex flex-col gap-1">
                  <span className="font-heading text-2xl font-extrabold tracking-display">{title}</span>
                  <span className="text-lg">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="features-title" className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-8 lg:grid-cols-12 lg:py-20">
        <h2 id="features-title" className="text-4xl leading-none lg:col-span-4">{copy.featuresTitle}</h2>
        <dl className="flex flex-col lg:col-span-8">
          {copy.features.map(({ title, body }) => (
            <div key={title} className="grid gap-1 border-t border-border py-5 sm:grid-cols-3 sm:gap-6">
              <dt className="font-heading text-xl font-extrabold tracking-display">{title}</dt>
              <dd className="text-lg text-muted-foreground sm:col-span-2">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="closing-title" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-8">
        <div className="flex flex-col gap-5 rounded-3xl bg-foreground px-6 py-10 text-background sm:px-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h2 id="closing-title" className="text-4xl leading-none">{copy.closingTitle}</h2>
            <p className="text-lg text-background/80">{copy.closingBody}</p>
          </div>
          <Button size="lg" asChild className="w-full sm:w-fit">
            <Link href="/sign-up">{copy.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

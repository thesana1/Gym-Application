import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { LandingPreview } from '@/features/marketing/components/landing-preview';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { NavIcon } from '@/shared/components/layout/nav-icon';
import { Button } from '@/shared/components/ui/button';
import { LANDING_COPY } from '@/shared/const/copy-public.const';

const copy = LANDING_COPY;

const StartButtons = () => (
  <div className="flex flex-col gap-3 sm:flex-row">
    <Button size="lg" asChild className="w-full sm:w-auto">
      <Link href="/sign-up">{copy.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
    </Button>
    <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
      <Link href="/sign-in">{copy.signIn}</Link>
    </Button>
  </div>
);

export const HomePage = () => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <Header />
    <main className="flex-1">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-12 pt-10 sm:px-8 lg:grid-cols-2 lg:pb-20 lg:pt-20">
        <div className="flex animate-rise flex-col gap-6">
          <h1 className="text-balance text-5xl font-semibold leading-none sm:text-6xl">
            {copy.titleStart}<span className="text-primary">{copy.titleAccent}</span>{copy.titleEnd}
          </h1>
          <p className="max-w-xl text-xl text-muted-foreground">{copy.subtitle}</p>
          <StartButtons />
        </div>
        <div className="animate-rise animate-rise-2"><LandingPreview /></div>
      </section>

      <section aria-labelledby="steps-title" className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
          <h2 id="steps-title" className="text-2xl font-semibold">{copy.stepsTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {copy.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xl font-semibold
                  text-primary-foreground">{index + 1}</span>
                <span className="text-lg font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="features-title" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8 lg:py-20">
        <h2 id="features-title" className="text-2xl font-semibold">{copy.featuresTitle}</h2>
        <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {copy.features.map(({ icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><NavIcon name={icon} /></span>
              <span className="flex flex-col">
                <span className="text-lg font-semibold">{title}</span>
                <span className="text-base text-muted-foreground">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="closing-title" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-8">
        <div className="flex flex-col gap-5 rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10">
          <h2 id="closing-title" className="text-3xl font-semibold">{copy.closingTitle}</h2>
          <p className="text-lg text-primary-foreground/90">{copy.closingBody}</p>
          <Button size="lg" variant="secondary" asChild className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-fit">
            <Link href="/sign-up">{copy.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

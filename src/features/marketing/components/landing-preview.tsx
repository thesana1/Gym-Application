import { ArrowRight, Dumbbell } from 'lucide-react';

import { Meter } from '@/shared/components/ui/meter';
import { LANDING_COPY } from '@/shared/const/copy-public.const';

const copy = LANDING_COPY;

// A labelled example of the Home screen, so visitors see the app before signing up.
export const LandingPreview = () => (
  <figure aria-label={copy.previewLabel} className="relative mx-auto w-full max-w-sm rounded-3xl border border-border bg-background p-4 shadow-xl">
    <figcaption className="absolute -top-3 right-4 rounded-full bg-foreground px-3 py-1 text-sm font-semibold text-background">{copy.previewTag}</figcaption>
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
        <p className="flex items-center gap-2 text-base font-semibold text-primary-foreground/85">
          <Dumbbell className="size-5" />{copy.previewWorkout}
        </p>
        <p className="mt-1 font-heading text-2xl font-semibold">{copy.previewSession}</p>
        <span className="mt-4 flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-foreground text-base font-semibold text-primary">
          {copy.previewStart}<ArrowRight className="size-5" />
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 font-heading text-lg font-semibold">{copy.previewFood}</p>
        <Meter label={copy.previewCalories} value={1250} target={2200} unit="kcal" />
      </div>
    </div>
  </figure>
);

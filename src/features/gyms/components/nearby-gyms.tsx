'use client';

import { ArrowUpRight, Clock, Dumbbell, MapPin } from 'lucide-react';
import { useState } from 'react';

import { useNearbyGyms } from '@/features/gyms/hooks/use-nearby-gyms';
import type { NearbyGym } from '@/features/gyms/types/gym.types';
import { Button } from '@/shared/components/ui/button';
import { HOME_COPY } from '@/shared/const/copy-home.const';
import { OSM_COPYRIGHT_URL } from '@/shared/const/gyms.const';
import { formatDistance } from '@/shared/utils/format';

const copy = HOME_COPY.gyms;

const directionsUrl = (gym: NearbyGym) => `https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lng}`;

// The gym's main photo; a plain dumbbell placeholder when it has none or the photo fails to load.
const GymPhoto = ({ url }: { url: string | null }) => {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <span className="flex h-32 items-center justify-center bg-muted text-muted-foreground">
        <Dumbbell className="size-8" aria-hidden="true" />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- photos come from any host in the map data
  return <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} className="h-32 w-full object-cover" />;
};

const GymCard = ({ gym }: { gym: NearbyGym }) => (
  <li className="w-64 shrink-0 snap-start">
    <a href={directionsUrl(gym)} target="_blank" rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200
        hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring">
      <GymPhoto url={gym.photoUrl} />
      <span className="flex flex-1 flex-col gap-3 p-4">
        <span className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 font-mono text-sm font-medium text-primary tabular-nums">
            <MapPin className="size-4" aria-hidden="true" />{formatDistance(gym.distanceMeters)}
          </span>
          <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true" />
        </span>
        <span className="line-clamp-2 font-heading text-lg font-semibold leading-snug">{gym.name ?? copy.unnamed}</span>
        {gym.address && <span className="line-clamp-1 text-sm text-muted-foreground">{gym.address}</span>}
        {gym.openingHours && (
          <span className="flex items-start gap-1 text-sm text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2">{copy.opens(gym.openingHours)}</span>
          </span>
        )}
        <span className="mt-auto text-sm font-semibold text-primary">{copy.directions}</span>
      </span>
    </a>
  </li>
);

const Message = ({ text, onRetry }: { text: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-card p-5" role="status">
    <p className="text-base text-muted-foreground">{text}</p>
    {onRetry && <Button variant="outline" onClick={onRetry}>{copy.retry}</Button>}
  </div>
);

// A row of the closest gyms that scrolls sideways. Each card opens directions in a new tab.
export const NearbyGyms = () => {
  const { status, gyms, retry } = useNearbyGyms();

  return (
    <section aria-labelledby="nearby-gyms" className="flex flex-col gap-3">
      <div>
        <h2 id="nearby-gyms" className="text-2xl font-semibold">{copy.title}</h2>
        <p className="text-base text-muted-foreground">{copy.description}</p>
      </div>

      {status === 'locating' && (
        <ul className="-mx-4 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:px-0" role="status" aria-label={copy.locating}>
          {[0, 1, 2].map((key) => <li key={key} className="h-76 w-64 shrink-0 animate-pulse rounded-2xl bg-muted" />)}
        </ul>
      )}
      {status === 'denied' && <Message text={copy.denied} onRetry={retry} />}
      {status === 'unsupported' && <Message text={copy.unsupported} />}
      {status === 'error' && <Message text={copy.error} onRetry={retry} />}
      {status === 'ready' && gyms.length === 0 && <Message text={copy.empty} />}
      {status === 'ready' && gyms.length > 0 && (
        <>
          <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0">
            {gyms.map((gym) => <GymCard key={gym.id} gym={gym} />)}
          </ul>
          <a href={OSM_COPYRIGHT_URL} target="_blank" rel="noopener noreferrer"
            className="self-start text-sm text-muted-foreground underline-offset-4 hover:underline">{copy.attribution}</a>
        </>
      )}
    </section>
  );
};

'use client';

import { MapPin, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import type { GymSearchResult } from '@/features/gyms/service/gym-search.mapper';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { http } from '@/shared/lib/http';

type GymSearchResponse = GymSearchResult | { error: string };

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Enter a town, city, or neighborhood to search.',
  LOCATION_NOT_FOUND: 'We could not find that location. Try a nearby town or city.',
  GEOCODER_UNAVAILABLE: 'Location search is temporarily unavailable. Try again later.',
  GYM_DATA_UNAVAILABLE: 'Gym data is temporarily unavailable. Try again later.',
  INVALID_GEOCODER_RESPONSE: 'Location search returned unusable data. Please try again.',
  INVALID_GYM_DATA_RESPONSE: 'Gym search returned unusable data. Please try again.',
};

export const GymFinder = () => {
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<GymSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await http.get<GymSearchResponse>('/gyms/search', {
        params: { location: location.trim() },
      });
      if ('error' in response) {
        setError(ERROR_MESSAGES[response.error] ?? 'Could not search for gyms.');
        return;
      }
      setResult(response);
    } catch (searchError) {
      const message =
        searchError instanceof Error && 'message' in searchError
          ? ERROR_MESSAGES[searchError.message]
          : undefined;
      setError(message ?? 'Could not search for gyms. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Find a place to train
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Nearby gyms</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search mapped fitness facilities within about 5 km of a place you enter.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search by locality</CardTitle>
          <CardDescription>
            Your search is sent to OpenStreetMap-powered search services to find
            mapped places. Use a town, city, or neighborhood only; do not enter
            your full address or personal details. We do not use browser GPS.
            Search results are temporarily cached for up to 24 hours for
            geocoding and 1 hour for gym data; searches are not saved to your
            fitness profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="gym-location">
              Town, city, or neighborhood
            </label>
            <Input
              id="gym-location"
              autoComplete="off"
              maxLength={120}
              placeholder="e.g. Ballard, Seattle"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              minLength={2}
            />
            <Button type="submit" disabled={isSearching}>
              <Search className="size-4" />
              {isSearching ? 'Searching…' : 'Search gyms'}
            </Button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {result && (
        <section aria-live="polite" className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {result.gyms.length
                ? `${result.gyms.length} mapped ${result.gyms.length === 1 ? 'facility' : 'facilities'}`
                : 'No mapped gyms found'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Approximate distance from the center of {result.searchLocation}
              . Listings and details may be incomplete or out of date.
            </p>
          </div>

          {result.gyms.map((gym) => (
            <Card key={gym.id}>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-base">{gym.name}</CardTitle>
                    <CardDescription className="mt-2 flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      <span>
                        {gym.address ?? 'Address not listed'} · {gym.distanceKm} km
                        approx.
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Hours</dt>
                    <dd>{gym.openingHours ?? 'Not listed'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Fee information</dt>
                    <dd>{gym.fee ?? 'Not listed'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Contact</dt>
                    <dd>
                      {gym.phone ?? 'Not listed'}
                      {gym.website && (
                        <>
                          {gym.phone ? ' · ' : ''}
                          <a
                            className="text-primary underline-offset-4 hover:underline"
                            href={gym.website}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Website
                          </a>
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Other mapped details</dt>
                    <dd>
                      {[gym.operator, gym.sports, gym.wheelchair && `Wheelchair: ${gym.wheelchair}`]
                        .filter(Boolean)
                        .join(' · ') || 'Not listed'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}

          <p className="text-xs text-muted-foreground">
            Data ©{' '}
            <a
              className="underline underline-offset-4"
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              OpenStreetMap contributors
            </a>
            . Ratings and membership prices are not verified or inferred.
          </p>
        </section>
      )}
    </div>
  );
};

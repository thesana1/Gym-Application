'use client';

import { useCallback, useEffect, useState } from 'react';

import type { NearbyGym } from '@/features/gyms/types/gym.types';
import { LOCATION_DECIMALS } from '@/shared/const/gyms.const';
import { http } from '@/shared/lib/http';

export type NearbyGymsStatus = 'locating' | 'ready' | 'denied' | 'unsupported' | 'error';

const round = (value: number) => Number(value.toFixed(LOCATION_DECIMALS));

// Asks the browser for the member's location once, then loads the gyms around it.
export const useNearbyGyms = () => {
  const [status, setStatus] = useState<NearbyGymsStatus>('locating');
  const [gyms, setGyms] = useState<NearbyGym[]>([]);

  const locate = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = { lat: round(coords.latitude), lng: round(coords.longitude) };
          setGyms(await http.get<NearbyGym[]>('/gyms/nearby', { params }));
          setStatus('ready');
        } catch {
          setStatus('error');
        }
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error'),
      { timeout: 10_000, maximumAge: 300_000 }
    );
  }, []);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      queueMicrotask(() => setStatus('unsupported'));
      return;
    }
    locate();
  }, [locate]);

  const retry = useCallback(() => {
    setStatus('locating');
    locate();
  }, [locate]);

  return { status, gyms, retry };
};

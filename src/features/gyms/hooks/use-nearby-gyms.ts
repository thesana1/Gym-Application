'use client';

import { useCallback, useEffect, useState } from 'react';

import type { NearbyGym } from '@/features/gyms/types/gym.types';
import { IP_LOCATION_URL, LOCATION_DECIMALS } from '@/shared/const/gyms.const';
import { http } from '@/shared/lib/http';

export type NearbyGymsStatus = 'locating' | 'ready' | 'denied' | 'unsupported' | 'error';

type Point = { lat: number; lng: number };

const round = (value: number) => Number(value.toFixed(LOCATION_DECIMALS));

// Approximate city-level location from the IP address. Null when the lookup fails.
const locateByIp = async (): Promise<Point | null> => {
  try {
    const response = await fetch(IP_LOCATION_URL, { cache: 'no-store' });
    if (!response.ok) return null;
    const { latitude, longitude } = await response.json() as { latitude?: string; longitude?: string };
    const point = { lat: Number(latitude), lng: Number(longitude) };
    return Number.isFinite(point.lat) && Number.isFinite(point.lng) && latitude && longitude ? point : null;
  } catch {
    return null;
  }
};

// Asks the browser for the member's location once, then loads the gyms around it.
// When the browser cannot give a location (no GPS, location turned off, timeout), it falls back to the IP location.
export const useNearbyGyms = () => {
  const [status, setStatus] = useState<NearbyGymsStatus>('locating');
  const [gyms, setGyms] = useState<NearbyGym[]>([]);

  const loadGyms = useCallback(async ({ lat, lng }: Point) => {
    try {
      setGyms(await http.get<NearbyGym[]>('/gyms/nearby', { params: { lat: round(lat), lng: round(lng) } }));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  const loadGymsByIp = useCallback(async (failedStatus: NearbyGymsStatus) => {
    const point = await locateByIp();
    if (point) await loadGyms(point);
    else setStatus(failedStatus);
  }, [loadGyms]);

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      void loadGymsByIp('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void loadGyms({ lat: coords.latitude, lng: coords.longitude }),
      // A member who said no keeps their choice; any other failure tries the IP location.
      (error) => (error.code === error.PERMISSION_DENIED ? setStatus('denied') : void loadGymsByIp('error')),
      { timeout: 10_000, maximumAge: 300_000 }
    );
  }, [loadGyms, loadGymsByIp]);

  useEffect(() => {
    queueMicrotask(locate);
  }, [locate]);

  const retry = useCallback(() => {
    setStatus('locating');
    locate();
  }, [locate]);

  return { status, gyms, retry };
};

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { proxy } from '@/proxy';

describe('proxy', () => {
  it.each(['/sign-in', '/sign-up'])('keeps %s reachable with a stale cookie', (route) => {
    const request = new NextRequest(`http://localhost:3001${route}`, { headers: { cookie: 'authjs.session-token=expired' } });
    expect(proxy(request).headers.get('location')).toBeNull();
  });
  it('preserves the destination when requesting authentication', () => {
    const response = proxy(new NextRequest('http://localhost:3001/dashboard/workouts?session=1'));
    const destination = new URL(response.headers.get('location')!);
    expect(destination.pathname).toBe('/sign-in');
    expect(destination.searchParams.get('callbackUrl')).toBe('/dashboard/workouts?session=1');
  });
});

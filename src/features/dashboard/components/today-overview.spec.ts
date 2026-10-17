import { afterEach, describe, expect, it } from 'vitest';

import { getLocalDayRange } from '@/features/dashboard/components/today-overview';

const originalTimezone = process.env.TZ;

afterEach(() => {
  if (originalTimezone === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = originalTimezone;
  }
});

describe('getLocalDayRange', () => {
  it('returns browser-local date boundaries across the spring daylight-saving change', () => {
    process.env.TZ = 'America/New_York';

    const range = getLocalDayRange(new Date('2026-03-08T16:00:00.000Z'));

    expect(range).toEqual({
      date: '2026-03-08',
      from: '2026-03-08T05:00:00.000Z',
      to: '2026-03-09T03:59:59.999Z',
    });
  });

  it('returns browser-local date boundaries across the fall daylight-saving change', () => {
    process.env.TZ = 'America/New_York';

    const range = getLocalDayRange(new Date('2026-11-01T17:00:00.000Z'));

    expect(range).toEqual({
      date: '2026-11-01',
      from: '2026-11-01T04:00:00.000Z',
      to: '2026-11-02T04:59:59.999Z',
    });
  });
});

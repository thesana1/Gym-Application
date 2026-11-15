import { describe, expect, it } from 'vitest';

import { getAuthRedirect } from '@/shared/utils/auth-redirect';

describe('getAuthRedirect', () => {
  it('preserves protected destinations and their query parameters', () => {
    expect(getAuthRedirect('/dashboard/workouts?session=1')).toBe('/dashboard/workouts?session=1');
  });
  it.each([undefined, 'https://other.example', '//other.example/dashboard', '/sign-in', '/dashboard/../sign-in', '/dashboard\\other']) (
    'rejects unsafe or looping destination %s', (value) => expect(getAuthRedirect(value)).toBe('/dashboard')
  );
});

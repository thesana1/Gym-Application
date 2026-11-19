import { describe, expect, it } from 'vitest';

import { isAdminEmail } from '@/shared/utils/admin';

describe('isAdminEmail', () => {
  it('matches listed emails ignoring case and spaces', () => {
    const list = 'owner@club.com, Coach@Club.com ,';
    expect(isAdminEmail('owner@club.com', list)).toBe(true);
    expect(isAdminEmail(' coach@club.com', list)).toBe(true);
    expect(isAdminEmail('member@club.com', list)).toBe(false);
    expect(isAdminEmail('', list)).toBe(false);
    expect(isAdminEmail(null, list)).toBe(false);
    expect(isAdminEmail('owner@club.com', '')).toBe(false);
  });
});

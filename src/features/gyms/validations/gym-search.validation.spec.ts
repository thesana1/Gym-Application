import { describe, expect, it } from 'vitest';

import { GymSearchSchema } from './gym-search.validation';

describe('GymSearchSchema', () => {
  it('trims and accepts a locality', () => {
    expect(GymSearchSchema.parse({ location: ' Seattle ' })).toEqual({
      location: 'Seattle',
    });
  });

  it.each([
    { location: 'x' },
    { location: 'a'.repeat(121) },
    { location: 'name@example.com' },
    { location: null },
  ])('rejects invalid or personal location input: %o', (input) => {
    expect(GymSearchSchema.safeParse(input).success).toBe(false);
  });
});

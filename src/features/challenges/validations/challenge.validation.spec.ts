import { describe, expect, it } from 'vitest';

import { ChallengeEnrollmentSchema } from './challenge.validation';

describe('ChallengeEnrollmentSchema', () => {
  it('accepts a challenge from the published catalog', () => {
    expect(
      ChallengeEnrollmentSchema.parse({ challengeId: 'build-consistency' })
    ).toEqual({ challengeId: 'build-consistency' });
  });

  it.each([
    { challengeId: 'unpublished-challenge' },
    { challengeId: '' },
    { challengeId: null },
    { challengeId: 'build-consistency', userId: 'caller-controlled' },
  ])('rejects unknown challenges and unexpected fields: %o', (input) => {
    expect(ChallengeEnrollmentSchema.safeParse(input).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import {
  CoachModerationSchema,
  CoachProfileSchema,
  ConsultationRequestSchema,
} from './coach.validation';

describe('coach validations', () => {
  it('rejects profiles without self-reported qualifications or focus', () => {
    expect(
      CoachProfileSchema.safeParse({
        displayName: 'Coach Example',
        bio: 'An experienced coach who helps people build sustainable routines.',
        experienceYears: 8,
        qualifications: [],
        specializations: [],
        languages: ['English'],
        availabilityNote: '',
      }).success
    ).toBe(false);
  });

  it('rejects malformed coach ids and unexpected request fields', () => {
    expect(
      ConsultationRequestSchema.safeParse({
        coachProfileId: 'not-an-object-id',
        topic: 'Strength training',
        message: 'I would like general help with my training plan.',
        preferredAvailability: '',
      }).success
    ).toBe(false);
    expect(
      CoachModerationSchema.safeParse({
        profileId: '507f1f77bcf86cd799439011',
        decision: 'verified',
        expectedRevision: 0,
      }).success
    ).toBe(false);
    expect(
      CoachModerationSchema.safeParse({
        profileId: '507f1f77bcf86cd799439011',
        decision: 'verified',
        reviewedBy: 'caller-controlled',
      }).success
    ).toBe(false);
  });

  it('accepts a bounded consultation request with a valid coach id', () => {
    expect(
      ConsultationRequestSchema.safeParse({
        coachProfileId: '507f1f77bcf86cd799439011',
        topic: 'Strength training',
        message: 'I would like general help with my training plan.',
        preferredAvailability: 'Weekday mornings',
      }).success
    ).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { FitnessProfileSchema } from '@/features/fitness/validations/fitness-profile.validation';

const validProfile = {
  goal: 'muscle-building',
  experience: 'beginner',
  age: '28',
  heightCm: '174.5',
  weightKg: '72',
  trainingDaysPerWeek: '4',
  availableEquipment: ['dumbbells', 'barbell'],
};

describe('FitnessProfileSchema', () => {
  it('converts optional form values to validated profile values', () => {
    expect(FitnessProfileSchema.parse(validProfile)).toEqual({
      goal: 'muscle-building',
      experience: 'beginner',
      age: 28,
      heightCm: 174.5,
      weightKg: 72,
      trainingDaysPerWeek: 4,
      availableEquipment: ['dumbbells', 'barbell'],
    });
  });

  it('allows measurements to be omitted', () => {
    expect(
      FitnessProfileSchema.parse({
        goal: 'general-fitness',
        experience: 'beginner',
        availableEquipment: [],
      })
    ).toMatchObject({
      goal: 'general-fitness',
      experience: 'beginner',
      availableEquipment: [],
    });
  });

  it('rejects invalid ranges, choices, and unexpected properties', () => {
    expect(
      FitnessProfileSchema.safeParse({ ...validProfile, age: '12' }).success
    ).toBe(false);
    expect(
      FitnessProfileSchema.safeParse({
        ...validProfile,
        availableEquipment: ['treadmill'],
      }).success
    ).toBe(false);
    expect(
      FitnessProfileSchema.safeParse({ ...validProfile, medicalCondition: 'private' })
        .success
    ).toBe(false);
  });

  it('requires a goal and experience level', () => {
    expect(
      FitnessProfileSchema.safeParse({
        ...validProfile,
        goal: '',
        experience: '',
      }).success
    ).toBe(false);
  });
});

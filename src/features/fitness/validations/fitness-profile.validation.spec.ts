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

  it('requires training days, age, height and weight with a friendly message', () => {
    const result = FitnessProfileSchema.safeParse({ ...validProfile, age: '', heightCm: '', weightKg: '', trainingDaysPerWeek: '' });
    expect(result.success).toBe(false);
    const messages = Object.fromEntries((result.error?.issues ?? []).map(({ path, message }) => [path[0], message]));
    expect(messages).toEqual({
      age: 'Please fill this in.', heightCm: 'Please fill this in.', weightKg: 'Please fill this in.', trainingDaysPerWeek: 'Please pick a number.',
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

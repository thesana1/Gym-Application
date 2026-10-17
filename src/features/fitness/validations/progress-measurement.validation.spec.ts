import { describe, expect, it } from 'vitest';

import { ProgressMeasurementSchema } from '@/features/fitness/validations/progress-measurement.validation';

describe('ProgressMeasurementSchema', () => {
  it('normalizes a partial measurement record with valid units and date', () => {
    expect(
      ProgressMeasurementSchema.parse({
        date: '2026-10-04',
        weightKg: '72.5',
        waistCm: '',
        notes: 'Morning measurement',
      })
    ).toMatchObject({
      date: '2026-10-04',
      weightKg: 72.5,
      notes: 'Morning measurement',
    });
  });

  it('requires at least one measurement and validates date and ranges', () => {
    expect(
      ProgressMeasurementSchema.safeParse({ date: '2026-10-04' }).success
    ).toBe(false);
    expect(
      ProgressMeasurementSchema.safeParse({
        date: '2026-02-30',
        weightKg: '72',
      }).success
    ).toBe(false);
    expect(
      ProgressMeasurementSchema.safeParse({
        date: '2026-10-04',
        weightKg: '500',
      }).success
    ).toBe(false);
  });

  it('rejects unknown fields', () => {
    expect(
      ProgressMeasurementSchema.safeParse({
        date: '2026-10-04',
        waistCm: '80',
        bodyFatDiagnosis: 'condition',
      }).success
    ).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import {
  getMeasurementWindowSummary,
} from '@/features/fitness/components/measurement-window-summary';
import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';

const measurement = (
  id: string,
  date: string,
  fields: Partial<ProgressMeasurement> = {}
): ProgressMeasurement => ({
  id,
  date,
  ...fields,
});

describe('getMeasurementWindowSummary', () => {
  it('compares each measurement type using its own first and latest readings', () => {
    const data = [
      measurement('old', '2026-09-20', { weightKg: 70, waistCm: 82 }),
      measurement('middle', '2026-10-01', { weightKg: 69 }),
      measurement('latest', '2026-10-17', { weightKg: 68, waistCm: 80 }),
      measurement('future', '2026-10-18', { weightKg: 50 }),
      measurement('out-of-range', '2026-09-18', { weightKg: 40 }),
    ];

    const result = getMeasurementWindowSummary(
      data,
      4,
      new Date(2026, 9, 17, 15, 0)
    );

    expect(result.startDate).toBe('2026-09-20');
    expect(result.endDate).toBe('2026-10-17');
    expect(result.recordCount).toBe(3);
    expect(result.comparisons).toEqual([
      {
        key: 'weightKg',
        label: 'Weight',
        unit: 'kg',
        first: 70,
        latest: 68,
        firstDate: '2026-09-20',
        latestDate: '2026-10-17',
        change: -2,
      },
      {
        key: 'waistCm',
        label: 'Waist',
        unit: 'cm',
        first: 82,
        latest: 80,
        firstDate: '2026-09-20',
        latestDate: '2026-10-17',
        change: -2,
      },
    ]);
  });

  it('uses local calendar-day boundaries across daylight-saving changes', () => {
    const springResult = getMeasurementWindowSummary(
      [],
      4,
      new Date(2026, 2, 29, 12)
    );
    const autumnResult = getMeasurementWindowSummary(
      [],
      4,
      new Date(2026, 9, 25, 12)
    );

    expect(springResult.startDate).toBe('2026-03-02');
    expect(springResult.endDate).toBe('2026-03-29');
    expect(autumnResult.startDate).toBe('2026-09-28');
    expect(autumnResult.endDate).toBe('2026-10-25');
  });

  it('returns only records in the selected eight-week range', () => {
    const result = getMeasurementWindowSummary(
      [
        measurement('old', '2026-08-22', { weightKg: 80 }),
        measurement('first', '2026-08-23', { weightKg: 79 }),
        measurement('latest', '2026-10-17', { weightKg: 77 }),
      ],
      8,
      new Date(2026, 9, 17)
    );

    expect(result.startDate).toBe('2026-08-23');
    expect(result.recordCount).toBe(2);
    expect(result.comparisons[0]).toMatchObject({
      key: 'weightKg',
      change: -2,
    });
  });

  it('does not compare a single value or invent missing observations', () => {
    const result = getMeasurementWindowSummary(
      [measurement('one', '2026-10-10', { armCm: 30 })],
      4,
      new Date(2026, 9, 17)
    );

    expect(result.recordCount).toBe(1);
    expect(result.comparisons).toEqual([]);
  });
});

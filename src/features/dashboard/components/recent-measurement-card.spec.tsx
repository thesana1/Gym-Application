import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  RecentMeasurementCard,
  summarizeRecentMeasurements,
} from '@/features/dashboard/components/recent-measurement-card';
import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';

describe('summarizeRecentMeasurements', () => {
  it('compares the first and latest values in a four-week window', () => {
    const now = new Date('2025-03-03T12:00:00');
    const measurements: ProgressMeasurement[] = [
      { id: '1', date: '2025-02-05', weightKg: 80, waistCm: 88 },
      { id: '2', date: '2025-02-18', weightKg: 79, waistCm: 87 },
      { id: '3', date: '2025-03-03', weightKg: 78, waistCm: 85 },
    ];

    const summary = summarizeRecentMeasurements(measurements, now);

    expect(summary.startDate).toBe('2025-02-04');
    expect(summary.endDate).toBe('2025-03-03');
    expect(summary.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'weightKg', change: -2, firstValue: 80, latestValue: 78 }),
        expect.objectContaining({ key: 'waistCm', change: -3, firstValue: 88, latestValue: 85 }),
      ])
    );
  });
});

describe('RecentMeasurementCard', () => {
  it('renders a helpful empty state when there are not enough readings', () => {
    render(
      <RecentMeasurementCard
        measurements={[
          { id: '1', date: '2025-02-10', weightKg: 82 },
        ]}
      />
    );

    expect(
      screen.getByText('Log at least two measurements in the last four weeks to see a trend.')
    ).toBeInTheDocument();
  });
});

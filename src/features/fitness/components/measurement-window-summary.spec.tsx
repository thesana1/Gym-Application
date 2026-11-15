import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MeasurementWindowSummary } from '@/features/fitness/components/measurement-window-summary';
import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';

const measurements: ProgressMeasurement[] = [
  { id: 'first', date: '2026-10-01', weightKg: 75 },
  { id: 'last', date: '2026-10-17', weightKg: 74 },
];

describe('MeasurementWindowSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 17, 12));
  });

  afterEach(() => vi.useRealTimers());

  it('renders a neutral self-entered comparison and switches ranges', () => {
    render(<MeasurementWindowSummary measurements={measurements} />);

    expect(screen.getByText('Down 1.0 kg')).toBeInTheDocument();
    expect(screen.getByText('75 → 74 kg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '8 weeks' }));

    expect(screen.getByRole('button', { name: '8 weeks' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Down 1.0 kg')).toBeInTheDocument();
  });

  it('explains when no same-type comparison can be made', () => {
    render(
      <MeasurementWindowSummary
        measurements={[{ id: 'one', date: '2026-10-17', armCm: 30 }]}
      />
    );

    expect(
      screen.getByText('Save the same thing at least twice to compare.')
    ).toBeInTheDocument();
  });
});

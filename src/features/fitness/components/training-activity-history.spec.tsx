import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/http', () => ({
  http: { get: vi.fn() },
}));

import { TrainingActivityHistory } from '@/features/fitness/components/training-activity-history';
import { http } from '@/shared/lib/http';

const mockGet = vi.mocked(http.get);

describe('TrainingActivityHistory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows only the returned activity counts and requests the selected range', async () => {
    mockGet
      .mockResolvedValueOnce({
        weeks: 4,
        periods: [
          {
            start: '2026-09-19T12:00:00.000Z',
            end: '2026-09-26T12:00:00.000Z',
            workoutCount: 2,
            setCount: 7,
            distinctExerciseCount: 3,
          },
        ],
      })
      .mockResolvedValueOnce({
        weeks: 8,
        periods: [
          {
            start: '2026-08-22T12:00:00.000Z',
            end: '2026-08-29T12:00:00.000Z',
            workoutCount: 1,
            setCount: 4,
            distinctExerciseCount: 2,
          },
        ],
      });

    render(<TrainingActivityHistory />);

    expect(await screen.findByText('7')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(
      screen.getByText(/not training quality, health outcomes, or a recommended schedule/)
    ).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith('/fitness/activity', {
      params: { weeks: 4 },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Past 8 weeks' }));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/fitness/activity', {
        params: { weeks: 8 },
      });
    });
    expect(await screen.findByText('4')).toBeInTheDocument();
  });

  it('offers retry when activity cannot be loaded', async () => {
    mockGet.mockRejectedValueOnce(new Error('Request failed'));
    mockGet.mockResolvedValueOnce({ weeks: 4, periods: [] });

    render(<TrainingActivityHistory />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your training activity.'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

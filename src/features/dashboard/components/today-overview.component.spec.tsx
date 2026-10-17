import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/http', () => ({
  http: { get: vi.fn() },
}));

import { getLocalDayRange, TodayOverview } from '@/features/dashboard/components/today-overview';
import { http } from '@/shared/lib/http';

const mockGet = vi.mocked(http.get);

describe('TodayOverview', () => {
  beforeEach(() => vi.resetAllMocks());

  it('loads local-day workouts and nutrition using the signed-in APIs', async () => {
    mockGet
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ sessions: [], assignments: [] })
      .mockResolvedValueOnce([]);

    render(<TodayOverview />);

    expect(
      await screen.findByText('No completed workouts logged today.')
    ).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith('/fitness/workouts', {
      params: {
        from: getLocalDayRange().from,
        to: getLocalDayRange().to,
      },
    });
    expect(mockGet).toHaveBeenCalledWith('/nutrition/entries', {
      params: { date: getLocalDayRange().date },
    });
    expect(mockGet).toHaveBeenCalledWith('/nutrition/targets');
    expect(mockGet).toHaveBeenCalledWith('/fitness/schedule');
    expect(mockGet).toHaveBeenCalledWith('/fitness/measurements');
    expect(
      screen.getByText('No session is scheduled for today.')
    ).toBeInTheDocument();
  });

  it('shows a scheduled session separately from completed workout logs', async () => {
    mockGet
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        sessions: [{ sessionIndex: 0, title: 'Full body A' }],
        assignments: [
          {
            weekday: new Date().getDay(),
            sessionIndex: 0,
            sessionTitle: 'Full body A',
          },
        ],
      })
      .mockResolvedValueOnce([]);

    render(<TodayOverview />);

    expect(
      await screen.findByText('Planned session · not completed')
    ).toBeInTheDocument();
    expect(screen.getByText('Full body A')).toBeInTheDocument();
    expect(
      screen.getByText('No completed workouts logged today.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Log completed session' })
    ).toHaveAttribute('href', '/dashboard/workouts?session=0');
  });

  it('shows a retry action when data loading fails', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('Request failed'))
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ sessions: [], assignments: [] })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ sessions: [], assignments: [] })
      .mockResolvedValueOnce([]);

    render(<TodayOverview />);

    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(10);
    });
    expect(
      await screen.findByText('No food or water entries logged today.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

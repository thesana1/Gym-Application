import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/http', () => ({
  http: { get: vi.fn(), put: vi.fn() },
}));

import { WeeklyWorkoutSchedule } from '@/features/fitness/components/weekly-workout-schedule';
import { http } from '@/shared/lib/http';

const mockGet = vi.mocked(http.get);
const mockPut = vi.mocked(http.put);

describe('WeeklyWorkoutSchedule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads, edits, and saves distinct weekday assignments', async () => {
    mockGet.mockResolvedValueOnce({
      sessions: [
        { sessionIndex: 0, title: 'Full body A' },
        { sessionIndex: 1, title: 'Full body B' },
      ],
      assignments: [
        { weekday: 1, sessionIndex: 0, sessionTitle: 'Full body A' },
      ],
    });
    mockPut.mockResolvedValueOnce({
      sessions: [],
      assignments: [
        { weekday: 2, sessionIndex: 0, sessionTitle: 'Full body A' },
      ],
    });

    render(
      <WeeklyWorkoutSchedule
        sessions={[{ title: 'Full body A' }, { title: 'Full body B' }]}
      />
    );

    const firstSession = await screen.findByLabelText('Session 1: Full body A');
    expect(firstSession).toHaveValue('1');
    fireEvent.change(firstSession, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save schedule' }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/fitness/schedule', {
        assignments: [{ weekday: 2, sessionIndex: 0 }],
      });
    });
    expect(await screen.findByText('Schedule saved.')).toBeInTheDocument();
  });

  it('offers a retry if the saved schedule cannot be loaded', async () => {
    mockGet.mockRejectedValueOnce(new Error('Request failed'));
    mockGet.mockResolvedValueOnce({ sessions: [], assignments: [] });

    render(<WeeklyWorkoutSchedule sessions={[{ title: 'Full body A' }]} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your schedule. Please try again.'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

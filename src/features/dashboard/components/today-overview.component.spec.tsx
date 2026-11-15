import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/http', () => ({
  http: { get: vi.fn() },
}));

import { getLocalDayRange, TodayOverview } from '@/features/dashboard/components/today-overview';
import { http } from '@/shared/lib/http';

const mockGet = vi.mocked(http.get);
const noSchedule = { sessions: [], assignments: [] };
const respond = (workouts: unknown[], entries: unknown[], schedule: unknown = noSchedule) =>
  mockGet.mockResolvedValueOnce(workouts).mockResolvedValueOnce(entries).mockResolvedValueOnce(null).mockResolvedValueOnce(schedule);

describe('TodayOverview', () => {
  beforeEach(() => vi.resetAllMocks());

  it('loads the week of workouts and only today’s food using the signed-in APIs', async () => {
    respond([], []);
    render(<TodayOverview hasProfile />);

    expect(await screen.findByText('Rest day')).toBeInTheDocument();
    expect(screen.getByText('Pick your training days to see your next workout.')).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith('/fitness/workouts', {
      params: { from: getLocalDayRange(new Date(), 7).from, to: getLocalDayRange().to },
    });
    expect(mockGet).toHaveBeenCalledWith('/nutrition/entries', {
      params: { from: getLocalDayRange().date, to: getLocalDayRange().date },
    });
    expect(mockGet).toHaveBeenCalledWith('/nutrition/targets');
    expect(mockGet).toHaveBeenCalledWith('/fitness/schedule');
  });

  it('puts today’s planned session first with one Start button', async () => {
    respond([], [], {
      sessions: [{ sessionIndex: 0, title: 'Full body A' }],
      assignments: [{ weekday: new Date().getDay(), sessionIndex: 0, sessionTitle: 'Full body A' }],
    });
    render(<TodayOverview hasProfile />);

    expect(await screen.findByText('Full body A')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start workout' })).toHaveAttribute('href', '/dashboard/workouts?session=0');
  });

  it('asks new members to set up their plan instead of showing a workout', async () => {
    respond([], []);
    render(<TodayOverview hasProfile={false} />);

    expect(await screen.findByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/dashboard/profile');
    expect(screen.queryByText('Rest day')).not.toBeInTheDocument();
  });

  it('shows a retry action when data loading fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('Request failed')).mockResolvedValue([]);
    render(<TodayOverview hasProfile />);

    const retry = await screen.findByRole('button', { name: 'Try again' });
    mockGet.mockReset();
    respond([], []);
    fireEvent.click(retry);

    expect(await screen.findByText('Nothing added yet today.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});

it('counts every workout from the last 7 days in the progress number but only today’s as done', async () => {
  vi.resetAllMocks();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  respond([{ id: 'past', title: 'Yesterday', completedAt: yesterday.toISOString(), exercises: [] }], []);
  render(<TodayOverview hasProfile />);

  expect(await screen.findByText('Workouts in the last 7 days')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.queryByText('Done for today')).not.toBeInTheDocument();
});

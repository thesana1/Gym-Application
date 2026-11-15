import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loadProfile: vi.fn(), saveProfile: vi.fn() }));
vi.mock('@/features/fitness/hooks/use-fitness-profile', () => ({
  useFitnessProfile: () => ({ loading: false, saving: false, error: null, ...mocks }),
}));

import { FitnessProfileForm } from '@/features/fitness/components/fitness-profile-form';

const profile = {
  goal: 'general-fitness', experience: 'beginner', availableEquipment: ['dumbbells'], heightCm: 180,
};

describe('FitnessProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadProfile.mockResolvedValue(null);
    mocks.saveProfile.mockResolvedValue(true);
  });

  it('asks one question at a time and offers the workout plan after saving', async () => {
    await act(async () => { render(<FitnessProfileForm />); });
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Please pick a goal.')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Improve general fitness'));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByLabelText(/Beginner/));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Make my plan' }));

    expect(await screen.findByRole('link', { name: 'See my workouts' })).toHaveAttribute('href', '/dashboard/workouts');
    expect(mocks.saveProfile).toHaveBeenCalledWith(expect.objectContaining({
      goal: 'general-fitness', experience: 'beginner', availableEquipment: [],
    }));
  });

  it('lets a returning member change one answer and keeps every other saved answer', async () => {
    mocks.loadProfile.mockResolvedValue(profile);
    await act(async () => { render(<FitnessProfileForm />); });
    expect(screen.getByText('Dumbbells')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Change Goal' }));
    fireEvent.click(screen.getByLabelText('Get stronger'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mocks.saveProfile).toHaveBeenCalledWith(expect.objectContaining({ ...profile, goal: 'strength' })));
    expect(await screen.findByText('Get stronger')).toBeInTheDocument();
  });

  it('jumps to the question with a problem when a saved value fails validation', async () => {
    mocks.loadProfile.mockResolvedValue({ ...profile, heightCm: 20 });
    await act(async () => { render(<FitnessProfileForm />); });
    fireEvent.click(screen.getByRole('button', { name: 'Change Goal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByLabelText('Height (cm)')).toBeVisible();
    expect(mocks.saveProfile).not.toHaveBeenCalled();
  });
});

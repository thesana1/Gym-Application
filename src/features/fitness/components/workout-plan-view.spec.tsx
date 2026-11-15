import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkoutPlanView } from '@/features/fitness/components/workout-plan-view';
import { createWorkoutPlanService } from '@/features/fitness/service/workout-plan.service';

const result = createWorkoutPlanService({
  goal: 'general-fitness',
  experience: 'beginner',
  availableEquipment: [],
  trainingDaysPerWeek: 3,
});
if ('error' in result.data) throw new Error('Expected a workout plan');
const plan = result.data;

describe('WorkoutPlanView', () => {
  it('shows one session and logs the session the user selects', () => {
    const onLogSession = vi.fn();
    render(<WorkoutPlanView plan={plan} onLogSession={onLogSession} />);

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(plan.sessions[0].exercises.length);
    fireEvent.click(screen.getByRole('button', { name: 'Workout 2' }));
    expect(screen.getByRole('heading', { level: 2, name: plan.sessions[1].title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Workout 2' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Start this workout' }));
    expect(onLogSession).toHaveBeenCalledWith(1);
  });

  it('honors a session deep link and keeps instructions available next to the exercise', () => {
    render(<WorkoutPlanView plan={plan} initialSessionIndex={1} />);
    expect(screen.getByRole('button', { name: 'Workout 2' })).toHaveAttribute('aria-pressed', 'true');
    const instruction = screen.getByText(plan.sessions[1].exercises[0].instructions[0]);
    expect(instruction).not.toBeVisible();
    fireEvent.click(screen.getAllByText('How to do it')[0]);
    expect(instruction).toBeVisible();
  });

  it('falls back from an invalid session index and offers profile setup for an empty plan', () => {
    const { rerender } = render(<WorkoutPlanView plan={plan} initialSessionIndex={99} />);
    expect(screen.getByRole('button', { name: 'Workout 1' })).toHaveAttribute('aria-pressed', 'true');
    rerender(<WorkoutPlanView plan={null} />);
    expect(screen.getByRole('link', { name: 'Make my plan' })).toHaveAttribute('href', '/dashboard/profile');
  });
});

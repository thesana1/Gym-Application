import { describe, expect, it } from 'vitest';

import { buildPlanCalendar } from '@/features/training/service/training-calendar.service';

const plan = {
  goal: 'strength' as const, focusAreas: [], source: 'manual' as const,
  workouts: [
    { id: 'w1', name: 'Legs, day', weekday: 3, exercises: [{ exerciseId: 'leg-press', sets: 3, repMin: 4, repMax: 6, restSeconds: 180 }] },
    { id: 'w2', name: 'Unscheduled', weekday: null, exercises: [{ exerciseId: 'push-up', sets: 2, repMin: 8, repMax: 12, restSeconds: 90 }] },
  ],
};

describe('buildPlanCalendar', () => {
  it('creates one weekly event per scheduled workout, starting on its next day', () => {
    const ics = buildPlanCalendar(plan, new Date(2026, 10, 16, 9));
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261118');
    expect(ics).toContain('RRULE:FREQ=WEEKLY');
    expect(ics).toContain('SUMMARY:Workout: Legs\\, day');
    expect(ics).toContain('Leg press: 3 × 4–6');
  });
});

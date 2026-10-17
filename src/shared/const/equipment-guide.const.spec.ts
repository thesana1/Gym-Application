import { describe, expect, it } from 'vitest';

import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

import { EQUIPMENT_GUIDE } from './equipment-guide.const';

describe('equipment guide catalogue', () => {
  it('covers equipment types used in the exercise library with guidance', () => {
    const equipmentInExercises = new Set(
      WORKOUT_EXERCISE_LIBRARY.flatMap(({ equipment }) => equipment)
    );
    const equipmentInGuide = new Set(
      EQUIPMENT_GUIDE.map(({ equipment }) => equipment)
    );

    expect([...equipmentInExercises].filter((equipment) => equipment !== 'bodyweight'))
      .toEqual(expect.arrayContaining([...equipmentInGuide]));
    expect([...equipmentInGuide]).toEqual(
      expect.arrayContaining(
        [...equipmentInExercises].filter((equipment) => equipment !== 'bodyweight')
      )
    );
    expect(
      EQUIPMENT_GUIDE.every(
        ({ setup, safetyNotes }) => setup.length > 0 && safetyNotes.length > 0
      )
    ).toBe(true);
  });
});

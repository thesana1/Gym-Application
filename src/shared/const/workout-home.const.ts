import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

// Dumbbell, band and bodyweight moves that work at home or in the gym.
export const HOME_EXERCISES: WorkoutExerciseDefinition[] = [
  {
    id: 'goblet-squat', name: 'Goblet squat', equipment: ['dumbbells'], targetMuscles: 'Thighs and glutes', region: 'lower', focus: ['legs', 'glutes'],
    instructions: ['Hold one dumbbell at your chest.', 'Sit down between your heels.', 'Stand up by pushing through your feet.'],
    commonMistake: 'Leaning far forward.', regression: 'Do bodyweight squats.', safetyCue: 'Go only as deep as feels good.',
  },
  {
    id: 'dumbbell-bench-press', name: 'Dumbbell bench press', equipment: ['dumbbells'], targetMuscles: 'Chest, shoulders and arms', region: 'upper',
    focus: ['chest', 'arms'],
    instructions: ['Lie on a bench with a dumbbell in each hand.', 'Lower them slowly to the sides of your chest.', 'Press them back up.'],
    commonMistake: 'Dropping the dumbbells too fast.', regression: 'Do push-ups on a bench.', safetyCue: 'Use weights you can control.',
  },
  {
    id: 'dumbbell-romanian-deadlift', name: 'Dumbbell Romanian deadlift', equipment: ['dumbbells'], targetMuscles: 'Hamstrings and glutes', region: 'lower',
    focus: ['glutes', 'legs'],
    instructions: [
      'Hold dumbbells in front of your thighs.',
      'Push your hips back and lower the weights down your legs.',
      'Stand tall and squeeze your glutes.',
    ],
    commonMistake: 'Rounding your back.', regression: 'Practise the hip hinge with no weight.', safetyCue: 'Keep your back flat.',
  },
  {
    id: 'dumbbell-split-squat', name: 'Split squat', equipment: ['dumbbells'], targetMuscles: 'Thighs and glutes', region: 'lower', focus: ['legs', 'glutes'],
    instructions: ['Stand in a long step with a dumbbell in each hand.', 'Lower your back knee towards the floor.', 'Push up through your front foot.'],
    commonMistake: 'Front knee falling inward.', regression: 'Do it with no weight and hold a wall.', safetyCue: 'Hold something for balance if needed.',
  },
  {
    id: 'dumbbell-lateral-raise', name: 'Side raise', equipment: ['dumbbells'], targetMuscles: 'Shoulders', region: 'upper', focus: ['shoulders'],
    instructions: ['Stand with light dumbbells at your sides.', 'Lift your arms out to the side up to shoulder height.', 'Lower them slowly.'],
    commonMistake: 'Swinging heavy weights.', regression: 'Use very light weights or a band.', safetyCue: 'Stop at shoulder height.',
  },
  {
    id: 'dumbbell-curl', name: 'Biceps curl', equipment: ['dumbbells'], targetMuscles: 'Front of arms', region: 'upper', focus: ['arms'],
    instructions: ['Hold dumbbells with palms facing forward.', 'Bend your elbows to lift the weights.', 'Lower them slowly.'],
    commonMistake: 'Swinging your body.', regression: 'Use a band or lighter weights.', safetyCue: 'Keep your elbows at your sides.',
  },
  {
    id: 'dumbbell-overhead-triceps', name: 'Overhead triceps press', equipment: ['dumbbells'], targetMuscles: 'Back of arms', region: 'upper', focus: ['arms'],
    instructions: ['Hold one dumbbell with both hands above your head.', 'Bend your elbows to lower it behind your head.', 'Straighten your arms again.'],
    commonMistake: 'Elbows flaring out wide.', regression: 'Do it seated with a lighter weight.', safetyCue: 'Hold the weight firmly.',
  },
  {
    id: 'push-up', name: 'Push-up', equipment: ['bodyweight'], targetMuscles: 'Chest, shoulders and arms', region: 'upper', focus: ['chest', 'arms'],
    instructions: ['Hands under your shoulders, body in a straight line.', 'Lower your chest towards the floor.', 'Push back up.'],
    commonMistake: 'Hips sagging.', regression: 'Do incline push-ups on a bench or wall.', safetyCue: 'Stop if your wrists or shoulders hurt.',
  },
  {
    id: 'step-up', name: 'Step-up', equipment: ['bodyweight'], targetMuscles: 'Thighs and glutes', region: 'lower', focus: ['legs', 'glutes'],
    instructions: ['Stand in front of a sturdy step or box.', 'Step up with one foot and stand tall.', 'Step down slowly and switch legs.'],
    commonMistake: 'Pushing off the back foot.', regression: 'Use a lower step.', safetyCue: 'Make sure the step does not slide.',
  },
  {
    id: 'calf-raise', name: 'Calf raise', equipment: ['bodyweight'], targetMuscles: 'Calves', region: 'lower', focus: ['legs'],
    instructions: ['Stand tall, holding a wall for balance.', 'Rise up onto your toes.', 'Lower slowly.'],
    commonMistake: 'Bouncing.', regression: 'Do both legs with a smaller range.', safetyCue: 'Hold on for balance.',
  },
  {
    id: 'superman', name: 'Superman', equipment: ['bodyweight'], targetMuscles: 'Lower and upper back', region: 'core', focus: ['back', 'core'],
    instructions: [
      'Lie face down with arms stretched out in front.',
      'Lift your arms, chest and legs a little off the floor.',
      'Hold for a breath, then lower slowly.',
    ],
    commonMistake: 'Lifting too high and straining your neck.', regression: 'Lift only your arms, or only your legs.',
    safetyCue: 'Keep your neck long and look at the floor.',
  },
  {
    id: 'reverse-crunch', name: 'Reverse crunch', equipment: ['bodyweight'], targetMuscles: 'Lower stomach', region: 'core', focus: ['core'],
    instructions: ['Lie on your back with knees bent and feet up.', 'Curl your hips off the floor towards your chest.', 'Lower slowly.'],
    commonMistake: 'Swinging your legs.', regression: 'Make the movement smaller.', safetyCue: 'Keep your lower back on the floor.',
  },
  {
    id: 'band-overhead-press', name: 'Band shoulder press', equipment: ['resistance-bands'], targetMuscles: 'Shoulders and arms', region: 'upper',
    focus: ['shoulders', 'arms'],
    instructions: ['Stand on the band, handles at your shoulders.', 'Press your hands up over your head.', 'Lower them slowly.'],
    commonMistake: 'Arching your back.', regression: 'Use a lighter band.', safetyCue: 'Check the band for tears first.',
  },
  {
    id: 'band-curl', name: 'Band biceps curl', equipment: ['resistance-bands'], targetMuscles: 'Front of arms', region: 'upper', focus: ['arms'],
    instructions: ['Stand on the band, holding the handles.', 'Bend your elbows to pull your hands up.', 'Lower slowly.'],
    commonMistake: 'Swinging your body.', regression: 'Use a lighter band.', safetyCue: 'Keep the band under your feet.',
  },
];

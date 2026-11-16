import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

// Common barbell and machine lifts, written in plain words for beginners.
export const GYM_EXERCISES: WorkoutExerciseDefinition[] = [
  {
    id: 'barbell-back-squat', name: 'Barbell squat', equipment: ['barbell'], targetMuscles: 'Thighs and glutes', region: 'lower', focus: ['legs', 'glutes'],
    instructions: [
      'Rest the bar across your upper back, feet shoulder-width apart.',
      'Sit down and back until your thighs are about level.',
      'Push through your whole foot to stand up.',
    ],
    commonMistake: 'Knees falling inward or heels lifting.', regression: 'Do goblet squats with a dumbbell first.',
    safetyCue: 'Use safety bars in a rack and stop if your back or knees hurt.',
  },
  {
    id: 'barbell-bench-press', name: 'Bench press', equipment: ['barbell'], targetMuscles: 'Chest, shoulders and arms',
    region: 'upper', focus: ['chest', 'arms'],
    instructions: [
      'Lie on the bench with your eyes under the bar.',
      'Lower the bar slowly to your mid chest.',
      'Press it back up until your arms are straight.',
    ],
    commonMistake: 'Bouncing the bar off the chest.', regression: 'Use dumbbells or a machine chest press.',
    safetyCue: 'Always use safety bars or a spotter.',
  },
  {
    id: 'barbell-romanian-deadlift', name: 'Romanian deadlift', equipment: ['barbell'], targetMuscles: 'Hamstrings and glutes',
    region: 'lower', focus: ['glutes', 'legs'],
    instructions: [
      'Hold the bar at your hips with soft knees.',
      'Push your hips back and slide the bar down your legs.',
      'Squeeze your glutes to stand tall again.',
    ],
    commonMistake: 'Rounding the back to reach lower.', regression: 'Practise the hip hinge with no weight.',
    safetyCue: 'Keep your back flat and only go as low as feels good.',
  },
  {
    id: 'barbell-overhead-press', name: 'Overhead press', equipment: ['barbell'], targetMuscles: 'Shoulders and arms',
    region: 'upper', focus: ['shoulders', 'arms'],
    instructions: [
      'Hold the bar at your shoulders, hands just wider than shoulders.',
      'Press the bar straight up over your head.',
      'Lower it slowly back to your shoulders.',
    ],
    commonMistake: 'Leaning far back to push the bar up.', regression: 'Use seated dumbbell presses.',
    safetyCue: 'Tighten your stomach and stop if your shoulder hurts.',
  },
  {
    id: 'barbell-row', name: 'Barbell row', equipment: ['barbell'], targetMuscles: 'Upper back and arms', region: 'upper', focus: ['back', 'arms'],
    instructions: ['Lean forward with a flat back, holding the bar.', 'Pull the bar to your lower ribs.', 'Lower it slowly until your arms are straight.'],
    commonMistake: 'Jerking the weight with your back.', regression: 'Use a supported dumbbell row.',
    safetyCue: 'Keep your back flat the whole time.',
  },
  {
    id: 'lat-pulldown', name: 'Lat pulldown', equipment: ['gym-machines'], targetMuscles: 'Back and arms', region: 'upper', focus: ['back', 'arms'],
    instructions: [
      'Sit with your knees under the pad and hold the bar wide.',
      'Pull the bar down to your upper chest.',
      'Let it rise slowly until your arms are straight.',
    ],
    commonMistake: 'Leaning far back and swinging.', regression: 'Use a lighter weight and pull one arm at a time.',
    safetyCue: 'Pull in front of your head, never behind your neck.',
  },
  {
    id: 'leg-press', name: 'Leg press', equipment: ['gym-machines'], targetMuscles: 'Thighs and glutes', region: 'lower', focus: ['legs', 'glutes'],
    instructions: [
      'Sit back with feet flat on the plate, shoulder-width apart.',
      'Lower the plate until your knees are bent about 90 degrees.',
      'Push the plate away without locking your knees.',
    ],
    commonMistake: 'Letting your lower back lift off the seat.', regression: 'Use a smaller range and lighter weight.',
    safetyCue: 'Do not lock your knees straight at the top.',
  },
  {
    id: 'leg-curl', name: 'Leg curl', equipment: ['gym-machines'], targetMuscles: 'Hamstrings', region: 'lower', focus: ['legs'],
    instructions: ['Set the pad just above your heels.', 'Bend your knees to pull the pad in.', 'Let it go back slowly.'],
    commonMistake: 'Using a quick swinging motion.', regression: 'Use lighter weight and a smaller range.',
    safetyCue: 'Move slowly and stop if you feel a cramp.',
  },
  {
    id: 'leg-extension', name: 'Leg extension', equipment: ['gym-machines'], targetMuscles: 'Front of thighs', region: 'lower', focus: ['legs'],
    instructions: ['Sit with the pad on your lower shins.', 'Straighten your legs to lift the pad.', 'Lower it slowly.'],
    commonMistake: 'Kicking the weight up fast.', regression: 'Use a lighter weight.',
    safetyCue: 'Stop if your knees hurt.',
  },
  {
    id: 'cable-triceps-pushdown', name: 'Triceps pushdown', equipment: ['gym-machines'], targetMuscles: 'Back of arms', region: 'upper', focus: ['arms'],
    instructions: ['Hold the handle with elbows at your sides.', 'Push the handle down until your arms are straight.', 'Let it rise slowly.'],
    commonMistake: 'Letting the elbows move forward.', regression: 'Use a lighter weight.',
    safetyCue: 'Keep your wrists straight.',
  },
  {
    id: 'cable-face-pull', name: 'Face pull', equipment: ['gym-machines'], targetMuscles: 'Rear shoulders and upper back',
    region: 'upper', focus: ['shoulders', 'back'],
    instructions: ['Set the rope at face height.', 'Pull the rope towards your face, elbows high.', 'Return slowly.'],
    commonMistake: 'Using too much weight and leaning back.', regression: 'Use a resistance band instead.',
    safetyCue: 'Keep it light and controlled.',
  },
  {
    id: 'machine-calf-raise', name: 'Calf raise machine', equipment: ['gym-machines'], targetMuscles: 'Calves', region: 'lower', focus: ['legs'],
    instructions: ['Stand with the balls of your feet on the step.', 'Rise up onto your toes.', 'Lower your heels slowly.'],
    commonMistake: 'Bouncing at the bottom.', regression: 'Do calf raises with no weight.',
    safetyCue: 'Hold on for balance if you need to.',
  },
];

export const FITNESS_GOALS = [
  { value: 'muscle-building', label: 'Build muscle' },
  { value: 'fat-loss', label: 'Lose body fat' },
  { value: 'general-fitness', label: 'Improve general fitness' },
  { value: 'strength', label: 'Get stronger' },
  { value: 'endurance', label: 'Improve endurance' },
  { value: 'athletic-performance', label: 'Improve athletic performance' },
] as const;

export const TRAINING_EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

export const AVAILABLE_EQUIPMENT = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'resistance-bands', label: 'Resistance bands' },
  { value: 'gym-machines', label: 'Gym machines' },
] as const;

export type FitnessGoal = (typeof FITNESS_GOALS)[number]['value'];
export type TrainingExperience = (typeof TRAINING_EXPERIENCE_LEVELS)[number]['value'];
export type AvailableEquipment = (typeof AVAILABLE_EQUIPMENT)[number]['value'];

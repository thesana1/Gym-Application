import { z } from 'zod';

export const FitnessQuestionRequestSchema = z.strictObject({
  question: z.string().trim().min(5).max(500),
});

export const FitnessAnswerSchema = z.strictObject({
  answer: z.string().min(1).max(1500),
  keyPoints: z.array(z.string().min(1).max(200)).max(5),
  seeProfessional: z.boolean(),
  followUpQuestions: z.array(z.string().min(1).max(150)).max(3),
});

export type FitnessQuestionRequestType = z.infer<typeof FitnessQuestionRequestSchema>;
export type FitnessAnswer = z.infer<typeof FitnessAnswerSchema>;

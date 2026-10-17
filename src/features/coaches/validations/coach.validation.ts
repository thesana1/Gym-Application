import { z } from 'zod';

import { COACH_SPECIALIZATIONS } from '@/shared/const/coaching.const';

const QualificationSchema = z.strictObject({
  title: z.string().trim().min(2).max(120),
});

export const CoachProfileSchema = z.strictObject({
  displayName: z.string().trim().min(2).max(80),
  bio: z.string().trim().min(30).max(1200),
  experienceYears: z.number().int().min(0).max(60),
  qualifications: z.array(QualificationSchema).min(1).max(10),
  specializations: z.array(z.enum(COACH_SPECIALIZATIONS)).min(1).max(6),
  languages: z.array(z.string().trim().min(2).max(40)).min(1).max(8),
  availabilityNote: z.string().trim().max(300),
});

export type CoachProfileType = z.infer<typeof CoachProfileSchema>;

export const CoachDirectoryQuerySchema = z.strictObject({
  search: z.string().trim().max(80).optional(),
  specialization: z.enum(COACH_SPECIALIZATIONS).optional(),
  language: z.string().trim().min(2).max(40).optional(),
});

export type CoachDirectoryQuery = z.infer<typeof CoachDirectoryQuerySchema>;

export const CoachModerationSchema = z
  .strictObject({
    profileId: z.string().length(24).regex(/^[a-f\d]{24}$/i),
    decision: z.enum(['verified', 'rejected']),
    confirmedCredentials: z.literal(true).optional(),
    expectedRevision: z.number().int().min(0),
  })
  .refine(
    (input) =>
      input.decision !== 'verified' || input.confirmedCredentials === true,
    { message: 'Qualification verification must be explicitly confirmed.' }
  );

export type CoachModerationType = z.infer<typeof CoachModerationSchema>;

export const ConsultationRequestSchema = z.strictObject({
  coachProfileId: z.string().length(24).regex(/^[a-f\d]{24}$/i),
  topic: z.string().trim().min(3).max(120),
  message: z.string().trim().min(20).max(1200),
  preferredAvailability: z.string().trim().max(300),
});

export type ConsultationRequestType = z.infer<
  typeof ConsultationRequestSchema
>;

export const ConsultationRequestFormSchema = ConsultationRequestSchema.omit({
  coachProfileId: true,
});

export type ConsultationRequestFormType = z.infer<
  typeof ConsultationRequestFormSchema
>;

export const ConsultationRequestStatusSchema = z.strictObject({
  status: z.enum(['accepted', 'declined', 'cancelled']),
});

export type ConsultationRequestStatusType = z.infer<
  typeof ConsultationRequestStatusSchema
>;

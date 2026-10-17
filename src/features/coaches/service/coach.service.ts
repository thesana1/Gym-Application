import { coachRepository } from '@/features/coaches/repository/coach.repository';
import type { CoachProfileDocument } from '@/features/coaches/schema/coach-profile.schema';
import type { ConsultationRequestDocument } from '@/features/coaches/schema/consultation-request.schema';
import type {
  CoachDirectoryQuery,
  CoachModerationType,
  CoachProfileType,
  ConsultationRequestStatusType,
  ConsultationRequestType,
} from '@/features/coaches/validations/coach.validation';
import type { ServiceResult } from '@/shared/types/common';

export type CoachProfile = {
  id: string;
  displayName: string;
  bio: string;
  experienceYears: number;
  qualifications: { title: string }[];
  specializations: string[];
  languages: string[];
  availabilityNote?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  revision: number;
};

export type ConsultationRequest = {
  id: string;
  coachProfileId: string;
  coachName: string;
  topic: string;
  message: string;
  preferredAvailability?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
  direction: 'incoming' | 'outgoing';
};

const toCoachProfile = (document: CoachProfileDocument): CoachProfile => ({
  id: document._id.toString(),
  displayName: document.displayName,
  bio: document.bio,
  experienceYears: document.experienceYears,
  qualifications: document.qualifications.map(({ title }) => ({ title })),
  specializations: document.specializations,
  languages: document.languages,
  ...(document.availabilityNote ? { availabilityNote: document.availabilityNote } : {}),
  verificationStatus: document.verificationStatus,
  revision: document.revision,
});

const toConsultationRequest = (
  document: ConsultationRequestDocument,
  direction: ConsultationRequest['direction']
): ConsultationRequest => ({
  id: document._id.toString(),
  coachProfileId: document.coachProfileId.toString(),
  coachName: document.coachName,
  topic: document.topic,
  message: document.message,
  ...(document.preferredAvailability
    ? { preferredAvailability: document.preferredAvailability }
    : {}),
  status: document.status,
  createdAt: document.createdAt.toISOString(),
  direction,
});

export async function listCoachesService(
  query: CoachDirectoryQuery
): Promise<ServiceResult<CoachProfile[]>> {
  const profiles = await coachRepository.findVerified(query);
  return { data: profiles.map(toCoachProfile), status: 200 };
}

export async function getOwnCoachProfileService(
  userId: string
): Promise<ServiceResult<CoachProfile | null>> {
  const profile = await coachRepository.findByCoachUserId(userId);
  return { data: profile ? toCoachProfile(profile) : null, status: 200 };
}

export async function saveOwnCoachProfileService(
  userId: string,
  profile: CoachProfileType
): Promise<ServiceResult<CoachProfile>> {
  const saved = await coachRepository.saveProfile(userId, profile);
  if (!saved) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return { data: toCoachProfile(saved), status: 200 };
}

export async function listCoachProfilesForModerationService(): Promise<
  ServiceResult<CoachProfile[]>
  > {
  const profiles = await coachRepository.findForModeration();
  return { data: profiles.map(toCoachProfile), status: 200 };
}

export async function moderateCoachProfileService(
  adminUserId: string,
  input: CoachModerationType
): Promise<ServiceResult<CoachProfile>> {
  const profile = await coachRepository.moderate(
    input.profileId,
    adminUserId,
    input.decision,
    input.expectedRevision
  );
  if (!profile) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: toCoachProfile(profile), status: 200 };
}

export async function createConsultationRequestService(
  memberUserId: string,
  input: ConsultationRequestType
): Promise<ServiceResult<ConsultationRequest>> {
  const profile = await coachRepository.findByProfileId(input.coachProfileId);
  if (!profile || profile.verificationStatus !== 'verified') {
    return { data: { error: 'COACH_NOT_AVAILABLE' }, status: 404 };
  }
  if (profile.coachUserId.toString() === memberUserId) {
    return { data: { error: 'CANNOT_REQUEST_SELF' }, status: 400 };
  }

  const request = await coachRepository.createRequest(
    memberUserId,
    profile.coachUserId.toString(),
    input,
    profile._id.toString(),
    profile.displayName
  );
  if (!request) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return { data: toConsultationRequest(request, 'outgoing'), status: 201 };
}

export async function listOwnConsultationRequestsService(
  userId: string
): Promise<ServiceResult<ConsultationRequest[]>> {
  const [sent, profile] = await Promise.all([
    coachRepository.findMemberRequests(userId),
    coachRepository.findByCoachUserId(userId),
  ]);
  const received =
    profile?.verificationStatus === 'verified'
      ? await coachRepository.findCoachRequests(userId)
      : [];
  return {
    data: [
      ...sent.map((request) => toConsultationRequest(request, 'outgoing')),
      ...received.map((request) => toConsultationRequest(request, 'incoming')),
    ].sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    status: 200,
  };
}

export async function updateConsultationRequestService(
  userId: string,
  requestId: string,
  input: ConsultationRequestStatusType
): Promise<ServiceResult<ConsultationRequest>> {
  if (input.status !== 'cancelled') {
    const coachProfile = await coachRepository.findByCoachUserId(userId);
    if (!coachProfile || coachProfile.verificationStatus !== 'verified') {
      return { data: { error: 'NOT_FOUND' }, status: 404 };
    }
  }

  const request =
    input.status === 'cancelled'
      ? await coachRepository.updateRequestAsMember(requestId, userId)
      : await coachRepository.updateRequestAsCoach(requestId, userId, input.status);
  if (!request) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return {
    data: toConsultationRequest(
      request,
      input.status === 'cancelled' ? 'outgoing' : 'incoming'
    ),
    status: 200,
  };
}

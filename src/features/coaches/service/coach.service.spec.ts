import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/coaches/repository/coach.repository', () => ({
  coachRepository: {
    createRequest: vi.fn(),
    findByProfileId: vi.fn(),
    findCoachRequests: vi.fn(),
    findForModeration: vi.fn(),
    findMemberRequests: vi.fn(),
    findVerified: vi.fn(),
    findByCoachUserId: vi.fn(),
    moderate: vi.fn(),
    saveProfile: vi.fn(),
    updateRequestAsCoach: vi.fn(),
    updateRequestAsMember: vi.fn(),
  },
}));

import { coachRepository } from '@/features/coaches/repository/coach.repository';
import {
  createConsultationRequestService,
  moderateCoachProfileService,
  listCoachesService,
  listOwnConsultationRequestsService,
  updateConsultationRequestService,
} from '@/features/coaches/service/coach.service';

const mockRepository = vi.mocked(coachRepository);
const MEMBER_ID = '507f1f77bcf86cd799439011';
const COACH_ID = '507f1f77bcf86cd799439012';
const PROFILE_ID = '507f1f77bcf86cd799439013';
const REQUEST_ID = '507f1f77bcf86cd799439014';
const ADMIN_ID = '507f1f77bcf86cd799439015';

const coachProfile = (verificationStatus: 'pending' | 'verified' = 'verified') =>
  ({
    _id: { toString: () => PROFILE_ID },
    coachUserId: { toString: () => COACH_ID },
    displayName: 'Coach Example',
    bio: 'An experienced coach who helps people build sustainable routines.',
    experienceYears: 8,
    qualifications: [{ title: 'Fitness certification' }],
    specializations: ['strength-training'],
    languages: ['English'],
    availabilityNote: 'Weekday mornings',
    verificationStatus,
    revision: 1,
  }) as never;

const consultationRequest = (
  status: 'pending' | 'accepted' | 'declined' | 'cancelled',
  createdAt: string
) =>
  ({
    _id: { toString: () => REQUEST_ID },
    coachProfileId: { toString: () => PROFILE_ID },
    coachName: 'Coach Example',
    topic: 'Training plan',
    message: 'I would like general help with my training plan.',
    preferredAvailability: 'Weekday mornings',
    status,
    createdAt: new Date(createdAt),
  }) as never;

describe('coach services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only fields needed to display a verified directory profile', async () => {
    mockRepository.findVerified.mockResolvedValueOnce([coachProfile()]);

    const result = await listCoachesService({});

    expect(result.status).toBe(200);
    expect(result.data).toMatchObject([
      {
        id: PROFILE_ID,
        displayName: 'Coach Example',
        verificationStatus: 'verified',
      },
    ]);
    expect(result.data).not.toHaveProperty('coachUserId');
    expect(mockRepository.findVerified).toHaveBeenCalledWith({});
  });

  it('records moderation against the revision that the admin reviewed', async () => {
    mockRepository.moderate.mockResolvedValueOnce(coachProfile());

    const result = await moderateCoachProfileService(ADMIN_ID, {
      profileId: PROFILE_ID,
      decision: 'verified',
      confirmedCredentials: true,
      expectedRevision: 1,
    });

    expect(result.status).toBe(200);
    expect(mockRepository.moderate).toHaveBeenCalledWith(
      PROFILE_ID,
      ADMIN_ID,
      'verified',
      1
    );
  });

  it('does not create a request to a profile that is not verified', async () => {
    mockRepository.findByProfileId.mockResolvedValueOnce(coachProfile('pending'));

    const result = await createConsultationRequestService(MEMBER_ID, {
      coachProfileId: PROFILE_ID,
      topic: 'Training plan',
      message: 'I would like general help with my training plan.',
      preferredAvailability: '',
    });

    expect(result).toEqual({
      data: { error: 'COACH_NOT_AVAILABLE' },
      status: 404,
    });
    expect(mockRepository.createRequest).not.toHaveBeenCalled();
  });

  it('prevents a coach from requesting a consultation with their own profile', async () => {
    mockRepository.findByProfileId.mockResolvedValueOnce(coachProfile());

    const result = await createConsultationRequestService(COACH_ID, {
      coachProfileId: PROFILE_ID,
      topic: 'Training plan',
      message: 'I would like general help with my training plan.',
      preferredAvailability: '',
    });

    expect(result).toEqual({
      data: { error: 'CANNOT_REQUEST_SELF' },
      status: 400,
    });
    expect(mockRepository.createRequest).not.toHaveBeenCalled();
  });

  it('creates requests only for verified profiles and snapshots the coach name', async () => {
    const created = consultationRequest('pending', '2025-01-01T12:00:00.000Z');
    mockRepository.findByProfileId.mockResolvedValueOnce(coachProfile());
    mockRepository.createRequest.mockResolvedValueOnce(created);

    const result = await createConsultationRequestService(MEMBER_ID, {
      coachProfileId: PROFILE_ID,
      topic: 'Training plan',
      message: 'I would like general help with my training plan.',
      preferredAvailability: 'Weekday mornings',
    });

    expect(result.status).toBe(201);
    expect(result.data).toMatchObject({
      id: REQUEST_ID,
      coachName: 'Coach Example',
      status: 'pending',
      direction: 'outgoing',
    });
    expect(mockRepository.createRequest).toHaveBeenCalledWith(
      MEMBER_ID,
      COACH_ID,
      expect.objectContaining({ topic: 'Training plan' }),
      PROFILE_ID,
      'Coach Example'
    );
  });

  it('lists requests from both actor perspectives without exposing account ids', async () => {
    mockRepository.findMemberRequests.mockResolvedValueOnce([
      consultationRequest('pending', '2025-01-01T12:00:00.000Z'),
    ]);
    mockRepository.findByCoachUserId.mockResolvedValueOnce(coachProfile());
    mockRepository.findCoachRequests.mockResolvedValueOnce([
      consultationRequest('accepted', '2025-02-01T12:00:00.000Z'),
    ]);

    const result = await listOwnConsultationRequestsService(MEMBER_ID);

    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data).toMatchObject([
      { direction: 'incoming', status: 'accepted' },
      { direction: 'outgoing', status: 'pending' },
    ]);
    expect(result.data[0]).not.toHaveProperty('memberUserId');
    expect(mockRepository.findMemberRequests).toHaveBeenCalledWith(MEMBER_ID);
    expect(mockRepository.findCoachRequests).toHaveBeenCalledWith(MEMBER_ID);
  });

  it('does not expose received requests to profiles awaiting review', async () => {
    mockRepository.findMemberRequests.mockResolvedValueOnce([]);
    mockRepository.findByCoachUserId.mockResolvedValueOnce(
      coachProfile('pending')
    );

    const result = await listOwnConsultationRequestsService(COACH_ID);

    expect(result).toEqual({ data: [], status: 200 });
    expect(mockRepository.findCoachRequests).not.toHaveBeenCalled();
  });

  it('scopes member cancellation and coach decisions to their separate repository methods', async () => {
    const pending = consultationRequest('cancelled', '2025-01-01T12:00:00.000Z');
    mockRepository.updateRequestAsMember.mockResolvedValueOnce(pending);

    const memberResult = await updateConsultationRequestService(MEMBER_ID, REQUEST_ID, {
      status: 'cancelled',
    });

    expect(memberResult.status).toBe(200);
    expect(mockRepository.updateRequestAsMember).toHaveBeenCalledWith(
      REQUEST_ID,
      MEMBER_ID
    );
    expect(mockRepository.updateRequestAsCoach).not.toHaveBeenCalled();

    mockRepository.findByCoachUserId.mockResolvedValueOnce(coachProfile());
    mockRepository.updateRequestAsCoach.mockResolvedValueOnce(
      consultationRequest('accepted', '2025-01-01T12:00:00.000Z')
    );
    const coachResult = await updateConsultationRequestService(
      COACH_ID,
      REQUEST_ID,
      { status: 'accepted' }
    );

    expect(coachResult.status).toBe(200);
    expect(mockRepository.updateRequestAsCoach).toHaveBeenCalledWith(
      REQUEST_ID,
      COACH_ID,
      'accepted'
    );
    expect(mockRepository.updateRequestAsMember).toHaveBeenCalledTimes(1);
  });

  it('does not allow a delisted or unverified coach to accept a request', async () => {
    mockRepository.findByCoachUserId.mockResolvedValueOnce(
      coachProfile('pending')
    );

    const result = await updateConsultationRequestService(
      COACH_ID,
      REQUEST_ID,
      { status: 'accepted' }
    );

    expect(result).toEqual({ data: { error: 'NOT_FOUND' }, status: 404 });
    expect(mockRepository.updateRequestAsCoach).not.toHaveBeenCalled();
  });
});

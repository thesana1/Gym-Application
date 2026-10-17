import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/coaches/service/coach.service', () => ({
  createConsultationRequestService: vi.fn(),
  listOwnConsultationRequestsService: vi.fn(),
}));

import {
  createConsultationRequestService,
  listOwnConsultationRequestsService,
} from '@/features/coaches/service/coach.service';
import { auth } from '@/shared/lib/auth';

import { GET, POST } from './route';

const mockAuth = vi.mocked(auth);
const mockCreate = vi.mocked(createConsultationRequestService);
const mockList = vi.mocked(listOwnConsultationRequestsService);
const MEMBER_ID = '507f1f77bcf86cd799439011';
const PROFILE_ID = '507f1f77bcf86cd799439012';

describe('/api/coaches/requests', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication to list consultation requests', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('creates consultation requests for the authenticated member', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: MEMBER_ID } } as never);
    mockCreate.mockResolvedValueOnce({
      data: { id: 'request-id' },
      status: 201,
    } as never);
    const request = new NextRequest('http://localhost/api/coaches/requests', {
      method: 'POST',
      body: JSON.stringify({
        coachProfileId: PROFILE_ID,
        topic: 'Strength training',
        message: 'I would like general help with my training plan.',
        preferredAvailability: '',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(MEMBER_ID, {
      coachProfileId: PROFILE_ID,
      topic: 'Strength training',
      message: 'I would like general help with my training plan.',
      preferredAvailability: '',
    });
  });

  it('rejects invalid consultation input before service execution', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: MEMBER_ID } } as never);
    const request = new NextRequest('http://localhost/api/coaches/requests', {
      method: 'POST',
      body: JSON.stringify({
        coachProfileId: 'invalid',
        topic: 'x',
        message: 'short',
        preferredAvailability: '',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

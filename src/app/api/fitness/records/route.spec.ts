import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/fitness/service/personal-record.service', () => ({
  listPersonalRecordsService: vi.fn(),
}));

import { listPersonalRecordsService } from '@/features/fitness/service/personal-record.service';
import { auth } from '@/shared/lib/auth';

import { GET } from './route';

const mockAuth = vi.mocked(auth);
const mockListRecords = vi.mocked(listPersonalRecordsService);
const USER_ID = '507f1f77bcf86cd799439011';

describe('GET /api/fitness/records', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires an authenticated user', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockListRecords).not.toHaveBeenCalled();
  });

  it('returns records derived for only the authenticated account', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockListRecords.mockResolvedValueOnce({ data: [], status: 200 });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockListRecords).toHaveBeenCalledWith(USER_ID);
    await expect(response.json()).resolves.toEqual([]);
  });
});

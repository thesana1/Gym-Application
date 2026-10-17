import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/fitness/service/progress-measurement.service', () => ({
  createProgressMeasurementService: vi.fn(),
  listProgressMeasurementsService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import {
  createProgressMeasurementService,
  listProgressMeasurementsService,
} from '@/features/fitness/service/progress-measurement.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { GET, POST } from './route';

const mockAuth = vi.mocked(auth);
const mockCreate = vi.mocked(createProgressMeasurementService);
const mockList = vi.mocked(listProgressMeasurementsService);
const mockValidate = vi.mocked(validateBody);
const USER_ID = '507f1f77bcf86cd799439011';
const measurement = { date: '2026-10-04', weightKg: 72 };

describe('/api/fitness/measurements', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects history access without authentication', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('returns only the current user measurement history', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockList.mockResolvedValueOnce({ data: [], status: 200 });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockList).toHaveBeenCalledWith(USER_ID);
  });

  it('validates measurement input before creating an authenticated record', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockValidate.mockResolvedValueOnce({ data: measurement } as never);
    mockCreate.mockResolvedValueOnce({
      data: { id: 'record-id', date: '2026-10-04', weightKg: 72 },
      status: 201,
    } as never);
    const request = new NextRequest(
      'http://localhost/api/fitness/measurements',
      { method: 'POST', body: JSON.stringify(measurement) }
    );

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(USER_ID, measurement);
  });
});

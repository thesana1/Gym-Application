import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/fitness/repository/progress-measurement.repository', () => ({
  progressMeasurementRepository: {
    findByUserId: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
  },
}));

import { progressMeasurementRepository } from '@/features/fitness/repository/progress-measurement.repository';
import {
  createProgressMeasurementService,
  deleteProgressMeasurementService,
  listProgressMeasurementsService,
  updateProgressMeasurementService,
} from '@/features/fitness/service/progress-measurement.service';
import { ProgressMeasurementSchema } from '@/features/fitness/validations/progress-measurement.validation';

const mockRepository = vi.mocked(progressMeasurementRepository);

const document = () =>
  ({
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    userId: 'user-one',
    date: '2026-10-04',
    weightKg: 72,
    waistCm: 80,
    hipsCm: null,
    chestCm: null,
    armCm: null,
    thighCm: null,
    notes: null,
  }) as never;

const measurement = ProgressMeasurementSchema.parse({
  date: '2026-10-04',
  weightKg: '72',
  waistCm: '80',
});

describe('progress measurement service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists only measurements requested for the signed-in user', async () => {
    mockRepository.findByUserId.mockResolvedValueOnce([document()]);

    const result = await listProgressMeasurementsService('user-one');

    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-one');
    expect(result.data).toMatchObject([
      { date: '2026-10-04', weightKg: 72, waistCm: 80 },
    ]);
  });

  it('creates and updates user-owned records', async () => {
    mockRepository.create.mockResolvedValueOnce(document());
    mockRepository.updateById.mockResolvedValueOnce(document());

    const created = await createProgressMeasurementService('user-one', measurement);
    const updated = await updateProgressMeasurementService(
      'user-two',
      '507f1f77bcf86cd799439011',
      measurement
    );

    expect(mockRepository.create).toHaveBeenCalledWith('user-one', measurement);
    expect(mockRepository.updateById).toHaveBeenCalledWith(
      'user-two',
      '507f1f77bcf86cd799439011',
      measurement
    );
    expect(created.status).toBe(201);
    expect(updated.status).toBe(200);
  });

  it('returns not found instead of exposing or deleting another user record', async () => {
    mockRepository.updateById.mockResolvedValueOnce(null);
    mockRepository.deleteById.mockResolvedValueOnce(false);

    const updated = await updateProgressMeasurementService(
      'user-two',
      '507f1f77bcf86cd799439011',
      measurement
    );
    const deleted = await deleteProgressMeasurementService(
      'user-two',
      '507f1f77bcf86cd799439011'
    );

    expect(updated).toMatchObject({ status: 404, data: { error: 'NOT_FOUND' } });
    expect(deleted).toMatchObject({ status: 404, data: { error: 'NOT_FOUND' } });
  });
});

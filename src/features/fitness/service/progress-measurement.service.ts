import { progressMeasurementRepository } from '@/features/fitness/repository/progress-measurement.repository';
import { ProgressMeasurementDocument } from '@/features/fitness/schema/progress-measurement.schema';
import { ProgressMeasurementType } from '@/features/fitness/validations/progress-measurement.validation';
import { ServiceResult } from '@/shared/types/common';

export type ProgressMeasurement = {
  id: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
};

const toMeasurement = (
  document: ProgressMeasurementDocument
): ProgressMeasurement => ({
  id: document._id.toString(),
  date: document.date,
  weightKg: document.weightKg ?? undefined,
  waistCm: document.waistCm ?? undefined,
  hipsCm: document.hipsCm ?? undefined,
  chestCm: document.chestCm ?? undefined,
  armCm: document.armCm ?? undefined,
  thighCm: document.thighCm ?? undefined,
  notes: document.notes ?? undefined,
});

export async function listProgressMeasurementsService(
  userId: string
): Promise<ServiceResult<ProgressMeasurement[]>> {
  const measurements = await progressMeasurementRepository.findByUserId(userId);
  return { data: measurements.map(toMeasurement), status: 200 };
}

export async function createProgressMeasurementService(
  userId: string,
  input: ProgressMeasurementType
): Promise<ServiceResult<ProgressMeasurement>> {
  const measurement = await progressMeasurementRepository.create(userId, input);
  if (!measurement) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return { data: toMeasurement(measurement), status: 201 };
}

export async function updateProgressMeasurementService(
  userId: string,
  measurementId: string,
  input: ProgressMeasurementType
): Promise<ServiceResult<ProgressMeasurement>> {
  const measurement = await progressMeasurementRepository.updateById(
    userId,
    measurementId,
    input
  );
  if (!measurement) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: toMeasurement(measurement), status: 200 };
}

export async function deleteProgressMeasurementService(
  userId: string,
  measurementId: string
): Promise<ServiceResult<{ deleted: true }>> {
  const deleted = await progressMeasurementRepository.deleteById(
    userId,
    measurementId
  );
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { deleted: true }, status: 200 };
}

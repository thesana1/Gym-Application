import { nutritionRepository } from '@/features/nutrition/repository/nutrition.repository';
import {
  NutritionEntryDocument,
  NutritionTargetsDocument,
} from '@/features/nutrition/schema/nutrition.schema';
import {
  NutritionEntryType,
  NutritionTargetsType,
} from '@/features/nutrition/validations/nutrition.validation';
import { ServiceResult } from '@/shared/types/common';

export type NutritionTargets = Omit<
  NutritionTargetsDocument,
  '_id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type NutritionEntry = {
  id: string;
  date: string;
  mealType: NutritionEntryType['mealType'];
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fiberGrams: number;
  waterMl?: number;
  notes?: string;
};

const toTargets = (document: NutritionTargetsDocument): NutritionTargets => ({
  calories: document.calories,
  proteinGrams: document.proteinGrams,
  carbohydrateGrams: document.carbohydrateGrams,
  fatGrams: document.fatGrams,
  fiberGrams: document.fiberGrams,
  waterMl: document.waterMl,
});

const toEntry = (document: NutritionEntryDocument): NutritionEntry => ({
  id: document._id.toString(),
  date: document.date,
  mealType: document.mealType,
  foodName: document.foodName,
  calories: document.calories,
  proteinGrams: document.proteinGrams,
  carbohydrateGrams: document.carbohydrateGrams,
  fatGrams: document.fatGrams,
  fiberGrams: document.fiberGrams,
  waterMl: document.waterMl ?? undefined,
  notes: document.notes ?? undefined,
});

export async function getNutritionTargetsService(
  userId: string
): Promise<ServiceResult<NutritionTargets | null>> {
  const targets = await nutritionRepository.findTargetsByUserId(userId);
  return { data: targets ? toTargets(targets) : null, status: 200 };
}

export async function saveNutritionTargetsService(
  userId: string,
  input: NutritionTargetsType
): Promise<ServiceResult<NutritionTargets>> {
  const targets = await nutritionRepository.upsertTargets(userId, input);
  if (!targets) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return { data: toTargets(targets), status: 200 };
}

export async function listNutritionEntriesService(
  userId: string,
  date: string
): Promise<ServiceResult<NutritionEntry[]>> {
  const entries = await nutritionRepository.findEntriesByUserAndDate(userId, date);
  return { data: entries.map(toEntry), status: 200 };
}

export async function listNutritionEntriesInRangeService(
  userId: string,
  from: string,
  to: string
): Promise<ServiceResult<NutritionEntry[]>> {
  const entries = await nutritionRepository.findEntriesByUserAndDateRange(
    userId,
    from,
    to
  );
  return { data: entries.map(toEntry), status: 200 };
}

export async function createNutritionEntryService(
  userId: string,
  input: NutritionEntryType
): Promise<ServiceResult<NutritionEntry>> {
  const entry = await nutritionRepository.createEntry(userId, input);
  if (!entry) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return { data: toEntry(entry), status: 201 };
}

export async function updateNutritionEntryService(
  userId: string,
  entryId: string,
  input: NutritionEntryType
): Promise<ServiceResult<NutritionEntry>> {
  const entry = await nutritionRepository.updateEntry(userId, entryId, input);
  if (!entry) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: toEntry(entry), status: 200 };
}

export async function deleteNutritionEntryService(
  userId: string,
  entryId: string
): Promise<ServiceResult<{ deleted: true }>> {
  const deleted = await nutritionRepository.deleteEntry(userId, entryId);
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { deleted: true }, status: 200 };
}

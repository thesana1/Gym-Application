import { NextRequest, NextResponse } from 'next/server';

import { generateMealsService } from '@/features/nutrition/service/meal-generator.service';
import { MealGeneratorSchema } from '@/features/nutrition/validations/meal-generator.validation';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, MealGeneratorSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = generateMealsService(validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

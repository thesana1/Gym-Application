import { NextRequest, NextResponse } from 'next/server';

import {
  getNutritionTargetsService,
  saveNutritionTargetsService,
} from '@/features/nutrition/service/nutrition.service';
import { NutritionTargetsSchema } from '@/features/nutrition/validations/nutrition.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

const getUserId = async () => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id ?? null;
};

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const { data, status } = await getNutritionTargetsService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const validated = await validateBody(req, NutritionTargetsSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await saveNutritionTargetsService(
      userId,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

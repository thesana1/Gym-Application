import { NextRequest, NextResponse } from 'next/server';

import {
  createNutritionEntryService,
  listNutritionEntriesInRangeService,
  listNutritionEntriesService,
} from '@/features/nutrition/service/nutrition.service';
import {
  NutritionEntryQuerySchema,
  NutritionEntrySchema,
} from '@/features/nutrition/validations/nutrition.validation';
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

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const query = NutritionEntryQuerySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    if (!query.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: query.error.flatten() },
        { status: 400 }
      );
    }

    const result =
      'date' in query.data
        ? await listNutritionEntriesService(userId, query.data.date)
        : await listNutritionEntriesInRangeService(
          userId,
          query.data.from,
          query.data.to
        );
    const { data, status } = result;
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const validated = await validateBody(req, NutritionEntrySchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await createNutritionEntryService(
      userId,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

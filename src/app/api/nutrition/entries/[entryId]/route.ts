import { NextRequest, NextResponse } from 'next/server';

import {
  deleteNutritionEntryService,
  updateNutritionEntryService,
} from '@/features/nutrition/service/nutrition.service';
import {
  NutritionEntryIdSchema,
  NutritionEntrySchema,
} from '@/features/nutrition/validations/nutrition.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

type RouteContext = {
  params: Promise<{ entryId: string }>;
};

const getUserId = async () => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id ?? null;
};

const getEntryId = async (context: RouteContext) => {
  const { entryId } = await context.params;
  return NutritionEntryIdSchema.safeParse(entryId);
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const entryId = await getEntryId(context);
    if (!entryId.success) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }
    const validated = await validateBody(req, NutritionEntrySchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await updateNutritionEntryService(
      userId,
      entryId.data,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const entryId = await getEntryId(context);
    if (!entryId.success) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const { data, status } = await deleteNutritionEntryService(
      userId,
      entryId.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

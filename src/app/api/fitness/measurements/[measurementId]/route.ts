import { NextRequest, NextResponse } from 'next/server';

import {
  deleteProgressMeasurementService,
  updateProgressMeasurementService,
} from '@/features/fitness/service/progress-measurement.service';
import {
  ProgressMeasurementIdSchema,
  ProgressMeasurementSchema,
} from '@/features/fitness/validations/progress-measurement.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

type RouteContext = {
  params: Promise<{ measurementId: string }>;
};

const getUserId = async () => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id ?? null;
};

const getMeasurementId = async (context: RouteContext) => {
  const { measurementId } = await context.params;
  return ProgressMeasurementIdSchema.safeParse(measurementId);
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const measurementId = await getMeasurementId(context);
    if (!measurementId.success) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }
    const validated = await validateBody(req, ProgressMeasurementSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await updateProgressMeasurementService(
      userId,
      measurementId.data,
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
    const measurementId = await getMeasurementId(context);
    if (!measurementId.success) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const { data, status } = await deleteProgressMeasurementService(
      userId,
      measurementId.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

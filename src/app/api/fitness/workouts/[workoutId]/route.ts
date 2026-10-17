import { NextRequest, NextResponse } from 'next/server';

import {
  deleteWorkoutLogService,
  updateWorkoutLogService,
} from '@/features/fitness/service/workout-log.service';
import {
  WorkoutLogIdSchema,
  WorkoutLogSchema,
} from '@/features/fitness/validations/workout-log.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

type RouteContext = {
  params: Promise<{ workoutId: string }>;
};

const getUserId = async () => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id ?? null;
};

const getWorkoutId = async (context: RouteContext) => {
  const { workoutId } = await context.params;
  return WorkoutLogIdSchema.safeParse(workoutId);
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const workoutId = await getWorkoutId(context);
    if (!workoutId.success) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const validated = await validateBody(req, WorkoutLogSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await updateWorkoutLogService(
      userId,
      workoutId.data,
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

    const workoutId = await getWorkoutId(context);
    if (!workoutId.success) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const { data, status } = await deleteWorkoutLogService(
      userId,
      workoutId.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

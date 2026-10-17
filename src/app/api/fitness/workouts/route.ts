import { NextRequest, NextResponse } from 'next/server';

import {
  createWorkoutLogService,
  listWorkoutLogsService,
} from '@/features/fitness/service/workout-log.service';
import {
  WorkoutLogQuerySchema,
  WorkoutLogSchema,
} from '@/features/fitness/validations/workout-log.validation';
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

    const query = WorkoutLogQuerySchema.safeParse({
      from: req.nextUrl.searchParams.get('from') ?? undefined,
      to: req.nextUrl.searchParams.get('to') ?? undefined,
      exerciseId: req.nextUrl.searchParams.get('exerciseId') ?? undefined,
    });
    if (!query.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: query.error.flatten() },
        { status: 400 }
      );
    }

    if (
      query.data.from &&
      query.data.to &&
      new Date(query.data.from) > new Date(query.data.to)
    ) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: { to: ['Must be after from'] } },
        { status: 400 }
      );
    }

    const { data, status } = await listWorkoutLogsService(userId, query.data);
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

    const validated = await validateBody(req, WorkoutLogSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await createWorkoutLogService(
      userId,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

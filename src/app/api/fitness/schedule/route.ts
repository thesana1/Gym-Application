import { NextRequest, NextResponse } from 'next/server';

import {
  getTrainingScheduleService,
  saveTrainingScheduleService,
} from '@/features/fitness/service/training-schedule.service';
import { TrainingScheduleSchema } from '@/features/fitness/validations/training-schedule.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

const getAuthenticatedUserId = async () => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id;
};

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data, status } = await getTrainingScheduleService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = await validateBody(request, TrainingScheduleSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await saveTrainingScheduleService(
      userId,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

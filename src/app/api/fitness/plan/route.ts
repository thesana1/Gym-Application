import { NextRequest, NextResponse } from 'next/server';

import {
  getWorkoutPlanCustomizationService,
  saveWorkoutPlanCustomizationService,
} from '@/features/fitness/service/workout-plan-customization.service';
import { WorkoutPlanCustomizationSchema } from '@/features/fitness/validations/workout-plan-customization.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

const authenticatedUserId = async () => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id;
};

export async function GET() {
  try {
    const userId = await authenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data, status } =
      await getWorkoutPlanCustomizationService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await authenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = await validateBody(
      request,
      WorkoutPlanCustomizationSchema
    );
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await saveWorkoutPlanCustomizationService(
      userId,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

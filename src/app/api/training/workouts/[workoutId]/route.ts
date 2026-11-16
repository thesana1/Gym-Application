import { NextResponse } from 'next/server';

import { getWorkoutSessionService } from '@/features/training/service/training-plan.service';
import { PlanWorkoutSchema } from '@/features/training/validations/training-plan.validation';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };
type RouteContext = { params: Promise<{ workoutId: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const userId = ((await auth())?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const { workoutId } = await params;
    if (!PlanWorkoutSchema.shape.id.safeParse(workoutId).success) return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    const { data, status } = await getWorkoutSessionService(userId, workoutId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { deleteTrainingPlanService, getTrainingPlanService, saveTrainingPlanService } from '@/features/training/service/training-plan.service';
import { TrainingPlanSchema } from '@/features/training/validations/training-plan.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

const getUserId = async () => ((await auth())?.user as SessionUser | undefined)?.id ?? null;
const unauthorized = () => NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();
    const { data, status } = await getTrainingPlanService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();
    const validated = await validateBody(req, TrainingPlanSchema);
    if (validated instanceof NextResponse) return validated;
    const { data, status } = await saveTrainingPlanService(userId, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();
    const { data, status } = await deleteTrainingPlanService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

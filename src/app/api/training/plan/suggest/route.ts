import { NextRequest, NextResponse } from 'next/server';

import { suggestTrainingPlanService } from '@/features/training/service/training-ai.service';
import { PlanPrioritiesSchema } from '@/features/training/validations/training-plan.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

export async function POST(req: NextRequest) {
  try {
    const userId = ((await auth())?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const validated = await validateBody(req, PlanPrioritiesSchema);
    if (validated instanceof NextResponse) return validated;
    const { data, status } = await suggestTrainingPlanService(userId, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

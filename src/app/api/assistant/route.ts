import { NextRequest, NextResponse } from 'next/server';

import { askFitnessQuestionService, listFitnessQuestionsService } from '@/features/assistant/service/fitness-question.service';
import { FitnessQuestionRequestSchema } from '@/features/assistant/validations/fitness-question.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

const getUserId = async () => {
  const session = await auth();
  return (session?.user as SessionUser | undefined)?.id ?? null;
};

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const { data, status } = await listFitnessQuestionsService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const validated = await validateBody(req, FitnessQuestionRequestSchema);
    if (validated instanceof NextResponse) return validated;
    const { data, status } = await askFitnessQuestionService(userId, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

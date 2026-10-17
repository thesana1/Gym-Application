import { NextRequest, NextResponse } from 'next/server';

import {
  getOwnCoachProfileService,
  saveOwnCoachProfileService,
} from '@/features/coaches/service/coach.service';
import { CoachProfileSchema } from '@/features/coaches/validations/coach.validation';
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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data, status } = await getOwnCoachProfileService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = await validateBody(request, CoachProfileSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await saveOwnCoachProfileService(
      userId,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

import {
  getFitnessProfileService,
  saveFitnessProfileService,
} from '@/features/fitness/service/fitness-profile.service';
import { FitnessProfileSchema } from '@/features/fitness/validations/fitness-profile.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data, status } = await getFitnessProfileService(user.id);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = await validateBody(req, FitnessProfileSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await saveFitnessProfileService(
      user.id,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

import {
  joinPersonalChallengeService,
  leavePersonalChallengeService,
  listPersonalChallengesService,
} from '@/features/challenges/service/challenge.service';
import { ChallengeEnrollmentSchema } from '@/features/challenges/validations/challenge.validation';
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

    const { data, status } = await listPersonalChallengesService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = await validateBody(request, ChallengeEnrollmentSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await joinPersonalChallengeService(
      userId,
      validated.data.challengeId
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = ChallengeEnrollmentSchema.safeParse({
      challengeId: request.nextUrl.searchParams.get('challengeId'),
    });
    if (!validated.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const { data, status } = await leavePersonalChallengeService(
      userId,
      validated.data.challengeId
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

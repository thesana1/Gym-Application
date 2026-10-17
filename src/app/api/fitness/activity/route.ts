import { NextRequest, NextResponse } from 'next/server';

import {
  getTrainingActivityService,
  isAllowedTrainingActivityWeeks,
} from '@/features/fitness/service/training-activity.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = {
  id?: string;
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const weeksValue = request.nextUrl.searchParams.get('weeks');
    const weeks = weeksValue === null ? 4 : Number(weeksValue);
    if (!isAllowedTrainingActivityWeeks(weeks)) {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const { data, status } = await getTrainingActivityService(user.id, weeks);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

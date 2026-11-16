import { NextResponse } from 'next/server';

import { buildPlanCalendar } from '@/features/training/service/training-calendar.service';
import { getTrainingPlanService } from '@/features/training/service/training-plan.service';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export async function GET() {
  try {
    const userId = ((await auth())?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const { data, status } = await getTrainingPlanService(userId);
    if (!data || 'error' in data) return NextResponse.json(data ?? { error: 'NOT_FOUND' }, { status: data ? status : 404 });
    return new NextResponse(buildPlanCalendar(data), {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${TRAINING_COPY.calendar.fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

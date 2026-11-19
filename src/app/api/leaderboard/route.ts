import { NextResponse } from 'next/server';

import { getLeaderboardsService } from '@/features/leaderboard/service/leaderboard.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const result = await getLeaderboardsService(user.id);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

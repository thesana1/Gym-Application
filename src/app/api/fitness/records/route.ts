import { NextResponse } from 'next/server';

import { listPersonalRecordsService } from '@/features/fitness/service/personal-record.service';
import { auth } from '@/shared/lib/auth';

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

    const { data, status } = await listPersonalRecordsService(user.id);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

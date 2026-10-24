import { NextResponse } from 'next/server';

import { getMembershipService } from '@/features/membership/service/membership.service';
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

    const result = await getMembershipService(user.id);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

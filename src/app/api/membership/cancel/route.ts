import { NextResponse } from 'next/server';

import { cancelMembershipService } from '@/features/membership/service/membership.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = {
  id?: string;
};

export async function POST() {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const result = await cancelMembershipService(user.id);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

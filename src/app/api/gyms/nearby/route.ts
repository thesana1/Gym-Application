import { NextRequest, NextResponse } from 'next/server';

import { findNearbyGymsService } from '@/features/gyms/service/nearby-gyms.service';
import { NearbyGymsQuerySchema } from '@/features/gyms/validations/gym.validation';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const query = NearbyGymsQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
    if (!query.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: query.error.flatten() }, { status: 400 });
    }

    const { data, status } = await findNearbyGymsService(query.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

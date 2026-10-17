import { NextRequest, NextResponse } from 'next/server';

import { findNearbyGymsService } from '@/features/gyms/service/gym-search.service';
import { GymSearchSchema } from '@/features/gyms/validations/gym-search.validation';
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

    const validated = GymSearchSchema.safeParse({
      location: request.nextUrl.searchParams.get('location'),
    });
    if (!validated.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const { data, status } = await findNearbyGymsService(validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

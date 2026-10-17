import { NextRequest, NextResponse } from 'next/server';

import { listCoachesService } from '@/features/coaches/service/coach.service';
import { CoachDirectoryQuerySchema } from '@/features/coaches/validations/coach.validation';
import { auth } from '@/shared/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const query = CoachDirectoryQuerySchema.safeParse({
      search: request.nextUrl.searchParams.get('search') ?? undefined,
      specialization:
        request.nextUrl.searchParams.get('specialization') ?? undefined,
      language: request.nextUrl.searchParams.get('language') ?? undefined,
    });
    if (!query.success) {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const { data, status } = await listCoachesService(query.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

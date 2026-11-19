import { NextRequest, NextResponse } from 'next/server';

import { searchAdminUsersService } from '@/features/admin/service/admin-user.service';
import { AdminSearchSchema } from '@/features/admin/validations/admin.validation';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string; role?: string };

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (user?.role !== 'admin') return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    const search = AdminSearchSchema.safeParse({ query: req.nextUrl.searchParams.get('q') ?? '' });
    if (!search.success) return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });

    const result = await searchAdminUsersService(search.data.query);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

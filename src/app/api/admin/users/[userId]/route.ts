import { NextRequest, NextResponse } from 'next/server';

import { deleteAdminUserService, updateAdminMembershipService } from '@/features/admin/service/admin-user.service';
import { AdminMembershipSchema, AdminUserIdSchema } from '@/features/admin/validations/admin.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string; role?: string };

type RouteContext = { params: Promise<{ userId: string }> };

// Returns the admin's own id, or null for anyone who is not an admin.
const getAdminId = async () => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.role === 'admin' && user.id ? user.id : null;
};

const getUserId = async (context: RouteContext) => AdminUserIdSchema.safeParse((await context.params).userId);

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    if (!(await getAdminId())) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    const userId = await getUserId(context);
    if (!userId.success) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    const validated = await validateBody(req, AdminMembershipSchema);
    if (validated instanceof NextResponse) return validated;

    const result = await updateAdminMembershipService(userId.data, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    const userId = await getUserId(context);
    if (!userId.success) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    const result = await deleteAdminUserService(adminId, userId.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

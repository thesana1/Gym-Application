import { NextRequest, NextResponse } from 'next/server';

import {
  listCoachProfilesForModerationService,
  moderateCoachProfileService,
} from '@/features/coaches/service/coach.service';
import { CoachModerationSchema } from '@/features/coaches/validations/coach.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
  role?: 'admin' | 'user';
};

type AdminUser = {
  id: string;
};

type AdminAccess =
  | AdminUser
  | { error: 'UNAUTHORIZED' | 'FORBIDDEN'; status: 401 | 403 };

const getAdmin = async (): Promise<AdminAccess> => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) return { error: 'UNAUTHORIZED', status: 401 };
  if (user.role !== 'admin') return { error: 'FORBIDDEN', status: 403 };
  return { id: user.id };
};

export async function GET() {
  try {
    const admin = await getAdmin();
    if ('error' in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { data, status } = await listCoachProfilesForModerationService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdmin();
    if ('error' in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const validated = await validateBody(request, CoachModerationSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await moderateCoachProfileService(
      admin.id,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

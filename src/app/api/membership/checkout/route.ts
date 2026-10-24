import { NextRequest, NextResponse } from 'next/server';

import { createMembershipCheckoutService } from '@/features/membership/service/membership.service';
import { MembershipCheckoutSchema } from '@/features/membership/validations/membership.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = await validateBody(request, MembershipCheckoutSchema);
    if (validated instanceof NextResponse) return validated;

    const result = await createMembershipCheckoutService(
      user.id,
      validated.data.tier,
      new URL('/dashboard/membership', request.url).toString()
    );
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

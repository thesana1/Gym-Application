import { NextRequest, NextResponse } from 'next/server';

import { BillingUserIdSchema } from '@/features/membership/validations/membership-payments.validation';
import { auth } from '@/shared/lib/auth';

export async function billingUser(req?: NextRequest): Promise<string | NextResponse> {
  if (req) {
    const origin = req.headers.get('origin');
    const expectedOrigin = new URL(process.env.NEXTAUTH_URL ?? req.url).origin;
    if (origin && origin !== expectedOrigin) return NextResponse.json({ error: 'INVALID_ORIGIN' }, { status: 403 });
  }
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  const parsed = BillingUserIdSchema.safeParse(user?.id);
  if (!parsed.success) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  return parsed.data;
}

import { NextRequest, NextResponse } from 'next/server';

import { createCheckoutService } from '@/features/membership/service/checkout.service';
import { CheckoutSchema } from '@/features/membership/validations/membership-payments.validation';
import { billingUser } from '@/shared/middleware/billing-user';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const userId = await billingUser(req);
    if (userId instanceof NextResponse) return userId;
    const validated = await validateBody(req, CheckoutSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await createCheckoutService(userId, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { createPortalService } from '@/features/membership/service/checkout.service';
import { BillingActionSchema } from '@/features/membership/validations/membership-payments.validation';
import { billingUser } from '@/shared/middleware/billing-user';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const userId = await billingUser(req);
    if (userId instanceof NextResponse) return userId;
    const validated = await validateBody(req, BillingActionSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await createPortalService(userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

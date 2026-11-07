import { NextResponse } from 'next/server';

import { getBillingAccessService } from '@/features/membership/service/access.service';
import { billingUser } from '@/shared/middleware/billing-user';

export async function GET() {
  try {
    const userId = await billingUser();
    if (userId instanceof NextResponse) return userId;
    const result = await getBillingAccessService(userId);
    return NextResponse.json(result.data, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

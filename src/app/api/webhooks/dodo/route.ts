import { NextRequest, NextResponse } from 'next/server';

import { handleWebhookService } from '@/features/membership/service/webhook.service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Signature verification requires the original bytes; do not use validateBody or req.json here.
    const result = await handleWebhookService(await req.text(), Object.fromEntries(req.headers.entries()));
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    // Non-2xx responses ask Dodo to retry transient provider/database failures.
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

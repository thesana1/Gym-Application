import { NextRequest, NextResponse } from 'next/server';

import { registerService } from '@/features/auth/service/auth.service';
import { SignUpSchema } from '@/features/auth/validations/auth.validation';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, SignUpSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await registerService(validated.data);
    return NextResponse.json(data, { status });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith('MONGO_URI is not configured.')
    ) {
      return NextResponse.json(
        { error: 'DATABASE_NOT_CONFIGURED' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

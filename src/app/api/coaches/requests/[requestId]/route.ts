import { NextRequest, NextResponse } from 'next/server';

import { updateConsultationRequestService } from '@/features/coaches/service/coach.service';
import { ConsultationRequestStatusSchema } from '@/features/coaches/validations/coach.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { requestId } = await context.params;
    if (!/^[a-f\d]{24}$/i.test(requestId)) {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const validated = await validateBody(
      request,
      ConsultationRequestStatusSchema
    );
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await updateConsultationRequestService(
      user.id,
      requestId,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

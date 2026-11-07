import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/shared/lib/auth';
import { billingUser } from '@/shared/middleware/billing-user';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
const mockAuth = vi.mocked(auth);

describe('billingUser', () => {
  beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('NEXTAUTH_URL', 'https://fitness.example'); });
  afterEach(() => vi.unstubAllEnvs());

  it('rejects signed-out and invalid identities', async () => {
    mockAuth.mockResolvedValue(null as never);
    expect((await billingUser()) as NextResponse).toHaveProperty('status', 401);
    mockAuth.mockResolvedValue({ user: { id: 'bad-id' } } as never);
    expect((await billingUser()) as NextResponse).toHaveProperty('status', 401);
  });

  it('uses only the authenticated session ID', async () => {
    mockAuth.mockResolvedValue({ user: { id: '507f1f77bcf86cd799439011' } } as never);
    expect(await billingUser()).toBe('507f1f77bcf86cd799439011');
  });

  it('rejects cross-origin billing mutations', async () => {
    const request = new NextRequest('https://fitness.example/api/billing/checkout', {
      method: 'POST', headers: { origin: 'https://attacker.example' },
    });
    expect((await billingUser(request)) as NextResponse).toHaveProperty('status', 403);
    expect(auth).not.toHaveBeenCalled();
  });
});

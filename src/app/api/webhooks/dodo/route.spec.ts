import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleWebhookService } from '@/features/membership/service/webhook.service';

import { POST } from './route';

vi.mock('@/features/membership/service/webhook.service', () => ({ handleWebhookService: vi.fn() }));

const makeRequest = () => new NextRequest('http://localhost/api/webhooks/dodo', {
  method: 'POST', body: 'exact raw webhook body',
  headers: { 'webhook-id': 'evt_123', 'webhook-signature': 'signature', 'webhook-timestamp': '123456' },
});

describe('/api/webhooks/dodo', () => {
  beforeEach(() => vi.resetAllMocks());

  it('passes the exact raw body and headers to signature verification without requiring a user session', async () => {
    vi.mocked(handleWebhookService).mockResolvedValue({ data: { received: true }, status: 200 });
    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    expect(handleWebhookService).toHaveBeenCalledWith('exact raw webhook body', expect.objectContaining({ 'webhook-id': 'evt_123' }));
  });

  it('returns the signature rejection status', async () => {
    vi.mocked(handleWebhookService).mockResolvedValue({ data: { error: 'INVALID_WEBHOOK_SIGNATURE' }, status: 401 });
    expect((await POST(makeRequest())).status).toBe(401);
  });

  it('returns 500 for transient errors so Dodo retries delivery', async () => {
    vi.mocked(handleWebhookService).mockRejectedValue(new Error('database unavailable'));
    expect((await POST(makeRequest())).status).toBe(500);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { OpenRouterClient } from '@/shared/lib/openrouter';

const schema = z.strictObject({ name: z.string(), grams: z.number() });
const options = { system: 'system prompt', user: 'user prompt', schema, schemaName: 'meal' };

const chatResponse = (content: string, model = 'test/model:free') =>
  new Response(JSON.stringify({ model, choices: [{ message: { content } }] }), { status: 200 });

describe('OpenRouterClient', () => {
  const fetchMock = vi.fn();
  let client: OpenRouterClient;

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('OPENROUTER_API_KEY', 'sk-or-test');
    vi.stubEnv('OPENROUTER_MODELS', '');
    fetchMock.mockReset();
    client = new OpenRouterClient();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns validated JSON and sends a strict JSON schema with server-side credentials', async () => {
    fetchMock.mockResolvedValueOnce(chatResponse('{"name":"Oats","grams":40}'));

    const result = await client.generateJson(options);

    expect(result).toEqual({ ok: true, data: { name: 'Oats', grams: 40 }, model: 'test/model:free' });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer sk-or-test');
    const body = JSON.parse(init.body);
    expect(body.response_format.json_schema).toMatchObject({ name: 'meal', strict: true });
    expect(body.response_format.json_schema.schema.additionalProperties).toBe(false);
    expect(body.models.length).toBeGreaterThan(0);
    expect(body.reasoning).toEqual({ effort: 'low' });
  });

  it('accepts JSON wrapped in markdown code fences', async () => {
    fetchMock.mockResolvedValueOnce(chatResponse('```json\n{"name":"Rice","grams":150}\n```'));
    const result = await client.generateJson(options);
    expect(result.ok && result.data.name).toBe('Rice');
  });

  it('retries once when the model returns output that fails validation', async () => {
    fetchMock
      .mockResolvedValueOnce(chatResponse('{"name":"Missing grams"}'))
      .mockResolvedValueOnce(chatResponse('{"name":"Eggs","grams":100}'));

    const result = await client.generateJson(options);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it('reports invalid output after the retry is exhausted', async () => {
    fetchMock.mockImplementation(async () => chatResponse('not json at all'));
    expect(await client.generateJson(options)).toEqual({ ok: false, error: 'AI_INVALID_OUTPUT' });
  });

  it.each([
    [429, 'AI_PROVIDER_BUSY'],
    [402, 'AI_QUOTA_EXCEEDED'],
    [401, 'AI_NOT_CONFIGURED'],
    [500, 'AI_UNAVAILABLE'],
  ])('maps provider status %i to %s without retrying', async (status, error) => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status }));
    expect(await client.generateJson(options)).toEqual({ ok: false, error });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('maps an error object inside a 200 response', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 429, message: 'rate limited' } }), { status: 200 }));
    expect(await client.generateJson(options)).toEqual({ ok: false, error: 'AI_PROVIDER_BUSY' });
  });

  it('reports a timeout when the request is aborted', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'));
    expect(await client.generateJson(options)).toEqual({ ok: false, error: 'AI_TIMEOUT' });
  });

  it('skips the retry when too little of the overall deadline is left', async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValueOnce(now).mockReturnValue(now + 40_000);
    fetchMock.mockImplementation(async () => chatResponse('not json'));

    expect(await client.generateJson(options)).toEqual({ ok: false, error: 'AI_INVALID_OUTPUT' });
    expect(fetchMock).toHaveBeenCalledOnce();
    clock.mockRestore();
  });

  it('reports network failures as unavailable', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    expect(await client.generateJson(options)).toEqual({ ok: false, error: 'AI_UNAVAILABLE' });
  });

  it('does not call the provider when no API key is configured', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '');
    expect(await client.generateJson(options)).toEqual({ ok: false, error: 'AI_NOT_CONFIGURED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses configured models in order when OPENROUTER_MODELS is set', () => {
    vi.stubEnv('OPENROUTER_MODELS', 'a/one:free, b/two:free');
    expect(client.models).toEqual(['a/one:free', 'b/two:free']);
  });
});

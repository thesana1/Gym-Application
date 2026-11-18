import { z } from 'zod';

import {
  AI_DEFAULT_MODELS,
  AI_MAX_ATTEMPTS,
  AI_MAX_OUTPUT_TOKENS,
  AI_MIN_RETRY_WINDOW_MS,
  AI_REASONING_EFFORT,
  AI_TEMPERATURE,
  AI_TIMEOUT_MS,
  OPENROUTER_API_URL,
} from '@/shared/const/ai.const';
import { APP_NAME } from '@/shared/const/app.const';
import type { AiErrorCode, AiResult } from '@/shared/types/ai';

type GenerateJsonOptions<T> = {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  schemaName: string;
  maxTokens?: number;
};

const ChatResponseSchema = z.object({
  model: z.string().optional(),
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable().optional() }) })).optional(),
  error: z.object({ code: z.union([z.number(), z.string()]).optional(), message: z.string().optional() }).optional(),
});

const errorForStatus = (status: number): AiErrorCode => {
  if (status === 401 || status === 403) return 'AI_NOT_CONFIGURED';
  if (status === 402) return 'AI_QUOTA_EXCEEDED';
  if (status === 408) return 'AI_TIMEOUT';
  if (status === 429) return 'AI_PROVIDER_BUSY';
  return 'AI_UNAVAILABLE';
};

const parseJsonContent = (content: string): unknown => {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end <= start) throw new SyntaxError('No JSON object in model output');
  return JSON.parse(trimmed.slice(start, end + 1));
};

class OpenRouterClient {
  get isConfigured(): boolean {
    return Boolean(process.env.OPENROUTER_API_KEY);
  }

  get models(): string[] {
    const configured = (process.env.OPENROUTER_MODELS ?? '').split(',').map((model) => model.trim()).filter(Boolean);
    return configured.length > 0 ? configured : AI_DEFAULT_MODELS;
  }

  async generateJson<T>(options: GenerateJsonOptions<T>): Promise<AiResult<T>> {
    if (!this.isConfigured) return { ok: false, error: 'AI_NOT_CONFIGURED' };
    // One deadline covers every attempt, so a slow model can never stack retries past AI_TIMEOUT_MS.
    const deadline = Date.now() + AI_TIMEOUT_MS;
    const signal = AbortSignal.timeout(AI_TIMEOUT_MS);
    let lastError: AiErrorCode = 'AI_INVALID_OUTPUT';
    for (let attempt = 0; attempt < AI_MAX_ATTEMPTS; attempt += 1) {
      if (attempt > 0 && deadline - Date.now() < AI_MIN_RETRY_WINDOW_MS) break;
      const result = await this.requestOnce(options, signal);
      if (result.ok || result.error !== 'AI_INVALID_OUTPUT') return result;
      lastError = result.error;
    }
    return { ok: false, error: lastError };
  }

  private async requestOnce<T>(
    { system, user, schema, schemaName, maxTokens }: GenerateJsonOptions<T>,
    signal: AbortSignal
  ): Promise<AiResult<T>> {
    let response: Response;
    try {
      response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        signal,
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXTAUTH_URL ?? 'http://localhost:3001',
          'X-Title': APP_NAME,
        },
        body: JSON.stringify({
          models: this.models,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: { name: schemaName, strict: true, schema: z.toJSONSchema(schema) },
          },
          provider: { require_parameters: true },
          reasoning: { effort: AI_REASONING_EFFORT },
          max_tokens: maxTokens ?? AI_MAX_OUTPUT_TOKENS,
          temperature: AI_TEMPERATURE,
        }),
      });
    } catch (error) {
      const timedOut = error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError');
      return { ok: false, error: timedOut ? 'AI_TIMEOUT' : 'AI_UNAVAILABLE' };
    }
    if (!response.ok) return { ok: false, error: errorForStatus(response.status) };

    const envelope = ChatResponseSchema.safeParse(await response.json().catch(() => null));
    if (signal.aborted) return { ok: false, error: 'AI_TIMEOUT' };
    if (!envelope.success) return { ok: false, error: 'AI_UNAVAILABLE' };
    if (envelope.data.error) {
      const code = Number(envelope.data.error.code);
      return { ok: false, error: Number.isFinite(code) ? errorForStatus(code) : 'AI_UNAVAILABLE' };
    }
    const content = envelope.data.choices?.[0]?.message.content;
    if (!content) return { ok: false, error: 'AI_INVALID_OUTPUT' };

    try {
      const parsed = schema.safeParse(parseJsonContent(content));
      if (!parsed.success) return { ok: false, error: 'AI_INVALID_OUTPUT' };
      return { ok: true, data: parsed.data, model: envelope.data.model ?? this.models[0] };
    } catch {
      return { ok: false, error: 'AI_INVALID_OUTPUT' };
    }
  }
}

export const openRouter = new OpenRouterClient();
export { OpenRouterClient };

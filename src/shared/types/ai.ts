export type AiErrorCode =
  | 'AI_NOT_CONFIGURED'
  | 'AI_PROVIDER_BUSY'
  | 'AI_QUOTA_EXCEEDED'
  | 'AI_TIMEOUT'
  | 'AI_INVALID_OUTPUT'
  | 'AI_UNAVAILABLE';

export type AiResult<T> =
  | { ok: true; data: T; model: string }
  | { ok: false; error: AiErrorCode };

export type AiSource = 'ai' | 'saved' | 'library';

export type AiUsage = { used: number; limit: number };

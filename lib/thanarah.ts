export type ThanarahRole = 'system' | 'user' | 'assistant'

export interface ThanarahMessage {
  role: ThanarahRole
  content: string
}

export class ThanarahError extends Error {
  constructor(
    public readonly code: 'MISSING_API_KEY' | 'UPSTREAM_ERROR' | 'INVALID_RESPONSE',
    public readonly status?: number,
  ) {
    super(code)
    this.name = 'ThanarahError'
  }
}

const THANARAH_CHAT_COMPLETIONS_URL = 'https://ai.thanarah.com/api/v1/chat/completions'

interface ThanarahChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown
    }
  }>
}

export async function createThanarahCompletion(
  messages: ThanarahMessage[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.THANARAH_API_KEY
  if (!apiKey) {
    throw new ThanarahError('MISSING_API_KEY')
  }

  const response = await fetch(THANARAH_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options.maxTokens !== undefined ? { max_tokens: options.maxTokens } : {}),
    }),
    signal: AbortSignal.timeout(60_000),
  })

  if (!response.ok) {
    throw new ThanarahError('UPSTREAM_ERROR', response.status)
  }

  let payload: ThanarahChatCompletionResponse
  try {
    payload = await response.json() as ThanarahChatCompletionResponse
  } catch {
    throw new ThanarahError('INVALID_RESPONSE')
  }

  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new ThanarahError('INVALID_RESPONSE')
  }

  return content.trim()
}

export function parseThanarahJson<T>(content: string): T {
  const fencedJson = content.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fencedJson?.[1] ?? content).trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')

  if (start < 0 || end < start) {
    throw new ThanarahError('INVALID_RESPONSE')
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T
  } catch {
    throw new ThanarahError('INVALID_RESPONSE')
  }
}
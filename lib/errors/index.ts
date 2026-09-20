import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BUSINESS_RULE'
  | 'CONFIGURATION_ERROR'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  readonly status: number
  readonly code: AppErrorCode
  readonly publicMessage: string

  constructor(
    code: AppErrorCode,
    publicMessage: string,
    status = 400,
    options?: { cause?: unknown },
  ) {
    super(publicMessage, options)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.publicMessage = publicMessage
  }
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status })
}

export function apiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request contains invalid fields.',
          fields: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    )
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.publicMessage } },
      { status: error.status },
    )
  }

  console.error('Unhandled API error', error)
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected server error occurred.',
      },
    },
    { status: 500 },
  )
}

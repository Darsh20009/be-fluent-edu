import { NextResponse } from 'next/server'

export async function POST(_request: Request) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'DEPRECATED',
        message: 'Password inspection is no longer supported. Use account recovery verification.',
      },
    },
    { status: 410 },
  )
}

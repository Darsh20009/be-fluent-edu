import { NextResponse } from 'next/server'
import { storageProviderStatus } from '@/lib/storage'

export async function GET() {
  const result = storageProviderStatus()
  return NextResponse.json({ ok: true, ...result })
}
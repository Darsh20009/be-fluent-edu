import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, userName, roomId } = await request.json()

    if (!userId || !userName || !roomId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName, roomId' },
        { status: 400 }
      )
    }

    const ZEGO_APP_ID = process.env.ZEGO_APP_ID
    const ZEGO_SERVER_SECRET = process.env.ZEGO_SERVER_SECRET

    if (!ZEGO_APP_ID || !ZEGO_SERVER_SECRET) {
      return NextResponse.json(
        { error: 'Zego configuration missing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      appId: parseInt(ZEGO_APP_ID),
      serverSecret: ZEGO_SERVER_SECRET,
      userId,
      userName,
      roomId
    })
  } catch (error) {
    console.error('Error generating Zego token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}

import { sha256 } from 'js-sha256'

interface TokenPayload {
  app_id: number
  user_id: string
  nonce: number
  ctime: number
  expire: number
  privilege: Record<string, number>
}

export function generateZegoToken(
  userId: string,
  userName: string,
  roomId: string,
  expirySeconds: number = 3600
): { token: string; appId: number; userId: string; userName: string; roomId: string } {
  const ZEGO_APP_ID = process.env.ZEGO_APP_ID
  const ZEGO_SERVER_SECRET = process.env.ZEGO_SERVER_SECRET

  if (!ZEGO_APP_ID || !ZEGO_SERVER_SECRET) {
    throw new Error('ZEGO_APP_ID or ZEGO_SERVER_SECRET not configured')
  }

  const appId = parseInt(ZEGO_APP_ID)
  const appSign = ZEGO_SERVER_SECRET

  const ctime = Math.floor(Date.now() / 1000)
  const expire = ctime + expirySeconds
  const nonce = Math.floor(Math.random() * 2147483647)

  const payload: TokenPayload = {
    app_id: appId,
    user_id: userId,
    nonce: nonce,
    ctime: ctime,
    expire: expire,
    privilege: {
      1: 1,
      2: 1
    }
  }

  const payloadStr = JSON.stringify(payload)
  const payloadBase64 = Buffer.from(payloadStr).toString('base64')
  const toSign = appSign + payloadBase64

  const signStr = sha256(toSign)
  const token = `${signStr}.${payloadBase64}`

  return {
    token,
    appId,
    userId,
    userName,
    roomId
  }
}

export function getZegoServerUrl(): string {
  return 'https://youspeak-zego.zegocloud.com'
}

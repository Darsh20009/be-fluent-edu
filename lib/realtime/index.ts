export const REALTIME_PATH = '/api/socket/io'
export const REALTIME_TRANSPORT = 'socket.io' as const

export interface RealtimeIdentity {
  userId: string
  role: string
}

export interface RealtimeConnectionPolicy {
  path: typeof REALTIME_PATH
  requiresAuthenticatedIdentity: boolean
  reconnectAttempts: number
}

export const REALTIME_POLICY: RealtimeConnectionPolicy = {
  path: REALTIME_PATH,
  requiresAuthenticatedIdentity: true,
  reconnectAttempts: 5,
}

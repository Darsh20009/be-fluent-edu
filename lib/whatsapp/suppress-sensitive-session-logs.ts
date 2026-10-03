const signalLogFilterMarker = Symbol.for('befluent.whatsapp.signal-session-log-filter.v1')

const sensitiveSessionMessages = new Set([
  'Closing session:',
  'Opening session:',
  'Session already closed',
])

export function suppressSensitiveSessionLogs(target: Console = console) {
  const targetWithMarker = target as unknown as Record<symbol, unknown>
  if (targetWithMarker[signalLogFilterMarker]) return

  const originalInfo = target.info.bind(target)
  const originalWarn = target.warn.bind(target)

  target.info = ((...args: unknown[]) => {
    if (isSensitiveSessionLog(args)) return
    originalInfo(...args)
  }) as Console['info']

  target.warn = ((...args: unknown[]) => {
    if (isSensitiveSessionLog(args)) return
    originalWarn(...args)
  }) as Console['warn']

  Object.defineProperty(target, signalLogFilterMarker, { value: true })
}

function isSensitiveSessionLog(args: unknown[]) {
  return (
    typeof args[0] === 'string' &&
    sensitiveSessionMessages.has(args[0]) &&
    args.length > 1 &&
    typeof args[1] === 'object' &&
    args[1] !== null
  )
}
export function safeLocalNotificationHref(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return null
  }
  try {
    const target = new URL(value, 'https://be-fluent.invalid')
    return target.origin === 'https://be-fluent.invalid' ? `${target.pathname}${target.search}${target.hash}` : null
  } catch {
    return null
  }
}
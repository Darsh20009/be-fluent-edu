import { z } from 'zod'

export function normalizePhone(value: string, defaultCountryCode = '20'): string {
  const compact = value.trim().replace(/[()\s-]/g, '')
  if (!compact) throw new Error('Phone number is required')

  if (compact.startsWith('00')) return `+${compact.slice(2)}`
  if (compact.startsWith('+')) return `+${compact.slice(1).replace(/\D/g, '')}`
  if (compact.startsWith(defaultCountryCode)) return `+${compact}`
  if (compact.startsWith('0')) return `+${defaultCountryCode}${compact.slice(1)}`

  return `+${defaultCountryCode}${compact}`
}

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((value) => normalizePhone(value))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, 'Invalid phone number'))

export const emailSchema = z.string().trim().email('Invalid email address')

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})

export type Pagination = z.infer<typeof paginationSchema>

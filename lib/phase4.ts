import { z } from 'zod'

export const levelCodes = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export const profilePatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(32).nullable().optional(),
  email: z.string().email().optional(),
  profilePhoto: z.string().url().nullable().optional(),
  goal: z.string().trim().max(2000).nullable().optional(),
  age: z.number().int().min(1).max(120).nullable().optional(),
})

export const studentAvailabilitySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(30).max(240),
}).strict().superRefine((slot, context) => {
  if (slot.startMinute + slot.durationMinutes > 1440) {
    context.addIssue({ code: 'custom', path: ['durationMinutes'], message: 'Availability must end before midnight' })
  }
})

const timezoneSchema = z.string().trim().min(1).max(100).refine((timezone) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    return true
  } catch {
    return false
  }
}, 'Enter a valid time zone')

export const studentProfilePatchSchema = profilePatchSchema.extend({
  gender: z.enum(['FEMALE', 'MALE', 'PREFER_NOT_TO_SAY']).nullable().optional(),
  nationality: z.string().trim().min(2).max(100).nullable().optional(),
  availabilityMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).nullable().optional(),
  availabilitySlots: z.array(studentAvailabilitySlotSchema).max(49).optional(),
  availabilityTimezone: timezoneSchema.optional(),
}).superRefine((value, context) => {
  const slots = value.availabilitySlots
  if (slots?.length && !value.availabilityMonth) {
    context.addIssue({ code: 'custom', path: ['availabilityMonth'], message: 'A month is required when availability is set' })
  }
  if (slots) {
    const keys = slots.map((slot) => `${slot.dayOfWeek}:${slot.startMinute}`)
    if (new Set(keys).size !== keys.length) {
      context.addIssue({ code: 'custom', path: ['availabilitySlots'], message: 'Availability slots must be unique' })
    }
  }
})

export const goalsSchema = z.object({
  overallGoal: z.string().trim().max(1000).nullable().optional(),
  monthlyGoal: z.string().trim().max(1000).nullable().optional(),
  weeklyFocus: z.string().trim().max(1000).nullable().optional(),
})

export function parseJson(value: string | null | undefined): unknown {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function parseList(value: string | null | undefined): string[] {
  const parsed = parseJson(value)
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
}
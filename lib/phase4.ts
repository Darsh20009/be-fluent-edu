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
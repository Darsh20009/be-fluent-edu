import assert from 'node:assert/strict'
import test from 'node:test'
import { GET as health } from '@/app/api/health/route'
import { goalsSchema, levelCodes, profilePatchSchema } from '@/lib/phase4'
import { hasPermission, roleHasPermission } from '@/lib/authorization'

test('phase 4 profile and goals boundaries validate safe input', () => {
  assert.equal(profilePatchSchema.parse({ name: 'Student', age: 20 }).name, 'Student')
  assert.deepEqual(goalsSchema.parse({ overallGoal: 'Speak confidently' }), { overallGoal: 'Speak confidently' })
  assert.equal(levelCodes.includes('C1'), true)
  assert.throws(() => profilePatchSchema.parse({ name: '' }))
})

test('phase 4 roles expose only intended capabilities', () => {
  assert.equal(roleHasPermission('STUDENT', 'student.editProfile'), true)
  assert.equal(roleHasPermission('TEACHER', 'teacher.recommendLevel'), true)
  assert.equal(roleHasPermission('MANAGER', 'admin.viewPeople'), true)
  assert.equal(roleHasPermission('MANAGER', 'admin.manageStaffPermissions'), false)
  assert.equal(roleHasPermission('STAFF', 'admin.manageStaffPermissions'), false)
  assert.equal(hasPermission({ userId: 'staff', role: 'STAFF', permissions: ['admin.manageStaffPermissions'] }, 'admin.manageStaffPermissions'), true)
})

test('health endpoint reports application readiness without MongoDB', async () => {
  const original = process.env.MONGODB_URI
  delete process.env.MONGODB_URI
  const response = await health()
  const body = await response.json()
  if (original) process.env.MONGODB_URI = original
  assert.equal(response.status, 503)
  assert.equal(body.application, 'healthy')
  assert.equal(body.database, 'not_configured')
  assert.equal(typeof body.environment, 'string')
})
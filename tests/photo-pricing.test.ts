import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPhotoPricing } from '../lib/photo-pricing'

test('photo pricing creates six per-student packages with explicit lesson counts', () => {
  const packages = buildPhotoPricing(2)
  assert.equal(packages.length, 6)
  assert.deepEqual(packages.map((item) => item.price), [1350, 4050, 8100, 2700, 8100, 16200])
  assert.deepEqual(packages.map((item) => item.discountPrice), [null, 2880, 4200, null, 6000, 10350])
  assert.deepEqual(packages.map((item) => item.lessonsCount), [8, 24, 48, 8, 24, 48])
  assert.deepEqual(packages.map((item) => item.capacity), [2, 2, 2, 3, 3, 3])
  assert.ok(packages.every((item) => item.currency === 'EGP'))
})

test('photo pricing refuses to create packages until weekly lesson frequency is configured', () => {
  assert.throws(() => buildPhotoPricing(0), /integer from 1 to 7/)
  assert.throws(() => buildPhotoPricing(1.5), /integer from 1 to 7/)
})
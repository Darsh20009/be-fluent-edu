import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPlacementTicket } from '../lib/placement-ticket'

test('placement access tickets are stored as non-reversible hashes', () => {
  const ticket = 'sample-placement-ticket'
  const hash = hashPlacementTicket(ticket)
  assert.match(hash, /^[a-f0-9]{64}$/)
  assert.notEqual(hash, ticket)
  assert.notEqual(hashPlacementTicket('another-ticket'), hash)
})
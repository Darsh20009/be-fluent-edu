import { createHash } from 'node:crypto'

export function hashPlacementTicket(ticket: string): string {
  return createHash('sha256').update(ticket).digest('hex')
}
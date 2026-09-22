class SpeakingMembershipError extends Error {
  constructor(code) {
    super(code);
    this.name = 'SpeakingMembershipError';
    this.code = code;
  }
}

function membershipTransitionDelta(fromStatus, toStatus) {
  const wasActive = fromStatus === 'ACTIVE';
  const isActive = toStatus === 'ACTIVE';
  return wasActive === isActive ? 0 : isActive ? 1 : -1;
}

/**
 * The only service allowed to change an ACTIVE/non-ACTIVE room membership.
 * The room counter is reserved conditionally in the same transaction as the
 * membership write, so reactivation cannot exceed capacity and deactivation
 * cannot decrement twice.
 */
async function transitionSpeakingRoomMember(client, input) {
  return client.$transaction(async (tx) => {
    const room = await tx.speakingRoom.findUnique({ where: { id: input.roomId } });
    if (!room) throw new SpeakingMembershipError('ROOM_NOT_FOUND');
    const current = await tx.speakingRoomMember.findUnique({
      where: { roomId_userId: { roomId: input.roomId, userId: input.userId } },
    });

    if (input.transition === 'ACTIVATE') {
      if (current && current.status === 'BLOCKED' && !input.allowBlockedReactivation) {
        throw new SpeakingMembershipError('MEMBER_BLOCKED');
      }
      if (current && membershipTransitionDelta(current.status, 'ACTIVE') !== 1) {
        throw new SpeakingMembershipError('ALREADY_MEMBER');
      }
      const reserved = await tx.speakingRoom.updateMany({
        where: {
          id: input.roomId,
          status: { in: ['OPEN', 'ACTIVE'] },
          ...(room.maxMembers === null ? {} : { activeMemberCount: { lt: room.maxMembers } }),
        },
        data: { activeMemberCount: { increment: 1 } },
      });
      if (reserved.count !== 1) throw new SpeakingMembershipError('ROOM_FULL');
      return current
        ? tx.speakingRoomMember.update({
          where: { id: current.id },
          data: { status: 'ACTIVE', joinedAt: new Date(), leftAt: null },
        })
        : tx.speakingRoomMember.create({ data: { roomId: input.roomId, userId: input.userId } });
    }

    if (!current || current.status !== 'ACTIVE') {
      return current;
    }
    const nextStatus = input.status || 'LEFT';
    if (membershipTransitionDelta(current.status, nextStatus) !== -1) return current;
    const updated = await tx.speakingRoomMember.update({
      where: { id: current.id },
      data: { status: nextStatus, leftAt: new Date() },
    });
    const released = await tx.speakingRoom.updateMany({
      where: { id: input.roomId, activeMemberCount: { gt: 0 } },
      data: { activeMemberCount: { decrement: 1 } },
    });
    if (released.count !== 1) throw new SpeakingMembershipError('COUNTER_DRIFT');
    return updated;
  });
}

module.exports = { SpeakingMembershipError, membershipTransitionDelta, transitionSpeakingRoomMember };
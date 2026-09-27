/**
 * CommonJS bridge for the custom Socket.IO server. Do not register tsx/cjs
 * here: its require hook intercepts Next.js internals during app.prepare().
 * The HTTP message endpoint uses the corresponding TypeScript pipeline.
 */
async function persistSpeakingActivitySignal(tx, input) {
  if (process.env.PHASE5_DATABASE_ENABLED !== 'true') {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const [room, profile, skill] = await Promise.all([
    tx.speakingRoom.findUnique({ where: { id: input.roomId }, select: { topic: true } }),
    tx.studentLearningProfile.findUnique({
      where: { userId: input.studentId },
      select: { officialLevelId: true, officialStageId: true },
    }),
    tx.skill.findUnique({ where: { code: 'SPEAKING' }, select: { id: true } }),
  ]);
  if (!room) throw new Error('Speaking room source was not found.');
  const topicKey = room.topic ? room.topic.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ') : null;
  await tx.learningSignal.upsert({
    where: {
      studentId_dedupeKey: {
        studentId: input.studentId,
        dedupeKey: `speaking:${input.messageId}`,
      },
    },
    create: {
      studentId: input.studentId,
      type: 'SPEAKING_ACTIVITY',
      source: 'SPEAKING',
      sourceEntityType: 'SpeakingRoomMessage',
      sourceEntityId: input.messageId,
      sourceItemKey: input.roomId,
      dedupeKey: `speaking:${input.messageId}`,
      skillId: skill?.id ?? null,
      levelId: profile?.officialLevelId ?? null,
      stageId: profile?.officialStageId ?? null,
      topicKey,
      strength: 1,
      occurredAt: input.createdAt,
      evidenceJson: JSON.stringify({
        roomId: input.roomId,
        ...(topicKey ? { topicKey } : {}),
        skillCode: 'SPEAKING',
      }),
    },
    update: {},
  });
}

module.exports = { persistSpeakingActivitySignal };
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type CefrLevel = typeof CEFR_LEVELS[number]

export const PLACEMENT_BANDS = CEFR_LEVELS.flatMap((level) =>
  [1, 2, 3, 4].map((band) => `${level}.${band}`),
)

export const PLACEMENT_QUESTION_TARGET = 1000
export const QUESTIONS_PER_BAND = Math.floor(PLACEMENT_QUESTION_TARGET / PLACEMENT_BANDS.length)
export const EXTRA_QUESTION_BANDS = PLACEMENT_QUESTION_TARGET % PLACEMENT_BANDS.length
export const PLACEMENT_TEST_LENGTH = 10

export function levelForBand(band: string): CefrLevel | null {
  const level = band.split('.')[0]
  return CEFR_LEVELS.includes(level as CefrLevel) ? level as CefrLevel : null
}

export function bandRank(band: string): number {
  return PLACEMENT_BANDS.indexOf(band)
}

export function bandAt(rank: number): string {
  return PLACEMENT_BANDS[Math.max(0, Math.min(PLACEMENT_BANDS.length - 1, Math.trunc(rank)))]
}

export function targetQuestionsForBand(index: number): number {
  return QUESTIONS_PER_BAND + (index < EXTRA_QUESTION_BANDS ? 1 : 0)
}

export function nextAdaptiveBand(current: string, correct: boolean): string {
  const rank = bandRank(current)
  if (rank < 0) return PLACEMENT_BANDS[5]
  return bandAt(rank + (correct ? 2 : -1))
}

export function determinePlacementBand(
  answers: Array<{ band: string; correct: boolean }>,
): string {
  const correctBands = answers
    .filter((answer) => answer.correct)
    .map((answer) => bandRank(answer.band))
    .filter((rank) => rank >= 0)
  if (!correctBands.length) {
    const firstRank = Math.min(...answers.map((answer) => bandRank(answer.band)).filter((rank) => rank >= 0))
    return bandAt(Number.isFinite(firstRank) ? firstRank - 1 : 0)
  }
  const correctRate = correctBands.length / Math.max(1, answers.length)
  if (correctRate >= 0.8) return bandAt(Math.max(...correctBands))
  return bandAt(correctBands.reduce((sum, rank) => sum + rank, 0) / correctBands.length)
}
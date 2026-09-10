import { Prediction, SwingDirection } from '../types';
import { getPatternStats } from './behaviorDatabase';
import { parsePatternTag } from './patternClassifier';

/**
 * Predicts the next market movement based on historical pattern statistics.
 * Requires minimum 5 occurrences of the pattern to provide reliable prediction.
 */
export async function predictNextMove(
  symbol: string,
  currentTag: string
): Promise<Prediction | null> {
  if (!currentTag) return null;

  const stats = await getPatternStats(symbol, currentTag);
  if (!stats || stats.occurrences < 5) {
    return null;
  }

  const parsed = parsePatternTag(currentTag);
  const originalDir = parsed.direction;

  let expectedDirection: SwingDirection = 'SIDEWAYS';

  if (
    stats.continuedCount > stats.reversedCount &&
    stats.continuedCount > stats.sidewaysCount
  ) {
    expectedDirection = originalDir;
  } else if (
    stats.reversedCount > stats.continuedCount &&
    stats.reversedCount > stats.sidewaysCount
  ) {
    // Reverse of the original direction
    if (originalDir === 'UP') expectedDirection = 'DOWN';
    else if (originalDir === 'DOWN') expectedDirection = 'UP';
    else expectedDirection = 'SIDEWAYS';
  } else {
    expectedDirection = 'SIDEWAYS';
  }

  return {
    tag: currentTag,
    symbol,
    confidence: stats.predictionConfidence,
    expectedDirection,
    expectedMovementPct: stats.avgNextMovement,
    expectedDurationMin: stats.avgNextDuration,
    historicalAccuracy: stats.predictionConfidence,
    sampleSize: stats.occurrences,
  };
}

export const predictOutcome = predictNextMove;
export { generatePatternTag as classifyPattern } from './patternClassifier';

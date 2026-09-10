import { SwingRecord, SwingDirection } from '../types';

export interface ParsedPatternTag {
  direction: SwingDirection;
  amplitudePct: number;
  durationMinutes: number;
  startRsi: number;
  endRsi: number;
  startAdx: number;
  endAdx: number;
}

/**
 * Buckets swing amplitude to nearest 0.5%, capped at 5.0%.
 * e.g. 0.3 -> 0.5, 1.2 -> 1.0, 1.4 -> 1.5, 2.7 -> 2.5, 5.0+ -> 5.0
 */
export function bucketAmplitude(amp: number): number {
  if (amp <= 0) return 0.5;
  const rounded = Math.round(amp * 2) / 2;
  const clamped = Math.min(5.0, Math.max(0.5, rounded));
  return Number(clamped.toFixed(1));
}

/**
 * Buckets duration in minutes into categories: 15 / 30 / 60 / 120 / 240
 * <20 -> 15, 20-45 -> 30, 45-90 -> 60, 90-180 -> 120, 180+ -> 240
 */
export function bucketDuration(minutes: number): number {
  if (minutes < 20) return 15;
  if (minutes <= 45) return 30;
  if (minutes <= 90) return 60;
  if (minutes <= 180) return 120;
  return 240;
}

/**
 * Buckets RSI into categories: 30 / 45 / 55 / 70
 * <30 -> 30, 30-45 -> 45, 45-55 -> 55, 55-70 -> 70, >70 -> 70
 */
export function bucketRsi(rsi: number): number {
  if (rsi < 30) return 30;
  if (rsi <= 45) return 45;
  if (rsi <= 55) return 55;
  return 70;
}

/**
 * Buckets ADX into categories: 20 / 25 / 30 / 40
 * <20 -> 20, 20-25 -> 25, 25-30 -> 30, 30-40 -> 40, >40 -> 40
 */
export function bucketAdx(adx: number): number {
  if (adx < 20) return 20;
  if (adx <= 25) return 25;
  if (adx <= 30) return 30;
  return 40;
}

/**
 * Generates a unique pattern tag fingerprint from a SwingRecord.
 * Format: P-{DIR}-{AMP}-{DUR}-R{RSI_START}-{RSI_END}-A{ADX_START}-{ADX_END}
 * Example: P-U-1.5-30-R45-70-A20-30
 */
export function generatePatternTag(swing: SwingRecord): string {
  const dirChar =
    swing.direction === 'UP' ? 'U' : swing.direction === 'DOWN' ? 'D' : 'S';
  const amp = bucketAmplitude(swing.amplitudePct);
  const dur = bucketDuration(swing.durationMinutes);
  const rsiStart = bucketRsi(swing.startRsi);
  const rsiEnd = bucketRsi(swing.endRsi);
  const adxStart = bucketAdx(swing.startAdx);
  const adxEnd = bucketAdx(swing.endAdx);

  return `P-${dirChar}-${amp.toFixed(1)}-${dur}-R${rsiStart}-${rsiEnd}-A${adxStart}-${adxEnd}`;
}

/**
 * Parses a pattern tag string back into its constituent components.
 */
export function parsePatternTag(tag: string): ParsedPatternTag {
  const regex = /^P-([UDS])-([\d.]+)-(\d+)-R(\d+)-(\d+)-A(\d+)-(\d+)$/;
  const match = tag.match(regex);

  if (!match) {
    return {
      direction: 'SIDEWAYS',
      amplitudePct: 1.0,
      durationMinutes: 30,
      startRsi: 50,
      endRsi: 50,
      startAdx: 20,
      endAdx: 20,
    };
  }

  const dirCode = match[1];
  const direction: SwingDirection =
    dirCode === 'U' ? 'UP' : dirCode === 'D' ? 'DOWN' : 'SIDEWAYS';

  return {
    direction,
    amplitudePct: parseFloat(match[2]),
    durationMinutes: parseInt(match[3], 10),
    startRsi: parseInt(match[4], 10),
    endRsi: parseInt(match[5], 10),
    startAdx: parseInt(match[6], 10),
    endAdx: parseInt(match[7], 10),
  };
}

/**
 * Calculates similarity between two pattern tags on a scale of 0 to 100%.
 */
export function patternSimilarity(tag1: string, tag2: string): number {
  if (tag1 === tag2) return 100;

  const p1 = parsePatternTag(tag1);
  const p2 = parsePatternTag(tag2);

  // 1. Direction score (max 30 pts)
  let dirScore = 0;
  if (p1.direction === p2.direction) {
    dirScore = 30;
  } else if (p1.direction === 'SIDEWAYS' || p2.direction === 'SIDEWAYS') {
    dirScore = 15;
  } else {
    dirScore = 0;
  }

  // 2. Amplitude score (max 20 pts)
  const ampDiff = Math.abs(p1.amplitudePct - p2.amplitudePct);
  const ampScore = Math.max(0, 20 * (1 - ampDiff / 5.0));

  // 3. Duration score (max 15 pts)
  const durDiff = Math.abs(p1.durationMinutes - p2.durationMinutes);
  const durScore = Math.max(0, 15 * (1 - durDiff / 240));

  // 4. RSI score (max 20 pts)
  const rsiDiff =
    (Math.abs(p1.startRsi - p2.startRsi) + Math.abs(p1.endRsi - p2.endRsi)) / 2;
  const rsiScore = Math.max(0, 20 * (1 - rsiDiff / 70));

  // 5. ADX score (max 15 pts)
  const adxDiff =
    (Math.abs(p1.startAdx - p2.startAdx) + Math.abs(p1.endAdx - p2.endAdx)) / 2;
  const adxScore = Math.max(0, 15 * (1 - adxDiff / 40));

  const total = dirScore + ampScore + durScore + rsiScore + adxScore;
  return Math.round(Math.max(0, Math.min(100, total)));
}

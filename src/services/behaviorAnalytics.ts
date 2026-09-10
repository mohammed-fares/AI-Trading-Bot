import { SymbolBehaviorStats } from '../types';
import {
  getSwingsBySymbol,
  getTopPatterns,
  saveSymbolStats,
  getSymbolStats,
} from './behaviorDatabase';

/**
 * Computes hours analysis (best and worst performing UTC hours based on outcome magnitude and success).
 */
export async function computeHourRankings(
  symbol: string
): Promise<{ bestHours: number[]; worstHours: number[] }> {
  const swings = await getSwingsBySymbol(symbol, 5000);
  if (swings.length === 0) {
    return { bestHours: [12, 14, 16], worstHours: [0, 4, 8] };
  }

  const hourBuckets: Record<number, { count: number; totalMag: number; successCount: number }> = {};
  for (let h = 0; h < 24; h++) {
    hourBuckets[h] = { count: 0, totalMag: 0, successCount: 0 };
  }

  for (const s of swings) {
    const hour = new Date(s.startTime).getUTCHours();
    hourBuckets[hour].count++;
    hourBuckets[hour].totalMag += s.outcomeMagnitude ?? s.amplitudePct;
    if (s.outcome === 'CONTINUED' || s.outcome === 'REVERSED') {
      hourBuckets[hour].successCount++;
    }
  }

  const hoursWithStats = Object.entries(hourBuckets).map(([hourStr, data]) => {
    const hour = parseInt(hourStr, 10);
    const avgMag = data.count > 0 ? data.totalMag / data.count : 0;
    const winRate = data.count > 0 ? (data.successCount / data.count) * 100 : 0;
    // Composite performance score
    const score = avgMag * 0.6 + winRate * 0.4;
    return { hour, count: data.count, score };
  });

  // Sort descending by score
  const sorted = [...hoursWithStats].sort((a, b) => b.score - a.score);

  const bestHours = sorted.slice(0, 3).map((h) => h.hour);
  const worstHours = sorted.slice(-3).reverse().map((h) => h.hour);

  return { bestHours, worstHours };
}

export async function computeBestHours(symbol: string): Promise<number[]> {
  const { bestHours } = await computeHourRankings(symbol);
  return bestHours;
}

export async function computeWorstHours(symbol: string): Promise<number[]> {
  const { worstHours } = await computeHourRankings(symbol);
  return worstHours;
}

/**
 * Computes complete aggregated behavioral statistics for a cryptocurrency symbol.
 */
export async function computeSymbolStats(
  symbol: string
): Promise<SymbolBehaviorStats> {
  const swings = await getSwingsBySymbol(symbol, 5000);

  const totalSwings = swings.length;
  const uniquePatternTags = new Set(
    swings.map((s) => s.patternTag).filter(Boolean)
  );
  const uniquePatternsCount = uniquePatternTags.size;

  const upSwings = swings.filter((s) => s.direction === 'UP');
  const downSwings = swings.filter((s) => s.direction === 'DOWN');

  const avgUpPct =
    upSwings.length > 0
      ? Number(
          (
            upSwings.reduce((sum, s) => sum + s.amplitudePct, 0) /
            upSwings.length
          ).toFixed(2)
        )
      : 0;

  const avgDownPct =
    downSwings.length > 0
      ? Number(
          (
            downSwings.reduce((sum, s) => sum + s.amplitudePct, 0) /
            downSwings.length
          ).toFixed(2)
        )
      : 0;

  const avgDurationMin =
    totalSwings > 0
      ? Math.round(
          swings.reduce((sum, s) => sum + s.durationMinutes, 0) / totalSwings
        )
      : 0;

  // Accuracy: completed swings with clear outcome (CONTINUED or REVERSED)
  const evaluatedSwings = swings.filter(
    (s) => s.outcome && s.outcome !== 'PENDING'
  );
  const successfulSwings = evaluatedSwings.filter(
    (s) => s.outcome === 'CONTINUED' || s.outcome === 'REVERSED'
  );
  const overallAccuracy =
    evaluatedSwings.length > 0
      ? Number(
          (
            (successfulSwings.length / evaluatedSwings.length) *
            100
          ).toFixed(1)
        )
      : 0;

  const { bestHours, worstHours } = await computeHourRankings(symbol);
  const topPatterns = await getTopPatterns(symbol, 10);

  const stats: SymbolBehaviorStats = {
    symbol,
    totalSwings,
    uniquePatternsCount,
    avgUpPct,
    avgDownPct,
    avgDurationMin,
    overallAccuracy,
    bestTradingHours: bestHours,
    worstTradingHours: worstHours,
    topPatterns,
    lastUpdated: Date.now(),
  };

  await saveSymbolStats(stats);
  return stats;
}

/**
 * Refreshes and saves the symbol behavioral statistics in DB.
 */
export async function refreshSymbolStats(symbol: string): Promise<void> {
  await computeSymbolStats(symbol);
}

export { getSymbolStats };

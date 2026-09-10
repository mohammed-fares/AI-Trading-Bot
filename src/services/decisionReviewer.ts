import {
  Trade,
  StrategyPerformance,
  DecisionReview,
  SwingDirection,
} from '../types';
import { getPatternStats } from './behaviorDatabase';
import { predictNextMove } from './predictionEngine';

/**
 * Performs a comprehensive 3-stage validation review before executing any trade:
 * 1. Open Trades Check (prevents duplicate trades & assesses hedge mode)
 * 2. Strategy Review (evaluates historical win-rate & rankings for this symbol)
 * 3. Pattern Review (validates current swing fingerprint against behavioral database)
 */
export async function performTripleReview(
  symbol: string,
  suggestedSide: 'LONG' | 'SHORT',
  baseConfidence: number,
  strategyName: string,
  activeTrades: Trade[],
  strategyPerformances: StrategyPerformance[],
  currentPattern: string,
  aiInsight?: { score: number; reason: string }
): Promise<DecisionReview> {
  // ==========================================
  // REVIEW 1: Open Trades Check
  // ==========================================
  const existingTrade = activeTrades.find((t) => t.symbol === symbol);
  let openTradesCheck: DecisionReview['openTradesCheck'];

  if (existingTrade) {
    if (existingTrade.side === suggestedSide) {
      openTradesCheck = {
        hasOpenTradeOnSymbol: true,
        openTradeId: existingTrade.id,
        openTradeSide: existingTrade.side,
        decision: 'BLOCK',
        scoreDelta: -100,
        reason: `Open ${suggestedSide} trade already exists on ${symbol}`,
        reasonAr: `توجد صفقة مفتوحة بالفعل على ${symbol} بنفس الاتجاه (${suggestedSide})`,
      };
    } else {
      openTradesCheck = {
        hasOpenTradeOnSymbol: true,
        openTradeId: existingTrade.id,
        openTradeSide: existingTrade.side,
        decision: 'ALLOW_HEDGE',
        scoreDelta: -20,
        reason: `Opposite direction open trade exists on ${symbol} (hedge penalty applied)`,
        reasonAr: `توجد صفقة مفتوحة بالاتجاه المعاكس على ${symbol} (خصم وضع التحوط)`,
      };
    }
  } else {
    openTradesCheck = {
      hasOpenTradeOnSymbol: false,
      decision: 'PASS',
      scoreDelta: 0,
      reason: `No open trades on ${symbol}`,
      reasonAr: `لا توجد صفقات مفتوحة حالياً على ${symbol}`,
    };
  }

  // ==========================================
  // REVIEW 2: Strategy Performance Review
  // ==========================================
  const symbolStrats = strategyPerformances.filter((s) => s.symbol === symbol);
  const pool = symbolStrats.length > 0 ? symbolStrats : strategyPerformances;

  const sortedStrats = [...pool].sort((a, b) => b.winRate - a.winRate);
  const top3 = sortedStrats.slice(0, 3).map((s) => ({
    name: s.strategyName,
    winRate: s.winRate,
    tradesCount: s.wins + s.losses,
  }));

  const targetPerf = pool.find((s) => s.strategyName === strategyName);
  const suggestedWinRate = targetPerf ? targetPerf.winRate : 55;
  const isTop = top3.some((s) => s.name === strategyName);

  let strategyDecision: 'STRONG_PASS' | 'PASS' | 'WEAK_PASS' | 'BLOCK' = 'PASS';
  let strategyScoreDelta = 0;
  let stratReason = '';
  let stratReasonAr = '';

  if (suggestedWinRate < 40) {
    strategyDecision = 'BLOCK';
    strategyScoreDelta = -50;
    stratReason = `Strategy ${strategyName} win rate (${suggestedWinRate}%) is too low (< 40%)`;
    stratReasonAr = `نسبة فوز الاستراتيجية (${suggestedWinRate}%) منخفضة جداً (< 40%)`;
  } else if (isTop) {
    if (suggestedWinRate >= 70) {
      strategyDecision = 'STRONG_PASS';
      strategyScoreDelta = 30;
      stratReason = `Strategy ${strategyName} is a top performer with excellent win rate (${suggestedWinRate}%)`;
      stratReasonAr = `الاستراتيجية من الأفضل أداءً بنسبة فوز ممتازة (${suggestedWinRate}%)`;
    } else if (suggestedWinRate >= 55) {
      strategyDecision = 'PASS';
      strategyScoreDelta = 15;
      stratReason = `Strategy ${strategyName} is a top performer with solid win rate (${suggestedWinRate}%)`;
      stratReasonAr = `الاستراتيجية ضمن الأفضل أداءً بنسبة فوز جيدة (${suggestedWinRate}%)`;
    } else {
      strategyDecision = 'WEAK_PASS';
      strategyScoreDelta = 0;
      stratReason = `Strategy ${strategyName} has moderate performance (${suggestedWinRate}%)`;
      stratReasonAr = `الاستراتيجية ذات أداء متوسط (${suggestedWinRate}%)`;
    }
  } else {
    strategyDecision = 'WEAK_PASS';
    strategyScoreDelta = -15;
    stratReason = `Strategy ${strategyName} is outside top 3 performers for ${symbol}`;
    stratReasonAr = `الاستراتيجية خارج أفضل 3 استراتيجيات للعملة (${suggestedWinRate}%)`;
  }

  const strategyReview: DecisionReview['strategyReview'] = {
    suggestedStrategy: strategyName,
    suggestedStrategyWinRate: suggestedWinRate,
    topStrategiesForSymbol: top3,
    isTopStrategy: isTop,
    decision: strategyDecision,
    scoreDelta: strategyScoreDelta,
    reason: stratReason,
    reasonAr: stratReasonAr,
  };

  // ==========================================
  // REVIEW 3: Behavioral Pattern Review
  // ==========================================
  let patternOccurrences = 0;
  let patternConfidence = 0;
  let expectedDirection: SwingDirection = 'SIDEWAYS';
  let matchesSuggestedDirection = false;

  let patternDecision: 'STRONG_PASS' | 'PASS' | 'NEUTRAL' | 'BLOCK' = 'NEUTRAL';
  let patternScoreDelta = 0;
  let patternReason = '';
  let patternReasonAr = '';

  if (currentPattern) {
    const stats = await getPatternStats(symbol, currentPattern);
    if (stats) {
      patternOccurrences = stats.occurrences;
      patternConfidence = stats.predictionConfidence;
    }

    const prediction = await predictNextMove(symbol, currentPattern);
    if (prediction) {
      expectedDirection = prediction.expectedDirection;
      matchesSuggestedDirection =
        (expectedDirection === 'UP' && suggestedSide === 'LONG') ||
        (expectedDirection === 'DOWN' && suggestedSide === 'SHORT');
    }
  }

  if (patternOccurrences < 5) {
    patternDecision = 'NEUTRAL';
    patternScoreDelta = 0;
    patternReason = `Insufficient pattern data (${patternOccurrences}/5 occurrences observed)`;
    patternReasonAr = `بيانات النمط غير كافية (${patternOccurrences}/5 تكرارات)`;
  } else {
    if (patternConfidence >= 70 && matchesSuggestedDirection) {
      patternDecision = 'STRONG_PASS';
      patternScoreDelta = 25;
      patternReason = `Historical pattern confirms ${suggestedSide} with ${patternConfidence}% confidence`;
      patternReasonAr = `النمط السلوكي يؤكد اتجاه ${suggestedSide} بنسبة ثقة ${patternConfidence}%`;
    } else if (patternConfidence >= 55 && matchesSuggestedDirection) {
      patternDecision = 'PASS';
      patternScoreDelta = 15;
      patternReason = `Historical pattern supports ${suggestedSide} (${patternConfidence}% confidence)`;
      patternReasonAr = `النمط السلوكي يدعم اتجاه ${suggestedSide} (ثقة ${patternConfidence}%)`;
    } else if (patternConfidence >= 55 && !matchesSuggestedDirection) {
      patternDecision = 'BLOCK';
      patternScoreDelta = -40;
      patternReason = `Pattern predicts opposite direction (${expectedDirection}) with ${patternConfidence}% confidence`;
      patternReasonAr = `النمط السلوكي يتوقع اتجاهاً معاكساً (${expectedDirection}) بثقة ${patternConfidence}%`;
    } else {
      patternDecision = 'NEUTRAL';
      patternScoreDelta = 0;
      patternReason = `Pattern has low directional bias (${patternConfidence}% confidence)`;
      patternReasonAr = `النمط ليس له انحياز اتجاهي قوي (ثقة ${patternConfidence}%)`;
    }
  }

  const patternReview: DecisionReview['patternReview'] = {
    currentPatternTag: currentPattern || 'NONE',
    patternOccurrences,
    patternConfidence,
    expectedDirection,
    matchesSuggestedDirection,
    decision: patternDecision,
    scoreDelta: patternScoreDelta,
    reason: patternReason,
    reasonAr: patternReasonAr,
  };

  // ==========================================
  // FINAL SCORE & SYNTHESIS
  // ==========================================
  const aiInsightScore = aiInsight?.score ?? 0;
  let finalScore =
    baseConfidence +
    openTradesCheck.scoreDelta +
    strategyReview.scoreDelta +
    patternReview.scoreDelta +
    aiInsightScore;

  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  let finalDecision: 'APPROVE' | 'APPROVE_WITH_CAUTION' | 'REJECT';

  if (
    openTradesCheck.decision === 'BLOCK' ||
    strategyReview.decision === 'BLOCK' ||
    patternReview.decision === 'BLOCK'
  ) {
    finalDecision = 'REJECT';
  } else if (finalScore >= 75) {
    finalDecision = 'APPROVE';
  } else if (finalScore >= 55) {
    finalDecision = 'APPROVE_WITH_CAUTION';
  } else {
    finalDecision = 'REJECT';
  }

  let summary = '';
  let summaryAr = '';

  if (finalDecision === 'APPROVE') {
    summary = `Decision APPROVED (${finalScore}/100): Validated across open trades, strategy win-rate, and behavioral pattern.`;
    summaryAr = `تمت الموافقة بنجاح (${finalScore}/100): اجتازت الصفقة فحص الصفقات المفتوحة، الاستراتيجية، والنمط السلوكي.`;
  } else if (finalDecision === 'APPROVE_WITH_CAUTION') {
    summary = `Decision APPROVED WITH CAUTION (${finalScore}/100): Trade allowed with conservative sizing.`;
    summaryAr = `موافقة بحذر (${finalScore}/100): يُسمح بالصفقة مع تخفيض حجم المركز احترازياً.`;
  } else {
    const blockers: string[] = [];
    const blockersAr: string[] = [];
    if (openTradesCheck.decision === 'BLOCK') {
      blockers.push(openTradesCheck.reason);
      blockersAr.push(openTradesCheck.reasonAr);
    }
    if (strategyReview.decision === 'BLOCK') {
      blockers.push(strategyReview.reason);
      blockersAr.push(strategyReview.reasonAr);
    }
    if (patternReview.decision === 'BLOCK') {
      blockers.push(patternReview.reason);
      blockersAr.push(patternReview.reasonAr);
    }
    if (blockers.length === 0) {
      blockers.push(`Score (${finalScore}) below required threshold (55)`);
      blockersAr.push(`النتيجة (${finalScore}) أقل من الحد الأدنى المطلوب (55)`);
    }

    summary = `Decision REJECTED (${finalScore}/100): ${blockers.join('; ')}`;
    summaryAr = `تم رفض الصفقة (${finalScore}/100): ${blockersAr.join('؛ ')}`;
  }

  return {
    openTradesCheck,
    strategyReview,
    patternReview,
    finalDecision,
    finalScore,
    baseScore: baseConfidence,
    aiInsightScore,
    summary,
    summaryAr,
  };
}

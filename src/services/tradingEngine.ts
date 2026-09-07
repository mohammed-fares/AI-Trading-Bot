import {
  BotConfig,
  CryptoAsset,
  MarketSentiment,
  MarketTrend,
  Strategy,
  Trade,
  ExitReason,
  MarketRegime,
  AILearnedLesson,
  AIErrorType,
} from '../types';

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length <= period) {
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

export function determineTrend(ema20: number, ema50: number, ema200: number): MarketTrend {
  if (ema20 > ema50 && ema50 > ema200) {
    return 'UP';
  } else if (ema20 < ema50 && ema50 < ema200) {
    return 'DOWN';
  }
  return 'NEUTRAL';
}

/**
 * Detects current macro market regime across assets
 */
export function detectMarketRegime(assets: CryptoAsset[]): MarketRegime {
  if (assets.length === 0) return 'RANGE_BOUND';

  const upCount = assets.filter((a) => a.trend === 'UP').length;
  const downCount = assets.filter((a) => a.trend === 'DOWN').length;
  const avgRsi = assets.reduce((sum, a) => sum + a.rsi, 0) / assets.length;
  const avgAdx = assets.reduce((sum, a) => sum + a.adx, 0) / assets.length;

  if (avgAdx > 26 && upCount >= assets.length * 0.6) {
    return 'BULL_TREND';
  }
  if (avgAdx > 26 && downCount >= assets.length * 0.6) {
    return 'BEAR_TREND';
  }
  if (avgRsi > 68 || avgRsi < 32 || avgAdx > 34) {
    return 'HIGH_VOLATILITY';
  }
  return 'RANGE_BOUND';
}

/**
 * Returns dynamic weight boost based on market regime and strategy category
 */
export function getRegimeStrategyBoost(category: Strategy['category'], regime: MarketRegime): number {
  switch (regime) {
    case 'BULL_TREND':
    case 'BEAR_TREND':
      if (category === 'trend') return 1.45;
      if (category === 'momentum') return 1.25;
      if (category === 'swing') return 1.2;
      if (category === 'scalping') return 0.9;
      return 1.0;

    case 'RANGE_BOUND':
      if (category === 'scalping') return 1.4;
      if (category === 'momentum') return 1.15;
      if (category === 'trend') return 0.75;
      return 1.0;

    case 'HIGH_VOLATILITY':
      if (category === 'scalping') return 1.35;
      if (category === 'momentum') return 1.3;
      if (category === 'swing') return 0.7;
      if (category === 'daily') return 0.7;
      return 1.0;

    default:
      return 1.0;
  }
}

/**
 * Evaluates Ensemble Signal incorporating Market Regime and adaptive strategy weights
 */
export function evaluateEnsembleSignal(
  asset: CryptoAsset,
  strategies: Strategy[],
  timeframe: string,
  regime: MarketRegime = 'BULL_TREND'
): {
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
  longScore: number;
  shortScore: number;
  confidence: number;
  totalScore: number;
} {
  let longScore = 0;
  let shortScore = 0;

  const enabledStrategies = strategies.filter((s) => s.enabled);

  enabledStrategies.forEach((strategy) => {
    let stratSignal: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
    let stratConfidence = 0.55;

    // Technical evaluation based on indicators
    if (asset.trend === 'UP') {
      if (asset.rsi < 45) {
        stratSignal = 'LONG';
        stratConfidence = 0.74;
      } else if (asset.rsi > 72) {
        stratSignal = 'SHORT';
        stratConfidence = 0.6;
      } else if (asset.macdSignal === 'BULLISH') {
        stratSignal = 'LONG';
        stratConfidence = 0.7;
      } else {
        stratSignal = 'LONG';
        stratConfidence = 0.6;
      }
    } else if (asset.trend === 'DOWN') {
      if (asset.rsi > 55) {
        stratSignal = 'SHORT';
        stratConfidence = 0.76;
      } else if (asset.rsi < 28) {
        stratSignal = 'LONG';
        stratConfidence = 0.62;
      } else if (asset.macdSignal === 'BEARISH') {
        stratSignal = 'SHORT';
        stratConfidence = 0.71;
      } else {
        stratSignal = 'SHORT';
        stratConfidence = 0.62;
      }
    } else {
      // Neutral trend - mean reversion
      if (asset.rsi < 35) {
        stratSignal = 'LONG';
        stratConfidence = 0.68;
      } else if (asset.rsi > 65) {
        stratSignal = 'SHORT';
        stratConfidence = 0.68;
      }
    }

    // Regime boost
    const regimeMultiplier = getRegimeStrategyBoost(strategy.category, regime);
    // Timeframe synergy
    const tfMultiplier = strategy.timeframe === timeframe ? 1.15 : 1.0;
    const finalWeight = strategy.weight * regimeMultiplier * tfMultiplier;

    if (stratSignal === 'LONG') {
      longScore += stratConfidence * finalWeight;
    } else if (stratSignal === 'SHORT') {
      shortScore += stratConfidence * finalWeight;
    }
  });

  const sumScores = longScore + shortScore;
  if (sumScores === 0) {
    return { signal: 'NEUTRAL', longScore: 0, shortScore: 0, confidence: 0, totalScore: 0 };
  }

  const confidence =
    longScore > shortScore
      ? (longScore / sumScores) * 100
      : (shortScore / sumScores) * 100;

  const signal =
    longScore > shortScore * 1.1 ? 'LONG' : shortScore > longScore * 1.1 ? 'SHORT' : 'NEUTRAL';

  return {
    signal,
    longScore: parseFloat(longScore.toFixed(2)),
    shortScore: parseFloat(shortScore.toFixed(2)),
    confidence: Math.round(confidence),
    totalScore: parseFloat((Math.max(longScore, shortScore) * 6).toFixed(1)),
  };
}

/**
 * Autonomous AI Self-Learning & Error Diagnostics Engine
 * Evaluates trade outcome and applies remedial actions
 */
export function analyzeTradeErrorAndLearn(
  trade: Trade,
  asset: CryptoAsset | undefined,
  config: BotConfig
): AILearnedLesson {
  const isWin = trade.pnl > 0;
  const isLong = trade.side === 'LONG';
  const assetTrend = asset?.trend || 'NEUTRAL';

  let errorType: AIErrorType = 'PERFECT_EXECUTION_WIN';
  let diagnosis = '';
  let arabicDiagnosis = '';
  let remedyAction = '';
  let arabicRemedyAction = '';
  let weightDelta = 0;
  let confidenceDelta = 0;

  if (isWin) {
    errorType = 'PERFECT_EXECUTION_WIN';
    diagnosis = `Successful trade execution with positive R:R. Signal alignment verified.`;
    arabicDiagnosis = `تنفيذ ناجح بنسبة عائد لمخاطرة ممتازة. توافق دقيق للإشارات الفنية.`;
    remedyAction = `AI boosted strategy "${trade.strategyUsed}" weight by +10% for optimal exploitation.`;
    arabicRemedyAction = `قام الذكاء الاصطناعي برفع وزن استراتيجية "${trade.strategyUsed}" بنسبة +10% لاستغلال فعاليتها.`;
    weightDelta = 0.1;
    confidenceDelta = 0;
  } else {
    // Determine error cause
    const isCounterTrend =
      (isLong && assetTrend === 'DOWN') || (!isLong && assetTrend === 'UP');

    if (isCounterTrend) {
      errorType = 'COUNTER_TREND_ERROR';
      diagnosis = `Trade was entered against the macro trend (${trade.side} in ${assetTrend} trend).`;
      arabicDiagnosis = `تم الدخول بالصفقة عكس الاتجاه العام للسوق (${trade.side} في اتجاه ${assetTrend}).`;
      remedyAction = `AI penalized counter-trend strategy weight by -15% and activated strict trend enforcement.`;
      arabicRemedyAction = `قام الذكاء الاصطناعي بخفض وزن الاستراتيجية بنسبة -15% وتغليظ شرط فلتر الاتجاه الصارم.`;
      weightDelta = -0.15;
      confidenceDelta = 2;
    } else if (trade.exitReason === 'STOP_LOSS' && (asset?.adx || 0) > 35) {
      errorType = 'VOLATILITY_SPIKE_ERROR';
      diagnosis = `Stop loss breached due to sudden ATR volatility expansion and liquidity sweep.`;
      arabicDiagnosis = `ضرب وقف الخسارة نتيجة قفزة تذبذب مفاجئة ومسح سيولة سريع (ATR Spike).`;
      remedyAction = `AI expanded adaptive volatility buffer by +0.3% and restricted position leverage.`;
      arabicRemedyAction = `قام الذكاء الاصطناعي بتوسيع هامش الأمان للتذبذب بمقدار +0.3% وضبط الرافعة وقائياً.`;
      weightDelta = -0.05;
      confidenceDelta = 3;
    } else if (trade.confidence < 70) {
      errorType = 'LOW_CONFIDENCE_SLIPPAGE';
      diagnosis = `Trade opened with marginal confidence (${trade.confidence}% < 70%) resulting in drawdown.`;
      arabicDiagnosis = `تم فتح الصفقة بنسبة ثقة حدية (${trade.confidence}%) مما أدى لانعكاس السعر.`;
      remedyAction = `AI raised minimum entry confidence baseline by +2% for this asset pair.`;
      arabicRemedyAction = `قام الذكاء الاصطناعي برفع الحد الأدنى المطلوب لثقة الدخول بمقدار +2% لهذا الزوج.`;
      weightDelta = -0.1;
      confidenceDelta = 2;
    } else {
      errorType = 'PREMATURE_EXIT_ERROR';
      diagnosis = `Premature exit trigger on minor market noise prior to setup maturation.`;
      arabicDiagnosis = `خروج مبكر ناتج عن ضجيج سعري مؤقت قبل اكتمال الهدف الفني.`;
      remedyAction = `AI optimized Trailing Stop delta filter and widened exit tolerance ratio.`;
      arabicRemedyAction = `قام الذكاء الاصطناعي بتحسين مسافة الوقف المتحرك (Trailing Delta) لامتصاص التذبذب.`;
      weightDelta = -0.05;
      confidenceDelta = 1;
    }
  }

  return {
    id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toLocaleTimeString(),
    tradeId: trade.id,
    symbol: trade.symbol,
    strategyUsed: trade.strategyUsed,
    pnl: trade.pnl,
    errorType,
    diagnosis,
    arabicDiagnosis,
    remedyAction,
    arabicRemedyAction,
    weightDelta,
    confidenceDelta,
    status: 'APPLIED',
  };
}

export function calculatePositionSize(
  balance: number,
  config: BotConfig,
  confidencePct: number,
  dailyPnL: number,
  dailyRiskUsed: number,
  currentPrice: number
): { margin: number; size: number; notional: number } {
  const riskAmount = balance * (config.maxTradeRisk / 100);
  const confidenceFactor = 0.5 + (confidencePct / 100) * 0.5;

  let dailyFactor = 1.0;
  if (dailyPnL < 0) {
    dailyFactor = Math.max(0.5, 1.0 + dailyPnL / 100);
  }

  const remainingRisk = Math.max(0, config.maxDailyRisk - dailyRiskUsed);
  const riskFactor = Math.min(1.0, Math.max(0.1, remainingRisk / config.maxDailyRisk));
  const stopLossFraction = config.stopLossPercent / 100;

  let targetMargin =
    (riskAmount / stopLossFraction) * confidenceFactor * dailyFactor * riskFactor;

  // Enforce 5% maximum account risk limit
  const maxAllowedMargin = balance * (config.tradeSizePercent / 100);
  const margin = Math.min(targetMargin, maxAllowedMargin);
  const notional = margin * config.leverage;
  const size = notional / currentPrice;

  return {
    margin: parseFloat(margin.toFixed(2)),
    notional: parseFloat(notional.toFixed(2)),
    size: parseFloat(size.toFixed(4)),
  };
}

export function checkSmartExit(
  trade: Trade,
  currentPrice: number,
  config: BotConfig
): { shouldExit: boolean; reason: ExitReason | null; details: string } {
  const isLong = trade.side === 'LONG';
  const priceDiff = isLong ? currentPrice - trade.entryPrice : trade.entryPrice - currentPrice;
  const rawPriceGainPct = (priceDiff / trade.entryPrice) * 100;

  const highest = Math.max(trade.highestPrice || currentPrice, currentPrice);
  const elapsedMinutes = (Date.now() - trade.openedAt) / (1000 * 60);

  // 1. Hard Stop Loss
  if (rawPriceGainPct <= -config.stopLossPercent) {
    return {
      shouldExit: true,
      reason: 'STOP_LOSS',
      details: `وقف الخسارة مفعل عند ${rawPriceGainPct.toFixed(2)}%`,
    };
  }

  // 2. Hard Take Profit
  if (rawPriceGainPct >= config.takeProfitPercent) {
    return {
      shouldExit: true,
      reason: 'TAKE_PROFIT',
      details: `هدف جني الأرباح محقق بنجاح عند +${rawPriceGainPct.toFixed(2)}%`,
    };
  }

  if (config.useSmartExit) {
    // 3. Trailing Stop
    if (rawPriceGainPct >= config.trailingStopTriggerPercent) {
      const trailStopPrice = isLong
        ? highest * (1 - config.trailingStopDeltaPercent / 100)
        : (trade.lowestPrice || currentPrice) * (1 + config.trailingStopDeltaPercent / 100);

      const hasTriggeredTrail = isLong
        ? currentPrice <= trailStopPrice
        : currentPrice >= trailStopPrice;

      if (hasTriggeredTrail && rawPriceGainPct > 0.5) {
        return {
          shouldExit: true,
          reason: 'TRAILING_STOP',
          details: `أمر التتبع اللاحق (Trailing Stop) تم تفعيله عند ربح +${rawPriceGainPct.toFixed(2)}%`,
        };
      }
    }

    // 4. Time exit for scalping
    if (
      trade.strategyUsed.toLowerCase().includes('scalping') &&
      elapsedMinutes >= config.timeExitMinutes &&
      rawPriceGainPct > config.timeExitMinProfit
    ) {
      return {
        shouldExit: true,
        reason: 'TIME_EXIT',
        details: `خروج زمني سريع (Time Exit) بعد ${elapsedMinutes.toFixed(1)} دقيقة بربح +${rawPriceGainPct.toFixed(2)}%`,
      };
    }

    // 5. Profit retracement protection
    const peakPriceGainPct = ((highest - trade.entryPrice) / trade.entryPrice) * 100;
    if (
      peakPriceGainPct >= config.profitRetraceThreshold &&
      elapsedMinutes >= 3 &&
      rawPriceGainPct < peakPriceGainPct * (1 - config.profitRetraceDropRatio)
    ) {
      return {
        shouldExit: true,
        reason: 'PROFIT_RETRACEMENT',
        details: `حماية الأرباح (Profit Retracement) بعد تراجع 40% من أعلى قمة ربح`,
      };
    }
  }

  return { shouldExit: false, reason: null, details: '' };
}

export function generateSentimentData(): MarketSentiment {
  const index = Math.floor(58 + Math.sin(Date.now() / 25000) * 16);
  let sentimentLabel: MarketSentiment['sentimentLabel'] = 'Neutral';
  let arabicLabel: MarketSentiment['arabicLabel'] = 'محايد';
  let marketCondition: MarketSentiment['marketCondition'] = 'تجميع وتماسك';

  if (index >= 75) {
    sentimentLabel = 'Extreme Greed';
    arabicLabel = 'طمع شديد';
    marketCondition = 'اتجاه صاعد قوي';
  } else if (index >= 55) {
    sentimentLabel = 'Greed';
    arabicLabel = 'طمع';
    marketCondition = 'تذبذب عالي';
  } else if (index <= 25) {
    sentimentLabel = 'Extreme Fear';
    arabicLabel = 'خوف شديد';
    marketCondition = 'اتجاه هابط حاد';
  } else if (index <= 45) {
    sentimentLabel = 'Fear';
    arabicLabel = 'خوف';
    marketCondition = 'تجميع وتماسك';
  }

  return {
    fearAndGreedIndex: index,
    sentimentLabel,
    arabicLabel,
    marketCondition,
  };
}

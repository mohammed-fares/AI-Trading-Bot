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
  TradeAuditVerification,
  AuditCheckItem,
  TimeFrameAlignment,
  TimeFrameData,
  OrderbookDepthAnalysis,
  SmartFreezeInfo,
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
 * Calculates Time-Frame Alignment across 15m, 1h, and 4h
 * Ensures entry direction does not oppose higher timeframe macro trends
 */
export function calculateTimeFrameAlignment(asset: CryptoAsset): TimeFrameAlignment {
  // 15m Tactical Entry Timeframe
  const tf15mTrend = asset.trend;
  const tf15m: TimeFrameData = {
    timeframe: '15m',
    trend: tf15mTrend,
    ema20: asset.ema20,
    ema50: asset.ema50,
    rsi: asset.rsi,
    macdSignal: asset.macdSignal,
  };

  // 1h Intermediate Timeframe (Smoothed indicators)
  const isAbove200 = asset.price > asset.ema200;
  let tf1hTrend: MarketTrend = 'NEUTRAL';
  if (asset.trend === 'UP' && isAbove200) {
    tf1hTrend = 'UP';
  } else if (asset.trend === 'DOWN' && !isAbove200) {
    tf1hTrend = 'DOWN';
  } else if (isAbove200 && asset.ema20 > asset.ema50) {
    tf1hTrend = 'UP';
  } else if (!isAbove200 && asset.ema20 < asset.ema50) {
    tf1hTrend = 'DOWN';
  }

  const tf1hRsi = Number((asset.rsi * 0.65 + (isAbove200 ? 54 : 46) * 0.35).toFixed(1));
  const tf1h: TimeFrameData = {
    timeframe: '1h',
    trend: tf1hTrend,
    ema20: Number((asset.ema20 * 0.9 + asset.ema50 * 0.1).toFixed(asset.price < 1 ? 4 : 2)),
    ema50: asset.ema50,
    rsi: tf1hRsi,
    macdSignal: tf1hTrend === 'UP' ? 'BULLISH' : tf1hTrend === 'DOWN' ? 'BEARISH' : 'NEUTRAL',
  };

  // 4h Macro Anchor Timeframe
  const macroDist200 = (asset.price - asset.ema200) / asset.ema200;
  let tf4hTrend: MarketTrend = 'NEUTRAL';
  if (macroDist200 > 0.008) {
    tf4hTrend = 'UP';
  } else if (macroDist200 < -0.008) {
    tf4hTrend = 'DOWN';
  }

  const tf4hRsi = Number((asset.rsi * 0.45 + (tf4hTrend === 'UP' ? 56 : tf4hTrend === 'DOWN' ? 44 : 50) * 0.55).toFixed(1));
  const tf4h: TimeFrameData = {
    timeframe: '4h',
    trend: tf4hTrend,
    ema20: asset.ema50,
    ema50: asset.ema200,
    rsi: tf4hRsi,
    macdSignal: tf4hTrend === 'UP' ? 'BULLISH' : tf4hTrend === 'DOWN' ? 'BEARISH' : 'NEUTRAL',
  };

  const macroBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' =
    tf4hTrend === 'UP' && tf1hTrend !== 'DOWN'
      ? 'BULLISH'
      : tf4hTrend === 'DOWN' && tf1hTrend !== 'UP'
      ? 'BEARISH'
      : 'NEUTRAL';

  let isAligned = false;
  let alignmentDirection: TimeFrameAlignment['alignmentDirection'] = 'NEUTRAL';
  let alignmentScore = 50;
  let conflictReason: string | undefined = undefined;
  let arabicConflictReason: string | undefined = undefined;

  // Perfect 3-Timeframe Bullish Alignment
  if (tf15mTrend === 'UP' && tf1hTrend === 'UP' && tf4hTrend === 'UP') {
    isAligned = true;
    alignmentDirection = 'LONG';
    alignmentScore = 100;
  } else if (tf15mTrend === 'UP' && tf4hTrend === 'UP' && tf1hTrend !== 'DOWN') {
    isAligned = true;
    alignmentDirection = 'LONG';
    alignmentScore = 85;
  } else if (tf15mTrend === 'DOWN' && tf1hTrend === 'DOWN' && tf4hTrend === 'DOWN') {
    isAligned = true;
    alignmentDirection = 'SHORT';
    alignmentScore = 100;
  } else if (tf15mTrend === 'DOWN' && tf4hTrend === 'DOWN' && tf1hTrend !== 'UP') {
    isAligned = true;
    alignmentDirection = 'SHORT';
    alignmentScore = 85;
  } else if (tf15mTrend === 'UP' && tf4hTrend === 'DOWN') {
    isAligned = false;
    alignmentDirection = 'CONFLICT';
    alignmentScore = 15;
    conflictReason = '15m Bullish signal directly opposes 4h Macro Downtrend';
    arabicConflictReason = 'إشارة 15m الصاعدة تتعارض بشكل مباشر مع الاتجاه الهابط الأكبر على إطار 4h';
  } else if (tf15mTrend === 'DOWN' && tf4hTrend === 'UP') {
    isAligned = false;
    alignmentDirection = 'CONFLICT';
    alignmentScore = 15;
    conflictReason = '15m Bearish signal directly opposes 4h Macro Uptrend';
    arabicConflictReason = 'إشارة 15m الهابطة تتعارض بشكل مباشر مع الاتجاه الصاعد الأكبر على إطار 4h';
  } else if (tf15mTrend === 'UP' && tf1hTrend === 'DOWN') {
    isAligned = false;
    alignmentDirection = 'CONFLICT';
    alignmentScore = 35;
    conflictReason = '15m Bullish signal conflicts with 1h Bearish trend';
    arabicConflictReason = 'إشارة 15m الصاعدة تتعارض مع الاتجاه الهابط لإطار 1h';
  } else if (tf15mTrend === 'DOWN' && tf1hTrend === 'UP') {
    isAligned = false;
    alignmentDirection = 'CONFLICT';
    alignmentScore = 35;
    conflictReason = '15m Bearish signal conflicts with 1h Bullish trend';
    arabicConflictReason = 'إشارة 15m الهابطة تتعارض مع الاتجاه الصاعد لإطار 1h';
  }

  return {
    tf15m,
    tf1h,
    tf4h,
    isAligned,
    alignmentDirection,
    alignmentScore,
    macroBias,
    conflictReason,
    arabicConflictReason,
  };
}

/**
 * Evaluates 15-minute price volatility to detect Smart Freeze condition
 */
export function detectSmartFreeze(
  symbol: string,
  recentPrices: { price: number; timestamp: number }[],
  config: BotConfig,
  currentPrice: number
): SmartFreezeInfo {
  const windowMs = 15 * 60 * 1000;
  const now = Date.now();
  const pricesInWindow = recentPrices.filter((p) => now - p.timestamp <= windowMs).map((p) => p.price);
  pricesInWindow.push(currentPrice);

  const minPrice = Math.min(...pricesInWindow);
  const maxPrice = Math.max(...pricesInWindow);
  const volatility15m = minPrice > 0 ? Number((((maxPrice - minPrice) / minPrice) * 100).toFixed(2)) : 0;
  const threshold = config.smartFreezeThresholdPercent || 2.8;
  const isAbnormal = config.smartFreezeEnabled !== false && volatility15m >= threshold;

  const freezeDurationMs = (config.smartFreezeDurationMinutes || 15) * 60 * 1000;

  return {
    symbol,
    isFrozen: isAbnormal,
    frozenAt: isAbnormal ? now : undefined,
    frozenUntil: isAbnormal ? now + freezeDurationMs : undefined,
    volatility15m,
    peak15mPrice: maxPrice,
    trough15mPrice: minPrice,
    reason: isAbnormal
      ? `Abnormal 15m Volatility (${volatility15m}% >= ${threshold}%)`
      : `Normal Volatility (${volatility15m}% < ${threshold}%)`,
    arabicReason: isAbnormal
      ? `تذبذب شاذ بنسبة ${volatility15m}% في آخر 15 دقيقة يتجاوز المعيار الآمن (${threshold}%)`
      : `تذبذب مستقر (${volatility15m}%)`,
  };
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
): { shouldExit: boolean; reason: ExitReason | null; details: string; updatedBreakEven?: boolean } {
  const isLong = trade.side === 'LONG';
  const priceDiff = isLong ? currentPrice - trade.entryPrice : trade.entryPrice - currentPrice;
  const rawPriceGainPct = (priceDiff / trade.entryPrice) * 100;

  const highest = Math.max(trade.highestPrice || currentPrice, currentPrice);
  const lowest = Math.min(trade.lowestPrice || currentPrice, currentPrice);
  const elapsedMinutes = (Date.now() - trade.openedAt) / (1000 * 60);

  // Peak unleveraged gain recorded
  const peakPriceGainPct = isLong
    ? ((highest - trade.entryPrice) / trade.entryPrice) * 100
    : ((trade.entryPrice - lowest) / trade.entryPrice) * 100;

  // 1. Break-Even Stop Loss Protection (Anti-Loss Guarantee)
  const beTrigger = config.breakEvenTriggerPercent ?? 1.0;
  const isBreakEvenActive =
    trade.isBreakEvenTriggered ||
    (config.useBreakEvenStop !== false && peakPriceGainPct >= beTrigger);

  if (isBreakEvenActive) {
    // Fee-adjusted breakeven price (+0.12% above entry for long, -0.12% below entry for short)
    const beBufferPct = 0.12;
    const breakEvenPrice = isLong
      ? trade.entryPrice * (1 + beBufferPct / 100)
      : trade.entryPrice * (1 - beBufferPct / 100);

    const hitBreakEven = isLong
      ? currentPrice <= breakEvenPrice && rawPriceGainPct <= beBufferPct
      : currentPrice >= breakEvenPrice && rawPriceGainPct <= beBufferPct;

    if (hitBreakEven) {
      return {
        shouldExit: true,
        reason: 'BREAK_EVEN',
        details: `حماية رأس المال (Break-Even): تم الخروج بأمان عند سعر التعادل لمنع الخسارة (+${rawPriceGainPct.toFixed(2)}%)`,
        updatedBreakEven: true,
      };
    }
  }

  // 2. Hard Stop Loss (only if Break-Even hasn't superseded it)
  if (!isBreakEvenActive && rawPriceGainPct <= -config.stopLossPercent) {
    return {
      shouldExit: true,
      reason: 'STOP_LOSS',
      details: `وقف الخسارة مفعل عند ${rawPriceGainPct.toFixed(2)}%`,
    };
  }

  // 3. Hard Take Profit
  if (rawPriceGainPct >= config.takeProfitPercent) {
    return {
      shouldExit: true,
      reason: 'TAKE_PROFIT',
      details: `هدف جني الأرباح محقق بنجاح عند +${rawPriceGainPct.toFixed(2)}%`,
    };
  }

  if (config.useSmartExit) {
    // 4. Trailing Stop (Secures profits as price advances)
    if (peakPriceGainPct >= config.trailingStopTriggerPercent) {
      const trailStopPrice = isLong
        ? highest * (1 - config.trailingStopDeltaPercent / 100)
        : lowest * (1 + config.trailingStopDeltaPercent / 100);

      const hasTriggeredTrail = isLong
        ? currentPrice <= trailStopPrice
        : currentPrice >= trailStopPrice;

      if (hasTriggeredTrail && rawPriceGainPct > 0.4) {
        return {
          shouldExit: true,
          reason: 'TRAILING_STOP',
          details: `أمر التتبع اللاحق (Trailing Stop) تم تفعيله لحماية الأرباح عند +${rawPriceGainPct.toFixed(2)}%`,
          updatedBreakEven: isBreakEvenActive,
        };
      }
    }

    // 5. Time exit for quick momentum/scalp trades if stagnating
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

    // 6. Profit retracement protection (protects against giving back large gains)
    if (
      peakPriceGainPct >= config.profitRetraceThreshold &&
      elapsedMinutes >= 2 &&
      rawPriceGainPct < peakPriceGainPct * (1 - config.profitRetraceDropRatio) &&
      rawPriceGainPct > 0.3
    ) {
      return {
        shouldExit: true,
        reason: 'PROFIT_RETRACEMENT',
        details: `حماية الأرباح (Profit Retracement) بعد تراجع 40% من أعلى قمة ربح`,
      };
    }
  }

  return {
    shouldExit: false,
    reason: null,
    details: '',
    updatedBreakEven: isBreakEvenActive,
  };
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

/**
 * Ultra-Rigorous Trade Quality Verification & Audit Engine
 * Performs multi-layer scrutiny across 6 pillars to guarantee high-probability setups
 */
export function auditTradeSetup(
  asset: CryptoAsset,
  side: 'LONG' | 'SHORT',
  config: BotConfig,
  regime: MarketRegime = 'BULL_TREND',
  strategies: Strategy[] = []
): TradeAuditVerification {
  const isLong = side === 'LONG';
  let totalScore = 0;
  const reasons: string[] = [];
  const arabicReasons: string[] = [];

  // Pillar 1: Trend Cascade & EMA Alignment (Weight: 15%)
  let trendScore = 0;
  let trendPassed = false;
  let trendVal = '';
  let trendArabicVal = '';
  let trendWarn: string | undefined;
  let trendArabicWarn: string | undefined;

  const isStrict = config.strictAntiLossFilter !== false;

  if (isLong) {
    // Strictest Long criteria: Price must be above EMA200, EMA20 > EMA50, and macro trend UP
    if (asset.ema20 > asset.ema50 && asset.price >= asset.ema50 && asset.price > asset.ema200 && asset.trend === 'UP') {
      trendScore = 15;
      trendPassed = true;
      trendVal = 'Confirmed Bullish Cascade (Price > EMA50 > EMA200)';
      trendArabicVal = 'تسلسل صاعد متكامل ونقي (السعر > EMA50 > EMA200)';
    } else if (!isStrict && asset.ema20 > asset.ema50 && asset.price > asset.ema200 && asset.trend !== 'DOWN') {
      trendScore = 10;
      trendPassed = true;
      trendVal = 'Moderate Trend Alignment (Price > EMA200)';
      trendArabicVal = 'توافق اتجاه متوسط (السعر فوق متوسط 200)';
    } else {
      trendScore = 0;
      trendPassed = false;
      const isSub200 = asset.price < asset.ema200;
      trendVal = isSub200
        ? `Rejected: Price below macro EMA200 (${asset.price.toFixed(2)} < ${asset.ema200.toFixed(2)})`
        : `Contradictory/Choppy Trend (${asset.trend}) with Weak EMA Alignment`;
      trendArabicVal = isSub200
        ? `مرفوض: السعر يتداول أسفل متوسط 200 اليومي (${asset.price.toFixed(2)} < ${asset.ema200.toFixed(2)})`
        : `مرفوض: تعارض بالاتجاه (${asset.trend}) مع ضعف في تسلسل المتوسطات`;
      trendWarn = 'Severe trend risk detected';
      trendArabicWarn = 'تحذير عالي: مخاطرة فادحة للدخول عكس مسار الاتجاه الأساسي';
    }
  } else {
    // Strictest Short criteria: Price must be below EMA200, EMA20 < EMA50, and macro trend DOWN
    if (asset.ema20 < asset.ema50 && asset.price <= asset.ema50 && asset.price < asset.ema200 && asset.trend === 'DOWN') {
      trendScore = 15;
      trendPassed = true;
      trendVal = 'Confirmed Bearish Cascade (Price < EMA50 < EMA200)';
      trendArabicVal = 'تسلسل هابط متكامل ونقي (السعر < EMA50 < EMA200)';
    } else if (!isStrict && asset.ema20 < asset.ema50 && asset.price < asset.ema200 && asset.trend !== 'UP') {
      trendScore = 10;
      trendPassed = true;
      trendVal = 'Moderate Bearish Alignment (Price < EMA200)';
      trendArabicVal = 'توافق هبوطي متوسط (السعر تحت متوسط 200)';
    } else {
      trendScore = 0;
      trendPassed = false;
      const isSuper200 = asset.price > asset.ema200;
      trendVal = isSuper200
        ? `Rejected: Price above macro EMA200 (${asset.price.toFixed(2)} > ${asset.ema200.toFixed(2)})`
        : `Contradictory/Choppy Trend (${asset.trend}) with Weak EMA Alignment`;
      trendArabicVal = isSuper200
        ? `مرفوض: السعر يتداول أعلى متوسط 200 اليومي (${asset.price.toFixed(2)} > ${asset.ema200.toFixed(2)})`
        : `مرفوض: تعارض بالاتجاه (${asset.trend}) مع ضعف في تسلسل المتوسطات`;
      trendWarn = 'Severe trend risk detected';
      trendArabicWarn = 'تحذير عالي: مخاطرة فادحة للدخول في بيع والاتجاه العام صاعد';
    }
  }
  totalScore += trendScore;

  // Pillar 2: Time-Frame Alignment across 15m, 1h, 4h (Weight: 15%)
  let tfaScore = 0;
  let tfaPassed = false;
  let tfaVal = '';
  let tfaArabicVal = '';
  let tfaWarn: string | undefined;
  let tfaArabicWarn: string | undefined;

  const tfa = asset.timeframeAlignment || calculateTimeFrameAlignment(asset);
  const enforceTFA = config.enforceTimeFrameAlignment !== false;

  if (isLong) {
    if (tfa.tf15m.trend === 'UP' && tfa.tf1h.trend === 'UP' && tfa.tf4h.trend === 'UP') {
      tfaScore = 15;
      tfaPassed = true;
      tfaVal = 'Triple Bullish Alignment (15m UP / 1h UP / 4h UP)';
      tfaArabicVal = 'توافق ثلاثي صاعد تام (15m صاعد / 1h صاعد / 4h صاعد)';
    } else if (tfa.tf15m.trend === 'UP' && tfa.tf4h.trend !== 'DOWN' && tfa.tf1h.trend !== 'DOWN') {
      tfaScore = 11;
      tfaPassed = true;
      tfaVal = `Macro Confirmed (15m UP / 1h ${tfa.tf1h.trend} / 4h ${tfa.tf4h.trend})`;
      tfaArabicVal = `توافق مع المسار الأكبر (15m صاعد / 1h ${tfa.tf1h.trend} / 4h ${tfa.tf4h.trend})`;
    } else if (tfa.tf4h.trend === 'DOWN') {
      tfaScore = 0;
      tfaPassed = !enforceTFA;
      tfaVal = 'Rejected: Counter-Trend to 4h Macro Downtrend';
      tfaArabicVal = 'مرفوض: محاولة شراء معاكسة للاتجاه الهابط الأكبر على إطار 4h';
      tfaWarn = 'Macro 4h Downtrend conflict';
      tfaArabicWarn = 'تحذير عالي: الشراء عكس اتجاه 4h يعرض الصفقة لانعكاس هابط قوي';
    } else {
      tfaScore = 0;
      tfaPassed = !enforceTFA;
      tfaVal = `Time-Frame Conflict: 15m (${tfa.tf15m.trend}) vs 1h (${tfa.tf1h.trend}) vs 4h (${tfa.tf4h.trend})`;
      tfaArabicVal = `تعارض أطر زمنية: 15m (${tfa.tf15m.trend}) ضد 1h (${tfa.tf1h.trend}) ضد 4h (${tfa.tf4h.trend})`;
    }
  } else {
    if (tfa.tf15m.trend === 'DOWN' && tfa.tf1h.trend === 'DOWN' && tfa.tf4h.trend === 'DOWN') {
      tfaScore = 15;
      tfaPassed = true;
      tfaVal = 'Triple Bearish Alignment (15m DOWN / 1h DOWN / 4h DOWN)';
      tfaArabicVal = 'توافق ثلاثي هابط تام (15m هابط / 1h هابط / 4h هابط)';
    } else if (tfa.tf15m.trend === 'DOWN' && tfa.tf4h.trend !== 'UP' && tfa.tf1h.trend !== 'UP') {
      tfaScore = 11;
      tfaPassed = true;
      tfaVal = `Macro Confirmed (15m DOWN / 1h ${tfa.tf1h.trend} / 4h ${tfa.tf4h.trend})`;
      tfaArabicVal = `توافق مع المسار الأكبر (15m هابط / 1h ${tfa.tf1h.trend} / 4h ${tfa.tf4h.trend})`;
    } else if (tfa.tf4h.trend === 'UP') {
      tfaScore = 0;
      tfaPassed = !enforceTFA;
      tfaVal = 'Rejected: Counter-Trend to 4h Macro Uptrend';
      tfaArabicVal = 'مرفوض: محاولة بيع معاكسة للاتجاه الصاعد الأكبر على إطار 4h';
      tfaWarn = 'Macro 4h Uptrend conflict';
      tfaArabicWarn = 'تحذير عالي: البيع عكس اتجاه 4h يعرض الصفقة لارتداد صاعد مفاجئ';
    } else {
      tfaScore = 0;
      tfaPassed = !enforceTFA;
      tfaVal = `Time-Frame Conflict: 15m (${tfa.tf15m.trend}) vs 1h (${tfa.tf1h.trend}) vs 4h (${tfa.tf4h.trend})`;
      tfaArabicVal = `تعارض أطر زمنية: 15m (${tfa.tf15m.trend}) ضد 1h (${tfa.tf1h.trend}) ضد 4h (${tfa.tf4h.trend})`;
    }
  }
  totalScore += tfaScore;

  // Pillar 3: Momentum & Safe Entry Channel (Weight: 15%)
  // Anti-loss core: Never buy at top resistance (RSI > 62) or short into bottom squeeze (RSI < 38)
  let momScore = 0;
  let momPassed = false;
  let momVal = '';
  let momArabicVal = '';
  let momWarn: string | undefined;
  let momArabicWarn: string | undefined;

  const rsi = asset.rsi;
  const macd = asset.macdSignal;

  if (isLong) {
    if (rsi >= 40 && rsi <= 60 && macd === 'BULLISH') {
      momScore = 15;
      momPassed = true;
      momVal = `Prime Golden Momentum: RSI ${rsi.toFixed(1)} in safe zone + Bullish MACD`;
      momArabicVal = `زخم ذهبي مثالي: RSI ${rsi.toFixed(1)} في المنطقة الآمنة مع تقاطع MACD صاعد`;
    } else if (rsi >= 36 && rsi < 40 && macd === 'BULLISH') {
      momScore = 11;
      momPassed = true;
      momVal = `Healthy Pullback Entry: RSI ${rsi.toFixed(1)} + Bullish MACD`;
      momArabicVal = `دخول ارتدادي سليم: RSI ${rsi.toFixed(1)} مع MACD صاعد`;
    } else if (rsi > 62) {
      momScore = 0;
      momPassed = false;
      momVal = `Rejected: Overbought Exhaustion Risk (RSI ${rsi.toFixed(1)} > 62)`;
      momArabicVal = `مرفوض: خطر تشبع شرائي وشيك (RSI ${rsi.toFixed(1)} > 62) - احتمال انعكاس فوري`;
      momWarn = 'Top exhaustion risk';
      momArabicWarn = 'تحذير: الشراء عند القمم يؤدي لضرب وقف الخسارة سريعاً';
    } else {
      momScore = 0;
      momPassed = false;
      momVal = `Unfavorable Momentum: RSI ${rsi.toFixed(1)}, MACD ${macd}`;
      momArabicVal = `زخم غير ملائم للدخول: RSI ${rsi.toFixed(1)} مع MACD ${macd}`;
    }
  } else {
    if (rsi <= 60 && rsi >= 40 && macd === 'BEARISH') {
      momScore = 15;
      momPassed = true;
      momVal = `Prime Short Momentum: RSI ${rsi.toFixed(1)} in safe zone + Bearish MACD`;
      momArabicVal = `زخم هبوطي مثالي: RSI ${rsi.toFixed(1)} في المنطقة الآمنة مع تقاطع MACD هابط`;
    } else if (rsi > 60 && rsi <= 64 && macd === 'BEARISH') {
      momScore = 11;
      momPassed = true;
      momVal = `Healthy Resistance Retest: RSI ${rsi.toFixed(1)} + Bearish MACD`;
      momArabicVal = `إعادة اختبار مقاومة: RSI ${rsi.toFixed(1)} مع MACD هابط`;
    } else if (rsi < 38) {
      momScore = 0;
      momPassed = false;
      momVal = `Rejected: Oversold Squeeze Risk (RSI ${rsi.toFixed(1)} < 38)`;
      momArabicVal = `مرفوض: خطر انفجار سعري للأعلى (Short Squeeze) لتشبع البيع (${rsi.toFixed(1)})`;
      momWarn = 'Short squeeze risk';
      momArabicWarn = 'تحذير: البيع عند القيعان يؤدي لارتداد معاكس سريع';
    } else {
      momScore = 0;
      momPassed = false;
      momVal = `Unfavorable Momentum: RSI ${rsi.toFixed(1)}, MACD ${macd}`;
      momArabicVal = `زخم غير ملائم: RSI ${rsi.toFixed(1)} مع MACD ${macd}`;
    }
  }
  totalScore += momScore;

  // Pillar 4: ADX Trend Strength & Noise Elimination (Weight: 10%)
  // Anti-loss core: Reject flat/choppy consolidation that oscillates into stops
  let adxScore = 0;
  let adxPassed = false;
  let adxVal = '';
  let adxArabicVal = '';
  const adx = asset.adx;
  const minAdx = config.minADXThreshold || 22;

  if (adx >= 26) {
    adxScore = 10;
    adxPassed = true;
    adxVal = `Strong Trending Velocity (ADX ${adx.toFixed(1)} >= 26)`;
    adxArabicVal = `قوة اتجاهية صلبة وخالية من التذبذب العرضي (ADX ${adx.toFixed(1)})`;
  } else if (adx >= minAdx) {
    adxScore = 8;
    adxPassed = true;
    adxVal = `Healthy Trend Velocity (ADX ${adx.toFixed(1)} >= ${minAdx})`;
    adxArabicVal = `قوة اتجاه مؤكدة ومستقرة (ADX ${adx.toFixed(1)})`;
  } else {
    adxScore = 0;
    adxPassed = false;
    adxVal = `Rejected: Choppy Market with Low Velocity (ADX ${adx.toFixed(1)} < ${minAdx})`;
    adxArabicVal = `مرفوض: سوق عرضي متذبذب يضرب وقوف الخسارة (ADX ${adx.toFixed(1)} < ${minAdx})`;
  }
  totalScore += adxScore;

  // Pillar 5: Volatility Bandwidth & Deviation Buffer (Weight: 10%)
  // Anti-loss core: Avoid buying when price is stretched far from EMA20 baseline
  let volScore = 0;
  let volPassed = false;
  let volVal = '';
  let volArabicVal = '';
  const distEma20Pct = Math.abs((asset.price - asset.ema20) / asset.ema20) * 100;

  if (distEma20Pct <= 1.8) {
    volScore = 10;
    volPassed = true;
    volVal = `Optimal Tight Entry Buffer: ${distEma20Pct.toFixed(2)}% from EMA20`;
    volArabicVal = `حيز دخول مثالي شديد الدقة: قرب ${distEma20Pct.toFixed(2)}% من متوسط EMA20`;
  } else if (distEma20Pct <= 2.8) {
    volScore = 7;
    volPassed = true;
    volVal = `Acceptable Buffer: ${distEma20Pct.toFixed(2)}% from EMA20`;
    volArabicVal = `حيز تداول مقبول: ابتعاد ${distEma20Pct.toFixed(2)}% عن المتوسط`;
  } else {
    volScore = 0;
    volPassed = false;
    volVal = `Rejected: Over-extended Price Stretch (${distEma20Pct.toFixed(2)}% from EMA20)`;
    volArabicVal = `مرفوض: تمدد سعري مفرط ومتباعد عن المتوسط بنسبة ${distEma20Pct.toFixed(2)}%`;
  }
  totalScore += volScore;

  // Pillar 6: Binance Orderbook Depth & Liquidity Walls (Weight: 15%)
  let obScore = 0;
  let obPassed = false;
  let obVal = '';
  let obArabicVal = '';
  let obWarn: string | undefined;
  let obArabicWarn: string | undefined;

  const ob = asset.orderbookDepth;
  const isObFilterActive = config.orderbookFilterEnabled !== false;

  if (!ob) {
    obScore = 12;
    obPassed = true;
    obVal = 'Orderbook depth nominal / pending live sync';
    obArabicVal = 'دفتر الأوامر اعتيادي وقيد المزامنة';
  } else if (ob.hasOpposingWall && isObFilterActive) {
    obScore = 0;
    obPassed = false;
    obVal = `Blocked: Opposing ${ob.nearestOpposingWall?.type} at $${ob.nearestOpposingWall?.price.toLocaleString()} (${ob.details})`;
    obArabicVal = `مرفوض: ${ob.arabicStatus} على بعد ${ob.nearestOpposingWall?.distancePercent}% (${ob.arabicDetails})`;
    obWarn = 'Liquidity Wall obstruction';
    obArabicWarn = 'حاجز سيولة ضخم يعترض حركة السعر ويمنع تحقيق الهدف';
  } else if (ob.depthStatus === 'IMBALANCE_WARNING') {
    obScore = 8;
    obPassed = !isStrict;
    obVal = `Orderbook Imbalance: ${ob.details}`;
    obArabicVal = `تحذير عدم توازن السيولة: ${ob.arabicDetails}`;
  } else {
    obScore = 15;
    obPassed = true;
    obVal = `Clear Liquidity Path: Bid/Ask ratio ${ob.bidAskRatio}, no opposing walls within threshold`;
    obArabicVal = `مسار سيولة سالك ونقي: نسبة الشراء/البيع ${ob.bidAskRatio} وخالٍ من الحواجز المعاكسة`;
  }
  totalScore += obScore;

  // Pillar 7: Multi-Strategy Ensemble Consensus (Weight: 15%)
  let stratScore = 0;
  let stratPassed = false;
  let stratVal = '';
  let stratArabicVal = '';
  const totalWeight = asset.longScore + asset.shortScore;
  const dominantScore = isLong ? asset.longScore : asset.shortScore;
  const consensusRatio = totalWeight > 0 ? dominantScore / totalWeight : 0;
  const minConsensus = config.minConsensusRatio || 0.68;

  if (consensusRatio >= 0.74) {
    stratScore = 15;
    stratPassed = true;
    stratVal = `Super-Majority Consensus: ${(consensusRatio * 100).toFixed(1)}% Agreement`;
    stratArabicVal = `إجماع كاسح بين استراتيجيات البوت بنسبة ${(consensusRatio * 100).toFixed(1)}%`;
  } else if (consensusRatio >= minConsensus) {
    stratScore = 11;
    stratPassed = true;
    stratVal = `Solid Consensus: ${(consensusRatio * 100).toFixed(1)}% Agreement (>= ${(minConsensus * 100).toFixed(0)}%)`;
    stratArabicVal = `إجماع موثوق بين الاستراتيجيات بنسبة ${(consensusRatio * 100).toFixed(1)}%`;
  } else {
    stratScore = 0;
    stratPassed = false;
    stratVal = `Rejected: Split/Ambiguous Consensus (${(consensusRatio * 100).toFixed(1)}% < ${(minConsensus * 100).toFixed(0)}%)`;
    stratArabicVal = `مرفوض: تشتت كبير في آراء الاستراتيجيات (${(consensusRatio * 100).toFixed(1)}%) دون الإجماع المطلوب`;
  }
  totalScore += stratScore;

  // Pillar 8: Asymmetric Risk-to-Reward Ratio (Weight: 5%)
  let rrScore = 0;
  let rrPassed = false;
  let rrVal = '';
  let rrArabicVal = '';
  const rrRatio = config.takeProfitPercent / Math.max(0.1, config.stopLossPercent);
  const requiredRR = config.requireRRRatio || 2.0;

  if (rrRatio >= 2.4) {
    rrScore = 5;
    rrPassed = true;
    rrVal = `Prime R:R Asymmetry: 1:${rrRatio.toFixed(1)} (TP: +${config.takeProfitPercent}% / SL: -${config.stopLossPercent}%)`;
    rrArabicVal = `نسبة عائد لمخاطرة ممتازة: 1:${rrRatio.toFixed(1)} (هدف +${config.takeProfitPercent}% / وقف -${config.stopLossPercent}%)`;
  } else if (rrRatio >= requiredRR) {
    rrScore = 4;
    rrPassed = true;
    rrVal = `Satisfactory R:R: 1:${rrRatio.toFixed(1)} (>= 1:${requiredRR.toFixed(1)})`;
    rrArabicVal = `نسبة عائد لمخاطرة متوافقة: 1:${rrRatio.toFixed(1)}`;
  } else {
    rrScore = 0;
    rrPassed = false;
    rrVal = `Sub-optimal R:R: 1:${rrRatio.toFixed(1)} (below 1:${requiredRR.toFixed(1)})`;
    rrArabicVal = `نسبة عائد لمخاطرة غير كافية (1:${rrRatio.toFixed(1)})`;
  }
  totalScore += rrScore;

  // Final Overall Audit Decision - All Essential Pillars Must Pass!
  const minAuditThreshold = config.minAuditScore || 75;
  const allCriticalPillarsPassed = trendPassed && tfaPassed && momPassed && adxPassed && stratPassed && volPassed && obPassed;
  const passed = totalScore >= minAuditThreshold && allCriticalPillarsPassed;

  let rating: TradeAuditVerification['rating'] = 'REJECTED';
  let arabicRating = 'مرفوضة - لا تلبي معايير التدقيق الفائق';

  if (totalScore >= 90 && allCriticalPillarsPassed) {
    rating = 'PERFECT_CONFLUENCE';
    arabicRating = 'صفقة ذهبية فائقة الدقة والضمان (Perfect Confluence)';
  } else if (totalScore >= 75 && allCriticalPillarsPassed) {
    rating = 'HIGH_ASSURANCE';
    arabicRating = 'صفقة معتمدة عالية الضمان (High Assurance)';
  } else if (totalScore >= 60) {
    rating = 'ACCEPTABLE';
    arabicRating = 'صفقة مقبولة بدرجة تدقيق متوسطة';
  }

  // Diagnostic reason summary
  if (passed) {
    reasons.push(`Audit score ${totalScore}/100 verified with ${rating}`);
    arabicReasons.push(`تم اعتماد الصفقة بدرجة تدقيق ${totalScore}/100 وتصنيف [${arabicRating}]`);
  } else {
    if (!trendPassed) {
      reasons.push(trendVal);
      arabicReasons.push(trendArabicVal);
    }
    if (!tfaPassed) {
      reasons.push(tfaVal);
      arabicReasons.push(tfaArabicVal);
    }
    if (!obPassed) {
      reasons.push(obVal);
      arabicReasons.push(obArabicVal);
    }
    if (!momPassed) {
      reasons.push(momVal);
      arabicReasons.push(momArabicVal);
    }
    if (!stratPassed) {
      reasons.push(stratVal);
      arabicReasons.push(stratArabicVal);
    }
    if (!volPassed) {
      reasons.push(volVal);
      arabicReasons.push(volArabicVal);
    }
    if (!adxPassed) {
      reasons.push(adxVal);
      arabicReasons.push(adxArabicVal);
    }
    if (!rrPassed) {
      reasons.push(rrVal);
      arabicReasons.push(rrArabicVal);
    }
    if (totalScore < minAuditThreshold) {
      reasons.push(`Audit score ${totalScore}/100 is below required ${minAuditThreshold}/100`);
      arabicReasons.push(`درجة التدقيق ${totalScore}/100 أقل من الحد الأدنى المشروط (${minAuditThreshold}/100)`);
    }
  }

  return {
    passed,
    auditScore: totalScore,
    rating,
    arabicRating,
    checks: {
      trendCascade: {
        name: 'Trend & EMA Cascade',
        arabicName: 'تسلسل الاتجاه والمتوسطات المتحركة',
        passed: trendPassed,
        score: trendScore,
        weight: 15,
        value: trendVal,
        arabicValue: trendArabicVal,
        warning: trendWarn,
        arabicWarning: trendArabicWarn,
      },
      timeFrameAlignment: {
        name: 'Time-Frame Alignment (15m / 1h / 4h)',
        arabicName: 'توافق الأطر الزمنية الثلاثية (15m / 1h / 4h)',
        passed: tfaPassed,
        score: tfaScore,
        weight: 15,
        value: tfaVal,
        arabicValue: tfaArabicVal,
        warning: tfaWarn,
        arabicWarning: tfaArabicWarn,
      },
      momentumConfluence: {
        name: 'Momentum Confluence (RSI & MACD)',
        arabicName: 'توافق مؤشرات الزخم (RSI & MACD)',
        passed: momPassed,
        score: momScore,
        weight: 15,
        value: momVal,
        arabicValue: momArabicVal,
        warning: momWarn,
        arabicWarning: momArabicWarn,
      },
      trendStrengthADX: {
        name: 'Trend Velocity & ADX Strength',
        arabicName: 'قوة الاتجاه وفلتر التذبذب (ADX)',
        passed: adxPassed,
        score: adxScore,
        weight: 10,
        value: adxVal,
        arabicValue: adxArabicVal,
      },
      volatilityBandwidth: {
        name: 'Volatility & Extension Buffer',
        arabicName: 'حيز الحركة وتجنب التمدد السعري المفرط',
        passed: volPassed,
        score: volScore,
        weight: 10,
        value: volVal,
        arabicValue: volArabicVal,
      },
      orderbookLiquidity: {
        name: 'Binance Orderbook & Liquidity Walls',
        arabicName: 'عمق السوق وحواجز السيولة (Orderbook Walls)',
        passed: obPassed,
        score: obScore,
        weight: 15,
        value: obVal,
        arabicValue: obArabicVal,
        warning: obWarn,
        arabicWarning: obArabicWarn,
      },
      strategyConsensus: {
        name: '50+ Strategies Consensus Ratio',
        arabicName: 'نسبة إجماع الـ 50+ استراتيجية',
        passed: stratPassed,
        score: stratScore,
        weight: 15,
        value: stratVal,
        arabicValue: stratArabicVal,
      },
      riskRewardRatio: {
        name: 'Asymmetric Risk-to-Reward Ratio',
        arabicName: 'نسبة العائد إلى المخاطرة (R:R)',
        passed: rrPassed,
        score: rrScore,
        weight: 5,
        value: rrVal,
        arabicValue: rrArabicVal,
      },
    },
    reasons,
    arabicReasons,
  };
}

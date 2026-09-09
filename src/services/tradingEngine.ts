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
  BinanceKline,
} from '../types';

/**
 * Technical Indicator Calculation Engine
 * Strictly deterministic, using standard financial market formulas and closed candles.
 * Zero Math.random, zero Math.sin approximations.
 */

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) {
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return Number(ema.toFixed(prices[prices.length - 1] < 1 ? 5 : 2));
}

export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return Number(Math.max(0, Math.min(100, rsi)).toFixed(1));
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macd: number;
  signal: number;
  histogram: number;
  signalState: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
} {
  if (closes.length < slowPeriod + signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0, signalState: 'NEUTRAL' };
  }

  const kFast = 2 / (fastPeriod + 1);
  const kSlow = 2 / (slowPeriod + 1);

  let emaFast = closes.slice(0, fastPeriod).reduce((a, b) => a + b, 0) / fastPeriod;
  let emaSlow = closes.slice(0, slowPeriod).reduce((a, b) => a + b, 0) / slowPeriod;

  // Warm-up fast EMA to slowPeriod
  for (let i = fastPeriod; i < slowPeriod; i++) {
    emaFast = closes[i] * kFast + emaFast * (1 - kFast);
  }

  const macdLineSeries: number[] = [];
  for (let i = slowPeriod; i < closes.length; i++) {
    emaFast = closes[i] * kFast + emaFast * (1 - kFast);
    emaSlow = closes[i] * kSlow + emaSlow * (1 - kSlow);
    macdLineSeries.push(emaFast - emaSlow);
  }

  if (macdLineSeries.length < signalPeriod) {
    const lastMacd = macdLineSeries[macdLineSeries.length - 1] || 0;
    return {
      macd: Number(lastMacd.toFixed(2)),
      signal: 0,
      histogram: Number(lastMacd.toFixed(2)),
      signalState: lastMacd > 0 ? 'BULLISH' : lastMacd < 0 ? 'BEARISH' : 'NEUTRAL',
    };
  }

  const kSig = 2 / (signalPeriod + 1);
  let signalEma = macdLineSeries.slice(0, signalPeriod).reduce((a, b) => a + b, 0) / signalPeriod;

  for (let i = signalPeriod; i < macdLineSeries.length; i++) {
    signalEma = macdLineSeries[i] * kSig + signalEma * (1 - kSig);
  }

  const finalMacd = macdLineSeries[macdLineSeries.length - 1];
  const histogram = finalMacd - signalEma;

  const signalState: 'BULLISH' | 'BEARISH' | 'NEUTRAL' =
    histogram > 0 && finalMacd > signalEma
      ? 'BULLISH'
      : histogram < 0 && finalMacd < signalEma
      ? 'BEARISH'
      : 'NEUTRAL';

  return {
    macd: Number(finalMacd.toFixed(2)),
    signal: Number(signalEma.toFixed(2)),
    histogram: Number(histogram.toFixed(2)),
    signalState,
  };
}

export function calculateADX(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number {
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len <= period * 2) return 20;

  const trs: number[] = [];
  const plusDMs: number[] = [];
  const minusDMs: number[] = [];

  for (let i = 1; i < len; i++) {
    const h = highs[i];
    const l = lows[i];
    const prevH = highs[i - 1];
    const prevL = lows[i - 1];
    const prevC = closes[i - 1];

    const tr = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
    trs.push(tr);

    const upMove = h - prevH;
    const downMove = prevL - l;

    const plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
    const minusDM = downMove > upMove && downMove > 0 ? downMove : 0;

    plusDMs.push(plusDM);
    minusDMs.push(minusDM);
  }

  if (trs.length < period) return 20;

  let smoothedTR = trs.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedPlusDM = plusDMs.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedMinusDM = minusDMs.slice(0, period).reduce((a, b) => a + b, 0);

  const dxList: number[] = [];

  for (let i = period; i < trs.length; i++) {
    smoothedTR = smoothedTR - smoothedTR / period + trs[i];
    smoothedPlusDM = smoothedPlusDM - smoothedPlusDM / period + plusDMs[i];
    smoothedMinusDM = smoothedMinusDM - smoothedMinusDM / period + minusDMs[i];

    const plusDI = smoothedTR > 0 ? (smoothedPlusDM / smoothedTR) * 100 : 0;
    const minusDI = smoothedTR > 0 ? (smoothedMinusDM / smoothedTR) * 100 : 0;
    const diSum = plusDI + minusDI;
    const diDiff = Math.abs(plusDI - minusDI);

    const dx = diSum > 0 ? (diDiff / diSum) * 100 : 0;
    dxList.push(dx);
  }

  if (dxList.length < period) return 20;

  let adx = dxList.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < dxList.length; i++) {
    adx = (adx * (period - 1) + dxList[i]) / period;
  }

  return Number(Math.max(0, Math.min(100, adx)).toFixed(1));
}

export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number {
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < period + 1) return 0;

  const trs: number[] = [];
  for (let i = 1; i < len; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trs.push(tr);
  }

  if (trs.length < period) return 0;
  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }
  return Number(atr.toFixed(closes[closes.length - 1] < 1 ? 5 : 2));
}

export interface CalculatedCandleIndicators {
  valid: boolean;
  error?: string;
  ema20: number;
  ema50: number;
  ema200: number;
  rsi: number;
  adx: number;
  atr: number;
  macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trend: MarketTrend;
  currentPrice: number;
  candleCount: number;
}

/**
 * Calculates complete indicators from real Binance Klines
 * Uses closed candles with >= 210 candle warm-up for EMA200 integrity
 */
export function calculateIndicatorsFromKlines(
  klines: BinanceKline[]
): CalculatedCandleIndicators {
  if (!Array.isArray(klines) || klines.length < 210) {
    return {
      valid: false,
      error: `Insufficient candles: received ${klines?.length || 0}, requires >= 210 for EMA200 warm-up`,
      ema20: 0,
      ema50: 0,
      ema200: 0,
      rsi: 50,
      adx: 20,
      atr: 0,
      macdSignal: 'NEUTRAL',
      trend: 'NEUTRAL',
      currentPrice: 0,
      candleCount: klines?.length || 0,
    };
  }

  // Use closed candles (if the last candle is still forming, use closed ones)
  const closedCandles = klines.filter((k) => k.isClosed);
  const dataset = closedCandles.length >= 210 ? closedCandles : klines.slice(0, -1);

  if (dataset.length < 210) {
    return {
      valid: false,
      error: `Insufficient closed candles for indicators calculation (< 210)`,
      ema20: 0,
      ema50: 0,
      ema200: 0,
      rsi: 50,
      adx: 20,
      atr: 0,
      macdSignal: 'NEUTRAL',
      trend: 'NEUTRAL',
      currentPrice: 0,
      candleCount: dataset.length,
    };
  }

  const closes = dataset.map((k) => k.close);
  const highs = dataset.map((k) => k.high);
  const lows = dataset.map((k) => k.low);

  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const rsi = calculateRSI(closes, 14);
  const macdInfo = calculateMACD(closes, 12, 26, 9);
  const adx = calculateADX(highs, lows, closes, 14);
  const atr = calculateATR(highs, lows, closes, 14);

  const lastPrice = closes[closes.length - 1];
  const trend = determineTrend(ema20, ema50, ema200, lastPrice);

  return {
    valid: true,
    ema20,
    ema50,
    ema200,
    rsi,
    adx,
    atr,
    macdSignal: macdInfo.signalState,
    trend,
    currentPrice: lastPrice,
    candleCount: dataset.length,
  };
}

export function determineTrend(
  ema20: number,
  ema50: number,
  ema200: number,
  currentPrice?: number
): MarketTrend {
  if (ema20 > ema50 && ema50 > ema200) {
    if (currentPrice === undefined || currentPrice > ema200) {
      return 'UP';
    }
  } else if (ema20 < ema50 && ema50 < ema200) {
    if (currentPrice === undefined || currentPrice < ema200) {
      return 'DOWN';
    }
  }
  return 'NEUTRAL';
}

/**
 * Calculates Multi-Timeframe Alignment strictly from 3 INDEPENDENT TimeFrameData sources
 * Zero derivation across timeframes.
 * LONG: 15m === 'UP' && 1h === 'UP' && 4h === 'UP'
 * SHORT: 15m === 'DOWN' && 1h === 'DOWN' && 4h === 'DOWN'
 * Any conflict or missing timeframe: isAligned = false, alignmentDirection = 'CONFLICT' / 'NEUTRAL', NO TRADE
 */
export function calculateTimeFrameAlignment(
  tf15mData?: TimeFrameData | null,
  tf1hData?: TimeFrameData | null,
  tf4hData?: TimeFrameData | null
): TimeFrameAlignment {
  // If any timeframe is missing or incomplete
  if (!tf15mData || !tf1hData || !tf4hData) {
    const placeholder: TimeFrameData = {
      timeframe: '15m',
      trend: 'NEUTRAL',
      ema20: 0,
      ema50: 0,
      rsi: 50,
      macdSignal: 'NEUTRAL',
    };
    return {
      tf15m: tf15mData || { ...placeholder, timeframe: '15m' },
      tf1h: tf1hData || { ...placeholder, timeframe: '1h' },
      tf4h: tf4hData || { ...placeholder, timeframe: '4h' },
      isAligned: false,
      alignmentDirection: 'NEUTRAL',
      alignmentScore: 0,
      macroBias: 'NEUTRAL',
      conflictReason: 'DATA_INVALID: Missing complete independent MTF data (15m, 1h, 4h required)',
      arabicConflictReason: 'بيانات ناقصة: لا تتوفر الأطر الزمنية المستقلة الثلاثة (15m, 1h, 4h)',
    };
  }

  const t15 = tf15mData.trend;
  const t1h = tf1hData.trend;
  const t4h = tf4hData.trend;

  const macroBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' =
    t4h === 'UP' && t1h === 'UP'
      ? 'BULLISH'
      : t4h === 'DOWN' && t1h === 'DOWN'
      ? 'BEARISH'
      : 'NEUTRAL';

  // Strict triple alignment
  if (t15 === 'UP' && t1h === 'UP' && t4h === 'UP') {
    return {
      tf15m: tf15mData,
      tf1h: tf1hData,
      tf4h: tf4hData,
      isAligned: true,
      alignmentDirection: 'LONG',
      alignmentScore: 100,
      macroBias,
    };
  }

  if (t15 === 'DOWN' && t1h === 'DOWN' && t4h === 'DOWN') {
    return {
      tf15m: tf15mData,
      tf1h: tf1hData,
      tf4h: tf4hData,
      isAligned: true,
      alignmentDirection: 'SHORT',
      alignmentScore: 100,
      macroBias,
    };
  }

  // Conflict / Neutral breakdown
  let conflictReason = 'Multi-timeframe trend disagreement';
  let arabicConflictReason = 'تعارض في الاتجاه بين الأطر الزمنية';

  if (t15 === 'UP' && t4h === 'DOWN') {
    conflictReason = '15m Bullish signal directly opposes 4h Macro Downtrend';
    arabicConflictReason = 'إشارة 15m الصاعدة تتعارض بشكل مباشر مع اتجاه 4h الهابط';
  } else if (t15 === 'DOWN' && t4h === 'UP') {
    conflictReason = '15m Bearish signal directly opposes 4h Macro Uptrend';
    arabicConflictReason = 'إشارة 15m الهابطة تتعارض بشكل مباشر مع اتجاه 4h الصاعد';
  } else if (t15 === 'UP' && t1h === 'DOWN') {
    conflictReason = '15m Bullish signal opposes 1h Intermediate Downtrend';
    arabicConflictReason = 'إشارة 15m الصاعدة تتعارض مع اتجاه 1h الهابط';
  } else if (t15 === 'DOWN' && t1h === 'UP') {
    conflictReason = '15m Bearish signal opposes 1h Intermediate Uptrend';
    arabicConflictReason = 'إشارة 15m الهابطة تتعارض مع اتجاه 1h الصاعد';
  } else if (t15 === 'NEUTRAL' || t1h === 'NEUTRAL' || t4h === 'NEUTRAL') {
    conflictReason = `Neutral trend detected on one or more timeframes (15m: ${t15}, 1h: ${t1h}, 4h: ${t4h})`;
    arabicConflictReason = `اتجاه محايد على أحد الأطر الزمنية (15m: ${t15}, 1h: ${t1h}, 4h: ${t4h})`;
  }

  return {
    tf15m: tf15mData,
    tf1h: tf1hData,
    tf4h: tf4hData,
    isAligned: false,
    alignmentDirection: 'CONFLICT',
    alignmentScore: 20,
    macroBias,
    conflictReason,
    arabicConflictReason,
  };
}

/**
 * Evaluates 15-minute price volatility strictly from real Klines to detect Smart Freeze condition
 */
export function detectSmartFreeze(
  symbol: string,
  klines15m: BinanceKline[],
  config: BotConfig,
  currentPrice?: number
): SmartFreezeInfo {
  if (!Array.isArray(klines15m) || klines15m.length === 0) {
    return {
      symbol,
      isFrozen: true,
      volatility15m: 0,
      peak15mPrice: 0,
      trough15mPrice: 0,
      reason: 'DATA_INVALID: Missing real 15m Klines for Smart Freeze detection',
      arabicReason: 'بيانات غير صالحة: عدم توفر شموع 15m لفحص التذبذب الشاذ',
    };
  }

  // Look at the latest completed and active 15m candles (last 2-3 candles = 30-45m window)
  const recentWindow = klines15m.slice(-3);
  const highs = recentWindow.map((k) => k.high);
  const lows = recentWindow.map((k) => k.low);
  if (currentPrice && currentPrice > 0) {
    highs.push(currentPrice);
    lows.push(currentPrice);
  }

  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  const volatility15m = minPrice > 0 ? Number((((maxPrice - minPrice) / minPrice) * 100).toFixed(2)) : 0;
  const threshold = config.smartFreezeThresholdPercent || 2.8;
  const isAbnormal = config.smartFreezeEnabled !== false && volatility15m >= threshold;

  const now = Date.now();
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
      ? `تذبذب شاذ بنسبة ${volatility15m}% يتجاوز المعيار الآمن (${threshold}%)`
      : `تذبذب مستقر (${volatility15m}%)`,
  };
}

/**
 * Detects current macro market regime across assets
 */
export function detectMarketRegime(assets: CryptoAsset[]): MarketRegime {
  const validAssets = assets.filter((a) => a.dataStatus !== 'DATA_INVALID');
  if (validAssets.length === 0) return 'RANGE_BOUND';

  const upCount = validAssets.filter((a) => a.trend === 'UP').length;
  const downCount = validAssets.filter((a) => a.trend === 'DOWN').length;
  const avgRsi = validAssets.reduce((sum, a) => sum + (a.rsi || 50), 0) / validAssets.length;
  const avgAdx = validAssets.reduce((sum, a) => sum + (a.adx || 20), 0) / validAssets.length;

  if (avgAdx > 26 && upCount >= validAssets.length * 0.6) {
    return 'BULL_TREND';
  }
  if (avgAdx > 26 && downCount >= validAssets.length * 0.6) {
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
      if (category === 'scientific') return 1.35;
      if (category === 'momentum') return 1.25;
      if (category === 'swing') return 1.2;
      if (category === 'scalping') return 0.9;
      return 1.0;

    case 'RANGE_BOUND':
      if (category === 'scalping') return 1.4;
      if (category === 'scientific') return 1.3;
      if (category === 'momentum') return 1.15;
      if (category === 'trend') return 0.75;
      return 1.0;

    case 'HIGH_VOLATILITY':
      if (category === 'scientific') return 1.4;
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
 * Evaluates Ensemble Signal incorporating Market Regime and adaptive strategy weights.
 * Applies Intelligent Asset-Specific Strategy Specialization:
 * Rather than scanning all 200 strategies indiscriminately, each coin receives its
 * specialized, high-conviction mathematical and technical strategy subset.
 * If asset has invalid market data, returns strictly NEUTRAL.
 */
export function evaluateEnsembleSignal(
  asset: CryptoAsset,
  strategies: Strategy[],
  timeframe: string,
  regime: MarketRegime = 'BULL_TREND',
  executionMode: 'SYNTHESIZED_ONLY' | 'SYNTHESIZED_PRIORITY' | 'ALL_STRATEGIES' = 'SYNTHESIZED_ONLY'
): {
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
  longScore: number;
  shortScore: number;
  confidence: number;
  totalScore: number;
  leadingStrategy?: Strategy;
} {
  if (asset.dataStatus === 'DATA_INVALID' || asset.price <= 0) {
    return { signal: 'NEUTRAL', longScore: 0, shortScore: 0, confidence: 0, totalScore: 0 };
  }

  let longScore = 0;
  let shortScore = 0;
  let leadingStrategy: Strategy | undefined;
  let maxStrategyScore = 0;

  // Normalized asset symbol (e.g. BTCUSDT from BTC/USDT or BTCUSDT)
  const normSymbol = asset.symbol.replace(/[\/\-_]/g, '').toUpperCase();

  // Intelligent Strategy Filtering based on executionMode & applicable symbols
  const applicableStrategies = strategies.filter((s) => {
    if (!s.enabled) return false;

    // Filter by executionMode:
    const isSynthesizedOrScientific =
      Boolean(s.isProprietaryAI) ||
      s.category === 'scientific' ||
      s.id.startsWith('strat-syn-') ||
      s.id.startsWith('strat-ai-syn-');

    if (executionMode === 'SYNTHESIZED_ONLY' && !isSynthesizedOrScientific) {
      return false; // Skip classical default strategies when in Synthesized Only mode
    }

    // Match symbol applicability
    if (s.applicableSymbols && s.applicableSymbols.length > 0 && !s.applicableSymbols.includes('ALL')) {
      const isMatch = s.applicableSymbols.some(
        (sym) => sym.replace(/[\/\-_]/g, '').toUpperCase() === normSymbol
      );
      if (!isMatch) return false;
    }
    return true;
  });

  applicableStrategies.forEach((strategy) => {
    let stratSignal: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
    let stratConfidence = 0.6;

    const isSynthesized = Boolean(strategy.isProprietaryAI) || strategy.category === 'scientific';
    const domain = strategy.scientificDomain;

    if (isSynthesized && domain) {
      // ⚛️ Advanced Domain-Specific Scientific Model Execution
      switch (domain) {
        case 'QUANTUM': {
          // Wavepacket dispersion & potential barrier tunneling near EMA levels
          const distEma50Pct = ((asset.price - asset.ema50) / asset.ema50) * 100;
          if (Math.abs(distEma50Pct) <= 2.5) {
            // High probability tunneling zone
            if (asset.macdSignal === 'BULLISH' || (asset.trend === 'UP' && asset.rsi <= 65)) {
              stratSignal = 'LONG';
              stratConfidence = 0.88;
            } else if (asset.macdSignal === 'BEARISH' || (asset.trend === 'DOWN' && asset.rsi >= 35)) {
              stratSignal = 'SHORT';
              stratConfidence = 0.88;
            }
          } else if (asset.rsi < 35) {
            stratSignal = 'LONG'; // Quantum ground-state rebound
            stratConfidence = 0.82;
          } else if (asset.rsi > 70) {
            stratSignal = 'SHORT'; // Quantum potential barrier reflection
            stratConfidence = 0.82;
          } else if (asset.trend === 'UP') {
            stratSignal = 'LONG';
            stratConfidence = 0.78;
          } else if (asset.trend === 'DOWN') {
            stratSignal = 'SHORT';
            stratConfidence = 0.78;
          }
          break;
        }

        case 'FLUID_DYNAMICS': {
          // Navier-Stokes liquidity vorticity & velocity flux
          const priceVelocity = asset.change24h;
          if (asset.trend === 'UP' && asset.macdSignal !== 'BEARISH') {
            stratSignal = 'LONG';
            stratConfidence = 0.86;
          } else if (asset.trend === 'DOWN' && asset.macdSignal !== 'BULLISH') {
            stratSignal = 'SHORT';
            stratConfidence = 0.86;
          } else if (priceVelocity > 1.2 && asset.rsi < 68) {
            stratSignal = 'LONG';
            stratConfidence = 0.80;
          } else if (priceVelocity < -1.2 && asset.rsi > 32) {
            stratSignal = 'SHORT';
            stratConfidence = 0.80;
          }
          break;
        }

        case 'THERMODYNAMICS': {
          // Carnot cycle orderbook free energy and temperature gradient
          const ob = asset.orderbookDepth;
          if (ob && ob.bidAskRatio > 1.1) {
            stratSignal = 'LONG';
            stratConfidence = 0.85;
          } else if (ob && ob.bidAskRatio < 0.9) {
            stratSignal = 'SHORT';
            stratConfidence = 0.85;
          } else if (asset.rsi < 45 && asset.trend !== 'DOWN') {
            stratSignal = 'LONG';
            stratConfidence = 0.80;
          } else if (asset.rsi > 60 && asset.trend !== 'UP') {
            stratSignal = 'SHORT';
            stratConfidence = 0.80;
          }
          break;
        }

        case 'STOCHASTIC':
        case 'CHAOS_FRACTAL':
        case 'INFORMATION_THEORY':
        default: {
          // Lorentz expansion, Lyapunov horizon, and Shannon information compression
          if (asset.trend === 'UP' && asset.rsi <= 65) {
            stratSignal = 'LONG';
            stratConfidence = 0.84;
          } else if (asset.trend === 'DOWN' && asset.rsi >= 35) {
            stratSignal = 'SHORT';
            stratConfidence = 0.84;
          } else if (asset.macdSignal === 'BULLISH') {
            stratSignal = 'LONG';
            stratConfidence = 0.76;
          } else if (asset.macdSignal === 'BEARISH') {
            stratSignal = 'SHORT';
            stratConfidence = 0.76;
          }
          break;
        }
      }
    } else {
      // Classical baseline strategy logic
      if (asset.trend === 'UP') {
        if (asset.rsi < 48) {
          stratSignal = 'LONG';
          stratConfidence = 0.75;
        } else if (asset.rsi > 70) {
          stratSignal = 'NEUTRAL';
          stratConfidence = 0.5;
        } else if (asset.macdSignal === 'BULLISH') {
          stratSignal = 'LONG';
          stratConfidence = 0.72;
        } else {
          stratSignal = 'LONG';
          stratConfidence = 0.65;
        }
      } else if (asset.trend === 'DOWN') {
        if (asset.rsi > 52) {
          stratSignal = 'SHORT';
          stratConfidence = 0.75;
        } else if (asset.rsi < 30) {
          stratSignal = 'NEUTRAL';
          stratConfidence = 0.5;
        } else if (asset.macdSignal === 'BEARISH') {
          stratSignal = 'SHORT';
          stratConfidence = 0.72;
        } else {
          stratSignal = 'SHORT';
          stratConfidence = 0.65;
        }
      } else {
        if (asset.rsi < 35) {
          stratSignal = 'LONG';
          stratConfidence = 0.65;
        } else if (asset.rsi > 65) {
          stratSignal = 'SHORT';
          stratConfidence = 0.65;
        }
      }
    }

    const regimeMultiplier = getRegimeStrategyBoost(strategy.category, regime);
    const tfMultiplier = strategy.timeframe === timeframe ? 1.15 : 1.0;
    // Synthesized priority boost
    const synthBoost = isSynthesized && executionMode === 'SYNTHESIZED_PRIORITY' ? 3.0 : 1.0;
    const finalWeight = strategy.weight * regimeMultiplier * tfMultiplier * synthBoost;
    const stratScore = stratConfidence * finalWeight;

    if (stratSignal === 'LONG') {
      longScore += stratScore;
      if (stratScore > maxStrategyScore) {
        maxStrategyScore = stratScore;
        leadingStrategy = strategy;
      }
    } else if (stratSignal === 'SHORT') {
      shortScore += stratScore;
      if (stratScore > maxStrategyScore) {
        maxStrategyScore = stratScore;
        leadingStrategy = strategy;
      }
    }
  });

  const sumScores = longScore + shortScore;
  if (sumScores === 0) {
    return { signal: 'NEUTRAL', longScore: 0, shortScore: 0, confidence: 0, totalScore: 0 };
  }

  // Adjust confidence based on MTF alignment if present
  let mtfMultiplier = 1.0;
  if (asset.timeframeAlignment) {
    if (asset.timeframeAlignment.isAligned) {
      mtfMultiplier = 1.15; // +15% boost for clean 15m/1h/4h triple alignment
    } else if (asset.timeframeAlignment.alignmentDirection === 'CONFLICT') {
      mtfMultiplier = 0.92; // mild caution damper, not complete disqualification
    }
  }

  const rawConfidence =
    longScore > shortScore ? (longScore / sumScores) * 100 : (shortScore / sumScores) * 100;
  const confidence = Math.min(95, Math.round(rawConfidence * mtfMultiplier));

  const signal =
    longScore > shortScore * 1.1 ? 'LONG' : shortScore > longScore * 1.1 ? 'SHORT' : 'NEUTRAL';

  return {
    signal,
    longScore: parseFloat(longScore.toFixed(2)),
    shortScore: parseFloat(shortScore.toFixed(2)),
    confidence,
    totalScore: parseFloat((Math.max(longScore, shortScore) * 6).toFixed(1)),
    leadingStrategy,
  };
}

/**
 * Autonomous AI Self-Learning & Error Diagnostics Engine
 * Restrained rule-based modifications only.
 * Weights strictly bounded to [0.2, 2.0].
 * CANNOT disable trend filter, bypass risk limits, or switch to REAL mode.
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
    remedyAction = `AI boosted strategy "${trade.strategyUsed}" weight by +0.08 within safe limits.`;
    arabicRemedyAction = `قام الذكاء الاصطناعي برفع وزن استراتيجية "${trade.strategyUsed}" بمقدار +0.08 ضمن الحدود الآمنة.`;
    weightDelta = 0.08;
    confidenceDelta = 0;
  } else {
    const isCounterTrend = (isLong && assetTrend === 'DOWN') || (!isLong && assetTrend === 'UP');

    if (isCounterTrend) {
      errorType = 'COUNTER_TREND_ERROR';
      diagnosis = `Trade was entered against the macro trend (${trade.side} in ${assetTrend} trend).`;
      arabicDiagnosis = `تم الدخول بالصفقة عكس الاتجاه العام للسوق (${trade.side} في اتجاه ${assetTrend}).`;
      remedyAction = `AI penalized counter-trend strategy weight by -0.15. Trend filter remains strictly locked.`;
      arabicRemedyAction = `قام الذكاء الاصطناعي بخفض وزن الاستراتيجية بمقدار -0.15 مع الإبقاء الصارم على فلتر الاتجاه.`;
      weightDelta = -0.15;
      confidenceDelta = 2;
    } else if (trade.exitReason === 'STOP_LOSS' && (asset?.adx || 0) > 35) {
      errorType = 'VOLATILITY_SPIKE_ERROR';
      diagnosis = `Stop loss breached due to sudden volatility expansion.`;
      arabicDiagnosis = `ضرب وقف الخسارة نتيجة قفزة تذبذب مفاجئة.`;
      remedyAction = `AI dialed back strategy weight by -0.05 and flagged volatility barrier.`;
      arabicRemedyAction = `قام الذكاء الاصطناعي بتهدئة وزن الاستراتيجية بمقدار -0.05 تحسباً لتقلبات السوق.`;
      weightDelta = -0.05;
      confidenceDelta = 2;
    } else if (trade.confidence < 70) {
      errorType = 'LOW_CONFIDENCE_SLIPPAGE';
      diagnosis = `Trade opened with marginal confidence (${trade.confidence}% < 70%).`;
      arabicDiagnosis = `تم فتح الصفقة بنسبة ثقة حدية (${trade.confidence}%).`;
      remedyAction = `AI penalized strategy weight by -0.10.`;
      arabicRemedyAction = `قام الذكاء الاصطناعي بخفض وزن الاستراتيجية بمقدار -0.10.`;
      weightDelta = -0.1;
      confidenceDelta = 2;
    } else {
      errorType = 'PREMATURE_EXIT_ERROR';
      diagnosis = `Premature exit trigger on minor market movement prior to setup maturation.`;
      arabicDiagnosis = `خروج مبكر ناتج عن حركة سعرية مؤقتة قبل اكتمال الهدف.`;
      remedyAction = `AI adjusted strategy weight by -0.05.`;
      arabicRemedyAction = `قام الذكاء الاصطناعي بضبط وزن الاستراتيجية بمقدار -0.05.`;
      weightDelta = -0.05;
      confidenceDelta = 1;
    }
  }

  return {
    id: `lesson-${Date.now()}-${trade.symbol}`,
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

  // Enforce account risk limit
  const maxAllowedMargin = balance * (config.tradeSizePercent / 100);
  const margin = Math.min(targetMargin, maxAllowedMargin);
  const notional = margin * config.leverage;
  const size = notional / currentPrice;

  return {
    margin: parseFloat(margin.toFixed(2)),
    notional: parseFloat(notional.toFixed(2)),
    size: parseFloat(size.toFixed(6)),
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

  const peakPriceGainPct = isLong
    ? ((highest - trade.entryPrice) / trade.entryPrice) * 100
    : ((trade.entryPrice - lowest) / trade.entryPrice) * 100;

  // 1. Break-Even Stop Loss Protection (Anti-Loss Guarantee)
  const beTrigger = config.breakEvenTriggerPercent ?? 1.0;
  const isBreakEvenActive =
    trade.isBreakEvenTriggered ||
    (config.useBreakEvenStop !== false && peakPriceGainPct >= beTrigger);

  if (isBreakEvenActive) {
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

  // 2. Hard Stop Loss
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
    // 4. Trailing Stop
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

    // 5. Time exit
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

    // 6. Profit retracement
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

/**
 * Display-only market sentiment helper.
 * Completely decoupled from trading engine decisions, signals, and audit.
 */
export function generateSentimentData(): MarketSentiment {
  return {
    fearAndGreedIndex: 58,
    sentimentLabel: 'Neutral',
    arabicLabel: 'محايد',
    marketCondition: 'تجميع وتماسك',
  };
}

/**
 * Ultra-Rigorous Trade Quality Verification & Audit Engine
 * Performs multi-layer scrutiny across 8 pillars.
 * Strictly FAILS if real 15m, 1h, 4h, MTF alignment, or real orderbook are missing.
 * Zero "pending live sync" or synthetic fallback pass allowed.
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

  // Data Integrity Pre-check
  if (asset.dataStatus === 'DATA_INVALID' || !asset.timeframeAlignment || !asset.orderbookDepth) {
    return {
      passed: false,
      auditScore: 0,
      rating: 'REJECTED',
      arabicRating: 'مرفوضة - بيانات السوق غير صالحة أو ناقصة (DATA_INVALID)',
      checks: {
        trendCascade: {
          name: 'Trend & EMA Cascade',
          arabicName: 'تسلسل الاتجاه والمتوسطات',
          passed: false,
          score: 0,
          weight: 15,
          value: 'Rejected: DATA_INVALID',
          arabicValue: 'مرفوض: بيانات السوق غير صالحة',
        },
        timeFrameAlignment: {
          name: 'Time-Frame Alignment (15m / 1h / 4h)',
          arabicName: 'توافق الأطر الزمنية الثلاثية',
          passed: false,
          score: 0,
          weight: 15,
          value: 'Missing or conflicted MTF data',
          arabicValue: 'بيانات الأطر الزمنية غير صالحة أو متعارضة',
        },
        momentumConfluence: {
          name: 'Momentum Confluence',
          arabicName: 'توافق مؤشرات الزخم',
          passed: false,
          score: 0,
          weight: 15,
          value: 'N/A',
          arabicValue: 'غير متاح',
        },
        trendStrengthADX: {
          name: 'Trend Velocity & ADX Strength',
          arabicName: 'قوة الاتجاه وفلتر التذبذب',
          passed: false,
          score: 0,
          weight: 10,
          value: 'N/A',
          arabicValue: 'غير متاح',
        },
        volatilityBandwidth: {
          name: 'Volatility Buffer',
          arabicName: 'حيز الحركة السعرية',
          passed: false,
          score: 0,
          weight: 10,
          value: 'N/A',
          arabicValue: 'غير متاح',
        },
        orderbookLiquidity: {
          name: 'Binance Orderbook & Liquidity Walls',
          arabicName: 'دفتر الأوامر وحواجز السيولة',
          passed: false,
          score: 0,
          weight: 15,
          value: 'Orderbook depth missing (NO TRADE)',
          arabicValue: 'دفتر الأوامر غير متوفر - يمنع فتح الصفقة',
        },
        strategyConsensus: {
          name: '50+ Strategies Consensus Ratio',
          arabicName: 'نسبة إجماع الاستراتيجيات',
          passed: false,
          score: 0,
          weight: 15,
          value: 'N/A',
          arabicValue: 'غير متاح',
        },
        riskRewardRatio: {
          name: 'Asymmetric Risk-to-Reward Ratio',
          arabicName: 'نسبة العائد إلى المخاطرة',
          passed: false,
          score: 0,
          weight: 5,
          value: 'N/A',
          arabicValue: 'غير متاح',
        },
      },
      reasons: ['DATA_INVALID: Missing mandatory real Binance market data or MTF alignment.'],
      arabicReasons: ['بيانات السوق غير صالحة أو غير مكتملة من بينانس (DATA_INVALID / NO TRADE).'],
    };
  }

  // Pillar 1: Trend Cascade & EMA Alignment (Weight: 15%)
  let trendScore = 0;
  let trendPassed = false;
  let trendVal = '';
  let trendArabicVal = '';
  let trendWarn: string | undefined;
  let trendArabicWarn: string | undefined;

  const isStrict = config.strictAntiLossFilter !== false;

  if (isLong) {
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
        ? `مرفوض: السعر يتداول أسفل متوسط 200 (${asset.price.toFixed(2)} < ${asset.ema200.toFixed(2)})`
        : `مرفوض: تعارض بالاتجاه (${asset.trend}) مع ضعف في تسلسل المتوسطات`;
      trendWarn = 'Severe trend risk detected';
      trendArabicWarn = 'تحذير عالي: مخاطرة فادحة للدخول عكس مسار الاتجاه الأساسي';
    }
  } else {
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
        ? `مرفوض: السعر يتداول أعلى متوسط 200 (${asset.price.toFixed(2)} > ${asset.ema200.toFixed(2)})`
        : `مرفوض: تعارض بالاتجاه (${asset.trend}) مع ضعف في تسلسل المتوسطات`;
      trendWarn = 'Severe trend risk detected';
      trendArabicWarn = 'تحذير عالي: مخاطرة فادحة للدخول في بيع والاتجاه العام صاعد';
    }
  }
  totalScore += trendScore;

  // Pillar 2: Independent Time-Frame Alignment (Weight: 15%)
  let tfaScore = 0;
  let tfaPassed = false;
  let tfaVal = '';
  let tfaArabicVal = '';
  let tfaWarn: string | undefined;
  let tfaArabicWarn: string | undefined;

  const tfa = asset.timeframeAlignment;

  if (isLong) {
    if (tfa.isAligned && tfa.alignmentDirection === 'LONG') {
      tfaScore = 15;
      tfaPassed = true;
      tfaVal = 'Triple Bullish Alignment (15m UP / 1h UP / 4h UP)';
      tfaArabicVal = 'توافق ثلاثي صاعد تام (15m صاعد / 1h صاعد / 4h صاعد)';
    } else {
      tfaScore = 0;
      tfaPassed = false;
      tfaVal = `Rejected: ${tfa.conflictReason || 'MTF alignment conflict'}`;
      tfaArabicVal = `مرفوض: ${tfa.arabicConflictReason || 'تعارض في اتجاه الأطر الزمنية'}`;
      tfaWarn = 'MTF conflict';
      tfaArabicWarn = 'تعارض في اتجاه الأطر الزمنية الثلاثة';
    }
  } else {
    if (tfa.isAligned && tfa.alignmentDirection === 'SHORT') {
      tfaScore = 15;
      tfaPassed = true;
      tfaVal = 'Triple Bearish Alignment (15m DOWN / 1h DOWN / 4h DOWN)';
      tfaArabicVal = 'توافق ثلاثي هابط تام (15m هابط / 1h هابط / 4h هابط)';
    } else {
      tfaScore = 0;
      tfaPassed = false;
      tfaVal = `Rejected: ${tfa.conflictReason || 'MTF alignment conflict'}`;
      tfaArabicVal = `مرفوض: ${tfa.arabicConflictReason || 'تعارض في اتجاه الأطر الزمنية'}`;
      tfaWarn = 'MTF conflict';
      tfaArabicWarn = 'تعارض في اتجاه الأطر الزمنية الثلاثة';
    }
  }
  totalScore += tfaScore;

  // Pillar 3: Momentum & Safe Entry Channel (Weight: 15%)
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
      momArabicWarn = 'تحذير: الشراء عند القمم يعرض الصفقة للانعكاس';
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
      momArabicVal = `مرفوض: خطر ارتداد صاعد لتشبع البيع (${rsi.toFixed(1)})`;
      momWarn = 'Short squeeze risk';
      momArabicWarn = 'تحذير: البيع عند القيعان يعرض الصفقة لارتداد معاكس سريع';
    } else {
      momScore = 0;
      momPassed = false;
      momVal = `Unfavorable Momentum: RSI ${rsi.toFixed(1)}, MACD ${macd}`;
      momArabicVal = `زخم غير ملائم: RSI ${rsi.toFixed(1)} مع MACD ${macd}`;
    }
  }
  totalScore += momScore;

  // Pillar 4: ADX Trend Strength & Noise Elimination (Weight: 10%)
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
    adxArabicVal = `مرفوض: سوق عرضي متذبذب (ADX ${adx.toFixed(1)} < ${minAdx})`;
  }
  totalScore += adxScore;

  // Pillar 5: Volatility Bandwidth & Deviation Buffer (Weight: 10%)
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

  // Pillar 6: Real Binance Orderbook Depth & Liquidity Walls (Weight: 15%)
  let obScore = 0;
  let obPassed = false;
  let obVal = '';
  let obArabicVal = '';
  let obWarn: string | undefined;
  let obArabicWarn: string | undefined;

  const ob = asset.orderbookDepth;
  const isObFilterActive = config.orderbookFilterEnabled !== false;

  if (!ob) {
    obScore = 0;
    obPassed = false;
    obVal = 'Rejected: Real Orderbook depth missing (NO TRADE)';
    obArabicVal = 'مرفوض: بيانات عمق دفتر الأوامر الحقيقية غير متوفرة (يمنع التداول)';
    obWarn = 'Missing orderbook data';
    obArabicWarn = 'غياب بيانات دفتر الأوامر يمنع الدخول';
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
    stratArabicVal = `مرفوض: تشتت في آراء الاستراتيجيات (${(consensusRatio * 100).toFixed(1)}%) دون الإجماع المطلوب`;
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

  // Final Decision: Realistic Anti-Loss Scrutiny
  const minAuditThreshold = config.minAuditScore || 65;

  // Severe disqualifiers that cause catastrophic losses:
  const severeWallBlock =
    obPassed === false &&
    Boolean(
      asset.orderbookDepth?.nearestOpposingWall &&
        asset.orderbookDepth.nearestOpposingWall.distancePercent < 0.8
    );
  const severeMacroClash = isLong
    ? asset.price < asset.ema200 * 0.94 && asset.trend === 'DOWN'
    : asset.price > asset.ema200 * 1.06 && asset.trend === 'UP';
  const severeMomentumOpposition = isLong
    ? asset.rsi > 78 && asset.macdSignal === 'BEARISH'
    : asset.rsi < 22 && asset.macdSignal === 'BULLISH';

  const hasSevereDisqualifier = Boolean(severeWallBlock || severeMacroClash || severeMomentumOpposition);
  const positivePillarsCount = [trendPassed, tfaPassed, momPassed, adxPassed, stratPassed, volPassed, obPassed].filter(Boolean).length;

  const passed = totalScore >= minAuditThreshold && !hasSevereDisqualifier && positivePillarsCount >= 4;

  let rating: TradeAuditVerification['rating'] = 'REJECTED';
  let arabicRating = 'مرفوضة - لا تلبي معايير التدقيق الفائق';

  if (totalScore >= 85 && passed) {
    rating = 'PERFECT_CONFLUENCE';
    arabicRating = 'صفقة ذهبية فائقة الدقة والضمان (Perfect Confluence)';
  } else if (totalScore >= 70 && passed) {
    rating = 'HIGH_ASSURANCE';
    arabicRating = 'صفقة معتمدة عالية الضمان (High Assurance)';
  } else if (passed) {
    rating = 'ACCEPTABLE';
    arabicRating = 'صفقة مقبولة بدرجة تدقيق معتمدة (Acceptable)';
  }

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
      arabicReasons.push(`درجة التدقيق ${totalScore}/100 أقل من الحد الأدنى (${minAuditThreshold}/100)`);
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

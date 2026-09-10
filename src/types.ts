export type BotStatus = 'RUNNING' | 'PAUSED' | 'STOPPED';

export type TradeSide = 'LONG' | 'SHORT';

export type ExitReason =
  | 'TAKE_PROFIT'
  | 'STOP_LOSS'
  | 'TRAILING_STOP'
  | 'BREAK_EVEN'
  | 'TIME_EXIT'
  | 'PROFIT_RETRACEMENT'
  | 'SMART_EXIT'
  | 'CIRCUIT_BREAKER'
  | 'MANUAL';

export interface SmartExitStatus {
  isActive: boolean;
  isTriggered: boolean;
  peakPnlPercent: number;
  currentPnlPercent: number;
  currentRetracePct: number;
  dropRatio: number; // e.g. 0.25 (25%)
  triggerPnlPercent: number;
  triggerPrice: number;
  peakPrice: number;
  entryPrice: number;
  currentPrice: number;
  pnlUSD: number;
  details: string;
  arabicDetails: string;
  trendFactor: string;
  volatilityFactor: string;
  momentumFactor: string;
}

export type MarketTrend = 'UP' | 'DOWN' | 'NEUTRAL';

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export type BotCycleStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BotStats {
  balance: number;
  initialBalance: number;
  peakBalance: number;
  totalPnL: number;
  totalPnLPercent: number;
  todayPnL: number;
  todayPnLPercent: number;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  openTradesCount: number;
  activeSignalsCount: number;
}

export type ScientificDomain =
  | 'QUANTUM'
  | 'THERMODYNAMICS'
  | 'FLUID_DYNAMICS'
  | 'CHAOS_FRACTAL'
  | 'INFORMATION_THEORY'
  | 'STOCHASTIC'
  | 'GAME_THEORY'
  | 'HARMONIC_SPECTRUM'
  | 'NEURAL_QUANT'
  | 'MACRO_PROP'
  | 'CLASSICAL_TECH';

export interface Strategy {
  id: string;
  name: string;
  arabicName: string;
  timeframe: TimeFrame;
  indicators: string;
  description: string;
  enabled: boolean;
  weight: number; // default 1.0
  category: 'scalping' | 'momentum' | 'trend' | 'swing' | 'daily' | 'scientific' | 'breakout';
  // Scientific & Asset-Specific Dimensions
  scientificDomain?: ScientificDomain;
  scientificFormula?: string;
  scientificPrinciple?: string;
  arabicPrinciple?: string;
  applicableSymbols?: string[]; // e.g. ['BTCUSDT'], ['SOLUSDT'], ['ALL']
  coinSuitabilityReason?: string;
  arabicSuitabilityReason?: string;
  isProprietaryAI?: boolean;
  winRateEstimate?: number;
  auditScoreEstimate?: number;
  mathModelComplexity?: 'STANDARD' | 'ADVANCED' | 'QUANTUM_GRADE';
  createdAt?: number;
}

export interface StrategyPerformance {
  strategyId: string;
  strategyName: string;
  symbol: string;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgConfidence: number;
  bestTrade: number;
  worstTrade: number;
}

export interface AuditCheckItem {
  name: string;
  arabicName: string;
  passed: boolean;
  score: number; // e.g. out of 20
  weight: number;
  value: string;
  arabicValue: string;
  warning?: string;
  arabicWarning?: string;
}

export interface TradeAuditVerification {
  passed: boolean;
  auditScore: number; // 0 to 100
  rating: 'PERFECT_CONFLUENCE' | 'HIGH_ASSURANCE' | 'ACCEPTABLE' | 'REJECTED';
  arabicRating: string;
  checks: {
    trendCascade: AuditCheckItem;
    momentumConfluence: AuditCheckItem;
    trendStrengthADX: AuditCheckItem;
    volatilityBandwidth: AuditCheckItem;
    strategyConsensus: AuditCheckItem;
    riskRewardRatio: AuditCheckItem;
    timeFrameAlignment?: AuditCheckItem;
    orderbookLiquidity?: AuditCheckItem;
  };
  reasons: string[];
  arabicReasons: string[];
}

export interface TimeFrameData {
  timeframe: '15m' | '1h' | '4h';
  trend: MarketTrend;
  ema20: number;
  ema50: number;
  rsi: number;
  macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  closePrice?: number;
  candleTimestamp?: number;
  isComplete?: boolean;
}

export type KlineInterval = '15m' | '1h' | '4h';

export interface BinanceKline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  isClosed: boolean;
}

export interface MarketDataResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  timestamp: number;
  source: 'BINANCE_FUTURES';
  isFresh: boolean;
}

export interface PersistedBotStateV20 {
  version: 'v20';
  savedAt: number;
  config: BotConfig;
  balance: number;
  initialBalance: number;
  peakBalance: number;
  activeTrades: Trade[];
  closedTrades: Trade[];
  strategyPerformances: StrategyPerformance[];
  learnedLessons: AILearnedLesson[];
  adaptiveState?: AIAdaptiveState;
  adaptiveConfidenceState?: AdaptiveConfidenceState;
  circuitBreakerState?: CircuitBreakerState;
  lossCooldowns?: Record<string, number>;
}

export interface TimeFrameAlignment {
  tf15m: TimeFrameData;
  tf1h: TimeFrameData;
  tf4h: TimeFrameData;
  isAligned: boolean;
  alignmentDirection: 'LONG' | 'SHORT' | 'CONFLICT' | 'NEUTRAL';
  alignmentScore: number; // 0 - 100%
  macroBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  conflictReason?: string;
  arabicConflictReason?: string;
}

export interface OrderbookWall {
  type: 'BUY_WALL' | 'SELL_WALL';
  price: number;
  distancePercent: number;
  quantity: number;
  notionalUSDT: number;
  significanceMultiplier: number;
}

export interface OrderbookDepthAnalysis {
  symbol: string;
  bidVolume: number;
  askVolume: number;
  bidAskRatio: number;
  buyWalls: OrderbookWall[];
  sellWalls: OrderbookWall[];
  nearestOpposingWall?: OrderbookWall;
  hasOpposingWall: boolean;
  depthStatus: 'HEALTHY' | 'SELL_WALL_BLOCKED' | 'BUY_WALL_BLOCKED' | 'IMBALANCE_WARNING';
  arabicStatus: string;
  details: string;
  arabicDetails: string;
}

export interface SmartFreezeInfo {
  symbol: string;
  isFrozen: boolean;
  frozenAt?: number;
  frozenUntil?: number;
  volatility15m: number;
  peak15mPrice: number;
  trough15mPrice: number;
  reason: string;
  arabicReason: string;
}

export interface CryptoAsset {
  symbol: string; // e.g. 'BTC/USDT'
  baseAsset?: string; // e.g. 'BTC'
  name: string;
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  sector: string;
  // Technicals
  ema20: number;
  ema50: number;
  ema200: number;
  trend: MarketTrend;
  rsi: number;
  macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  macdHist?: number;
  adx: number;
  atr?: number;
  // Ensemble Signal for this asset
  ensembleSignal: 'LONG' | 'SHORT' | 'NEUTRAL';
  longScore: number;
  shortScore: number;
  confidence: number; // 0 to 100%
  score?: number; // normalized aggregate score
  // Audit Verification
  auditScore?: number;
  auditPassed?: boolean;
  auditVerification?: TradeAuditVerification;
  // Time-Frame Alignment (15m, 1h, 4h)
  timeframeAlignment?: TimeFrameAlignment;
  // Leading Strategy driving this signal
  leadingStrategy?: Strategy;
  // Binance Orderbook Depth & Liquidity Walls
  orderbookDepth?: OrderbookDepthAnalysis;
  // Smart Freeze state
  smartFreeze?: SmartFreezeInfo;
  // Gemini AI Decision Engine analysis
  geminiDecision?: GeminiDecisionResult;
  // Market Data Validity
  dataStatus?: 'VALID' | 'DATA_INVALID' | 'PENDING';
  lastDataError?: string;
  currentPatternTag?: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  currentPrice: number;
  highestPrice?: number;
  lowestPrice?: number;
  size: number; // base asset amount
  notional: number; // size * price in USD
  margin: number; // notional / leverage
  leverage: number;
  pnl: number;
  pnlPercent: number;
  peakPnlPercent?: number;
  targetProfitUSD?: number; // Target $20 profit per trade
  stopLoss: number;
  takeProfit: number;
  trailingStopActive?: boolean;
  trailingStopPrice?: number;
  isBreakEvenTriggered?: boolean;
  breakEvenPrice?: number;
  strategyUsed: string;
  confidence: number;
  auditScore?: number;
  auditVerification?: TradeAuditVerification;
  geminiDecision?: GeminiDecisionResult;
  decisionReview?: DecisionReview;
  openedAt: number; // timestamp
  closedAt?: number;
  closePrice?: number;
  exitReason?: ExitReason | null;
  smartExitStatus?: SmartExitStatus;
}

export interface BotConfig {
  balance: number;
  initialBalance: number;
  peakBalance: number;
  // Strict Target Profit per Trade ($20 USD)
  targetProfitPerTradeUSD: number; // default $20.00
  geminiAiEngineEnabled: boolean; // default true
  geminiMinConfidence: number; // default 70%
  // Risk settings
  maxDailyRisk: number; // e.g. 2.0%
  maxTradeRisk: number; // e.g. 0.3%
  maxOpenTrades: number; // default 4
  leverage: number; // default 20x
  tradeSizePercent: number; // max 5% of balance
  stopLossPercent: number; // default 2.0%
  takeProfitPercent: number; // default 5.0%
  // Confidence settings
  minConfidence: number; // default 15% (or 75% for default baseline)
  maxConfidence: number; // default 75%
  currentConfidence: number; // dynamically adjusts
  confidenceStep: number; // 5%
  minScore: number; // default 25
  // Filters & exits
  timeframe: TimeFrame;
  useTrendFilter: boolean;
  useSmartExit: boolean;
  trailingStopTriggerPercent: number; // 1.5% profit
  trailingStopDeltaPercent: number; // 1.0% trail
  timeExitMinutes: number; // 5 min
  timeExitMinProfit: number; // 0.3%
  profitRetraceThreshold: number; // 2.0% profit
  profitRetraceDropRatio: number; // retraces 40% (0.4)
  // Adaptive Smart Exit (Phase 1: Dynamic Market-Adaptive Pullback)
  smartExitEnabled: boolean; // Enable/disable adaptive smart exit
  smartExitMinProfitPercent: number; // Min profit before activation (default 5.0%)
  smartExitMinDropRatio: number; // Min allowed drop ratio (default 10.0%)
  smartExitMaxDropRatio: number; // Max allowed drop ratio (default 35.0%)
  smartExitSeparateTrendRatios: boolean; // Separate drop ratio for UP vs DOWN trend
  smartExitUptrendDropRatio: number; // Drop ratio in strong UP trend (default 25.0%)
  smartExitDowntrendDropRatio: number; // Drop ratio in DOWN trend (default 15.0%)
  smartExitUseAIMomentum: boolean; // Use AI / Momentum to dynamically expand/contract ratio
  smartExitVolatilityWindowMin: number; // Volatility measurement window in minutes (default 15)
  // Circuit breaker
  maxConsecutiveLosses: number; // 5
  circuitBreakerCooldownMin: number; // 30 min
  maxDailyLosses: number; // 10
  maxDrawdownPercent: number; // 10%
  // Execution
  cycleIntervalSeconds: number; // 15
  testnetMode: boolean;
  tradingMode: 'PAPER' | 'REAL';
  binanceApiKey: string;
  binanceApiSecret: string;
  binanceNetwork: 'TESTNET' | 'PRODUCTION';
  pureSelfLearning: boolean;
  // Strategy Execution Focus (Natural Classical Strategies vs All)
  strategyExecutionMode?: 'NATURAL_STRATEGIES' | 'ALL_STRATEGIES';
  // High-Precision Trade Verification & Scrutiny
  precisionAuditMode: boolean;
  minAuditScore: number; // default: 75%
  minConsensusRatio: number; // default: 0.65 (65%)
  minADXThreshold: number; // default: 20
  requireRRRatio: number; // default: 2.0 (1:2 minimum)
  // Anti-Loss & Break-Even Safeguards
  useBreakEvenStop: boolean; // auto moves SL to entry +0.15% once in profit
  breakEvenTriggerPercent: number; // e.g. 1.0% unleveraged gain
  strictAntiLossFilter: boolean; // strictly blocks overextended and low-quality setups
  symbolCooldownMinutes: number; // cooldown period after a stopped-out loss
  // Time-Frame Alignment (15m, 1h, 4h)
  enforceTimeFrameAlignment: boolean; // Ensures 15m, 1h, 4h indicator cascade matches entry
  // Binance Orderbook Liquidity Walls
  orderbookFilterEnabled: boolean; // Blocks trades encountering opposing Liquidity Walls
  maxOpposingWallDistancePct: number; // e.g. 2.5% proximity threshold
  // Smart Freeze (15m Abnormal Volatility Protection)
  smartFreezeEnabled: boolean; // Suspends trading on pairs with abnormal 15m volatility
  smartFreezeThresholdPercent: number; // 15m price swing threshold (e.g. 2.8%)
  smartFreezeDurationMinutes: number; // Freeze duration (e.g. 15 min)
  // Triple Decision Review Settings
  enableTripleReview?: boolean;
  useTripleReview?: boolean;
  minDecisionScore?: number;
  minFinalScoreForApprove?: number;
  minFinalScoreForCaution?: number;
  blockIfOpenTradeExists?: boolean;
  allowHedgeTrades?: boolean;
  boostHighConviction?: boolean;
  useTopStrategiesOnly?: boolean;
  minStrategyWinRate?: number;
  minPatternOccurrences?: number;
}

// ==========================================
// GEMINI AI DECISION ENGINE STRUCTURES
// ==========================================

export interface CandleSnapshot {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSnapshot {
  symbol: string;
  currentPrice: number;
  timeframe: string;
  candles: CandleSnapshot[];
  indicators: {
    ema20: number;
    ema50: number;
    ema200: number;
    rsi: number;
    macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    adx: number;
    atr?: number;
    priceVsEma200Percent: number;
  };
  trend: MarketTrend;
  marketRegime: MarketRegime;
  multiTimeframe: {
    tf15mTrend: MarketTrend;
    tf1hTrend: MarketTrend;
    tf4hTrend: MarketTrend;
    isAligned: boolean;
    alignmentDirection: 'LONG' | 'SHORT' | 'CONFLICT' | 'NEUTRAL';
  };
  orderbook: {
    bidVolume: number;
    askVolume: number;
    bidAskRatio: number;
    depthStatus: string;
    hasOpposingWall: boolean;
    nearestWallDistancePct?: number;
    nearestWallType?: string;
  };
  supportResistance: {
    support: number;
    resistance: number;
    pivot: number;
  };
  volatility: number;
  volume24h?: number;
  strategyResults: {
    longScore: number;
    shortScore: number;
    consensusRatio: number;
    dominantSide: 'LONG' | 'SHORT' | 'NEUTRAL';
    leadingStrategyName?: string;
    evaluatedCount: number;
  };
  riskParameters: {
    targetProfitUSD: number; // strictly $20.00
    accountBalance: number;
    leverage: number;
    stopLossPercent: number;
    takeProfitPercent: number;
  };
}

export interface GeminiDecisionResult {
  symbol: string;
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number; // 0 to 100
  reasoningEn: string;
  reasoningAr: string;
  keyRisksEn: string[];
  keyRisksAr: string[];
  confirmationFactorsEn: string[];
  confirmationFactorsAr: string[];
  targetProfitUSD: number; // 20
  recommendedEntry: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  suggestedStrategyAdjustment?: string;
  isApproved: boolean;
  rejectionReason?: string;
  timestamp: number;
  source: 'GEMINI_AI' | 'CONSENSUS_ENGINE_FALLBACK';
}

// ==========================================
// BACKTESTING ENGINE STRUCTURES
// ==========================================

export interface BacktestConfig {
  symbol: string;
  timeframe: '15m' | '1h' | '4h';
  candleCount: number; // e.g. 100 to 500
  targetProfitUSD: number; // $20
  leverage: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  useBreakEvenStop: boolean;
}

export interface BacktestTrade {
  id: string;
  symbol: string;
  side: TradeSide;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
  exitReason: ExitReason;
  strategyUsed: string;
  durationCandles: number;
}

export interface BacktestReport {
  symbol: string;
  timeframe: string;
  totalCandlesAnalyzed: number;
  dateRange: { start: string; end: string };
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  averageProfitPerTrade: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  trades: BacktestTrade[];
  equityCurve: Array<{ time: string; balance: number }>;
}

export type Language = 'ar' | 'en';

export interface AIAdaptiveState {
  currentLevel: 0 | 1 | 2 | 3;
  consecutiveIdleCycles: number;
  totalAdaptations: number;
  history: Array<{
    id: string;
    timestamp: string;
    level: number;
    action: string;
    details: string;
  }>;
}

export interface AdaptiveConfidenceState {
  currentConfidence: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  totalAdjustments: number;
  history: Array<{
    id: string;
    timestamp: string;
    type: 'UP' | 'DOWN';
    change: number;
    reason: string;
    newConfidence: number;
  }>;
}

export interface CircuitBreakerState {
  consecutiveLosses: number;
  dailyLossesCount: number;
  isTriggered: boolean;
  cooldownUntil: number | null; // timestamp
  reason: string | null;
}

export interface MarketSentiment {
  fearAndGreedIndex: number; // 0 - 100
  sentimentLabel: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  arabicLabel: 'خوف شديد' | 'خوف' | 'محايد' | 'طمع' | 'طمع شديد';
  marketCondition: 'تذبذب عالي' | 'اتجاه صاعد قوي' | 'اتجاه هابط حاد' | 'تجميع وتماسك';
}

export interface BotLog {
  id: string;
  timestamp: string;
  category: 'CYCLE' | 'TRADE' | 'RISK' | 'AI_ADAPTIVE' | 'CONFIDENCE' | 'SMART_EXIT';
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  arabicMessage: string;
}

export type MarketRegime = 'BULL_TREND' | 'BEAR_TREND' | 'RANGE_BOUND' | 'HIGH_VOLATILITY';

export type AIErrorType =
  | 'COUNTER_TREND_ERROR'
  | 'VOLATILITY_SPIKE_ERROR'
  | 'PREMATURE_EXIT_ERROR'
  | 'LOW_CONFIDENCE_SLIPPAGE'
  | 'PERFECT_EXECUTION_WIN';

export interface AILearnedLesson {
  id: string;
  timestamp: string;
  tradeId: string;
  symbol: string;
  strategyUsed: string;
  pnl: number;
  errorType: AIErrorType;
  diagnosis: string;
  arabicDiagnosis: string;
  remedyAction: string;
  arabicRemedyAction: string;
  weightDelta: number;
  confidenceDelta: number;
  status: 'APPLIED' | 'LEARNED';
}

export interface AILearningMetrics {
  totalAnalyzedTrades: number;
  errorsDiagnosed: number;
  autoCorrectionsApplied: number;
  optimizationScore: number;
  dominantRegime: MarketRegime;
}

// ==========================================
// PHASE 2: Behavioral Database & Swing Types
// ==========================================

export type SwingDirection = 'UP' | 'DOWN' | 'SIDEWAYS';
export type SwingOutcome = 'CONTINUED' | 'REVERSED' | 'SIDEWAYS' | 'PENDING';

export interface SwingRecord {
  id: string; // unique ID: e.g. `${symbol}-${startTime}-${endTime}`
  symbol: string;
  direction: SwingDirection;
  startTime: number; // timestamp in ms
  endTime: number; // timestamp in ms
  startPrice: number;
  endPrice: number;
  highPrice: number;
  lowPrice: number;
  amplitudePct: number; // percentage price change, e.g. 1.5 for 1.5%
  durationMinutes: number;
  volumeChangePct: number;
  startRsi: number;
  endRsi: number;
  startAdx: number;
  endAdx: number;
  patternTag?: string; // e.g. "P-U-1.5-47-R42-68-A18-32"
  outcome?: SwingOutcome;
  outcomeMagnitude?: number;
  createdAt: number;
}

export interface PatternStats {
  tag: string;
  symbol: string;
  occurrences: number;
  lastSeen: number;
  continuedCount: number;
  reversedCount: number;
  sidewaysCount: number;
  avgNextMovement: number;
  avgNextDuration: number;
  avgPeakProfitBeforeReversal: number;
  predictionConfidence: number; // 0 - 100%
  stdDev: number;
  avgRange: number;
}

export interface Prediction {
  tag: string;
  symbol: string;
  confidence: number; // 0 - 100%
  expectedDirection: SwingDirection;
  expectedMovementPct: number;
  expectedDurationMin: number;
  historicalAccuracy: number;
  sampleSize: number;
}

export interface SymbolBehaviorStats {
  symbol: string;
  totalSwings: number;
  uniquePatternsCount: number;
  avgUpPct: number;
  avgDownPct: number;
  avgDurationMin: number;
  overallAccuracy: number;
  bestTradingHours: number[]; // e.g. [14, 15, 18] UTC hours
  worstTradingHours: number[];
  topPatterns: PatternStats[];
  lastUpdated: number;
}

export interface DecisionReview {
  openTradesCheck: {
    hasOpenTradeOnSymbol: boolean;
    openTradeId?: string;
    openTradeSide?: 'LONG' | 'SHORT';
    decision: 'PASS' | 'BLOCK' | 'ALLOW_HEDGE';
    scoreDelta: number;
    reason: string;
    reasonAr: string;
  };
  strategyReview: {
    suggestedStrategy: string;
    suggestedStrategyWinRate: number;
    topStrategiesForSymbol: Array<{
      name: string;
      winRate: number;
      tradesCount: number;
    }>;
    isTopStrategy: boolean;
    decision: 'STRONG_PASS' | 'PASS' | 'WEAK_PASS' | 'BLOCK';
    scoreDelta: number;
    reason: string;
    reasonAr: string;
  };
  patternReview: {
    currentPatternTag: string;
    patternOccurrences: number;
    patternConfidence: number;
    expectedDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
    matchesSuggestedDirection: boolean;
    decision: 'STRONG_PASS' | 'PASS' | 'NEUTRAL' | 'BLOCK';
    scoreDelta: number;
    reason: string;
    reasonAr: string;
  };
  finalDecision: 'APPROVE' | 'APPROVE_WITH_CAUTION' | 'REJECT';
  finalScore: number;
  baseScore: number;
  aiInsightScore: number;
  summary: string;
  summaryAr: string;
}


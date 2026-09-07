export type BotStatus = 'RUNNING' | 'PAUSED' | 'STOPPED';

export type TradeSide = 'LONG' | 'SHORT';

export type ExitReason =
  | 'TAKE_PROFIT'
  | 'STOP_LOSS'
  | 'TRAILING_STOP'
  | 'BREAK_EVEN'
  | 'TIME_EXIT'
  | 'PROFIT_RETRACEMENT'
  | 'CIRCUIT_BREAKER'
  | 'MANUAL';

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

export interface Strategy {
  id: string;
  name: string;
  arabicName: string;
  timeframe: TimeFrame;
  indicators: string;
  description: string;
  enabled: boolean;
  weight: number; // default 1.0
  category: 'scalping' | 'momentum' | 'trend' | 'swing' | 'daily';
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
  adx: number;
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
  // Binance Orderbook Depth & Liquidity Walls
  orderbookDepth?: OrderbookDepthAnalysis;
  // Smart Freeze state
  smartFreeze?: SmartFreezeInfo;
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
  openedAt: number; // timestamp
  closedAt?: number;
  closePrice?: number;
  exitReason?: ExitReason | null;
}

export interface BotConfig {
  balance: number;
  initialBalance: number;
  peakBalance: number;
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

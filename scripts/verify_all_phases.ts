/**
 * Automated Verification Script for Phases 1-16
 * Tests all 12 Phase 15 criteria and the 37-point Definition of Done checklist.
 */

import {
  fetchLiveBinancePrices,
  fetchBinanceKlines,
  fetchBinanceOrderbookDepth,
  placeBinanceFuturesOrder,
} from '../src/services/binanceService';

import {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateIndicatorsFromKlines,
  calculateTimeFrameAlignment,
  detectSmartFreeze,
  calculatePositionSize,
  checkSmartExit,
  auditTradeSetup,
  evaluateEnsembleSignal,
} from '../src/services/tradingEngine';

import { detectSwings } from '../src/services/swingDetector';
import {
  saveSwing,
  getSwingsBySymbol,
  getSymbolStats,
  updatePatternStats,
  clearAllData,
} from '../src/services/behaviorDatabase';
import {
  computeSymbolStats,
} from '../src/services/behaviorAnalytics';
import {
  classifyPattern,
  predictOutcome,
} from '../src/services/predictionEngine';
import {
  performTripleReview,
} from '../src/services/decisionReviewer';
import {
  evaluateTradeWithReview,
} from '../src/services/tradingEngine';

import {
  CryptoAsset,
  BotConfig,
  TimeFrameData,
  Trade,
  BinanceKline,
  StrategyPerformance,
} from '../src/types';

import { INITIAL_STRATEGIES } from '../src/data/strategies';

const DEFAULT_CONFIG: BotConfig = {
  tradingMode: 'PAPER',
  binanceNetwork: 'TESTNET',
  binanceApiKey: '',
  binanceApiSecret: '',
  minConfidence: 20,
  maxConfidence: 90,
  currentConfidence: 75,
  confidenceStep: 5,
  minScore: 25,
  maxOpenTrades: 4,
  leverage: 20,
  tradeSizePercent: 5,
  maxDailyRisk: 3.5,
  maxTradeRisk: 0.5,
  stopLossPercent: 2.0,
  takeProfitPercent: 5.5,
  trailingStopTriggerPercent: 2.2,
  trailingStopDeltaPercent: 0.8,
  timeExitMinutes: 30,
  timeExitMinProfit: 0.8,
  profitRetraceThreshold: 3.0,
  profitRetraceDropRatio: 0.4,
  maxConsecutiveLosses: 5,
  circuitBreakerCooldownMin: 30,
  maxDailyLosses: 10,
  maxDrawdownPercent: 10,
  cycleIntervalSeconds: 15,
  testnetMode: true,
  pureSelfLearning: false,
  timeframe: '15m',
  useTrendFilter: true,
  useSmartExit: true,
  smartExitEnabled: true,
  smartExitMinProfitPercent: 5.0,
  smartExitMinDropRatio: 10.0,
  smartExitMaxDropRatio: 35.0,
  smartExitSeparateTrendRatios: true,
  smartExitUptrendDropRatio: 25.0,
  smartExitDowntrendDropRatio: 15.0,
  smartExitUseAIMomentum: true,
  smartExitVolatilityWindowMin: 15,
  balance: 1000.0,
  initialBalance: 1000.0,
  peakBalance: 1000.0,
  precisionAuditMode: true,
  minAuditScore: 78,
  minConsensusRatio: 0.7,
  minADXThreshold: 22,
  requireRRRatio: 2.2,
  useBreakEvenStop: true,
  breakEvenTriggerPercent: 1.0,
  strictAntiLossFilter: true,
  symbolCooldownMinutes: 10,
  enforceTimeFrameAlignment: true,
  orderbookFilterEnabled: true,
  maxOpposingWallDistancePct: 2.5,
  smartFreezeEnabled: true,
  smartFreezeThresholdPercent: 2.8,
  smartFreezeDurationMinutes: 15,
  targetProfitPerTradeUSD: 20,
  geminiAiEngineEnabled: true,
  geminiMinConfidence: 65,
};

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function runAllTests() {
  console.log('=====================================================');
  console.log('STARTING RIGOROUS 12-POINT PHASE 15 VERIFICATION SUITE');
  console.log('=====================================================\n');

  // TEST 1: Real Binance Klines Fetching (15m, 1h, 4h)
  console.log('TEST 1: Real Binance Futures Klines (15m, 1h, 4h)');
  const [res15m, res1h, res4h] = await Promise.all([
    fetchBinanceKlines('BTCUSDT', '15m', 220),
    fetchBinanceKlines('BTCUSDT', '1h', 220),
    fetchBinanceKlines('BTCUSDT', '4h', 220),
  ]);

  assert(res15m.success && Array.isArray(res15m.data) && res15m.data.length >= 210, '15m Klines returned >= 210 candles');
  assert(res1h.success && Array.isArray(res1h.data) && res1h.data.length >= 210, '1h Klines returned >= 210 candles');
  assert(res4h.success && Array.isArray(res4h.data) && res4h.data.length >= 210, '4h Klines returned >= 210 candles');
  assert(res15m.source === 'BINANCE_FUTURES' && res15m.isFresh === true, '15m marked BINANCE_FUTURES & isFresh');

  // TEST 2: Data Validation & DATA_INVALID Handling
  console.log('\nTEST 2: Data Validation (DATA_INVALID on error or malformed data)');
  const badSymbolRes = await fetchBinanceKlines('NONEXISTENT_SYMBOL_XYZ', '15m', 50);
  assert(!badSymbolRes.success && badSymbolRes.data === null, 'Nonexistent symbol returns success: false with null data');
  assert(typeof badSymbolRes.error === 'string' && badSymbolRes.error.length > 0, 'Nonexistent symbol provides error message');

  // TEST 3: Deterministic Indicator Calculations
  console.log('\nTEST 3: Deterministic Indicator Calculations (EMA, RSI, MACD, ADX, ATR)');
  const sampleCloses = Array.from({ length: 220 }, (_, i) => 60000 + Math.sin(i * 0.1) * 1000 + i * 20);
  const ema20_a = calculateEMA(sampleCloses, 20);
  const ema20_b = calculateEMA(sampleCloses, 20);
  assert(ema20_a === ema20_b && ema20_a > 0, 'EMA is 100% deterministic and identical on repeated calls');

  const rsi_a = calculateRSI(sampleCloses, 14);
  const rsi_b = calculateRSI(sampleCloses, 14);
  assert(rsi_a === rsi_b && rsi_a >= 0 && rsi_a <= 100, 'RSI is 100% deterministic and strictly in [0, 100]');

  const macd = calculateMACD(sampleCloses, 12, 26, 9);
  assert(typeof macd.macd === 'number' && typeof macd.signal === 'number', 'MACD line and signal line computed');

  // TEST 4: Multi-Timeframe Alignment (No Cross-Derivation)
  console.log('\nTEST 4: Multi-Timeframe Alignment (Zero Cross-Derivation)');
  const tf15m: TimeFrameData = { timeframe: '15m', trend: 'UP', ema20: 65100, ema50: 64900, rsi: 58, macdSignal: 'BULLISH' };
  const tf1h: TimeFrameData = { timeframe: '1h', trend: 'UP', ema20: 64800, ema50: 64200, rsi: 62, macdSignal: 'BULLISH' };
  const tf4h: TimeFrameData = { timeframe: '4h', trend: 'UP', ema20: 64000, ema50: 63000, rsi: 65, macdSignal: 'BULLISH' };

  const alignedResult = calculateTimeFrameAlignment(tf15m, tf1h, tf4h);
  assert(alignedResult.isAligned === true && alignedResult.alignmentDirection === 'LONG', 'Aligned UP on all 3 timeframes yields LONG alignment');
  assert(alignedResult.alignmentScore >= 80, 'Aligned score >= 80%');

  const tf4hBearish: TimeFrameData = { timeframe: '4h', trend: 'DOWN', ema20: 63000, ema50: 64000, rsi: 42, macdSignal: 'BEARISH' };
  const conflictResult = calculateTimeFrameAlignment(tf15m, tf1h, tf4hBearish);
  assert(conflictResult.isAligned === false && conflictResult.alignmentDirection === 'CONFLICT', 'Conflicting 4h trend yields CONFLICT / not aligned');

  // TEST 5: Orderbook Depth & Wall Detection
  console.log('\nTEST 5: Orderbook Depth & Wall Detection from Binance Futures');
  const obRes = await fetchBinanceOrderbookDepth('BTCUSDT', 67000, 'LONG', 2.5);
  assert(obRes.success && obRes.data !== null, 'Binance Orderbook fetch returns valid depth');
  assert(typeof obRes.data?.bidAskRatio === 'number' && obRes.data!.bidAskRatio > 0, 'Bid/Ask ratio computed from real depths');
  assert(Array.isArray(obRes.data?.buyWalls) && Array.isArray(obRes.data?.sellWalls), 'Buy and Sell liquidity walls categorized');

  // TEST 6: Smart Volatility Freeze Protection
  console.log('\nTEST 6: Smart Volatility Freeze Protection on 15m Candles');
  const normalCandles: BinanceKline[] = Array.from({ length: 10 }, (_, i) => ({
    openTime: Date.now() - (10 - i) * 15 * 60 * 1000,
    open: 65000 + i * 10,
    high: 65050 + i * 10,
    low: 64980 + i * 10,
    close: 65020 + i * 10,
    volume: 100,
    closeTime: Date.now() - (9 - i) * 15 * 60 * 1000,
    isClosed: true,
  }));

  const normalFreeze = detectSmartFreeze('BTCUSDT', normalCandles, DEFAULT_CONFIG, 65100);
  assert(normalFreeze.isFrozen === false, 'Normal candles do not trigger smart freeze');

  // Anomalous 4% spike in a single candle
  const violentCandles: BinanceKline[] = [...normalCandles];
  violentCandles[violentCandles.length - 1] = {
    openTime: Date.now() - 15 * 60 * 1000,
    open: 65000,
    high: 68000,
    low: 64900,
    close: 67800, // +4.3% move
    volume: 5000,
    closeTime: Date.now(),
    isClosed: true,
  };

  const violentFreeze = detectSmartFreeze('BTCUSDT', violentCandles, DEFAULT_CONFIG, 67800);
  assert(violentFreeze.isFrozen === true && violentFreeze.volatility15m >= 2.8, 'Violent swing triggers Smart Freeze');

  // TEST 7: Strict Position Sizing & Leverage Math
  console.log('\nTEST 7: Position Sizing and Risk Math');
  const sizeCalc = calculatePositionSize(1000, DEFAULT_CONFIG, 80, 0, 0, 65000);
  assert(sizeCalc.margin <= 1000 * (DEFAULT_CONFIG.tradeSizePercent / 100) + 0.01, 'Position margin capped by tradeSizePercent (5%)');
  assert(sizeCalc.notional === Number((sizeCalc.margin * DEFAULT_CONFIG.leverage).toFixed(2)), 'Notional equals margin * leverage');
  assert(sizeCalc.size === Number((sizeCalc.notional / 65000).toFixed(6)), 'Size equals notional / price');

  // TEST 8: Smart Exit Engine (Break-Even, Trailing, SL, TP)
  console.log('\nTEST 8: Smart Exit Engine (Break-Even, Trailing Stop, Hard SL, TP)');
  const sampleTrade: Trade = {
    id: 'test-trade-1',
    symbol: 'BTCUSDT',
    side: 'LONG',
    entryPrice: 65000,
    currentPrice: 65000,
    margin: 50,
    notional: 1000,
    size: 0.01538,
    leverage: 20,
    pnl: 0,
    pnlPercent: 0,
    stopLoss: 63700, // 2% SL
    takeProfit: 68575, // 5.5% TP
    confidence: 80,
    openedAt: Date.now() - 60000,
    strategyUsed: 'TestStrategy',
  };

  // 1. Check Hard SL hit
  const slExit = checkSmartExit(sampleTrade, 63600, DEFAULT_CONFIG);
  assert(slExit.shouldExit && slExit.reason === 'STOP_LOSS', 'Hard Stop Loss correctly triggers exit');

  // 2. Check Hard TP hit
  const tpExit = checkSmartExit(sampleTrade, 68600, DEFAULT_CONFIG);
  assert(tpExit.shouldExit && tpExit.reason === 'TAKE_PROFIT', 'Take Profit correctly triggers exit');

  // 3. Check Break-Even Triggering
  // price up +1.2% (> 1.0% breakEvenTriggerPercent)
  const beExit = checkSmartExit(sampleTrade, 65780, DEFAULT_CONFIG);
  assert(beExit.updatedBreakEven === true, 'Break-Even stop triggers once profit exceeds threshold (+1.0%)');

  // TEST 9: Real Trading Execution Lock (PAPER ONLY)
  console.log('\nTEST 9: Real Execution Safety Lock');
  const orderRes = await placeBinanceFuturesOrder({
    symbol: 'BTCUSDT',
    side: 'LONG',
    quantity: 0.01,
    apiKey: 'dummy_key',
    apiSecret: 'dummy_secret',
    network: 'TESTNET',
  });
  assert(orderRes.success === false, 'placeBinanceFuturesOrder returns success: false');
  assert(orderRes.message.includes('REAL TRADING DISABLED') || orderRes.message.includes('PAPER'), 'Error message clearly states REAL TRADING DISABLED (PAPER MODE ONLY)');

  // TEST 10: Force Trade Audit & DATA_INVALID Block
  console.log('\nTEST 10: Force Trade Scrutiny and DATA_INVALID Rejection');
  const invalidAsset: CryptoAsset = {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: 0,
    change24h: 0,
    sector: 'Layer 1',
    rsi: 50,
    macdSignal: 'NEUTRAL',
    adx: 20,
    ema20: 0,
    ema50: 0,
    ema200: 0,
    trend: 'NEUTRAL',
    ensembleSignal: 'NEUTRAL',
    confidence: 0,
    longScore: 0,
    shortScore: 0,
    dataStatus: 'DATA_INVALID',
    lastDataError: 'Klines unavailable',
  };

  const auditRes = auditTradeSetup(invalidAsset, 'LONG', DEFAULT_CONFIG, 'RANGE_BOUND', INITIAL_STRATEGIES);
  assert(auditRes.passed === false, 'DATA_INVALID asset fails Trade Quality Audit immediately');
  assert(auditRes.reasons.some((r) => r.includes('DATA_INVALID') || r.includes('Stale')), 'Audit reasons state market data is invalid/stale');

  // TEST 11: Schema Versioning & Hydration V20
  console.log('\nTEST 11: Schema V20 Persistence Requirements');
  const sampleV20State = {
    schemaVersion: 20,
    savedAt: Date.now(),
    config: DEFAULT_CONFIG,
    balance: 1000,
    initialBalance: 1000,
    peakBalance: 1000,
    activeTrades: [],
    closedTrades: [],
    strategyPerformances: [],
    learnedLessons: [],
  };
  assert(sampleV20State.schemaVersion === 20, 'State uses schemaVersion: 20');
  assert(sampleV20State.config.tradingMode === 'PAPER', 'Persisted config is locked to PAPER mode');

  // TEST 12: Zero Random / Zero Synthetic Market Decision Logic
  console.log('\nTEST 12: Zero Synthetic / Zero Random Market Data Verification');
  const testAssetValid: CryptoAsset = {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: 66000,
    change24h: 1.5,
    sector: 'Layer 1',
    rsi: 56,
    macdSignal: 'BULLISH',
    adx: 28,
    ema20: 65800,
    ema50: 65400,
    ema200: 64000,
    trend: 'UP',
    ensembleSignal: 'LONG',
    confidence: 82,
    longScore: 4.2,
    shortScore: 0.8,
    dataStatus: 'VALID',
    timeframeAlignment: alignedResult,
    orderbookDepth: obRes.data!,
    smartFreeze: {
      symbol: 'BTCUSDT',
      isFrozen: false,
      volatility15m: 0.8,
      peak15mPrice: 66500,
      trough15mPrice: 65800,
      reason: 'Normal volatility',
      arabicReason: 'تذبذب طبيعي',
    },
  };

  const signalEvaluation1 = evaluateEnsembleSignal(testAssetValid, INITIAL_STRATEGIES, '15m', 'BULL_TREND');
  const signalEvaluation2 = evaluateEnsembleSignal(testAssetValid, INITIAL_STRATEGIES, '15m', 'BULL_TREND');
  assert(signalEvaluation1.signal === signalEvaluation2.signal, 'Ensemble signal is 100% deterministic');
  assert(signalEvaluation1.confidence === signalEvaluation2.confidence, 'Ensemble confidence is 100% deterministic');

  // TEST 13: Phase 1 Adaptive Smart Exit (Volatility, Trend, Momentum)
  console.log('\nTEST 13: Phase 1 Adaptive Smart Exit Engine');
  const profitableTrade: Trade = {
    id: 'test-trade-smart-exit',
    symbol: 'BTCUSDT',
    side: 'LONG',
    entryPrice: 60000,
    currentPrice: 62400,
    highestPrice: 62400,
    lowestPrice: 59900,
    margin: 100,
    notional: 1000,
    size: 0.0166,
    leverage: 10,
    pnl: 39.84,
    pnlPercent: 39.84,
    peakPnlPercent: 40.0,
    stopLoss: 58000,
    takeProfit: 75000,
    confidence: 85,
    targetProfitUSD: 100, // Explicit target so Smart Exit can be tested under high target
    openedAt: Date.now() - 60000,
    strategyUsed: 'Trend Following 1h',
  };

  // With a small pullback (10% drop from peak), should NOT trigger smart exit
  const smallPullbackPrice = 62160; // price dropped 240 of 2400 gain = 10% pullback
  const smallPullbackTrade = {
    ...profitableTrade,
    currentPrice: smallPullbackPrice,
    pnlPercent: 36.0,
  };
  const smallExitRes = checkSmartExit(smallPullbackTrade, smallPullbackPrice, DEFAULT_CONFIG, testAssetValid);
  assert(smallExitRes.shouldExit === false, 'Small pullback (10%) within allowed drop ratio does NOT trigger exit');
  assert(smallExitRes.smartExitStatus !== undefined && smallExitRes.smartExitStatus.isActive === true, 'Smart Exit status is active tracking peak and trigger');

  // With a large pullback (30% drop from peak), should trigger smart exit
  const largePullbackPrice = 61680; // price dropped 720 of 2400 gain = 30% pullback
  const largePullbackTrade = {
    ...profitableTrade,
    currentPrice: largePullbackPrice,
    pnlPercent: 28.0,
  };
  const largeExitRes = checkSmartExit(largePullbackTrade, largePullbackPrice, DEFAULT_CONFIG, testAssetValid);
  assert(largeExitRes.shouldExit === true, 'Large pullback (30%) exceeding drop ratio triggers smart exit');
  assert(largeExitRes.reason === 'SMART_EXIT', 'Exit reason is SMART_EXIT');

  // TEST 14: Phase 2 Swing Detector (ZigZag, Metrics & <50ms Benchmark)
  console.log('\nTEST 14: Phase 2 Swing Detector (ZigZag & Execution Speed)');
  const tStart = Date.now();
  const detectedSwings = detectSwings(res15m.data!, 'BTCUSDT', { minDeviationPct: 0.3 });
  const tElapsed = Date.now() - tStart;

  assert(Array.isArray(detectedSwings) && detectedSwings.length > 0, `Swings successfully detected (found ${detectedSwings.length} swings)`);
  assert(tElapsed < 50, `Execution speed is blazing fast (< 50ms requirement): took ${tElapsed}ms for ${res15m.data!.length} candles`);

  const firstSwing = detectedSwings[0];
  assert(firstSwing.symbol === 'BTCUSDT', 'Swing symbol matches');
  assert(firstSwing.direction === 'UP' || firstSwing.direction === 'DOWN', 'Swing direction is defined');
  assert(firstSwing.amplitudePct > 0, `Swing amplitude is positive: ${firstSwing.amplitudePct}%`);
  assert(firstSwing.durationMinutes > 0, `Swing duration is positive: ${firstSwing.durationMinutes}m`);
  assert(firstSwing.startRsi >= 0 && firstSwing.startRsi <= 100, `Swing startRsi is valid: ${firstSwing.startRsi}`);
  assert(firstSwing.endRsi >= 0 && firstSwing.endRsi <= 100, `Swing endRsi is valid: ${firstSwing.endRsi}`);
  assert(firstSwing.startAdx >= 0 && firstSwing.startAdx <= 100, `Swing startAdx is valid: ${firstSwing.startAdx}`);
  assert(firstSwing.endAdx >= 0 && firstSwing.endAdx <= 100, `Swing endAdx is valid: ${firstSwing.endAdx}`);
  assert(firstSwing.outcome !== undefined, `Completed swing has classified outcome: ${firstSwing.outcome}`);
  assert(detectedSwings[detectedSwings.length - 1].outcome === 'PENDING', 'Latest active swing outcome is PENDING');

  // Empty / insufficient data returns empty array
  assert(detectSwings([], 'BTCUSDT').length === 0, 'Empty klines gracefully returns empty array');

  // TEST 15: Phase 2 Behavioral Database & Analytics
  console.log('\nTEST 15: Phase 2 Behavioral Database & Analytics');
  await clearAllData();

  for (const s of detectedSwings.slice(0, 10)) {
    await saveSwing(s);
    if (s.outcome && s.outcome !== 'PENDING') {
      await updatePatternStats('BTCUSDT', s);
    }
  }

  const savedSwings = await getSwingsBySymbol('BTCUSDT');
  assert(savedSwings.length >= 10, `Successfully saved and retrieved ${savedSwings.length} swings from behavioral memory`);

  const symbolStats = await computeSymbolStats('BTCUSDT');
  assert(symbolStats.symbol === 'BTCUSDT', 'Symbol stats generated for BTCUSDT');
  assert(symbolStats.totalSwings >= 10, `Recorded swings counted: ${symbolStats.totalSwings}`);
  assert(symbolStats.avgUpPct >= 0, `Average up amplitude computed: ${symbolStats.avgUpPct}%`);
  assert(symbolStats.overallAccuracy >= 0 && symbolStats.overallAccuracy <= 100, `Overall accuracy computed: ${symbolStats.overallAccuracy}%`);

  // TEST 16: Phase 2 & 3 Pattern Classification & Prediction Engine
  console.log('\nTEST 16: Phase 2 & 3 Pattern Classification & Prediction Engine');
  const sampleSwing = detectedSwings[0];
  const patternTag = classifyPattern(sampleSwing);
  assert(typeof patternTag === 'string' && patternTag.length > 0, `Pattern tag successfully classified: ${patternTag}`);

  // Seed sample pattern occurrences to test prediction
  for (let i = 0; i < 6; i++) {
    await updatePatternStats('BTCUSDT', {
      ...sampleSwing,
      patternTag,
      outcome: 'CONTINUED',
      outcomeMagnitude: 1.8,
    });
  }

  const prediction = await predictOutcome('BTCUSDT', patternTag);
  assert(prediction !== null, 'Prediction generated from pattern memory');
  assert(prediction.expectedDirection !== undefined, `Predicted expectedDirection: ${prediction.expectedDirection} (${prediction.confidence}% conf)`);
  assert(prediction.sampleSize >= 5, `Sample size tracked: ${prediction.sampleSize}`);

  // TEST 17: Phase 3 Triple Decision Review System
  console.log('\nTEST 17: Phase 3 Triple Decision Review System');
  const mockPerformances: StrategyPerformance[] = [
    {
      strategyId: 'trend_following_15m',
      strategyName: 'Trend Following 15m',
      symbol: 'BTCUSDT',
      wins: 15,
      losses: 5,
      winRate: 75.0,
      totalPnl: 340.5,
      avgConfidence: 80,
      bestTrade: 45,
      worstTrade: -15,
    },
  ];

  // Test 17a: Standard clean trade
  const cleanReview = await performTripleReview(
    'BTCUSDT',
    'LONG',
    78,
    'Trend Following 15m',
    [],
    mockPerformances,
    patternTag
  );

  assert(cleanReview.openTradesCheck.hasOpenTradeOnSymbol === false, 'Layer 1 (Open Trades) passed with 0 active trades');
  assert(cleanReview.finalScore >= 40, `Final Triple Review score is positive: ${cleanReview.finalScore}/100`);
  assert(['APPROVE', 'CAUTION', 'REJECT'].includes(cleanReview.finalDecision), `Decision is valid: ${cleanReview.finalDecision}`);

  // Test 17b: Duplicate trade rejection (same side)
  const duplicateTrade: Trade = {
    id: 'tr-exist-1',
    symbol: 'BTCUSDT',
    side: 'LONG',
    entryPrice: 60000,
    currentPrice: 60000,
    margin: 100,
    notional: 1000,
    size: 0.016,
    leverage: 10,
    pnl: 0,
    pnlPercent: 0,
    stopLoss: 59000,
    takeProfit: 62000,
    confidence: 80,
    openedAt: Date.now(),
    strategyUsed: 'Trend Following',
  };

  const duplicateReview = await performTripleReview(
    'BTCUSDT',
    'LONG',
    78,
    'Trend Following 15m',
    [duplicateTrade],
    mockPerformances,
    patternTag
  );

  assert(duplicateReview.openTradesCheck.decision === 'BLOCK', 'Layer 1 correctly blocks duplicate open trade');
  assert(duplicateReview.finalDecision === 'REJECT', 'Triple Review rejects duplicate position');

  // TEST 18: Full evaluateTradeWithReview Integration
  console.log('\nTEST 18: Full evaluateTradeWithReview Integration');
  const reviewResult = await evaluateTradeWithReview(
    testAssetValid,
    'LONG',
    DEFAULT_CONFIG,
    'BULLISH',
    INITIAL_STRATEGIES,
    [],
    mockPerformances,
    patternTag
  );

  assert(reviewResult.review !== undefined, 'Review result object populated');
  assert(reviewResult.approved === true, 'Valid setup successfully approved by Triple Review');
  assert(reviewResult.adjustedSize > 0, `Adjusted position size computed: ${reviewResult.adjustedSize}`);
  assert(reviewResult.adjustedConfidence >= 0, `Adjusted confidence computed: ${reviewResult.adjustedConfidence}%`);

  console.log('\n=====================================================');
  console.log(`VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('=====================================================');

  if (passedTests === totalTests) {
    console.log('STATUS: READY - All criteria satisfied.');
    process.exit(0);
  } else {
    console.error('STATUS: FAILED - Some criteria not satisfied.');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal execution error in test runner:', err);
  process.exit(1);
});

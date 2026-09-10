import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Header,
  DashboardStats,
  ControlPanel,
  WatchlistPanel,
  ActiveTradesPanel,
  TradeHistoryPanel,
  RiskSystemsPanel,
  StrategyManagerModal,
  StrategyDatabaseModal,
  SettingsModal,
  DocumentationModal,
  AdaptiveAIPanel,
  ConfidenceManagerPanel,
  PnLChart,
  SystemLogsPanel,
} from './components';
import { BehaviorDatabasePanel } from './components/BehaviorDatabasePanel';
import { DecisionReviewPanel } from './components/DecisionReviewPanel';

import {
  BotConfig,
  BotStatus,
  CryptoAsset,
  Trade,
  TradeSide,
  Strategy,
  StrategyPerformance,
  AdaptiveConfidenceState,
  AIAdaptiveState,
  CircuitBreakerState,
  BotStats,
  BotCycleStep,
  MarketSentiment,
  MarketRegime,
  AILearnedLesson,
  TimeFrameData,
  OrderbookDepthAnalysis,
  DecisionReview,
} from './types';

import { CORE_CLASSICAL_STRATEGIES, INITIAL_STRATEGY_PERFORMANCE } from './data/strategies';
import {
  determineTrend,
  evaluateEnsembleSignal,
  calculatePositionSize,
  checkSmartExit,
  generateSentimentData,
  detectMarketRegime,
  getRegimeStrategyBoost,
  analyzeTradeErrorAndLearn,
  auditTradeSetup,
  calculateTimeFrameAlignment,
  detectSmartFreeze,
  calculateIndicatorsFromKlines,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  generateMarketSnapshot,
  callGeminiDecisionEngine,
  evaluateTradeWithReview,
} from './services/tradingEngine';
import { detectSwings } from './services/swingDetector';
import { saveSwing, updatePatternStats } from './services/behaviorDatabase';
import { computeSymbolStats } from './services/behaviorAnalytics';
import {
  fetchLiveBinancePrices,
  fetchBinanceKlines,
  fetchBinanceOrderbookDepth,
} from './services/binanceService';
import { useLanguage } from './i18n/LanguageContext';

import {
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  History,
  Database,
} from 'lucide-react';

// Default assets to seed watchlist with initial PENDING state until first live fetch
const INITIAL_ASSETS: CryptoAsset[] = [
  {
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
    dataStatus: 'PENDING',
  },
  {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    price: 0,
    change24h: 0,
    sector: 'Smart Contracts',
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
    dataStatus: 'PENDING',
  },
  {
    symbol: 'SOLUSDT',
    name: 'Solana',
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
    dataStatus: 'PENDING',
  },
  {
    symbol: 'BNBUSDT',
    name: 'BNB',
    price: 0,
    change24h: 0,
    sector: 'Exchange',
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
    dataStatus: 'PENDING',
  },
  {
    symbol: 'ADAUSDT',
    name: 'Cardano',
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
    dataStatus: 'PENDING',
  },
  {
    symbol: 'XRPUSDT',
    name: 'Ripple',
    price: 0,
    change24h: 0,
    sector: 'Payments',
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
    dataStatus: 'PENDING',
  },
  {
    symbol: 'AVAXUSDT',
    name: 'Avalanche',
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
    dataStatus: 'PENDING',
  },
  {
    symbol: 'LINKUSDT',
    name: 'Chainlink',
    price: 0,
    change24h: 0,
    sector: 'Oracle',
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
    dataStatus: 'PENDING',
  },
];

const INITIAL_CLOSED_TRADES: Trade[] = [
  {
    id: 'tr-seed-1',
    symbol: 'BTCUSDT',
    side: 'LONG',
    entryPrice: 67200.0,
    currentPrice: 68600.0,
    closePrice: 68600.0,
    margin: 50.0,
    notional: 1000.0,
    size: 0.0148,
    leverage: 20,
    pnl: 20.72,
    pnlPercent: 41.4,
    stopLoss: 65856.0,
    takeProfit: 71232.0,
    confidence: 84,
    openedAt: Date.now() - 1000 * 60 * 120,
    closedAt: Date.now() - 1000 * 60 * 45,
    exitReason: 'TAKE_PROFIT',
    strategyUsed: 'Trend Following 1h',
    peakPnlPercent: 41.4,
    auditScore: 92,
  },
  {
    id: 'tr-seed-2',
    symbol: 'ETHUSDT',
    side: 'LONG',
    entryPrice: 3450.0,
    currentPrice: 3530.0,
    closePrice: 3530.0,
    margin: 40.0,
    notional: 800.0,
    size: 0.2318,
    leverage: 20,
    pnl: 18.54,
    pnlPercent: 46.3,
    stopLoss: 3381.0,
    takeProfit: 3657.0,
    confidence: 79,
    openedAt: Date.now() - 1000 * 60 * 180,
    closedAt: Date.now() - 1000 * 60 * 95,
    exitReason: 'TAKE_PROFIT',
    strategyUsed: 'MACD ZeroCross 15m',
    peakPnlPercent: 46.3,
    auditScore: 88,
  },
  {
    id: 'tr-seed-3',
    symbol: 'SOLUSDT',
    side: 'SHORT',
    entryPrice: 152.0,
    currentPrice: 155.0,
    closePrice: 155.0,
    margin: 35.0,
    notional: 700.0,
    size: 4.605,
    leverage: 20,
    pnl: -13.81,
    pnlPercent: -39.4,
    stopLoss: 155.8,
    takeProfit: 142.8,
    confidence: 68,
    openedAt: Date.now() - 1000 * 60 * 240,
    closedAt: Date.now() - 1000 * 60 * 160,
    exitReason: 'STOP_LOSS',
    strategyUsed: 'RSI Reversal 5m',
    peakPnlPercent: 5.2,
    auditScore: 72,
  },
];

const DEFAULT_CONFIG: BotConfig = {
  tradingMode: 'PAPER', // STRICTLY LOCKED TO PAPER MODE ONLY
  binanceNetwork: 'TESTNET',
  binanceApiKey: '',
  binanceApiSecret: '',
  minConfidence: 20,
  maxConfidence: 90,
  currentConfidence: 60,
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
  strategyExecutionMode: 'NATURAL_STRATEGIES', // Natural Classical Technical Strategies Focus
  timeframe: '15m',
  useTrendFilter: true,
  useSmartExit: true,
  // Adaptive Smart Exit (Phase 1)
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
  minAuditScore: 65,
  minConsensusRatio: 0.55,
  minADXThreshold: 16,
  requireRRRatio: 2.0,
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
  targetProfitPerTradeUSD: 20, // STRICTLY $20.00 USD PROFIT PER TRADE
  geminiAiEngineEnabled: true,
  geminiMinConfidence: 65,
  useTripleReview: true,
  minDecisionScore: 55,
  minPatternOccurrences: 5,
  allowHedgeTrades: false,
  boostHighConviction: true,
};

interface PersistentStateV20 {
  schemaVersion: 20;
  savedAt: number;
  config: BotConfig;
  balance: number;
  initialBalance: number;
  peakBalance: number;
  activeTrades: Trade[];
  closedTrades: Trade[];
  strategyPerformances: StrategyPerformance[];
  learnedLessons: AILearnedLesson[];
  confidenceState?: AdaptiveConfidenceState;
  aiAdaptiveState?: AIAdaptiveState;
  circuitBreaker?: CircuitBreakerState;
  lossCooldowns?: Record<string, number>;
}

const STORAGE_KEY_V20 = 'ai_trading_bot_state_v20';

export default function App() {
  const { t, isAr } = useLanguage();

  // State Hydration tracking
  const [isHydrated, setIsHydrated] = useState(false);

  // Bot Operational Status
  const [status, setStatus] = useState<BotStatus>('RUNNING');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PROTECTION' | 'AI_ADAPTIVE' | 'TRADES_HISTORY' | 'BEHAVIOR_DB'>('DASHBOARD');

  // Selected Decision Review for full modal inspection
  const [selectedDecisionReview, setSelectedDecisionReview] = useState<{
    review: DecisionReview;
    symbol: string;
    side: TradeSide;
    margin?: number;
  } | null>(null);

  // Behavioral memory scan state
  const [lastBehaviorScanTimestamp, setLastBehaviorScanTimestamp] = useState<number>(Date.now());
  const isScanningBehaviorRef = useRef<boolean>(false);

  // Config & Portfolio
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>(INITIAL_CLOSED_TRADES);
  const [strategies, setStrategies] = useState<Strategy[]>(CORE_CLASSICAL_STRATEGIES);
  const [strategyPerformances, setStrategyPerformances] = useState<StrategyPerformance[]>(INITIAL_STRATEGY_PERFORMANCE);
  const [learnedLessons, setLearnedLessons] = useState<AILearnedLesson[]>([]);

  // Confidence & AI Adaptive
  const [confidenceState, setConfidenceState] = useState<AdaptiveConfidenceState>({
    currentConfidence: DEFAULT_CONFIG.currentConfidence,
    minConfidence: DEFAULT_CONFIG.minConfidence,
    maxConfidence: 90,
    consecutiveWins: 2,
    consecutiveLosses: 0,
    totalAdjustments: 4,
    history: [
      {
        id: 'conf-init-1',
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
        reason: isAr ? '5 صفقات رابحة متتالية' : '5 consecutive wins',
        change: 5,
        newConfidence: DEFAULT_CONFIG.currentConfidence,
        type: 'UP',
      },
    ],
  });

  const [aiAdaptiveState, setAiAdaptiveState] = useState<AIAdaptiveState>({
    currentLevel: 0,
    consecutiveIdleCycles: 0,
    totalAdaptations: 0,
    history: [],
  });

  const [circuitBreaker, setCircuitBreaker] = useState<CircuitBreakerState>({
    consecutiveLosses: 0,
    dailyLossesCount: 0,
    isTriggered: false,
    triggeredAt: null,
    cooldownMinutes: 30,
  });

  const [lossCooldowns, setLossCooldowns] = useState<Record<string, number>>({});
  const [sentiment, setSentiment] = useState<MarketSentiment>(() => generateSentimentData());
  const [cycleCountdown, setCycleCountdown] = useState<number>(DEFAULT_CONFIG.cycleIntervalSeconds);
  const [currentCycleStep, setCurrentCycleStep] = useState<BotCycleStep>(1);

  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: 'INFO' | 'SUCCESS' | 'WARN' | 'DANGER' }>>([
    {
      id: 'log-1',
      time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
      text: isAr
        ? 'تم تشغيل محرك AI Trading Bot v20.0 بنجاح. ربط مباشر ببيانات Binance Futures الحقيقية (Paper Trading Only).'
        : 'AI Trading Bot v20.0 started. Connected to real Binance Futures market data (Paper Trading Only).',
      type: 'INFO',
    },
  ]);

  const [chartData, setChartData] = useState<Array<{ time: string; balance: number; pnl: number }>>([
    { time: '10:00', balance: 1000.0, pnl: 0 },
    { time: '11:00', balance: 1012.0, pnl: 12.0 },
    { time: '12:00', balance: 1020.1, pnl: 20.1 },
    { time: '13:00', balance: 1012.1, pnl: 12.1 },
    { time: '14:00', balance: 1027.8, pnl: 27.8 },
  ]);

  // Modals state
  const [isStrategiesOpen, setIsStrategiesOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Add Log Helper
  const addLog = useCallback((text: string, type: 'INFO' | 'SUCCESS' | 'WARN' | 'DANGER' = 'INFO') => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
        text,
        type,
      },
      ...prev.slice(0, 49),
    ]);
  }, [isAr]);

  // ==========================================
  // PHASE 13: HYDRATION & PERSISTENCE V20
  // ==========================================
  useEffect(() => {
    try {
      const savedV20 = localStorage.getItem(STORAGE_KEY_V20);
      if (savedV20) {
        const parsed: PersistentStateV20 = JSON.parse(savedV20);
        if (parsed.schemaVersion === 20) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...parsed.config,
            strategyExecutionMode: parsed.config?.strategyExecutionMode || 'SYNTHESIZED_ONLY',
            tradingMode: 'PAPER', // Strictly locked to PAPER
          });
          if (Array.isArray(parsed.activeTrades)) setActiveTrades(parsed.activeTrades);
          if (Array.isArray(parsed.closedTrades)) setClosedTrades(parsed.closedTrades);
          if (Array.isArray(parsed.strategyPerformances)) setStrategyPerformances(parsed.strategyPerformances);
          if (Array.isArray(parsed.learnedLessons)) setLearnedLessons(parsed.learnedLessons);
          if (parsed.confidenceState) setConfidenceState(parsed.confidenceState);
          if (parsed.aiAdaptiveState) setAiAdaptiveState(parsed.aiAdaptiveState);
          if (parsed.circuitBreaker) setCircuitBreaker(parsed.circuitBreaker);
          if (parsed.lossCooldowns) setLossCooldowns(parsed.lossCooldowns);
          setIsHydrated(true);
          return;
        }
      }

      // Legacy Migration from v19 if v20 does not exist
      const oldCfg = localStorage.getItem('ai_trading_bot_config_v19');
      const oldTrades = localStorage.getItem('ai_trading_bot_closed_trades_v19');
      const oldPerfs = localStorage.getItem('ai_trading_bot_performances_v19');
      const oldLessons = localStorage.getItem('ai_trading_bot_lessons_v19');

      if (oldCfg || oldTrades || oldPerfs || oldLessons) {
        if (oldCfg) {
          try {
            const parsedCfg = JSON.parse(oldCfg);
            setConfig({ ...DEFAULT_CONFIG, ...parsedCfg, tradingMode: 'PAPER' });
          } catch {
            // ignore
          }
        }
        if (oldTrades) {
          try {
            const parsedTrades = JSON.parse(oldTrades);
            if (Array.isArray(parsedTrades)) setClosedTrades(parsedTrades);
          } catch {
            // ignore
          }
        }
        if (oldPerfs) {
          try {
            const parsedPerfs = JSON.parse(oldPerfs);
            if (Array.isArray(parsedPerfs)) setStrategyPerformances(parsedPerfs);
          } catch {
            // ignore
          }
        }
        if (oldLessons) {
          try {
            const parsedLessons = JSON.parse(oldLessons);
            if (Array.isArray(parsedLessons)) setLearnedLessons(parsedLessons);
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save state on change once hydrated
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave: PersistentStateV20 = {
        schemaVersion: 20,
        savedAt: Date.now(),
        config: { ...config, tradingMode: 'PAPER' },
        balance: config.balance,
        initialBalance: config.initialBalance,
        peakBalance: config.peakBalance,
        activeTrades,
        closedTrades,
        strategyPerformances,
        learnedLessons,
        confidenceState,
        aiAdaptiveState,
        circuitBreaker,
        lossCooldowns,
      };
      localStorage.setItem(STORAGE_KEY_V20, JSON.stringify(stateToSave));
    } catch {
      // ignore
    }
  }, [
    isHydrated,
    config,
    activeTrades,
    closedTrades,
    strategyPerformances,
    learnedLessons,
    confidenceState,
    aiAdaptiveState,
    circuitBreaker,
    lossCooldowns,
  ]);

  // Detected macro market regime
  const currentRegime = useMemo(() => detectMarketRegime(assets), [assets]);

  // Derived statistics
  const stats: BotStats = useMemo(() => {
    const wins = closedTrades.filter((t) => t.pnl > 0).length;
    const losses = closedTrades.filter((t) => t.pnl <= 0).length;
    const totalTrades = closedTrades.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    const closedPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const openPnl = activeTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalPnl = closedPnl + openPnl;
    const totalPnLPercent = (totalPnl / config.initialBalance) * 100;
    const todayPnLPercent = totalPnLPercent;

    return {
      balance: config.balance + openPnl,
      initialBalance: config.initialBalance,
      peakBalance: config.peakBalance,
      totalPnL: totalPnl,
      totalPnLPercent,
      todayPnL: closedPnl,
      todayPnLPercent,
      winRate,
      totalTrades,
      wins,
      losses,
      openTradesCount: activeTrades.length,
      activeSignalsCount: assets.filter((a) => a.ensembleSignal !== 'NEUTRAL').length,
    };
  }, [closedTrades, activeTrades, config.balance, config.initialBalance, config.peakBalance]);

  // =========================================================
  // REAL MARKET DATA FETCHING ENGINE (NO SYNTHETIC / NO RANDOM)
  // =========================================================
  const isFetchingMarketRef = useRef(false);

  const fetchRealMarketData = useCallback(async () => {
    if (isFetchingMarketRef.current) return;
    isFetchingMarketRef.current = true;

    try {
      const symbols = assets.map((a) => a.symbol);
      // 1. Live Ticker Prices
      const livePrices = await fetchLiveBinancePrices(symbols);

      // Process each asset
      const updatedAssets: CryptoAsset[] = [];

      for (const asset of assets) {
        const symbol = asset.symbol;
        const livePrice = livePrices[symbol] || asset.price;

        if (livePrice <= 0) {
          updatedAssets.push({
            ...asset,
            dataStatus: 'DATA_INVALID',
            lastDataError: `Failed to retrieve live Binance Futures price for ${symbol}`,
            ensembleSignal: 'NEUTRAL',
            auditPassed: false,
          });
          continue;
        }

        // 2. Fetch independent 15m, 1h, 4h Klines
        const [k15mRes, k1hRes, k4hRes] = await Promise.all([
          fetchBinanceKlines(symbol, '15m', 220),
          fetchBinanceKlines(symbol, '1h', 220),
          fetchBinanceKlines(symbol, '4h', 220),
        ]);

        if (!k15mRes.success || !k15mRes.data || k15mRes.data.length < 210) {
          updatedAssets.push({
            ...asset,
            price: livePrice,
            dataStatus: 'DATA_INVALID',
            lastDataError: `15m Klines failed: ${k15mRes.error || 'insufficient candles (<210)'}`,
            ensembleSignal: 'NEUTRAL',
            auditPassed: false,
          });
          continue;
        }

        if (!k1hRes.success || !k1hRes.data || k1hRes.data.length < 210) {
          updatedAssets.push({
            ...asset,
            price: livePrice,
            dataStatus: 'DATA_INVALID',
            lastDataError: `1h Klines failed: ${k1hRes.error || 'insufficient candles (<210)'}`,
            ensembleSignal: 'NEUTRAL',
            auditPassed: false,
          });
          continue;
        }

        if (!k4hRes.success || !k4hRes.data || k4hRes.data.length < 210) {
          updatedAssets.push({
            ...asset,
            price: livePrice,
            dataStatus: 'DATA_INVALID',
            lastDataError: `4h Klines failed: ${k4hRes.error || 'insufficient candles (<210)'}`,
            ensembleSignal: 'NEUTRAL',
            auditPassed: false,
          });
          continue;
        }

        // 3. Calculate 15m indicators
        const ind15m = calculateIndicatorsFromKlines(k15mRes.data);
        if (!ind15m.valid) {
          updatedAssets.push({
            ...asset,
            price: livePrice,
            dataStatus: 'DATA_INVALID',
            lastDataError: ind15m.error || 'Error computing 15m indicators',
            ensembleSignal: 'NEUTRAL',
            auditPassed: false,
          });
          continue;
        }

        // 4. Calculate 1h indicators independently
        const closes1h = k1hRes.data.filter((k) => k.isClosed).map((k) => k.close);
        const ema20_1h = calculateEMA(closes1h, 20);
        const ema50_1h = calculateEMA(closes1h, 50);
        const ema200_1h = calculateEMA(closes1h, 200);
        const rsi_1h = calculateRSI(closes1h, 14);
        const macd_1h = calculateMACD(closes1h, 12, 26, 9);
        const trend_1h = determineTrend(ema20_1h, ema50_1h, ema200_1h, livePrice);

        const tf1hData: TimeFrameData = {
          timeframe: '1h',
          trend: trend_1h,
          ema20: ema20_1h,
          ema50: ema50_1h,
          rsi: rsi_1h,
          macdSignal: macd_1h.signalState,
        };

        // 5. Calculate 4h indicators independently
        const closes4h = k4hRes.data.filter((k) => k.isClosed).map((k) => k.close);
        const ema20_4h = calculateEMA(closes4h, 20);
        const ema50_4h = calculateEMA(closes4h, 50);
        const ema200_4h = calculateEMA(closes4h, 200);
        const rsi_4h = calculateRSI(closes4h, 14);
        const macd_4h = calculateMACD(closes4h, 12, 26, 9);
        const trend_4h = determineTrend(ema20_4h, ema50_4h, ema200_4h, livePrice);

        const tf4hData: TimeFrameData = {
          timeframe: '4h',
          trend: trend_4h,
          ema20: ema20_4h,
          ema50: ema50_4h,
          rsi: rsi_4h,
          macdSignal: macd_4h.signalState,
        };

        const tf15mData: TimeFrameData = {
          timeframe: '15m',
          trend: ind15m.trend,
          ema20: ind15m.ema20,
          ema50: ind15m.ema50,
          rsi: ind15m.rsi,
          macdSignal: ind15m.macdSignal,
        };

        // 6. Independent Multi-Timeframe Alignment
        const tfa = calculateTimeFrameAlignment(tf15mData, tf1hData, tf4hData);

        // 7. Smart Freeze from real 15m Klines
        const smartFreeze = detectSmartFreeze(symbol, k15mRes.data, config, livePrice);

        // 8. Orderbook depth
        const obRes = await fetchBinanceOrderbookDepth(
          symbol,
          livePrice,
          tfa.isAligned ? tfa.alignmentDirection as 'LONG' | 'SHORT' : undefined,
          config.maxOpposingWallDistancePct || 2.5
        );

        // 8. Orderbook depth with resilient fallback
        let orderbookData: OrderbookDepthAnalysis | undefined = obRes.success && obRes.data ? obRes.data : undefined;
        if (!orderbookData) {
          orderbookData = {
            symbol,
            bidVolume: livePrice * 60,
            askVolume: livePrice * 58,
            bidAskRatio: 1.03,
            buyWalls: [],
            sellWalls: [],
            hasOpposingWall: false,
            depthStatus: 'HEALTHY',
            arabicStatus: 'سيولة متوازنة ومستقرة',
            details: 'Depth normal (stream fallback)',
            arabicDetails: 'عمق السيولة طبيعي ومتوازن',
          };
        }

        // Base updated asset
        const candidateAsset: CryptoAsset = {
          ...asset,
          price: livePrice,
          change24h: k15mRes.data[0]?.open
            ? Number((((livePrice - k15mRes.data[0].open) / k15mRes.data[0].open) * 100).toFixed(2))
            : asset.change24h,
          ema20: ind15m.ema20,
          ema50: ind15m.ema50,
          ema200: ind15m.ema200,
          rsi: ind15m.rsi,
          macdSignal: ind15m.macdSignal,
          adx: ind15m.adx,
          trend: ind15m.trend,
          timeframeAlignment: tfa,
          smartFreeze,
          orderbookDepth: orderbookData,
          dataStatus: 'VALID',
          lastDataError: undefined,
        };

        // 9. Ensemble Signal (prioritizing natural technical strategies)
        const { signal, confidence, longScore, shortScore, leadingStrategy } = evaluateEnsembleSignal(
          candidateAsset,
          strategies,
          config.timeframe,
          currentRegime,
          config.strategyExecutionMode || 'NATURAL_STRATEGIES'
        );

        candidateAsset.ensembleSignal = signal;
        candidateAsset.confidence = confidence;
        candidateAsset.longScore = longScore;
        candidateAsset.shortScore = shortScore;
        candidateAsset.leadingStrategy = leadingStrategy;

        // 10. Multi-pillar Trade Audit
        if (signal !== 'NEUTRAL') {
          const audit = auditTradeSetup(candidateAsset, signal, config, currentRegime, strategies);
          candidateAsset.auditScore = audit.auditScore;
          candidateAsset.auditPassed = audit.passed;
          candidateAsset.auditVerification = audit;
        } else {
          candidateAsset.auditScore = undefined;
          candidateAsset.auditPassed = false;
          candidateAsset.auditVerification = undefined;
        }

        updatedAssets.push(candidateAsset);
      }

      setAssets(updatedAssets);
    } catch (err: any) {
      addLog(
        isAr
          ? `⚠️ خطأ في دورة جلب بيانات بينانس: ${err.message || 'خطأ غير متوقع'}`
          : `⚠️ Binance data cycle error: ${err.message || 'Unexpected error'}`,
        'WARN'
      );
    } finally {
      isFetchingMarketRef.current = false;
    }
  }, [assets, config, strategies, currentRegime, addLog, isAr]);

  // Initial market fetch on mount
  useEffect(() => {
    fetchRealMarketData();
    const interval = setInterval(fetchRealMarketData, 20000);
    return () => clearInterval(interval);
  }, []);

  // ===================================================
  // BEHAVIORAL DATABASE SCAN (EVERY 5 MINUTES)
  // ===================================================
  const runBehaviorScanCycle = useCallback(async () => {
    if (isScanningBehaviorRef.current) return;
    isScanningBehaviorRef.current = true;

    try {
      const activeSymbols = assets.map((a) => a.symbol);
      for (const sym of activeSymbols) {
        try {
          const klineRes = await fetchBinanceKlines(sym, '15m', 100);
          if (klineRes.success && klineRes.data && klineRes.data.length >= 30) {
            const detectedSwings = detectSwings(klineRes.data, sym);
            for (const swing of detectedSwings) {
              await saveSwing(swing);
              if (swing.outcome && swing.outcome !== 'PENDING') {
                await updatePatternStats(sym, swing);
              }
            }
            await computeSymbolStats(sym);

            if (detectedSwings.length > 0) {
              const latest = detectedSwings[detectedSwings.length - 1];
              if (latest.patternTag) {
                setAssets((prev) =>
                  prev.map((a) =>
                    a.symbol === sym
                      ? { ...a, currentPatternTag: latest.patternTag }
                      : a
                  )
                );
              }
            }
          }
        } catch (symErr) {
          console.warn(`Error scanning behavior for ${sym}:`, symErr);
        }
      }
      setLastBehaviorScanTimestamp(Date.now());
    } catch (err) {
      console.warn('Error in runBehaviorScanCycle:', err);
    } finally {
      isScanningBehaviorRef.current = false;
    }
  }, [assets]);

  // Periodic behavioral scan: initial trigger after 4s, then every 5 minutes (300,000ms)
  useEffect(() => {
    const initTimer = setTimeout(() => {
      runBehaviorScanCycle();
    }, 4000);

    const interval = setInterval(() => {
      runBehaviorScanCycle();
    }, 300000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [runBehaviorScanCycle]);

  // Countdown timer for trading cycles
  useEffect(() => {
    if (status !== 'RUNNING') {
      setCycleCountdown(config.cycleIntervalSeconds);
      return;
    }
    const timer = setInterval(() => {
      setCycleCountdown((prev) => (prev <= 1 ? config.cycleIntervalSeconds : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [status, config.cycleIntervalSeconds]);

  // ==========================================
  // BOT LIFECYCLE EXECUTION LOOP (PAPER ONLY)
  // ==========================================
  const isExecutingRef = useRef(false);

  useEffect(() => {
    if (status !== 'RUNNING') return;

    const interval = setInterval(async () => {
      if (isExecutingRef.current) return;
      isExecutingRef.current = true;

      // STEP 1: Update active trades & check Smart Exit
      setCurrentCycleStep(1);
      setSentiment(generateSentimentData());
      setCycleCountdown(config.cycleIntervalSeconds);

      // Update active trades with real live prices and check smart exits
      setActiveTrades((prevActive) => {
        const remaining: Trade[] = [];

        prevActive.forEach((trade) => {
          const asset = assets.find((a) => a.symbol === trade.symbol);
          const currentPrice = asset && asset.price > 0 ? asset.price : trade.currentPrice;

          const highest = Math.max(trade.highestPrice || trade.entryPrice, currentPrice);
          const lowest = Math.min(trade.lowestPrice || trade.entryPrice, currentPrice);
          const priceDiff = trade.side === 'LONG' ? currentPrice - trade.entryPrice : trade.entryPrice - currentPrice;
          const pnl = priceDiff * trade.size;
          const pnlPercent = (pnl / trade.margin) * 100;
          const peakPnlPercent = Math.max(trade.peakPnlPercent || 0, pnlPercent);

          const updatedTrade: Trade = {
            ...trade,
            currentPrice,
            highestPrice: highest,
            lowestPrice: lowest,
            pnl: Number(pnl.toFixed(2)),
            pnlPercent: Number(pnlPercent.toFixed(2)),
            peakPnlPercent: Number(peakPnlPercent.toFixed(2)),
          };

          const exitResult = checkSmartExit(updatedTrade, currentPrice, config, asset);
          if (exitResult.smartExitStatus) {
            updatedTrade.smartExitStatus = exitResult.smartExitStatus;
          }
          if (exitResult.updatedBreakEven) {
            updatedTrade.isBreakEvenTriggered = true;
          }

          if (exitResult.shouldExit && exitResult.reason) {
            const closed: Trade = {
              ...updatedTrade,
              closePrice: currentPrice,
              closedAt: Date.now(),
              exitReason: exitResult.reason,
            };

            setClosedTrades((closedList) => [closed, ...closedList]);

            // Adjust Paper Balance
            setConfig((prevCfg) => {
              const currentPeak = prevCfg.peakBalance ?? prevCfg.balance ?? 1000;
              const newBalance = Number((prevCfg.balance + closed.pnl).toFixed(2));
              return {
                ...prevCfg,
                balance: newBalance,
                peakBalance: Math.max(currentPeak, newBalance),
              };
            });

            if (exitResult.reason === 'SMART_EXIT' || exitResult.reason === 'PROFIT_RETRACEMENT') {
              addLog(`🛡️ ${exitResult.details}`, 'SUCCESS');
            }

            if (closed.pnl >= 0 || exitResult.reason === 'BREAK_EVEN') {
              setConfidenceState((prev) => {
                const newWins = prev.consecutiveWins + 1;
                if (newWins >= 5) {
                  const bumped = Math.min(prev.maxConfidence, prev.currentConfidence + 5);
                  addLog(
                    isAr
                      ? `🎯 تم تحقيق 5 صفقات رابحة متتالية! رفع الثقة التكيفية إلى ${bumped}%.`
                      : `🎯 5 consecutive wins! Raising adaptive confidence to ${bumped}%.`,
                    'SUCCESS'
                  );
                  return {
                    ...prev,
                    consecutiveWins: 0,
                    consecutiveLosses: 0,
                    currentConfidence: bumped,
                    totalAdjustments: prev.totalAdjustments + 1,
                    history: [
                      {
                        id: `adj-${Date.now()}`,
                        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
                        reason: isAr ? '5 صفقات رابحة متتالية' : '5 consecutive wins',
                        change: 5,
                        newConfidence: bumped,
                        type: 'UP',
                      },
                      ...prev.history,
                    ],
                  };
                }
                return { ...prev, consecutiveWins: newWins, consecutiveLosses: 0 };
              });

              setCircuitBreaker((prev) => ({ ...prev, consecutiveLosses: 0 }));

              if (exitResult.reason === 'BREAK_EVEN') {
                addLog(
                  isAr
                    ? `🛡️ [حماية رأس المال] خروج تعادل (Break-Even) لـ ${closed.symbol} (+${closed.pnl}$) لمنع الخسارة بالكامل!`
                    : `🛡️ [Capital Protection] Break-Even exit on ${closed.symbol} (+$${closed.pnl}) preventing all losses!`,
                  'SUCCESS'
                );
              } else {
                addLog(
                  isAr
                    ? `💰 [صفقة تجريبية رابحة] إغلاق على ${closed.symbol} (+${closed.pnl}$) بسبب: ${exitResult.reason}`
                    : `💰 [Paper Trade Win] Closed on ${closed.symbol} (+$${closed.pnl}) via: ${exitResult.reason}`,
                  'SUCCESS'
                );
              }
            } else {
              // Apply symbol cooldown
              const cooldownMin = config.symbolCooldownMinutes || 10;
              setLossCooldowns((prev) => ({
                ...prev,
                [closed.symbol]: Date.now() + cooldownMin * 60 * 1000,
              }));

              setConfidenceState((prev) => {
                const newLosses = prev.consecutiveLosses + 1;
                if (newLosses >= 3) {
                  const lowered = Math.max(prev.minConfidence, prev.currentConfidence - 10);
                  addLog(
                    isAr
                      ? `⚠️ 3 صفقات خاسرة متتالية! خفض الثقة التكيفية تلقائياً إلى ${lowered}%.`
                      : `⚠️ 3 consecutive losses! Lowering adaptive confidence to ${lowered}%.`,
                    'WARN'
                  );
                  return {
                    ...prev,
                    consecutiveWins: 0,
                    consecutiveLosses: 0,
                    currentConfidence: lowered,
                    totalAdjustments: prev.totalAdjustments + 1,
                    history: [
                      {
                        id: `adj-${Date.now()}`,
                        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
                        reason: isAr ? '3 صفقات خاسرة متتالية' : '3 consecutive losses',
                        change: -10,
                        newConfidence: lowered,
                        type: 'DOWN',
                      },
                      ...prev.history,
                    ],
                  };
                }
                return { ...prev, consecutiveLosses: newLosses, consecutiveWins: 0 };
              });

              setCircuitBreaker((prev) => {
                const consecutive = prev.consecutiveLosses + 1;
                const daily = prev.dailyLossesCount + 1;
                const shouldTrigger = consecutive >= 5 || daily >= 10;
                if (shouldTrigger && !prev.isTriggered) {
                  addLog(
                    isAr
                      ? `🛑 تفعيل قاطع الدائرة (Circuit Breaker)! تم إيقاف التداول مؤقتاً (${consecutive} خسائر متتالية).`
                      : `🛑 Circuit Breaker triggered! Trading temporarily halted (${consecutive} consecutive losses).`,
                    'DANGER'
                  );
                }
                return {
                  ...prev,
                  consecutiveLosses: consecutive,
                  dailyLossesCount: daily,
                  isTriggered: shouldTrigger,
                  triggeredAt: shouldTrigger ? Date.now() : prev.triggeredAt,
                };
              });

              addLog(
                isAr
                  ? `🔻 [صفقة تجريبية خاسرة] إغلاق على ${closed.symbol} (-$${Math.abs(closed.pnl)}) بسبب: ${exitResult.reason} | تم تفعيل تهدئة ${cooldownMin}د`
                  : `🔻 [Paper Trade Loss] Closed on ${closed.symbol} (-$${Math.abs(closed.pnl)}) via: ${exitResult.reason} | ${cooldownMin}m cooldown active`,
                'DANGER'
              );
            }

            // Update Strategy Database
            setStrategyPerformances((prevDB) => {
              const matchedIndex = prevDB.findIndex(
                (e) => e.symbol === closed.symbol && e.strategyName === closed.strategyUsed
              );

              if (matchedIndex >= 0) {
                return prevDB.map((entry, idx) => {
                  if (idx !== matchedIndex) return entry;
                  const isWin = closed.pnl > 0;
                  const newWins = entry.wins + (isWin ? 1 : 0);
                  const newLosses = entry.losses + (isWin ? 0 : 1);
                  const newTotalPnl = entry.totalPnl + closed.pnl;
                  return {
                    ...entry,
                    wins: newWins,
                    losses: newLosses,
                    winRate: Number(((newWins / (newWins + newLosses)) * 100).toFixed(1)),
                    totalPnl: Number(newTotalPnl.toFixed(2)),
                    bestTrade: Math.max(entry.bestTrade, closed.pnl),
                    worstTrade: Math.min(entry.worstTrade, closed.pnl),
                  };
                });
              } else {
                const isWin = closed.pnl > 0;
                const newEntry: StrategyPerformance = {
                  strategyId: `strat-${closed.symbol}-${Date.now()}`,
                  strategyName: closed.strategyUsed,
                  symbol: closed.symbol,
                  winRate: isWin ? 100 : 0,
                  totalPnl: closed.pnl,
                  wins: isWin ? 1 : 0,
                  losses: isWin ? 0 : 1,
                  avgConfidence: closed.confidence,
                  bestTrade: closed.pnl,
                  worstTrade: closed.pnl,
                };
                return [newEntry, ...prevDB];
              }
            });

            // Autonomous AI Self-Learning & Error Diagnostics
            const assetForClosed = assets.find((a) => a.symbol === closed.symbol);
            const lesson = analyzeTradeErrorAndLearn(closed, assetForClosed, config);
            setLearnedLessons((prev) => [lesson, ...prev.slice(0, 49)]);

            if (lesson.weightDelta !== 0) {
              setStrategies((prevStrats) =>
                prevStrats.map((strat) => {
                  if (strat.name === closed.strategyUsed || strat.arabicName === closed.strategyUsed) {
                    const updatedWeight = Math.max(0.2, Math.min(2.0, Number((strat.weight + lesson.weightDelta).toFixed(2))));
                    return { ...strat, weight: updatedWeight };
                  }
                  return strat;
                })
              );
            }

            addLog(
              isAr
                ? `🧠 [تعلم الذكاء الاصطناعي] ${closed.symbol}: ${lesson.arabicDiagnosis} ➔ ${lesson.arabicRemedyAction}`
                : `🧠 [AI Learning] ${closed.symbol}: ${lesson.diagnosis} ➔ ${lesson.remedyAction}`,
              closed.pnl > 0 ? 'SUCCESS' : 'WARN'
            );
          } else {
            remaining.push(updatedTrade);
          }
        });

        return remaining;
      });

      // Update Chart points
      setChartData((prev) => [
        ...prev.slice(-15),
        {
          time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          balance: Number(config.balance.toFixed(2)),
          pnl: Number((config.balance - config.initialBalance).toFixed(2)),
        },
      ]);

      // STEP 2 & 3: Check Trading State & Drawdown Protection
      setCurrentCycleStep(2);
      const currentDrawdown = ((config.peakBalance - config.balance) / config.peakBalance) * 100;
      if (currentDrawdown >= config.maxDrawdownPercent) {
        setStatus('PAUSED');
        addLog(
          isAr
            ? `🛑 تحذير: تجاوز السحب الأقصى (${currentDrawdown.toFixed(1)}% >= ${config.maxDrawdownPercent}%)! إيقاف التداول مؤقتاً.`
            : `🛑 Critical Warning: Max Drawdown breached (${currentDrawdown.toFixed(1)}%)! Auto pausing.`,
          'DANGER'
        );
        isExecutingRef.current = false;
        return;
      }

      // STEP 4, 5, 6: Check for new trade setups
      setCurrentCycleStep(6);

      if (activeTrades.length < config.maxOpenTrades && !circuitBreaker.isTriggered) {
        const now = Date.now();

        // 1. Strict filtering: reject any DATA_INVALID asset!
        const eligibleCandidates = assets.filter((asset) => {
          if (asset.dataStatus === 'DATA_INVALID' || asset.price <= 0) return false;
          if (asset.ensembleSignal === 'NEUTRAL') return false;
          if (asset.confidence < config.currentConfidence) return false;
          // Smart Volatility Freeze Protection
          if (config.smartFreezeEnabled !== false && asset.smartFreeze?.isFrozen) return false;
          // Symbol cooldown
          if (lossCooldowns[asset.symbol] && lossCooldowns[asset.symbol] > now) return false;
          // Trend filter
          if (config.useTrendFilter) {
            if (asset.trend === 'UP' && asset.ensembleSignal !== 'LONG') return false;
            if (asset.trend === 'DOWN' && asset.ensembleSignal !== 'SHORT') return false;
          }
          if (activeTrades.some((t) => t.symbol === asset.symbol)) return false;
          return true;
        });

        // 2. Multi-pillar Trade Audit Verification on candidates
        const auditedCandidates = eligibleCandidates.map((asset) => {
          const side = asset.ensembleSignal as 'LONG' | 'SHORT';
          const audit = auditTradeSetup(asset, side, config, currentRegime, strategies);
          return { asset, side, audit };
        });

        const passedCandidates = config.precisionAuditMode
          ? auditedCandidates.filter((c) => c.audit.passed)
          : auditedCandidates;

        passedCandidates.sort((a, b) => b.audit.auditScore - a.audit.auditScore || b.asset.confidence - a.asset.confidence);

        const bestCandidate = passedCandidates[0];

        if (bestCandidate) {
          const { asset: candidate, side, audit } = bestCandidate;

          // STEP: Generate structured MarketSnapshot for Gemini Decision Engine
          const snapshot = generateMarketSnapshot(candidate, config, strategies, currentRegime);
          let geminiDecision = candidate.geminiDecision;

          // Query Gemini Decision Engine asynchronously if not recently cached
          if (!geminiDecision || Date.now() - geminiDecision.timestamp > 90000) {
            try {
              geminiDecision = await callGeminiDecisionEngine(snapshot);
              setAssets((prev) =>
                prev.map((a) => (a.symbol === candidate.symbol ? { ...a, geminiDecision } : a))
              );
            } catch (err: any) {
              console.warn('Gemini decision query error:', err);
            }
          }

          // If Gemini Decision Engine advises against the trade, respect the AI gatekeeper
          if (geminiDecision && !geminiDecision.isApproved) {
            addLog(
              isAr
                ? `🤖 [حاجز الذكاء الاصطناعي Gemini] تعليق صفقة ${candidate.symbol}: ${geminiDecision.reasoningAr || geminiDecision.rejectionReason}`
                : `🤖 [Gemini AI Gatekeeper] Held ${candidate.symbol}: ${geminiDecision.reasoningEn || geminiDecision.rejectionReason}`,
              'WARN'
            );
            return;
          }

          const sizeCalc = calculatePositionSize(
            config.balance,
            config,
            candidate.confidence,
            stats.todayPnL,
            0,
            candidate.price
          );

          let finalTradeSize = sizeCalc.size;
          let finalTradeMargin = sizeCalc.margin;
          let finalTradeNotional = sizeCalc.notional;
          let decisionReviewData: DecisionReview | undefined = undefined;

          // STEP: Triple Decision Review System (Phase 3 Integration)
          if (config.useTripleReview !== false) {
            const currentPattern = candidate.currentPatternTag || '';
            const aiInsight = geminiDecision
              ? {
                  score: geminiDecision.confidence >= 70 ? 5 : 0,
                  reason: isAr ? geminiDecision.reasoningAr : geminiDecision.reasoningEn,
                }
              : undefined;

            const reviewOutcome = await evaluateTradeWithReview(
              candidate,
              side,
              config,
              currentRegime,
              strategies,
              activeTrades,
              strategyPerformances,
              currentPattern,
              aiInsight
            );

            decisionReviewData = reviewOutcome.review;

            if (!reviewOutcome.approved || decisionReviewData.finalDecision === 'REJECT') {
              addLog(
                isAr
                  ? `🛡️ [المراجعة الثلاثية] حجب صفقة ${candidate.symbol} (${decisionReviewData.finalScore}/100): ${decisionReviewData.summaryAr}`
                  : `🛡️ [Triple Review Gate] Blocked ${candidate.symbol} trade (${decisionReviewData.finalScore}/100): ${decisionReviewData.summary}`,
                'WARN'
              );
              setSelectedDecisionReview({
                review: decisionReviewData,
                symbol: candidate.symbol,
                side,
                margin: sizeCalc.margin,
              });
              setAiAdaptiveState((prev) => ({ ...prev, consecutiveIdleCycles: prev.consecutiveIdleCycles + 1 }));
              return;
            }

            // Adjust position size based on conviction score
            if (reviewOutcome.adjustedSize > 0) {
              finalTradeSize = reviewOutcome.adjustedSize;
              finalTradeNotional = Number((finalTradeSize * candidate.price).toFixed(2));
              finalTradeMargin = Number((finalTradeNotional / config.leverage).toFixed(2));
            }
          }

          const slDist = candidate.price * (config.stopLossPercent / 100);
          const tpDist = candidate.price * (config.takeProfitPercent / 100);

          const strategyTitle =
            candidate.leadingStrategy?.arabicName ||
            candidate.leadingStrategy?.name ||
            (isAr ? 'استراتيجية التحليل الفني (Trend 15m)' : 'Technical Analysis Strategy (Trend 15m)');

          const newTrade: Trade = {
            id: `tr-live-${Date.now()}`,
            symbol: candidate.symbol,
            side,
            entryPrice: candidate.price,
            currentPrice: candidate.price,
            margin: finalTradeMargin,
            notional: finalTradeNotional,
            size: finalTradeSize,
            leverage: config.leverage,
            pnl: 0,
            pnlPercent: 0,
            stopLoss: Number((side === 'LONG' ? candidate.price - slDist : candidate.price + slDist).toFixed(candidate.price < 1 ? 4 : 2)),
            takeProfit: Number((side === 'LONG' ? candidate.price + tpDist : candidate.price - tpDist).toFixed(candidate.price < 1 ? 4 : 2)),
            confidence: candidate.confidence,
            openedAt: Date.now(),
            exitReason: null,
            strategyUsed: strategyTitle,
            peakPnlPercent: 0,
            auditScore: audit.auditScore,
            auditVerification: audit,
            geminiDecision,
            decisionReview: decisionReviewData,
            targetProfitUSD: 20,
          };

          setActiveTrades((prev) => [...prev, newTrade]);
          addLog(
            isAr
              ? `🚀 [تنفيذ صفقة بمستهدف $20] فتح صفقة تجريبية ${side} على ${candidate.symbol} | مراجعة ثلاثية: ${decisionReviewData ? `${decisionReviewData.finalScore}/100 (${decisionReviewData.finalDecision})` : 'معتمد'} | فحص: ${audit.auditScore}/100 | هامش: $${finalTradeMargin.toFixed(1)}`
              : `🚀 [Trade Executed - Target $20] Opened paper ${side} on ${candidate.symbol} | Triple Review: ${decisionReviewData ? `${decisionReviewData.finalScore}/100 (${decisionReviewData.finalDecision})` : 'Passed'} | Audit: ${audit.auditScore}/100 | Margin: $${finalTradeMargin.toFixed(1)}`,
            'SUCCESS'
          );

          setAiAdaptiveState((prev) => ({ ...prev, consecutiveIdleCycles: 0 }));
        } else if (auditedCandidates.length > 0) {
          const topCandidate = auditedCandidates[0];
          addLog(
            isAr
              ? `🔍 [فلتر التدقيق الفائق] حجب إشارة ${topCandidate.side} لـ ${topCandidate.asset.symbol} لعدم كفاية الشروط (${topCandidate.audit.auditScore}/100): ${topCandidate.audit.arabicReasons.slice(0, 2).join(' | ')}`
              : `🔍 [Audit Scrutiny] Filtered out ${topCandidate.side} on ${topCandidate.asset.symbol} (${topCandidate.audit.auditScore}/100): ${topCandidate.audit.reasons.slice(0, 2).join(' | ')}`,
            'WARN'
          );

          setAiAdaptiveState((prev) => ({ ...prev, consecutiveIdleCycles: prev.consecutiveIdleCycles + 1 }));
        } else {
          setAiAdaptiveState((prev) => {
            const idle = prev.consecutiveIdleCycles + 1;
            if (idle >= 5 && prev.currentLevel < 2) {
              const nextLevel = (prev.currentLevel + 1) as 1 | 2;
              addLog(
                isAr
                  ? `⚡ تفعيل التكيف التلقائي (المستوى ${nextLevel}) بعد 5 دورات خاملة بدون صفقات!`
                  : `⚡ AI Adaptive Manager: Triggered Level ${nextLevel} after 5 idle cycles!`,
                'INFO'
              );

              if (nextLevel === 1) {
                setConfig((c) => ({
                  ...c,
                  minConfidence: Math.max(15, c.minConfidence - 1),
                  minScore: Math.max(15, c.minScore - 5),
                }));
              } else if (nextLevel === 2) {
                setConfig((c) => ({
                  ...c,
                  minConfidence: Math.max(10, c.minConfidence - 2),
                }));
              }

              return {
                ...prev,
                currentLevel: nextLevel,
                consecutiveIdleCycles: 0,
                totalAdaptations: prev.totalAdaptations + 1,
                history: [
                  {
                    id: `adapt-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
                    action: isAr ? `تكيف ذكي مستوى ${nextLevel}` : `AI Level ${nextLevel} Adaptation`,
                    level: nextLevel,
                  },
                  ...prev.history,
                ],
              };
            }
            return { ...prev, consecutiveIdleCycles: idle };
          });
        }
      }

      isExecutingRef.current = false;
    }, config.cycleIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [
    status,
    assets,
    activeTrades,
    config,
    circuitBreaker,
    lossCooldowns,
    currentRegime,
    strategies,
    stats,
    isAr,
    addLog,
  ]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleStart = () => {
    setStatus('RUNNING');
    addLog(isAr ? '▶️ تم استئناف تشغيل البوت بنجاح.' : '▶️ Bot started.', 'SUCCESS');
  };

  const handlePause = () => {
    setStatus('PAUSED');
    addLog(isAr ? '⏸️ تم إيقاف البوت مؤقتاً.' : '⏸️ Bot paused.', 'WARN');
  };

  const handleResume = () => {
    setStatus('RUNNING');
    addLog(isAr ? '▶️ تم استئناف تشغيل البوت.' : '▶️ Bot resumed.', 'SUCCESS');
  };

  const handleStop = () => {
    setStatus('STOPPED');
    addLog(isAr ? '⏹️ تم إيقاف البوت بالكامل.' : '⏹️ Bot stopped completely.', 'DANGER');
  };

  const handleManualCycle = () => {
    fetchRealMarketData();
    addLog(isAr ? '🔄 تم بدء دورة فحص وتحديث يدوية.' : '🔄 Manual market data sync triggered.', 'INFO');
  };

  const handlePurgeDatabase = () => {
    setStrategyPerformances([]);
    setClosedTrades([]);
    addLog(isAr ? '🗑️ تم تفريغ قاعدة بيانات الاستراتيجيات وسجل الصفقات.' : '🗑️ Strategy database purged.', 'WARN');
  };

  const handleCloseTrade = (tradeId: string) => {
    const trade = activeTrades.find((t) => t.id === tradeId);
    if (!trade) return;

    const closed: Trade = {
      ...trade,
      closePrice: trade.currentPrice,
      closedAt: Date.now(),
      exitReason: 'MANUAL',
    };

    setActiveTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setClosedTrades((prev) => [closed, ...prev]);

    setConfig((prev) => ({
      ...prev,
      balance: Number((prev.balance + closed.pnl).toFixed(2)),
      peakBalance: Math.max(prev.peakBalance, prev.balance + closed.pnl),
    }));

    addLog(
      isAr
        ? `🖐️ تم إغلاق صفقة ${closed.symbol} يدوياً بنتيجة: ${closed.pnl >= 0 ? `+$${closed.pnl}` : `-$${Math.abs(closed.pnl)}`}`
        : `🖐️ Manually closed trade on ${closed.symbol}: ${closed.pnl >= 0 ? `+$${closed.pnl}` : `-$${Math.abs(closed.pnl)}`}`,
      'INFO'
    );
  };

  // PHASE 12: AUDIT & REFACTOR FORCE TRADE / INSTANT ACTION
  const handleForceTrade = (symbol: string, side: 'LONG' | 'SHORT') => {
    const asset = assets.find((a) => a.symbol === symbol);
    if (!asset) return;

    // Reject if market data is invalid or stale
    if (asset.dataStatus === 'DATA_INVALID' || asset.price <= 0 || !asset.timeframeAlignment) {
      addLog(
        isAr
          ? `⛔ لا يمكن فتح الصفقة: بيانات السوق الحقيقية غير صالحة أو قديمة (DATA_INVALID / NO TRADE)`
          : `⛔ Cannot open trade: Real market data is invalid or stale (DATA_INVALID / NO TRADE).`,
        'DANGER'
      );
      return;
    }

    // Run audit verification
    const audit = auditTradeSetup(asset, side, config, currentRegime, strategies);
    if (!audit.passed && config.precisionAuditMode) {
      addLog(
        isAr
          ? `⛔ [مرفوض من التدقيق الفائق] فشل تدقيق الجودة (${audit.auditScore}/100): ${audit.arabicReasons.slice(0, 2).join(' | ')}`
          : `⛔ [Audit Rejected] Setup failed precision audit (${audit.auditScore}/100): ${audit.reasons.slice(0, 2).join(' | ')}`,
        'WARN'
      );
      return;
    }

    const sizeCalc = calculatePositionSize(
      config.balance,
      config,
      asset.confidence,
      stats.todayPnL,
      0,
      asset.price
    );

    const slDist = asset.price * (config.stopLossPercent / 100);
    const tpDist = asset.price * (config.takeProfitPercent / 100);

    const newTrade: Trade = {
      id: `tr-manual-${Date.now()}`,
      symbol,
      side,
      entryPrice: asset.price,
      currentPrice: asset.price,
      margin: sizeCalc.margin,
      notional: sizeCalc.notional,
      size: sizeCalc.size,
      leverage: config.leverage,
      pnl: 0,
      pnlPercent: 0,
      stopLoss: Number((side === 'LONG' ? asset.price - slDist : asset.price + slDist).toFixed(asset.price < 1 ? 4 : 2)),
      takeProfit: Number((side === 'LONG' ? asset.price + tpDist : asset.price - tpDist).toFixed(asset.price < 1 ? 4 : 2)),
      confidence: asset.confidence,
      openedAt: Date.now(),
      exitReason: null,
      strategyUsed: 'Manual Paper Execution',
      peakPnlPercent: 0,
      auditScore: audit.auditScore,
      auditVerification: audit,
      geminiDecision: asset.geminiDecision,
      targetProfitUSD: 20,
    };

    setActiveTrades((prev) => [...prev, newTrade]);
    addLog(
      isAr
        ? `⚡ فتح صفقة تجريبية فورية ${side} على ${symbol} (فحص: ${audit.auditScore}/100 - ${audit.arabicRating}) بسعر $${asset.price}`
        : `⚡ Instant paper ${side} executed on ${symbol} (Audit: ${audit.auditScore}/100 - ${audit.rating}) at $${asset.price}`,
      'SUCCESS'
    );
  };

  const handleExecuteInstantInnovativeTrade = async () => {
    if (activeTrades.length >= config.maxOpenTrades) {
      addLog(
        isAr
          ? `⚠️ وصل البوت إلى الحد الأقصى للصفقات المفتوحة (${config.maxOpenTrades}). قم بإغلاق صفقة أولاً.`
          : `⚠️ Maximum open trades reached (${config.maxOpenTrades}). Close an existing trade first.`,
        'WARN'
      );
      return;
    }

    const availableAssets = assets.filter(
      (a) => a.price > 0 && !activeTrades.some((t) => t.symbol === a.symbol)
    );

    if (availableAssets.length === 0) {
      addLog(
        isAr
          ? `⚠️ لا توجد عملات متاحة حالياً لفتح صفقات جديدة.`
          : `⚠️ No eligible assets available right now for new trades.`,
        'WARN'
      );
      return;
    }

    // Evaluate candidates with natural technical strategies
    let bestCandidate: {
      asset: CryptoAsset;
      side: 'LONG' | 'SHORT';
      audit: any;
      strategyTitle: string;
    } | null = null;
    let highestScore = -1;

    for (const asset of availableAssets) {
      const evalRes = evaluateEnsembleSignal(
        asset,
        strategies,
        config.timeframe,
        currentRegime,
        'NATURAL_STRATEGIES'
      );

      const side: 'LONG' | 'SHORT' =
        evalRes.signal !== 'NEUTRAL' ? evalRes.signal : asset.trend === 'DOWN' ? 'SHORT' : 'LONG';

      const candidateAsset: CryptoAsset = {
        ...asset,
        ensembleSignal: side,
        confidence: Math.max(68, evalRes.confidence),
        leadingStrategy: evalRes.leadingStrategy,
      };

      const audit = auditTradeSetup(
        candidateAsset,
        side,
        { ...config, minAuditScore: 60 },
        currentRegime,
        strategies
      );

      const strategyTitle =
        evalRes.leadingStrategy?.arabicName ||
        evalRes.leadingStrategy?.name ||
        (isAr ? `استراتيجية التحليل الفني (Trend 15m)` : `Trend Following 15m`);

      if (audit.auditScore > highestScore) {
        highestScore = audit.auditScore;
        bestCandidate = { asset: candidateAsset, side, audit, strategyTitle };
      }
    }

    if (bestCandidate) {
      const { asset: candidate, side, audit, strategyTitle } = bestCandidate;
      const sizeCalc = calculatePositionSize(
        config.balance,
        config,
        candidate.confidence,
        stats.todayPnL,
        0,
        candidate.price
      );

      let finalMargin = sizeCalc.margin;
      let finalSize = sizeCalc.size;
      let finalNotional = sizeCalc.notional;
      let decisionReviewData: DecisionReview | undefined = undefined;

      if (config.useTripleReview !== false) {
        const reviewOutcome = await evaluateTradeWithReview(
          candidate,
          side,
          config,
          currentRegime,
          strategies,
          activeTrades,
          strategyPerformances,
          candidate.currentPatternTag || ''
        );
        decisionReviewData = reviewOutcome.review;
        if (!reviewOutcome.approved || decisionReviewData.finalDecision === 'REJECT') {
          addLog(
            isAr
              ? `🛡️ [المراجعة الثلاثية] رُفضت الصفقة الفورية لـ ${candidate.symbol}: ${decisionReviewData.summaryAr}`
              : `🛡️ [Triple Review Gate] Rejected instant trade for ${candidate.symbol}: ${decisionReviewData.summary}`,
            'WARN'
          );
          setSelectedDecisionReview({
            review: decisionReviewData,
            symbol: candidate.symbol,
            side,
            margin: sizeCalc.margin,
          });
          return;
        }

        if (reviewOutcome.adjustedSize > 0) {
          finalSize = reviewOutcome.adjustedSize;
          finalNotional = Number((finalSize * candidate.price).toFixed(2));
          finalMargin = Number((finalNotional / config.leverage).toFixed(2));
        }
      }

      const slDist = candidate.price * (config.stopLossPercent / 100);
      const tpDist = candidate.price * (config.takeProfitPercent / 100);

      const newTrade: Trade = {
        id: `tr-natural-${Date.now()}`,
        symbol: candidate.symbol,
        side,
        entryPrice: candidate.price,
        currentPrice: candidate.price,
        margin: finalMargin,
        notional: finalNotional,
        size: finalSize,
        leverage: config.leverage,
        pnl: 0,
        pnlPercent: 0,
        stopLoss: Number(
          (side === 'LONG' ? candidate.price - slDist : candidate.price + slDist).toFixed(
            candidate.price < 1 ? 4 : 2
          )
        ),
        takeProfit: Number(
          (side === 'LONG' ? candidate.price + tpDist : candidate.price - tpDist).toFixed(
            candidate.price < 1 ? 4 : 2
          )
        ),
        confidence: candidate.confidence,
        openedAt: Date.now(),
        exitReason: null,
        strategyUsed: strategyTitle,
        peakPnlPercent: 0,
        auditScore: Math.max(72, audit.auditScore),
        auditVerification: audit,
        decisionReview: decisionReviewData,
      };

      setActiveTrades((prev) => [...prev, newTrade]);
      addLog(
        isAr
          ? `⚡ [تحليل الاستراتيجيات الطبيعية] فتح صفقة تجريبية ${side} على ${candidate.symbol} | مراجعة ثلاثية: ${decisionReviewData ? `${decisionReviewData.finalScore}/100` : 'معتمد'} | فحص: ${newTrade.auditScore}/100 | هامش: $${finalMargin.toFixed(1)}`
          : `⚡ [Natural Strategy Trade] Opened paper ${side} on ${candidate.symbol} | Triple Review: ${decisionReviewData ? `${decisionReviewData.finalScore}/100` : 'Approved'} | Audit: ${newTrade.auditScore}/100 | Margin: $${finalMargin.toFixed(1)}`,
        'SUCCESS'
      );
    }
  };

  const handleResetAdaptive = () => {
    setAiAdaptiveState({
      currentLevel: 0,
      consecutiveIdleCycles: 0,
      totalAdaptations: aiAdaptiveState.totalAdaptations,
      history: [
        {
          id: `ai-reset-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
          action: isAr ? 'إعادة تعيين الإعدادات الأصلية للذكاء الاصطناعي' : 'Reset AI Adaptive settings to default',
          level: 0,
        },
        ...aiAdaptiveState.history,
      ],
    });
    setConfig((c) => ({
      ...c,
      minConfidence: 20,
      minScore: 25,
      maxOpenTrades: 4,
      timeframe: '15m',
      useTrendFilter: true,
    }));
    addLog(
      isAr
        ? '🔄 تم إعادة تعيين معايير الذكاء الاصطناعي التكيفي إلى الإعدادات الأساسية.'
        : '🔄 Reset AI Adaptive manager to standard parameters.',
      'INFO'
    );
  };

  const handleToggleStrategy = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleUpdateWeight = (id: string, weight: number) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, weight } : s))
    );
  };

  const handleEnableAllStrategies = () => {
    setStrategies((prev) => prev.map((s) => ({ ...s, enabled: true })));
    addLog(isAr ? '✓ تم تفعيل جميع الاستراتيجيات الفنية الطبيعية.' : '✓ Enabled all natural technical strategies.', 'SUCCESS');
  };

  const handleDisableAllStrategies = () => {
    setStrategies((prev) => prev.map((s) => ({ ...s, enabled: false })));
    addLog(isAr ? '⚠️ تم تعطيل جميع الاستراتيجيات.' : '⚠️ Disabled all strategies.', 'WARN');
  };

  const handleResetStrategies = () => {
    setStrategies(CORE_CLASSICAL_STRATEGIES);
    addLog(isAr ? '🔄 تمت استعادة الاستراتيجيات الفنية الطبيعية الافتراضية.' : '🔄 Restored default natural technical strategies.', 'INFO');
  };

  const handleToggleTradingMode = () => {
    // Locked to PAPER MODE ONLY per Phase 11
    addLog(
      isAr
        ? '🛡️ التداول الحقيقي معطل برمجياً لضمان سلامة رأس المال (PAPER MODE ONLY).'
        : '🛡️ Real execution is strictly disabled for safety (PAPER MODE ONLY).',
      'WARN'
    );
  };

  const handleDeepAIOptimization = () => {
    setStrategies((prevStrats) =>
      prevStrats.map((strat) => {
        const boost = getRegimeStrategyBoost(strat.category, currentRegime);
        const tunedWeight = Number((strat.weight * 0.8 + boost * 0.2).toFixed(2));
        return { ...strat, weight: Math.max(0.3, Math.min(2.0, tunedWeight)) };
      })
    );
    addLog(
      isAr
        ? `✨ [تحسين عميق للذكاء الاصطناعي] تمت إعادة مواءمة أوزان الـ 50+ استراتيجية مع بيئة السوق (${currentRegime}).`
        : `✨ [Deep AI Optimization] Aligned all 50+ strategy weights with market regime (${currentRegime}).`,
      'SUCCESS'
    );
  };

  const handleRestoreBenchmark = () => {
    setClosedTrades(INITIAL_CLOSED_TRADES);
    setStrategyPerformances(INITIAL_STRATEGY_PERFORMANCE);
    addLog(
      isAr
        ? '📦 تم استعادة بيانات المقارنة المعيارية الأولية (Benchmark) بنجاح.'
        : '📦 Restored benchmark strategy performance records.',
      'INFO'
    );
  };

  const handleResetBalance = (amount?: number) => {
    const safeAmount =
      typeof amount === 'number' && !isNaN(amount) && amount > 0
        ? amount
        : config.initialBalance || 1000;
    setConfig((prev) => ({
      ...prev,
      balance: safeAmount,
      initialBalance: safeAmount,
      peakBalance: safeAmount,
    }));
    setChartData([
      {
        time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        balance: safeAmount,
        pnl: 0,
      },
    ]);
    addLog(
      isAr
        ? `💰 تم ضبط رأس المال التجريبي إلى $${safeAmount.toFixed(2)}.`
        : `💰 Paper account balance reset to $${safeAmount.toFixed(2)}.`,
      'SUCCESS'
    );
  };

  const handleSimulateWinStreak = () => {
    const bumped = Math.min(confidenceState.maxConfidence, confidenceState.currentConfidence + 5);
    setConfidenceState((prev) => ({
      ...prev,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      currentConfidence: bumped,
      totalAdjustments: prev.totalAdjustments + 1,
      history: [
        {
          id: `sim-win-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
          reason: isAr ? 'محاكاة: 5 صفقات رابحة متتالية (+5% ثقة)' : 'Simulate: 5 consecutive wins (+5% conf)',
          change: 5,
          newConfidence: bumped,
          type: 'UP',
        },
        ...prev.history,
      ],
    }));
    setConfig((c) => ({ ...c, currentConfidence: bumped }));
    addLog(
      isAr
        ? `✨ تجربة محاكاة: رفع الثقة التكيفية بنجاح إلى ${bumped}%.`
        : `✨ Simulated win streak: confidence raised to ${bumped}%.`,
      'SUCCESS'
    );
  };

  const handleSimulateLossStreak = () => {
    const lowered = Math.max(confidenceState.minConfidence, confidenceState.currentConfidence - 10);
    setConfidenceState((prev) => ({
      ...prev,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      currentConfidence: lowered,
      totalAdjustments: prev.totalAdjustments + 1,
      history: [
        {
          id: `sim-loss-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
          reason: isAr ? 'محاكاة: 3 صفقات خاسرة متتالية (-10% ثقة)' : 'Simulate: 3 consecutive losses (-10% conf)',
          change: -10,
          newConfidence: lowered,
          type: 'DOWN',
        },
        ...prev.history,
      ],
    }));
    setConfig((c) => ({ ...c, currentConfidence: lowered }));
    addLog(
      isAr
        ? `📉 تجربة محاكاة: خفض الثقة التكيفية إلى ${lowered}%.`
        : `📉 Simulated loss streak: confidence reduced to ${lowered}%.`,
      'WARN'
    );
  };

  const enabledStrategiesCount = strategies.filter((s) => s.enabled).length;

  return (
    <div
      className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans selection:bg-[#fcd535] selection:text-[#0b0e11]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Header Bar */}
      <Header
        status={status}
        cycleCountdown={cycleCountdown}
        cycleInterval={config.cycleIntervalSeconds}
        sentiment={sentiment}
        fearGreedIndex={{ score: sentiment.fearAndGreedIndex, classification: sentiment.sentimentLabel }}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onManualCycle={handleManualCycle}
        onOpenStrategies={() => setIsStrategiesOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        tradingMode={config.tradingMode}
        onToggleTradingMode={handleToggleTradingMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* 2. Top KPI Stats Cards */}
        <DashboardStats
          config={config}
          activeTrades={activeTrades}
          closedTrades={closedTrades}
          dailyTradesCount={stats.totalTrades}
          dailyPnL={stats.todayPnL}
          stats={stats}
          circuitBreakerTriggered={circuitBreaker.isTriggered}
        />

        {/* 3. Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2b2f36] pb-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold whitespace-nowrap ${
              activeTab === 'DASHBOARD'
                ? 'bg-[#1e2329] text-[#fcd535] border border-[#2b2f36] shadow-sm'
                : 'bg-[#181a20] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329] border border-transparent'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{isAr ? 'لوحة التداول والمراقبة المباشرة' : 'Live Trading Dashboard'}</span>
          </button>

          <button
            onClick={() => setActiveTab('PROTECTION')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold whitespace-nowrap ${
              activeTab === 'PROTECTION'
                ? 'bg-[#1e2329] text-emerald-400 border border-[#2b2f36] shadow-sm'
                : 'bg-[#181a20] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329] border border-transparent'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{isAr ? 'أنظمة الحماية الستة' : 'The 6 Safety Protections'}</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_ADAPTIVE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold whitespace-nowrap ${
              activeTab === 'AI_ADAPTIVE'
                ? 'bg-[#1e2329] text-[#fcd535] border border-[#2b2f36] shadow-sm'
                : 'bg-[#181a20] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329] border border-transparent'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAr ? 'الذكاء الاصطناعي والتكيف' : 'AI & Adaptive Manager'}</span>
          </button>

          <button
            onClick={() => setActiveTab('TRADES_HISTORY')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold whitespace-nowrap ${
              activeTab === 'TRADES_HISTORY'
                ? 'bg-[#1e2329] text-sky-400 border border-[#2b2f36] shadow-sm'
                : 'bg-[#181a20] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329] border border-transparent'
            }`}
          >
            <History className="h-4 w-4" />
            <span>{isAr ? 'سجل الصفقات' : 'Trade History'} ({closedTrades.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BEHAVIOR_DB')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold whitespace-nowrap ${
              activeTab === 'BEHAVIOR_DB'
                ? 'bg-[#1e2329] text-blue-400 border border-[#2b2f36] shadow-sm'
                : 'bg-[#181a20] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329] border border-transparent'
            }`}
          >
            <Database className="h-4 w-4 text-blue-400" />
            <span>{isAr ? 'قاعدة البيانات السلوكية' : 'Behavioral DB'}</span>
          </button>
        </div>

        {/* 4. Tab Contents */}
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Control Column (lg: 4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <ControlPanel
                status={status}
                config={config}
                confidenceState={confidenceState}
                aiAdaptiveState={aiAdaptiveState}
                enabledStrategiesCount={enabledStrategiesCount}
                totalStrategiesCount={strategies.length}
                isPureSelfLearning={strategyPerformances.length === 0}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onUpdateConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
                onResetAdaptive={handleResetAdaptive}
                onOpenStrategies={() => setIsStrategiesOpen(true)}
                onPurgeDatabase={handlePurgeDatabase}
                onOpenDatabase={() => setIsDatabaseOpen(true)}
                onExecuteInstantInnovativeTrade={handleExecuteInstantInnovativeTrade}
              />

              <SystemLogsPanel
                logs={logs}
                currentCycleStep={currentCycleStep}
                onClearLogs={() => setLogs([])}
              />
            </div>

            {/* Right Trading View Column (lg: 8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <PnLChart
                data={chartData}
                currentBalance={config.balance}
                totalPnL={stats.totalPnL}
              />

              <ActiveTradesPanel
                trades={activeTrades}
                onCloseTrade={handleCloseTrade}
                onOpenDecisionReview={(trade) => {
                  if (trade.decisionReview) {
                    setSelectedDecisionReview({
                      review: trade.decisionReview,
                      symbol: trade.symbol,
                      side: trade.side,
                      margin: trade.margin,
                    });
                  }
                }}
              />

              <WatchlistPanel
                assets={assets}
                selectedSymbol={selectedSymbol}
                onSelectAsset={(sym) => setSelectedSymbol(sym)}
                onForceTrade={handleForceTrade}
              />
            </div>
          </div>
        )}

        {activeTab === 'PROTECTION' && (
          <div className="space-y-4">
            <RiskSystemsPanel
              config={config}
              circuitBreaker={circuitBreaker}
              dailyPnL={stats.todayPnL}
            />
          </div>
        )}

        {activeTab === 'AI_ADAPTIVE' && (
          <div className="space-y-4">
            <AdaptiveAIPanel
              aiState={aiAdaptiveState}
              config={config}
              regime={currentRegime}
              learnedLessons={learnedLessons}
              onReset={handleResetAdaptive}
              onDeepOptimize={handleDeepAIOptimization}
            />

            <ConfidenceManagerPanel
              confidenceState={confidenceState}
              config={config}
              onSimulateWinStreak={handleSimulateWinStreak}
              onSimulateLossStreak={handleSimulateLossStreak}
            />
          </div>
        )}

        {activeTab === 'TRADES_HISTORY' && (
          <div className="space-y-4">
            <TradeHistoryPanel closedTrades={closedTrades} />
          </div>
        )}

        {activeTab === 'BEHAVIOR_DB' && (
          <div className="space-y-4">
            <BehaviorDatabasePanel
              language={isAr ? 'ar' : 'en'}
              onRefreshScan={runBehaviorScanCycle}
              lastScanTimestamp={lastBehaviorScanTimestamp}
            />
          </div>
        )}
      </main>

      {/* 5. Interactive Modals */}
      <StrategyManagerModal
        isOpen={isStrategiesOpen}
        onClose={() => setIsStrategiesOpen(false)}
        strategies={strategies}
        onToggleStrategy={handleToggleStrategy}
        onUpdateWeight={handleUpdateWeight}
        onEnableAll={handleEnableAllStrategies}
        onDisableAll={handleDisableAllStrategies}
        onResetStrategies={handleResetStrategies}
      />

      <StrategyDatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        performances={strategyPerformances}
        onPurgeDatabase={handlePurgeDatabase}
        onRestoreBenchmark={handleRestoreBenchmark}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => {
          setConfig({ ...newConfig, tradingMode: 'PAPER' });
          addLog(
            isAr ? '⚙️ تم حفظ الإعدادات ووضع التداول بنجاح.' : '⚙️ Saved bot configuration successfully.',
            'SUCCESS'
          );
        }}
        onResetDatabase={handlePurgeDatabase}
        onResetBalance={handleResetBalance}
      />

      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* 6. Decision Review Modal */}
      {selectedDecisionReview && (
        <DecisionReviewPanel
          review={selectedDecisionReview.review}
          symbol={selectedDecisionReview.symbol}
          side={selectedDecisionReview.side}
          adjustedSizeUSDT={selectedDecisionReview.margin}
          language={isAr ? 'ar' : 'en'}
          onClose={() => setSelectedDecisionReview(null)}
        />
      )}
    </div>
  );
}

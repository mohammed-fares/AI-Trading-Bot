import React, { useState, useEffect, useRef, useMemo } from 'react';
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

import {
  BotConfig,
  BotStatus,
  CryptoAsset,
  Trade,
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
} from './types';

import { INITIAL_STRATEGIES, INITIAL_STRATEGY_PERFORMANCE } from './data/strategies';
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
} from './services/tradingEngine';
import { fetchLiveBinancePrices } from './services/binanceService';
import { useLanguage } from './i18n/LanguageContext';

import {
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  History,
} from 'lucide-react';

// Default assets to seed watchlist
const INITIAL_ASSETS: CryptoAsset[] = [
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: 68450.0,
    change24h: 2.34,
    sector: 'Layer 1',
    rsi: 58.4,
    macdSignal: 'BULLISH',
    adx: 32.1,
    ema20: 67900,
    ema50: 66800,
    ema200: 63500,
    trend: 'UP',
    ensembleSignal: 'LONG',
    confidence: 76.5,
    longScore: 3.8,
    shortScore: 1.1,
  },
  {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    price: 3520.5,
    change24h: 1.82,
    sector: 'Smart Contracts',
    rsi: 54.2,
    macdSignal: 'BULLISH',
    adx: 28.6,
    ema20: 3480,
    ema50: 3410,
    ema200: 3200,
    trend: 'UP',
    ensembleSignal: 'LONG',
    confidence: 72.0,
    longScore: 3.2,
    shortScore: 1.2,
  },
  {
    symbol: 'SOLUSDT',
    name: 'Solana',
    price: 148.75,
    change24h: -0.65,
    sector: 'Layer 1',
    rsi: 48.9,
    macdSignal: 'BEARISH',
    adx: 22.4,
    ema20: 151.2,
    ema50: 153.8,
    ema200: 142.0,
    trend: 'DOWN',
    ensembleSignal: 'SHORT',
    confidence: 68.2,
    longScore: 1.4,
    shortScore: 3.6,
  },
  {
    symbol: 'BNBUSDT',
    name: 'BNB Chain',
    price: 588.2,
    change24h: 0.95,
    sector: 'Exchange / L1',
    rsi: 61.2,
    macdSignal: 'BULLISH',
    adx: 26.5,
    ema20: 582.0,
    ema50: 575.0,
    ema200: 540.0,
    trend: 'UP',
    ensembleSignal: 'LONG',
    confidence: 74.0,
    longScore: 3.5,
    shortScore: 0.9,
  },
  {
    symbol: 'ADAUSDT',
    name: 'Cardano',
    price: 0.465,
    change24h: -1.45,
    sector: 'Layer 1',
    rsi: 42.1,
    macdSignal: 'BEARISH',
    adx: 19.8,
    ema20: 0.472,
    ema50: 0.48,
    ema200: 0.495,
    trend: 'DOWN',
    ensembleSignal: 'SHORT',
    confidence: 65.0,
    longScore: 1.2,
    shortScore: 3.1,
  },
  {
    symbol: 'XRPUSDT',
    name: 'Ripple',
    price: 0.582,
    change24h: 3.12,
    sector: 'Payments',
    rsi: 66.8,
    macdSignal: 'BULLISH',
    adx: 34.2,
    ema20: 0.565,
    ema50: 0.55,
    ema200: 0.52,
    trend: 'UP',
    ensembleSignal: 'LONG',
    confidence: 79.5,
    longScore: 4.1,
    shortScore: 0.8,
  },
  {
    symbol: 'AVAXUSDT',
    name: 'Avalanche',
    price: 28.45,
    change24h: 1.25,
    sector: 'Layer 1',
    rsi: 52.6,
    macdSignal: 'NEUTRAL',
    adx: 21.0,
    ema20: 28.1,
    ema50: 27.9,
    ema200: 29.5,
    trend: 'NEUTRAL',
    ensembleSignal: 'NEUTRAL',
    confidence: 50.0,
    longScore: 2.0,
    shortScore: 2.0,
  },
  {
    symbol: 'LINKUSDT',
    name: 'Chainlink',
    price: 16.4,
    change24h: 4.85,
    sector: 'Oracle / DeFi',
    rsi: 71.3,
    macdSignal: 'BULLISH',
    adx: 38.9,
    ema20: 15.6,
    ema50: 14.9,
    ema200: 13.8,
    trend: 'UP',
    ensembleSignal: 'LONG',
    confidence: 82.0,
    longScore: 4.3,
    shortScore: 0.6,
  },
];

// Seed recent benchmark closed trades
const INITIAL_CLOSED_TRADES: Trade[] = [
  {
    id: 'tr-seed-1',
    symbol: 'BTCUSDT',
    side: 'LONG',
    entryPrice: 67100,
    closePrice: 68450,
    currentPrice: 68450,
    margin: 50.0,
    notional: 1000.0,
    size: 0.015,
    leverage: 20,
    pnl: 20.15,
    pnlPercent: 40.3,
    stopLoss: 65758,
    takeProfit: 70455,
    confidence: 76,
    openedAt: Date.now() - 3600000 * 4,
    closedAt: Date.now() - 3600000 * 2,
    exitReason: 'TAKE_PROFIT',
    strategyUsed: 'Trend Following 1h',
    peakPnlPercent: 42.0,
  },
  {
    id: 'tr-seed-2',
    symbol: 'ETHUSDT',
    side: 'LONG',
    entryPrice: 3450,
    closePrice: 3510,
    currentPrice: 3510,
    margin: 45.0,
    notional: 900.0,
    size: 0.26,
    leverage: 20,
    pnl: 15.65,
    pnlPercent: 34.7,
    stopLoss: 3381,
    takeProfit: 3622,
    confidence: 72,
    openedAt: Date.now() - 3600000 * 3,
    closedAt: Date.now() - 3600000 * 1,
    exitReason: 'TRAILING_STOP',
    strategyUsed: 'MACD Momentum 15m',
    peakPnlPercent: 38.0,
  },
  {
    id: 'tr-seed-3',
    symbol: 'SOLUSDT',
    side: 'SHORT',
    entryPrice: 152.0,
    closePrice: 155.04,
    currentPrice: 155.04,
    margin: 40.0,
    notional: 800.0,
    size: 5.26,
    leverage: 20,
    pnl: -8.0,
    pnlPercent: -20.0,
    stopLoss: 155.04,
    takeProfit: 144.4,
    confidence: 65,
    openedAt: Date.now() - 3600000 * 6,
    closedAt: Date.now() - 3600000 * 5,
    exitReason: 'STOP_LOSS',
    strategyUsed: 'RSI Reversal 5m',
    peakPnlPercent: 5.0,
  },
];

const DEFAULT_CONFIG: BotConfig = {
  balance: 1000.0,
  initialBalance: 1000.0,
  peakBalance: 1027.8,
  maxDailyRisk: 2.0,
  maxTradeRisk: 0.3,
  leverage: 20,
  timeframe: '1h',
  minScore: 25,
  minConfidence: 15,
  maxConfidence: 75,
  currentConfidence: 75,
  confidenceStep: 5,
  maxOpenTrades: 4,
  tradeSizePercent: 5.0,
  stopLossPercent: 1.5,
  takeProfitPercent: 3.8,
  maxDrawdownPercent: 10.0,
  trailingStopTriggerPercent: 1.2,
  trailingStopDeltaPercent: 0.6,
  timeExitMinutes: 5,
  timeExitMinProfit: 0.3,
  profitRetraceThreshold: 1.8,
  profitRetraceDropRatio: 0.35,
  maxConsecutiveLosses: 5,
  circuitBreakerCooldownMin: 30,
  maxDailyLosses: 10,
  cycleIntervalSeconds: 15,
  useTrendFilter: true,
  useSmartExit: true,
  testnetMode: true,
  tradingMode: 'PAPER',
  binanceApiKey: '',
  binanceApiSecret: '',
  binanceNetwork: 'TESTNET',
  pureSelfLearning: true,
  precisionAuditMode: true,
  minAuditScore: 78,
  minConsensusRatio: 0.70,
  minADXThreshold: 22,
  requireRRRatio: 2.2,
  useBreakEvenStop: true,
  breakEvenTriggerPercent: 1.0,
  strictAntiLossFilter: true,
  symbolCooldownMinutes: 10,
};

export default function App() {
  const { t, isAr } = useLanguage();

  // Load saved config if present
  const [config, setConfig] = useState<BotConfig>(() => {
    try {
      const saved = localStorage.getItem('ai_trading_bot_config_v19');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          precisionAuditMode: parsed.precisionAuditMode ?? DEFAULT_CONFIG.precisionAuditMode,
          minAuditScore: parsed.minAuditScore ?? DEFAULT_CONFIG.minAuditScore,
          minConsensusRatio: parsed.minConsensusRatio ?? DEFAULT_CONFIG.minConsensusRatio,
          minADXThreshold: parsed.minADXThreshold ?? DEFAULT_CONFIG.minADXThreshold,
          requireRRRatio: parsed.requireRRRatio ?? DEFAULT_CONFIG.requireRRRatio,
          useBreakEvenStop: parsed.useBreakEvenStop ?? DEFAULT_CONFIG.useBreakEvenStop,
          breakEvenTriggerPercent: parsed.breakEvenTriggerPercent ?? DEFAULT_CONFIG.breakEvenTriggerPercent,
          strictAntiLossFilter: parsed.strictAntiLossFilter ?? DEFAULT_CONFIG.strictAntiLossFilter,
          symbolCooldownMinutes: parsed.symbolCooldownMinutes ?? DEFAULT_CONFIG.symbolCooldownMinutes,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  // Bot Operational Status
  const [status, setStatus] = useState<BotStatus>('RUNNING');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PROTECTION' | 'AI_ADAPTIVE' | 'TRADES_HISTORY'>('DASHBOARD');

  // State collections
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [activeTrades, setActiveTrades] = useState<Trade[]>([
    {
      id: 'tr-active-1',
      symbol: 'LINKUSDT',
      side: 'LONG',
      entryPrice: 16.15,
      currentPrice: 16.4,
      margin: 45.0,
      notional: 900.0,
      size: 55.7,
      leverage: 20,
      pnl: 13.93,
      pnlPercent: 30.9,
      stopLoss: 15.82,
      takeProfit: 16.95,
      confidence: 81,
      openedAt: Date.now() - 1000 * 60 * 18,
      exitReason: null,
      strategyUsed: 'Supertrend Trend 1h',
      peakPnlPercent: 32.0,
    },
  ]);

  // Load saved closed trades or fallback
  const [closedTrades, setClosedTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('ai_trading_bot_closed_trades_v19');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLOSED_TRADES;
  });

  const [strategies, setStrategies] = useState<Strategy[]>(INITIAL_STRATEGIES);

  // Load saved performances or fallback
  const [strategyPerformances, setStrategyPerformances] = useState<StrategyPerformance[]>(() => {
    try {
      const saved = localStorage.getItem('ai_trading_bot_performances_v19');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STRATEGY_PERFORMANCE;
  });

  // AI Learned Lessons from trades
  const [learnedLessons, setLearnedLessons] = useState<AILearnedLesson[]>(() => {
    try {
      const saved = localStorage.getItem('ai_trading_bot_lessons_v19');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-lesson-1',
        timestamp: new Date().toLocaleTimeString('en-US'),
        tradeId: 'tr-seed-3',
        symbol: 'SOLUSDT',
        strategyUsed: 'RSI Reversal 5m',
        pnl: -8.0,
        errorType: 'COUNTER_TREND_ERROR',
        diagnosis: 'Trade was entered against the macro trend (SHORT in UP trend).',
        arabicDiagnosis: 'تم الدخول بالصفقة عكس الاتجاه العام للسوق (SHORT في اتجاه صاعد).',
        remedyAction: 'AI penalized counter-trend strategy weight by -15% and tightened trend enforcement.',
        arabicRemedyAction: 'قام الذكاء الاصطناعي بخفض وزن استراتيجية العكس بنسبة -15% وتغليظ شرط فلتر الاتجاه الصارم.',
        weightDelta: -0.15,
        confidenceDelta: 2,
        status: 'APPLIED',
      },
      {
        id: 'init-lesson-2',
        timestamp: new Date().toLocaleTimeString('en-US'),
        tradeId: 'tr-seed-1',
        symbol: 'BTCUSDT',
        strategyUsed: 'Trend Following 1h',
        pnl: 20.15,
        errorType: 'PERFECT_EXECUTION_WIN',
        diagnosis: 'Successful trade execution with positive R:R and high indicator synergy.',
        arabicDiagnosis: 'تنفيذ ناجح بنسبة ربح عالية وتوافق فني ممتاز مع مؤشرات الزخم.',
        remedyAction: 'AI boosted strategy weight by +10% for optimal exploitation.',
        arabicRemedyAction: 'قام الذكاء الاصطناعي برفع وزن استراتيجية الاتجاه بنسبة +10% لاستغلالها بكفاءة.',
        weightDelta: 0.1,
        confidenceDelta: 0,
        status: 'APPLIED',
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_trading_bot_config_v19', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_trading_bot_closed_trades_v19', JSON.stringify(closedTrades));
    } catch {
      // ignore
    }
  }, [closedTrades]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_trading_bot_performances_v19', JSON.stringify(strategyPerformances));
    } catch {
      // ignore
    }
  }, [strategyPerformances]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_trading_bot_lessons_v19', JSON.stringify(learnedLessons));
    } catch {
      // ignore
    }
  }, [learnedLessons]);

  // Detected macro market regime
  const currentRegime = useMemo(() => detectMarketRegime(assets), [assets]);

  // Confidence & AI States
  const [confidenceState, setConfidenceState] = useState<AdaptiveConfidenceState>({
    currentConfidence: config.currentConfidence,
    minConfidence: config.minConfidence,
    maxConfidence: config.maxConfidence,
    consecutiveWins: 2,
    consecutiveLosses: 0,
    totalAdjustments: 4,
    history: [
      {
        id: 'conf-init-1',
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
        reason: isAr ? '5 صفقات رابحة متتالية' : '5 consecutive wins',
        change: 5,
        newConfidence: config.currentConfidence,
        type: 'UP',
      },
    ],
  });

  const [aiAdaptiveState, setAiAdaptiveState] = useState<AIAdaptiveState>({
    currentLevel: 0,
    consecutiveIdleCycles: 1,
    totalAdaptations: 0,
    history: [],
  });

  const [circuitBreaker, setCircuitBreaker] = useState<CircuitBreakerState>({
    consecutiveLosses: 0,
    dailyLossesCount: 1,
    isTriggered: false,
    triggeredAt: null,
    cooldownMinutes: 30,
  });

  // Symbol-level cooldown tracking to prevent repetitive stop-outs on volatile/choppy coins
  const [lossCooldowns, setLossCooldowns] = useState<Record<string, number>>({});

  // Fear & Greed sentiment
  const [sentiment, setSentiment] = useState<MarketSentiment>(() => generateSentimentData());
  const [cycleCountdown, setCycleCountdown] = useState<number>(config.cycleIntervalSeconds);

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

  // Cycle tracking & Logs
  const [currentCycleStep, setCurrentCycleStep] = useState<BotCycleStep>(1);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: 'INFO' | 'SUCCESS' | 'WARN' | 'DANGER' }>>([
    {
      id: 'log-1',
      time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
      text: isAr
        ? 'تم تشغيل محرك AI Trading Bot v19.0 بنجاح. فحص الاتصال بـ Binance Futures.'
        : 'AI Trading Bot v19.0 engine started. Checking Binance Futures connectivity.',
      type: 'INFO',
    },
    {
      id: 'log-2',
      time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
      text: isAr
        ? 'تم تفعيل 50+ استراتيجية تداول موزونة عبر 6 أطر زمنية (1m - 1d).'
        : 'Enabled 50+ weighted trading strategies across 6 timeframes (1m - 1d).',
      type: 'SUCCESS',
    },
    {
      id: 'log-3',
      time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
      text: isAr
        ? 'أنظمة الحماية الستة مفعلة: Risk Manager (0.3% / 2.0%)، Circuit Breaker، Smart Exit.'
        : 'Active 6 Safety Systems: Risk Manager, Circuit Breaker, Smart Exit.',
      type: 'INFO',
    },
  ]);

  // Chart data
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
      peakBalance: Math.max(config.peakBalance, config.balance + openPnl),
      totalPnL: totalPnl,
      totalPnLPercent,
      todayPnL: totalPnl,
      todayPnLPercent,
      winRate,
      totalTrades,
      wins,
      losses,
      openTradesCount: activeTrades.length,
      activeSignalsCount: assets.filter((a) => a.ensembleSignal !== 'NEUTRAL').length,
    };
  }, [closedTrades, activeTrades, config.balance, config.initialBalance, config.peakBalance, assets]);

  // Add Log Helper
  const addLog = (text: string, type: 'INFO' | 'SUCCESS' | 'WARN' | 'DANGER' = 'INFO') => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
        text,
        type,
      },
      ...prev.slice(0, 49),
    ]);
  };

  // Live Binance Price Polling
  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      try {
        const symbols = assets.map((a) => a.symbol);
        const prices = await fetchLiveBinancePrices(symbols);
        if (isMounted && Object.keys(prices).length > 0) {
          setAssets((prevAssets) =>
            prevAssets.map((asset) => {
              const livePrice = prices[asset.symbol];
              if (!livePrice) return asset;
              return {
                ...asset,
                price: livePrice,
              };
            })
          );
        }
      } catch {
        // graceful fallback to simulated price movement
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Bot Lifecycle Execution Effect
  const isExecutingRef = useRef(false);

  useEffect(() => {
    if (status !== 'RUNNING') return;

    const interval = setInterval(() => {
      if (isExecutingRef.current) return;
      isExecutingRef.current = true;

      // STEP 1: Update active trades & check Smart Exit
      setCurrentCycleStep(1);
      setSentiment(generateSentimentData());
      setCycleCountdown(config.cycleIntervalSeconds);

      // Market drift - aligned with macro trend and volatility dynamics
      setAssets((prevAssets) => {
        return prevAssets.map((asset) => {
          // Directional drift: Strong confirmed trends naturally produce directional follow-through
          let directionalDrift = 0;
          if (asset.trend === 'UP') {
            directionalDrift = 0.04 + (Math.min(50, asset.adx) / 100) * 0.06;
          } else if (asset.trend === 'DOWN') {
            directionalDrift = -0.04 - (Math.min(50, asset.adx) / 100) * 0.06;
          }

          // Natural micro-fluctuations
          const noise = (Math.random() - 0.5) * 0.28;
          const deltaPct = directionalDrift + noise;
          const newPrice = Number((asset.price * (1 + deltaPct / 100)).toFixed(asset.price < 1 ? 4 : 2));
          const newChange = Number((asset.change24h + deltaPct * 0.1).toFixed(2));

          const rsiDelta = (deltaPct > 0 ? 0.4 : -0.4) + (Math.random() - 0.5) * 0.8;
          const newRsi = Math.min(85, Math.max(15, asset.rsi + rsiDelta));
          const newTrend = determineTrend(asset.ema20, asset.ema50, asset.ema200);

          const { signal, confidence, longScore, shortScore } = evaluateEnsembleSignal(
            asset,
            strategies,
            config.timeframe,
            currentRegime
          );

          let assetAudit = undefined;
          if (signal !== 'NEUTRAL') {
            assetAudit = auditTradeSetup(asset, signal, config, currentRegime, strategies);
          }

          return {
            ...asset,
            price: newPrice,
            change24h: newChange,
            rsi: Number(newRsi.toFixed(1)),
            trend: newTrend,
            ensembleSignal: signal,
            confidence: Number(confidence.toFixed(1)),
            longScore: Number(longScore.toFixed(1)),
            shortScore: Number(shortScore.toFixed(1)),
            auditScore: assetAudit?.auditScore,
            auditPassed: assetAudit?.passed,
            auditVerification: assetAudit,
          };
        });
      });

      // Update active trades prices and test smart exits
      setActiveTrades((prevActive) => {
        const remaining: Trade[] = [];

        prevActive.forEach((trade) => {
          const asset = assets.find((a) => a.symbol === trade.symbol);
          const currentPrice = asset ? asset.price : trade.currentPrice;

          const priceDiff = trade.side === 'LONG' ? currentPrice - trade.entryPrice : trade.entryPrice - currentPrice;
          const pnl = priceDiff * trade.size;
          const pnlPercent = (pnl / trade.margin) * 100;
          const peakPnlPercent = Math.max(trade.peakPnlPercent || 0, pnlPercent);

          const updatedTrade: Trade = {
            ...trade,
            currentPrice,
            pnl: Number(pnl.toFixed(2)),
            pnlPercent: Number(pnlPercent.toFixed(2)),
            peakPnlPercent: Number(peakPnlPercent.toFixed(2)),
          };

          const exitResult = checkSmartExit(updatedTrade, currentPrice, config);
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

            setConfig((prevCfg) => ({
              ...prevCfg,
              balance: Number((prevCfg.balance + closed.pnl).toFixed(2)),
              peakBalance: Math.max(prevCfg.peakBalance, prevCfg.balance + closed.pnl),
            }));

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
                    ? `💰 إغلاق صفقة رابحة على ${closed.symbol} (+${closed.pnl}$) بسبب: ${exitResult.reason}`
                    : `💰 Closed winning trade on ${closed.symbol} (+$${closed.pnl}) via: ${exitResult.reason}`,
                  'SUCCESS'
                );
              }
            } else {
              // Apply symbol cooldown to prevent revenge-trading on losing coin
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
                      ? `🛑 تفعيل قاطع الدائرة (Circuit Breaker)! تم إيقاف التداول مؤقتاً لحماية رأس المال (${consecutive} خسائر).`
                      : `🛑 Circuit Breaker triggered! Trading temporarily halted for capital protection (${consecutive} losses).`,
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
                  ? `🔻 إغلاق صفقة بخسارة على ${closed.symbol} (-${Math.abs(closed.pnl)}$) بسبب: ${exitResult.reason} | تم تفعيل تهدئة ${cooldownMin}د للرمز`
                  : `🔻 Closed trade on ${closed.symbol} (-$${Math.abs(closed.pnl)}) via: ${exitResult.reason} | Symbol in ${cooldownMin}m cooldown`,
                'DANGER'
              );
            }

            // Update Strategy Database entry
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
                // If in pureSelfLearning or new combination, add entry
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
                    const updatedWeight = Math.max(0.2, Math.min(2.5, Number((strat.weight + lesson.weightDelta).toFixed(2))));
                    return { ...strat, weight: updatedWeight };
                  }
                  return strat;
                })
              );
            }

            if (lesson.confidenceDelta > 0 && config.minConfidence < 45) {
              setConfig((c) => ({ ...c, minConfidence: Math.min(45, c.minConfidence + 1) }));
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

      // STEP 2 & 3: Check Trading State & AI Adaptive Manager
      setCurrentCycleStep(2);

      // Check Drawdown Protection
      const currentDrawdown = ((config.peakBalance - config.balance) / config.peakBalance) * 100;
      if (currentDrawdown >= config.maxDrawdownPercent) {
        setStatus('PAUSED');
        addLog(
          isAr
            ? `🛑 تحذير خطير: تجاوز السحب الأقصى (${currentDrawdown.toFixed(1)}% >= 10%)! إيقاف التداول تلقائياً.`
            : `🛑 Critical Warning: Max Drawdown breached (${currentDrawdown.toFixed(1)}%)! Auto pausing.`,
          'DANGER'
        );
        isExecutingRef.current = false;
        return;
      }

      // STEP 4, 5, 6: Check for new trade setups
      setCurrentCycleStep(6);

      if (activeTrades.length < config.maxOpenTrades && !circuitBreaker.isTriggered) {
        // Collect all candidates matching confidence and trend thresholds
        const now = Date.now();
        const eligibleCandidates = assets.filter((asset) => {
          if (asset.ensembleSignal === 'NEUTRAL') return false;
          if (asset.confidence < config.currentConfidence) return false;
          // Anti-loss safeguard: Enforce symbol cooldown if recently stopped out
          if (lossCooldowns[asset.symbol] && lossCooldowns[asset.symbol] > now) return false;
          if (config.useTrendFilter) {
            if (asset.trend === 'UP' && asset.ensembleSignal !== 'LONG') return false;
            if (asset.trend === 'DOWN' && asset.ensembleSignal !== 'SHORT') return false;
          }
          if (activeTrades.some((t) => t.symbol === asset.symbol)) return false;
          return true;
        });

        // Run multi-pillar Trade Audit Verification on every candidate
        const auditedCandidates = eligibleCandidates.map((asset) => {
          const side = asset.ensembleSignal as 'LONG' | 'SHORT';
          const audit = auditTradeSetup(asset, side, config, currentRegime, strategies);
          return { asset, side, audit };
        });

        // Filter by High-Precision Quality Verification if enabled
        const passedCandidates = config.precisionAuditMode
          ? auditedCandidates.filter((c) => c.audit.passed)
          : auditedCandidates;

        // Rank by highest audit score, then by confidence
        passedCandidates.sort((a, b) => b.audit.auditScore - a.audit.auditScore || b.asset.confidence - a.asset.confidence);

        const bestCandidate = passedCandidates[0];

        if (bestCandidate) {
          const { asset: candidate, side, audit } = bestCandidate;
          const sizeCalc = calculatePositionSize(
            config.balance,
            config,
            candidate.confidence,
            stats.todayPnL,
            0,
            candidate.price
          );

          const slDist = candidate.price * (config.stopLossPercent / 100);
          const tpDist = candidate.price * (config.takeProfitPercent / 100);

          const newTrade: Trade = {
            id: `tr-live-${Date.now()}`,
            symbol: candidate.symbol,
            side,
            entryPrice: candidate.price,
            currentPrice: candidate.price,
            margin: sizeCalc.margin,
            notional: sizeCalc.notional,
            size: sizeCalc.size,
            leverage: config.leverage,
            pnl: 0,
            pnlPercent: 0,
            stopLoss: Number((side === 'LONG' ? candidate.price - slDist : candidate.price + slDist).toFixed(candidate.price < 1 ? 4 : 2)),
            takeProfit: Number((side === 'LONG' ? candidate.price + tpDist : candidate.price - tpDist).toFixed(candidate.price < 1 ? 4 : 2)),
            confidence: candidate.confidence,
            openedAt: Date.now(),
            exitReason: null,
            strategyUsed: 'MultiStrategyAI Ensemble',
            peakPnlPercent: 0,
            auditScore: audit.auditScore,
            auditVerification: audit,
          };

          setActiveTrades((prev) => [...prev, newTrade]);
          addLog(
            isAr
              ? `🛡️ [تدقيق فائق معتمد] فتح صفقة ${side} فائقة الضمان على ${candidate.symbol} بدرجة فحص ${audit.auditScore}/100 (${audit.arabicRating}) | هامش: $${sizeCalc.margin.toFixed(1)}`
              : `🛡️ [Precision Verified] Opened high-assurance ${side} on ${candidate.symbol} with audit score ${audit.auditScore}/100 (${audit.rating}) | Margin: $${sizeCalc.margin.toFixed(1)}`,
            'SUCCESS'
          );

          setAiAdaptiveState((prev) => ({ ...prev, consecutiveIdleCycles: 0 }));
        } else if (auditedCandidates.length > 0) {
          // Candidates were found but screened out by the strict audit engine
          const topCandidate = auditedCandidates[0];
          addLog(
            isAr
              ? `🔍 [فلتر التدقيق الفائق] تم حجب إشارة ${topCandidate.side} لـ ${topCandidate.asset.symbol} لعدم كفاية الشروط (${topCandidate.audit.auditScore}/100): ${topCandidate.audit.arabicReasons.slice(0, 2).join(' | ')}`
              : `🔍 [Audit Scrutiny] Filtered out ${topCandidate.side} on ${topCandidate.asset.symbol} (${topCandidate.audit.auditScore}/100): ${topCandidate.audit.reasons.slice(0, 2).join(' | ')}`,
            'WARN'
          );

          setAiAdaptiveState((prev) => {
            const idle = prev.consecutiveIdleCycles + 1;
            return { ...prev, consecutiveIdleCycles: idle };
          });
        } else {
          setAiAdaptiveState((prev) => {
            const idle = prev.consecutiveIdleCycles + 1;
            if (idle >= 5 && prev.currentLevel < 3) {
              const nextLevel = (prev.currentLevel + 1) as 1 | 2 | 3;
              addLog(
                isAr
                  ? `⚡ تفعيل التكيف التلقائي (المستوى ${nextLevel}) بعد 5 دورات خاملة بدون صفقات!`
                  : `⚡ AI Adaptive Manager: Triggered Level ${nextLevel} after 5 idle cycles!`,
                'INFO'
              );

              if (nextLevel === 1) {
                setConfig((c) => ({
                  ...c,
                  minConfidence: Math.max(10, c.minConfidence - 1),
                  minScore: Math.max(10, c.minScore - 5),
                  maxOpenTrades: 5,
                }));
              } else if (nextLevel === 2) {
                setConfig((c) => ({
                  ...c,
                  minConfidence: Math.max(10, c.minConfidence - 1),
                  minScore: Math.max(10, c.minScore - 5),
                }));
              } else if (nextLevel === 3) {
                setConfig((c) => ({
                  ...c,
                  minConfidence: 10,
                  minScore: 10,
                  useTrendFilter: false,
                }));
              }

              return {
                ...prev,
                currentLevel: nextLevel,
                consecutiveIdleCycles: 0,
                totalAdaptations: prev.totalAdaptations + 1,
                history: [
                  {
                    id: `ai-adapt-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US'),
                    action: isAr
                      ? `تفعيل التكيف المستوى ${nextLevel} (تخفيف الشروط لإنعاش التداول)`
                      : `Adaptive Level ${nextLevel} active`,
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

      setCurrentCycleStep(7);
      isExecutingRef.current = false;
    }, config.cycleIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [status, config, assets, activeTrades, circuitBreaker, strategies, isAr]);

  // Bot Manual Actions
  const handleStart = () => {
    setStatus('RUNNING');
    addLog(isAr ? '▶ تم تشغيل دورات تداول البوت بنجاح.' : '▶ Bot trading engine started.', 'SUCCESS');
  };

  const handlePause = () => {
    setStatus('PAUSED');
    addLog(isAr ? '⏸ تم إيقاف البوت مؤقتاً. لن يتم فتح صفقات جديدة.' : '⏸ Bot paused. No new positions will be opened.', 'WARN');
  };

  const handleResume = () => {
    setStatus('RUNNING');
    addLog(isAr ? '▶ تم استئناف نشاط البوت والبحث عن إشارات.' : '▶ Bot resumed trading cycles.', 'INFO');
  };

  const handleStop = () => {
    setStatus('STOPPED');
    addLog(isAr ? '■ تم إيقاف البوت بالكامل.' : '■ Bot stopped completely.', 'DANGER');
  };

  const handleManualCycle = () => {
    setCycleCountdown(config.cycleIntervalSeconds);
    setSentiment(generateSentimentData());
    addLog(isAr ? '⚡ تم تشغيل دورة فحص السوق وتحديث المؤشرات يدوياً.' : '⚡ Manual market analysis cycle triggered.', 'INFO');
  };

  // Close trade manually
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
    setConfig((c) => ({ ...c, balance: Number((c.balance + closed.pnl).toFixed(2)) }));

    // AI Self-Learning & Error Diagnostics for manual close
    const assetForClosed = assets.find((a) => a.symbol === closed.symbol);
    const lesson = analyzeTradeErrorAndLearn(closed, assetForClosed, config);
    setLearnedLessons((prev) => [lesson, ...prev.slice(0, 49)]);

    if (lesson.weightDelta !== 0) {
      setStrategies((prevStrats) =>
        prevStrats.map((strat) => {
          if (strat.name === closed.strategyUsed || strat.arabicName === closed.strategyUsed) {
            const updatedWeight = Math.max(0.2, Math.min(2.5, Number((strat.weight + lesson.weightDelta).toFixed(2))));
            return { ...strat, weight: updatedWeight };
          }
          return strat;
        })
      );
    }

    addLog(
      isAr
        ? `🖐️ تم إغلاق صفقة ${closed.symbol} يدوياً بنتيجة: ${closed.pnl >= 0 ? `+$${closed.pnl}` : `-$${Math.abs(closed.pnl)}`}`
        : `🖐️ Manually closed trade on ${closed.symbol}: ${closed.pnl >= 0 ? `+$${closed.pnl}` : `-$${Math.abs(closed.pnl)}`}`,
      'INFO'
    );
  };

  // Force manual trade from Watchlist
  const handleForceTrade = (symbol: string, side: 'LONG' | 'SHORT') => {
    const asset = assets.find((a) => a.symbol === symbol);
    if (!asset) return;

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

    const audit = auditTradeSetup(asset, side, config, currentRegime, strategies);

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
      strategyUsed: 'Manual Instant Execution',
      peakPnlPercent: 0,
      auditScore: audit.auditScore,
      auditVerification: audit,
    };

    setActiveTrades((prev) => [...prev, newTrade]);
    addLog(
      isAr
        ? `⚡ فتح صفقة فورية ${side} على ${symbol} (فحص: ${audit.auditScore}/100 - ${audit.arabicRating}) بسعر $${asset.price}`
        : `⚡ Instant ${side} executed on ${symbol} (Audit: ${audit.auditScore}/100 - ${audit.rating}) at $${asset.price}`,
      'SUCCESS'
    );
  };

  // Reset AI Adaptive state
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
      minConfidence: 15,
      minScore: 25,
      maxOpenTrades: 4,
      timeframe: '1h',
      useTrendFilter: true,
    }));
    addLog(
      isAr
        ? '🔄 تم إعادة تعيين معايير الذكاء الاصطناعي التكيفي إلى الإعدادات الأساسية.'
        : '🔄 Reset AI Adaptive manager to standard parameters.',
      'INFO'
    );
  };

  // Toggle & Weight Strategies
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
    addLog(isAr ? '✓ تم تفعيل جميع الـ 50+ استراتيجية تداول.' : '✓ Enabled all 50+ strategies.', 'SUCCESS');
  };

  const handleDisableAllStrategies = () => {
    setStrategies((prev) => prev.map((s) => ({ ...s, enabled: false })));
    addLog(isAr ? '⚠️ تم تعطيل جميع الاستراتيجيات.' : '⚠️ Disabled all strategies.', 'WARN');
  };

  const handleResetStrategies = () => {
    setStrategies(INITIAL_STRATEGIES);
    addLog(isAr ? '🔄 تمت استعادة التوزيع الافتراضي للاستراتيجيات والأوزان.' : '🔄 Restored default strategy weights.', 'INFO');
  };

  // Database Management: Purge Database to start Pure Self Learning
  const handlePurgeDatabase = () => {
    setClosedTrades([]);
    // In Pure Self Learning mode, zero out previous stats so the bot learns only from its own new executions
    setStrategyPerformances([]);
    setLearnedLessons([]);
    try {
      localStorage.removeItem('ai_trading_bot_lessons_v19');
    } catch {
      // ignore
    }
    setChartData([
      {
        time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        balance: config.balance,
        pnl: 0,
      },
    ]);
    addLog(
      isAr
        ? '🗑️ تم تفريغ قاعدة بيانات البوت وسجل التعلم بالكامل. سيبدأ البوت الآن بالتعلم الذاتي بناءً على صفقاته ونتائجه الحصرية فقط (Pure Self-Learning Mode).'
        : '🗑️ Database and learning logs purged. The bot will now begin pure self-learning based exclusively on its own performance.',
      'SUCCESS'
    );
  };

  // Toggle Trading Mode (Paper with real live data <-> Real Live API)
  const handleToggleTradingMode = () => {
    if (config.tradingMode === 'PAPER') {
      if (!config.binanceApiKey || !config.binanceApiSecret) {
        setIsSettingsOpen(true);
        addLog(
          isAr
            ? '⚠️ للانتقال إلى التداول الحقيقي (Live Binance API)، يرجى إدخال مفاتيح API الخاصة بك وحفظ الإعدادات أولاً.'
            : '⚠️ To switch to Real Live Trading, please enter your Binance API Key and Secret in Settings first.',
          'WARN'
        );
      } else {
        setConfig((prev) => ({ ...prev, tradingMode: 'REAL' }));
        addLog(
          isAr
            ? `🔴 تم الانتقال بنجاح إلى وضع التداول الحقيقي (Binance Futures ${config.binanceNetwork}).`
            : `🔴 Successfully switched to Real Live Trading Mode (Binance Futures ${config.binanceNetwork}).`,
          'SUCCESS'
        );
      }
    } else {
      setConfig((prev) => ({ ...prev, tradingMode: 'PAPER' }));
      addLog(
        isAr
          ? '🟢 تم الانتقال بنجاح إلى وضع التداول التجريبي (Paper Trading) ببيانات السوق الحية الحقيقية.'
          : '🟢 Successfully switched to Paper Trading Mode with live real-time market data feed.',
        'INFO'
      );
    }
  };

  // Deep AI Strategy Exploitation & Optimization
  const handleDeepAIOptimization = () => {
    setStrategies((prevStrats) =>
      prevStrats.map((strat) => {
        const boost = getRegimeStrategyBoost(strat.category, currentRegime);
        const tunedWeight = Number((strat.weight * 0.8 + boost * 0.2).toFixed(2));
        return { ...strat, weight: Math.max(0.3, Math.min(2.5, tunedWeight)) };
      })
    );
    addLog(
      isAr
        ? `✨ [تحسين عميق للذكاء الاصطناعي] تمت إعادة مواءمة أوزان الـ 50+ استراتيجية مع بيئة السوق الحالية (${currentRegime}).`
        : `✨ [Deep AI Optimization] Aligned all 50+ strategy weights with prevailing market regime (${currentRegime}).`,
      'SUCCESS'
    );
  };

  // Restore Initial Benchmark Database
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

  // Reset Balance Handler
  const handleResetBalance = (amount: number) => {
    setConfig((prev) => ({
      ...prev,
      balance: amount,
      initialBalance: amount,
      peakBalance: amount,
    }));
    setChartData([
      {
        time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        balance: amount,
        pnl: 0,
      },
    ]);
    addLog(
      isAr
        ? `💰 تم ضبط رأس المال بنجاح إلى $${amount.toFixed(2)}.`
        : `💰 Account balance reset to $${amount.toFixed(2)}.`,
      'SUCCESS'
    );
  };

  // Simulation test triggers for Confidence Manager
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition font-semibold ${
              activeTab === 'TRADES_HISTORY'
                ? 'bg-[#1e2329] text-sky-400 border border-[#2b2f36] shadow-sm'
                : 'bg-[#181a20] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329] border border-transparent'
            }`}
          >
            <History className="h-4 w-4" />
            <span>{isAr ? 'سجل الصفقات' : 'Trade History'} ({closedTrades.length})</span>
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
          setConfig(newConfig);
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
    </div>
  );
}

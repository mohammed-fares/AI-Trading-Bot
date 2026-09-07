import React from 'react';
import { Wallet, TrendingUp, Award, BarChart3, ArrowUpRight, ArrowDownRight, ShieldAlert } from 'lucide-react';
import { BotConfig, Trade } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface DashboardStatsProps {
  config?: BotConfig;
  activeTrades?: Trade[];
  closedTrades?: Trade[];
  dailyTradesCount?: number;
  dailyPnL?: number;
  stats?: any;
  circuitBreakerTriggered?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  config = {
    balance: 1000,
    initialBalance: 1000,
    peakBalance: 1000,
    leverage: 10,
    maxDailyRisk: 2,
    maxTradeRisk: 0.3,
    maxOpenTrades: 3,
    tradeSizePercent: 3,
    timeframe: '5m',
    minScore: 40,
    minConfidence: 45,
    stopLossPercent: 2.0,
    takeProfitPercent: 5.0,
    maxDrawdownPercent: 5.0,
    useTrendFilter: true,
    useSmartExit: true,
    cycleIntervalSeconds: 15,
    currentConfidence: 70,
    testnetMode: true,
    tradingMode: 'PAPER',
    binanceApiKey: '',
    binanceApiSecret: '',
    binanceNetwork: 'TESTNET',
    pureSelfLearning: true,
  },
  activeTrades = [],
  closedTrades = [],
  dailyTradesCount = 0,
  dailyPnL = 0,
  stats,
  circuitBreakerTriggered,
}) => {
  const { t, isAr } = useLanguage();

  const effectiveDailyPnL = stats?.todayPnL ?? dailyPnL;
  const effectiveDailyTrades = stats?.todayTradesCount ?? stats?.totalTrades ?? dailyTradesCount;

  // Calculate unrealized PnL from active trades
  const unrealizedPnL = activeTrades.reduce((sum, trade) => sum + (trade?.pnl || 0), 0);

  // Total realized PnL
  const totalRealizedPnL = stats?.totalPnL ?? closedTrades.reduce((sum, trade) => sum + (trade?.pnl || 0), 0);

  // Win rate
  const winningTrades = stats?.wins ?? closedTrades.filter((trade) => (trade?.pnl || 0) > 0).length;
  const totalClosed = stats?.totalTrades ?? closedTrades.length;
  const winRate = stats?.winRate ?? (totalClosed > 0 ? (winningTrades / totalClosed) * 100 : 0);

  // Margin in use
  const usedMargin = activeTrades.reduce((sum, trade) => sum + (trade?.margin || 0), 0);
  const currentBalance = config?.balance ?? 1000;
  const availableBalance = Math.max(0, currentBalance - usedMargin);
  const marginUsagePct = currentBalance > 0 ? (usedMargin / currentBalance) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {/* 1. الرصيد (Balance) */}
      <div
        id="stat-balance-card"
        className="bg-[#1e2329] border border-[#2b2f36] hover:border-[#3b404a] rounded-xl p-3.5 shadow-sm transition"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5 font-mono">
            <Wallet className="h-3.5 w-3.5 text-[#fcd535]" />
            <span>{t.kpiBalance}</span>
          </span>
          <span className="text-[10px] font-mono text-[#848e9c] bg-[#0b0e11] px-1.5 py-0.5 rounded border border-[#2b2f36]">
            Peak: ${config.peakBalance.toFixed(2)}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-mono font-bold text-[#fcd535]">
            ${config.balance.toFixed(2)}
          </span>
          <span className="text-xs text-[#848e9c] font-mono">USDT</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-[#2b2f36] flex items-center justify-between text-xs text-[#848e9c] font-mono">
          <span>{isAr ? 'المتاح:' : 'Avail:'} <strong className="text-[#eaecef]">${availableBalance.toFixed(2)}</strong></span>
          <span>{isAr ? 'الهامش:' : 'Margin:'} <strong className="text-[#fcd535]">{marginUsagePct.toFixed(1)}%</strong></span>
        </div>
      </div>

      {/* 2. الأرباح والخسائر (Daily PnL) */}
      <div
        id="stat-pnl-card"
        className="bg-[#1e2329] border border-[#2b2f36] hover:border-[#3b404a] rounded-xl p-3.5 shadow-sm transition"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5 font-mono">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.kpiDailyPnL}</span>
          </span>
          {effectiveDailyPnL >= 0 ? (
            <span className="flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="h-3 w-3" />
              +${effectiveDailyPnL.toFixed(2)}
            </span>
          ) : (
            <span className="flex items-center text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded">
              <ArrowDownRight className="h-3 w-3" />
              -${Math.abs(effectiveDailyPnL).toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-mono font-bold ${
              totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {totalRealizedPnL >= 0 ? `+$${totalRealizedPnL.toFixed(2)}` : `-$${Math.abs(totalRealizedPnL).toFixed(2)}`}
          </span>
          <span className="text-xs text-[#848e9c] font-mono">
            ({(((currentBalance - (config.initialBalance || 1000)) / (config.initialBalance || 1000)) * 100).toFixed(1)}%)
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-[#2b2f36] flex items-center justify-between text-xs text-[#848e9c] font-mono">
          <span>{isAr ? 'غير محقق:' : 'Unrealized:'}{' '}
            <strong className={`${unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {unrealizedPnL >= 0 ? `+$${unrealizedPnL.toFixed(2)}` : `-$${Math.abs(unrealizedPnL).toFixed(2)}`}
            </strong>
          </span>
          <span>{isAr ? 'اليومي:' : 'Daily:'} <strong className="text-[#eaecef]">{effectiveDailyTrades}</strong></span>
        </div>
      </div>

      {/* 3. نسبة النجاح (Win Rate) */}
      <div
        id="stat-winrate-card"
        className="bg-[#1e2329] border border-[#2b2f36] hover:border-[#3b404a] rounded-xl p-3.5 shadow-sm transition"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5 font-mono">
            <Award className="h-3.5 w-3.5 text-sky-400" />
            <span>{t.kpiWinRate}</span>
          </span>
          <span className="text-[10px] font-mono text-[#848e9c] bg-[#0b0e11] px-1.5 py-0.5 rounded border border-[#2b2f36]">
            {winningTrades}W / {totalClosed - winningTrades}L
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-mono font-bold text-sky-400">
            {winRate.toFixed(1)}%
          </span>
          <span className="text-xs text-[#848e9c] font-mono">
            ({winningTrades}/{totalClosed || 0})
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-[#2b2f36]">
          <div className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-full h-1.5 overflow-hidden flex">
            <div
              className="bg-sky-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, winRate)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-[#848e9c] font-mono mt-1">
            <span>{isAr ? `المنفذ: ${totalClosed}` : `Total: ${totalClosed}`}</span>
            <span>{isAr ? 'الهدف: ≥70%' : 'Target: ≥70%'}</span>
          </div>
        </div>
      </div>

      {/* 4. الصفقات والثقة (AI Confidence & Circuit Breaker) */}
      <div
        id="stat-trades-card"
        className="bg-[#1e2329] border border-[#2b2f36] hover:border-[#3b404a] rounded-xl p-3.5 shadow-sm transition"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5 font-mono">
            <BarChart3 className="h-3.5 w-3.5 text-orange-400" />
            <span>{t.currentConfidence}</span>
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              activeTrades.length >= config.maxOpenTrades
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-[#0b0e11] border-[#2b2f36] text-[#fcd535]'
            }`}
          >
            {activeTrades.length}/{config.maxOpenTrades} {isAr ? 'مفتوحة' : 'active'}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-mono font-bold text-orange-400">
            {config.currentConfidence}%
          </span>
          <span className="text-xs text-[#848e9c] font-mono">Adaptive</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-[#2b2f36] flex items-center justify-between text-xs text-[#848e9c] font-mono">
          <span>{isAr ? 'الرافعة:' : 'Lev:'} <strong className="text-[#fcd535]">{config.leverage}x</strong></span>
          <span>{isAr ? 'الفريم:' : 'TF:'} <strong className="text-[#eaecef]">{config.timeframe}</strong></span>
        </div>
      </div>
    </div>
  );
};

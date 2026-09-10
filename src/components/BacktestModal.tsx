import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import { BacktestReport, Language } from '../types';

interface BacktestModalProps {
  symbols: string[];
  currentSymbol: string;
  lang: Language;
  onClose: () => void;
}

export const BacktestModal: React.FC<BacktestModalProps> = ({
  symbols,
  currentSymbol,
  lang,
  onClose,
}) => {
  const isAr = lang === 'ar';
  const [selectedSymbol, setSelectedSymbol] = useState(currentSymbol || 'BTCUSDT');
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '4h'>('15m');
  const [candleCount, setCandleCount] = useState<number>(300);
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          timeframe,
          candleCount,
          targetProfitUSD: 20, // Strictly $20 per trade
          leverage: 10,
          stopLossPercent: 1.25,
          takeProfitPercent: 2.5,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        throw new Error(data.error || 'Failed to complete backtest');
      }
    } catch (err: any) {
      setError(err.message || 'Error running historical backtest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in flex flex-col max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2b2f36] flex items-center justify-between bg-[#1e2329]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#eaecef]">
                  {isAr
                    ? 'اختبار الأداء التاريخي لبيانات بينانس فيوتشرز'
                    : 'Binance Futures Historical Backtesting Engine'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0b0e11] text-[#fcd535] border border-[#fcd535]/30 font-mono font-bold">
                  Target: $20 / trade
                </span>
              </div>
              <p className="text-xs text-[#848e9c]">
                {isAr
                  ? 'محاكاة حقيقية على بيانات شموع بينانس السابقة دون توليد بيانات وهمية'
                  : 'Rigorous validation on Binance real historical candles (no synthetic data)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#2b2f36] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 border-b border-[#2b2f36] bg-[#0b0e11] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Symbol selector */}
            <div>
              <label className="text-[10px] text-[#848e9c] block font-mono mb-1">
                {isAr ? 'زوج التداول' : 'Symbol'}
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-[#1e2329] border border-[#2b2f36] rounded-lg px-3 py-1.5 text-xs text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
              >
                {symbols.map((sym) => {
                  const clean = sym.replace('/', '');
                  return (
                    <option key={clean} value={clean}>
                      {clean}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="text-[10px] text-[#848e9c] block font-mono mb-1">
                {isAr ? 'الفريم الزمني' : 'Timeframe'}
              </label>
              <div className="flex bg-[#1e2329] rounded-lg p-0.5 border border-[#2b2f36]">
                {(['15m', '1h', '4h'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                      timeframe === tf
                        ? 'bg-[#fcd535] text-black font-bold'
                        : 'text-[#848e9c] hover:text-[#eaecef]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Candle count */}
            <div>
              <label className="text-[10px] text-[#848e9c] block font-mono mb-1">
                {isAr ? 'عدد الشموع التاريخية' : 'History Depth'}
              </label>
              <div className="flex bg-[#1e2329] rounded-lg p-0.5 border border-[#2b2f36]">
                {[150, 300, 500].map((count) => (
                  <button
                    key={count}
                    onClick={() => setCandleCount(count)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                      candleCount === count
                        ? 'bg-[#2b2f36] text-[#eaecef]'
                        : 'text-[#848e9c] hover:text-[#eaecef]'
                    }`}
                  >
                    {count} {isAr ? 'شمعة' : 'bars'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={runBacktest}
            disabled={loading}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono rounded-xl transition flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            <span>
              {loading
                ? isAr ? 'جاري جلب البيانات واختبار الاستراتيجية...' : 'Fetching Binance Data & Testing...'
                : isAr ? 'بدء الاختبار التاريخي' : 'Run Backtest'}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!report && !loading && (
            <div className="py-16 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-[#1e2329] inline-block text-[#848e9c]">
                <BarChart3 className="h-10 w-10 text-[#fcd535]" />
              </div>
              <h4 className="text-sm font-bold text-[#eaecef]">
                {isAr ? 'جاهز للاختبار التاريخي' : 'Ready to Run Historical Backtest'}
              </h4>
              <p className="text-xs text-[#848e9c] max-w-md mx-auto">
                {isAr
                  ? 'اختر الزوج والفريم الزمني ثم اضغط على زر بدء الاختبار لتحميل بيانات بينانس الحقيقية ومحاكاة صفقات بمستهدف 20 دولار بالضبط.'
                  : 'Select your pair and timeframe, then click Run Backtest to pull real Binance historical data and simulate trades strictly targeting $20 per trade.'}
              </p>
            </div>
          )}

          {report && (
            <>
              {/* Key Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                <div className="p-3 bg-[#0b0e11] rounded-xl border border-[#2b2f36] font-mono">
                  <span className="text-[10px] text-[#848e9c] block">
                    {isAr ? 'إجمالي الصفقات' : 'Total Trades'}
                  </span>
                  <span className="text-base font-bold text-[#eaecef]">
                    {report.totalTrades}
                  </span>
                </div>

                <div className="p-3 bg-[#0b0e11] rounded-xl border border-[#2b2f36] font-mono">
                  <span className="text-[10px] text-[#848e9c] block">
                    {isAr ? 'نسبة الفوز' : 'Win Rate'}
                  </span>
                  <span
                    className={`text-base font-bold ${
                      report.winRate >= 60 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {report.winRate}%
                  </span>
                </div>

                <div className="p-3 bg-[#0b0e11] rounded-xl border border-[#2b2f36] font-mono">
                  <span className="text-[10px] text-[#848e9c] block">
                    {isAr ? 'صافي الربح' : 'Net PnL'}
                  </span>
                  <span
                    className={`text-base font-bold ${
                      report.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {report.totalPnL >= 0 ? '+' : ''}${report.totalPnL.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 bg-[#0b0e11] rounded-xl border border-[#2b2f36] font-mono">
                  <span className="text-[10px] text-[#848e9c] block">
                    {isAr ? 'عامل الربحية' : 'Profit Factor'}
                  </span>
                  <span className="text-base font-bold text-[#fcd535]">
                    {report.profitFactor}
                  </span>
                </div>

                <div className="p-3 bg-[#0b0e11] rounded-xl border border-[#2b2f36] font-mono">
                  <span className="text-[10px] text-[#848e9c] block">
                    {isAr ? 'أقصى تراجع' : 'Max Drawdown'}
                  </span>
                  <span className="text-base font-bold text-red-400">
                    -{report.maxDrawdownPercent}%
                  </span>
                </div>

                <div className="p-3 bg-[#0b0e11] rounded-xl border border-[#2b2f36] font-mono">
                  <span className="text-[10px] text-[#848e9c] block">
                    {isAr ? 'متوسط الربح / صفقة' : 'Avg PnL / Trade'}
                  </span>
                  <span className="text-base font-bold text-emerald-400">
                    +${report.averageProfitPerTrade.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Equity Curve Visualizer */}
              <div className="p-4 bg-[#0b0e11] rounded-xl border border-[#2b2f36] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#848e9c] flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{isAr ? 'منحنى الرصيد التراكمي (Equity Curve)' : 'Cumulative Equity Curve'}</span>
                  </span>
                  <span className="text-[#eaecef] font-bold">
                    ${report.equityCurve[report.equityCurve.length - 1]?.balance.toFixed(2)} USDT
                  </span>
                </div>

                {/* SVG Mini Curve */}
                <div className="h-28 w-full bg-[#181a20] rounded-lg p-2 flex items-end">
                  {report.equityCurve.length > 1 ? (
                    <svg className="w-full h-full overflow-visible">
                      {(() => {
                        const minBal = Math.min(...report.equityCurve.map((p) => p.balance)) * 0.99;
                        const maxBal = Math.max(...report.equityCurve.map((p) => p.balance)) * 1.01;
                        const range = maxBal - minBal || 1;

                        const points = report.equityCurve
                          .map((p, idx) => {
                            const x = (idx / (report.equityCurve.length - 1)) * 100;
                            const y = 100 - ((p.balance - minBal) / range) * 90;
                            return `${x},${y}`;
                          })
                          .join(' ');

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                          </>
                        );
                      })()}
                    </svg>
                  ) : (
                    <div className="w-full text-center text-xs text-[#848e9c]">
                      {isAr ? 'لا توجد صفقات كافية لرسم المنحنى' : 'Not enough trade points to render curve'}
                    </div>
                  )}
                </div>
              </div>

              {/* Simulated Trades List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#848e9c] font-mono uppercase">
                  {isAr ? 'سجل الصفقات المنفذة في المحاكاة' : 'Simulated Executed Trades Log'}
                </h4>

                <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono" dir="ltr">
                      <thead className="bg-[#1e2329] text-[10px] text-[#848e9c] uppercase sticky top-0">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Side</th>
                          <th className="py-2 px-3">Entry</th>
                          <th className="py-2 px-3">Exit</th>
                          <th className="py-2 px-3">PnL (Target: $20)</th>
                          <th className="py-2 px-3">Exit Reason</th>
                          <th className="py-2 px-3">Strategy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2329]">
                        {report.trades.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-[#848e9c]">
                              {isAr ? 'لم تنطبق شروط الدخول خلال هذه الفترة' : 'No trade entries matched during this interval'}
                            </td>
                          </tr>
                        ) : (
                          report.trades.map((tr, idx) => (
                            <tr key={tr.id} className="hover:bg-[#181a20]">
                              <td className="py-2 px-3 text-[#848e9c]">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    tr.side === 'LONG'
                                      ? 'bg-emerald-500/15 text-emerald-400'
                                      : 'bg-red-500/15 text-red-400'
                                  }`}
                                >
                                  {tr.side}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-[#eaecef]">
                                ${tr.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-[#eaecef]">
                                ${tr.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 font-bold">
                                <span
                                  className={tr.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}
                                >
                                  {tr.pnl > 0 ? '+' : ''}${tr.pnl.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2329] text-[#848e9c]">
                                  {tr.exitReason}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-[#848e9c] text-[11px] truncate max-w-[160px]">
                                {tr.strategyUsed}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1e2329] border-t border-[#2b2f36] flex items-center justify-between">
          <div className="text-[11px] text-[#848e9c] font-mono flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {isAr
                ? 'نتائج المحاكاة تعتمد كلياً على أسعار بينانس فيوتشرز الفعلية'
                : 'All backtest simulations run against genuine Binance Futures public klines'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2b2f36] hover:bg-[#3b404a] text-[#eaecef] text-xs font-bold rounded-xl transition"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

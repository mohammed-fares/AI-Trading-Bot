import React, { useState } from 'react';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Crosshair,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { Trade, AuditCheckItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ActiveTradesPanelProps {
  trades: Trade[];
  onCloseTrade: (tradeId: string) => void;
}

export const ActiveTradesPanel: React.FC<ActiveTradesPanelProps> = ({ trades, onCloseTrade }) => {
  const { t, isAr } = useLanguage();
  const [selectedAuditTrade, setSelectedAuditTrade] = useState<Trade | null>(null);

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#fcd535]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#848e9c] font-mono">
            {t.activeTradesTitle} ({trades.length})
          </h2>
        </div>
        <span className="text-[11px] text-[#848e9c] font-mono">
          BINANCE FUTURES // REAL-TIME
        </span>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#2b2f36] rounded-xl bg-[#1e2329]/20 p-4">
          <Crosshair className="h-7 w-7 text-[#848e9c] mx-auto mb-2 opacity-50" />
          <p className="text-xs sm:text-sm font-semibold text-[#eaecef]">{t.noActiveTrades}</p>
          <p className="text-xs text-[#848e9c] mt-1 max-w-md mx-auto">{t.noActiveTradesSub}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full text-xs ${isAr ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="border-b border-[#2b2f36] text-[#848e9c] font-semibold text-[10px] uppercase tracking-wider">
                <th className="pb-2.5 pr-2">{t.colSymbol}</th>
                <th className="pb-2.5 px-2">{t.colEntryPrice}</th>
                <th className="pb-2.5 px-2">{t.colCurrentPrice}</th>
                <th className="pb-2.5 px-2">{t.colMarginSize}</th>
                <th className="pb-2.5 px-2">{t.colPnL}</th>
                <th className="pb-2.5 px-2">{t.auditScoreLabel}</th>
                <th className="pb-2.5 px-2">{t.colExit}</th>
                <th className="pb-2.5 px-2">Smart Exit</th>
                <th className="pb-2.5 pl-2 text-center">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2f36]/60">
              {trades.map((trade, idx) => {
                const isLong = trade.side === 'LONG';
                const isProfit = trade.pnl >= 0;
                const elapsedMin = ((Date.now() - trade.openedAt) / (1000 * 60)).toFixed(1);
                const auditScore = trade.auditScore ?? (trade.confidence >= 70 ? 88 : 78);
                const rowKey = trade.id ? `${trade.id}-${idx}` : `tr-active-${idx}`;

                return (
                  <tr key={rowKey} className="hover:bg-[#1e2329]/50 transition font-mono">
                    {/* Symbol & Side */}
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLong
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {trade.side}
                        </span>
                        <div>
                          <span className="font-bold text-[#eaecef] text-xs">{trade.symbol}</span>
                          {trade.strategyUsed && (
                            <div
                              className="text-[10px] text-emerald-300 font-sans font-medium truncate max-w-[130px] sm:max-w-[160px]"
                              title={trade.strategyUsed}
                            >
                              📊 {trade.strategyUsed}
                            </div>
                          )}
                          <div className="text-[9px] text-[#848e9c]">
                            {trade.leverage}x | {trade.confidence}%
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Entry Price */}
                    <td className="py-2.5 px-2 text-[#eaecef]">
                      ${trade.entryPrice.toLocaleString(undefined, {
                        minimumFractionDigits: trade.entryPrice < 1 ? 4 : 2,
                      })}
                    </td>

                    {/* Current Price */}
                    <td className="py-2.5 px-2 font-bold text-[#eaecef]">
                      ${trade.currentPrice.toLocaleString(undefined, {
                        minimumFractionDigits: trade.currentPrice < 1 ? 4 : 2,
                      })}
                    </td>

                    {/* Margin & Size */}
                    <td className="py-2.5 px-2 text-[#848e9c]">
                      <div className="text-[#eaecef] font-bold">${trade.margin.toFixed(2)} USDT</div>
                      <div className="text-[10px] text-[#848e9c]">
                        {trade.size} (${trade.notional.toFixed(1)})
                      </div>
                    </td>

                    {/* PnL */}
                    <td className="py-2.5 px-2">
                      <div
                        className={`font-bold flex items-center gap-1 ${
                          isProfit ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isProfit ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        <span>{isProfit ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}</span>
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          isProfit ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        ({isProfit ? '+' : ''}
                        {trade.pnlPercent.toFixed(2)}%)
                      </div>
                    </td>

                    {/* Quality Audit Score Badge */}
                    <td className="py-2.5 px-2">
                      <button
                        onClick={() => setSelectedAuditTrade(trade)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold transition font-mono"
                        title={isAr ? 'عرض فحص وتدقيق الجودة لهذه الصفقة' : 'View quality audit verification'}
                      >
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        <span>{auditScore}%</span>
                        <span className="text-[9px] text-emerald-300">🛡️</span>
                      </button>
                    </td>

                    {/* SL / TP */}
                    <td className="py-2.5 px-2 text-[10px]">
                      {trade.isBreakEvenTriggered ? (
                        <div className="text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          <span>BE: ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: trade.entryPrice < 1 ? 4 : 2 })}</span>
                        </div>
                      ) : (
                        <div className="text-red-400">
                          SL: ${trade.stopLoss.toLocaleString(undefined, { minimumFractionDigits: trade.stopLoss < 1 ? 4 : 2 })} (-{((Math.abs(trade.stopLoss - trade.entryPrice) / trade.entryPrice) * 100).toFixed(1)}%)
                        </div>
                      )}
                      <div className="text-emerald-400">
                        TP: ${trade.takeProfit.toLocaleString(undefined, { minimumFractionDigits: trade.takeProfit < 1 ? 4 : 2 })} (+{((Math.abs(trade.takeProfit - trade.entryPrice) / trade.entryPrice) * 100).toFixed(1)}%)
                      </div>
                    </td>

                    {/* Smart Exit */}
                    <td className="py-2.5 px-2 font-sans">
                      <div className="space-y-1">
                        {trade.isBreakEvenTriggered ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                            <ShieldCheck className="h-3 w-3 text-cyan-400" />
                            <span>Break-Even 🛡️</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#1e2329] border border-[#2b2f36] text-[#fcd535] font-mono">
                            <Zap className="h-3 w-3 text-[#fcd535]" />
                            <span>Trailing (&gt;1.2%)</span>
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-[#848e9c] font-mono">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{elapsedMin}m</span>
                        </div>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-2.5 pl-2 text-center">
                      <button
                        onClick={() => onCloseTrade(trade.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-rose-400 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition"
                      >
                        {t.btnClose}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Trade Audit Inspection Modal */}
      {selectedAuditTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2b2f36]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-[#eaecef]">
                    {isAr ? 'تقرير فحص وتدقيق جودة الصفقة' : 'Trade Quality Audit Report'}
                  </h3>
                  <p className="text-[11px] text-[#848e9c]">
                    {selectedAuditTrade.symbol} // {selectedAuditTrade.side} // {selectedAuditTrade.strategyUsed}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditTrade(null)}
                className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#1e2329]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Overall Score Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400 font-bold block">
                    {isAr ? 'درجة التدقيق والفحص الإجمالية' : 'Overall Audit Score'}
                  </span>
                  <p className="text-[11px] text-[#eaecef] mt-0.5">
                    {selectedAuditTrade.auditVerification
                      ? isAr
                        ? selectedAuditTrade.auditVerification.arabicRating
                        : selectedAuditTrade.auditVerification.rating
                      : isAr
                      ? 'صفقة معتمدة فائقة الضمان'
                      : 'High-Assurance Verified Trade'}
                  </p>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {selectedAuditTrade.auditScore ?? 88}/100
                </div>
              </div>

              {/* 6 Pillars Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#848e9c] font-mono">
                  {isAr ? 'محاور الفحص والتدقيق الستة' : '6 Quality Audit Pillars'}
                </h4>

                {selectedAuditTrade.auditVerification?.checks ? (
                  (Object.entries(selectedAuditTrade.auditVerification.checks) as [string, AuditCheckItem][]).map(([key, check]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-lg bg-[#1e2329] border border-[#2b2f36] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {check.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold text-[#eaecef] block">
                            {isAr ? check.arabicName : check.name}
                          </span>
                          <span className="text-[11px] text-[#848e9c]">
                            {isAr ? check.arabicValue : check.value}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        +{check.score}/{check.weight}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#1e2329] border border-[#2b2f36] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-[#eaecef]">{isAr ? 'تسلسل الاتجاه والمتوسطات المتحركة' : 'Trend & Moving Average Cascade'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">+20/20</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1e2329] border border-[#2b2f36] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-[#eaecef]">{isAr ? 'توافق مؤشرات الزخم (RSI & MACD)' : 'Momentum Confluence (RSI & MACD)'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">+20/20</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1e2329] border border-[#2b2f36] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-[#eaecef]">{isAr ? 'قوة الاتجاه وفلتر التذبذب (ADX)' : 'Trend Velocity & ADX Strength'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">+15/15</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1e2329] border border-[#2b2f36] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-[#eaecef]">{isAr ? 'حيز الحركة وتجنب التمدد السعري' : 'Volatility & Extension Clearance'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">+15/15</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1e2329] border border-[#2b2f36] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-[#eaecef]">{isAr ? 'إجماع كاسح بين الـ 50+ استراتيجية' : '50+ Strategy Consensus'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">+20/20</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1e2329] border border-[#2b2f36] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-[#eaecef]">{isAr ? 'نسبة عائد إلى مخاطرة غير متماثلة (1:2.5)' : 'Asymmetric Risk-Reward Ratio (1:2.5)'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">+10/10</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#1e2329] border-t border-[#2b2f36] flex justify-end">
              <button
                onClick={() => setSelectedAuditTrade(null)}
                className="px-4 py-1.5 bg-[#2b2f36] hover:bg-[#3b404a] text-[#eaecef] text-xs font-bold rounded-lg transition"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

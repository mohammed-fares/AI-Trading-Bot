import React from 'react';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Crosshair,
  Clock,
  Zap,
} from 'lucide-react';
import { Trade } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ActiveTradesPanelProps {
  trades: Trade[];
  onCloseTrade: (tradeId: string) => void;
}

export const ActiveTradesPanel: React.FC<ActiveTradesPanelProps> = ({ trades, onCloseTrade }) => {
  const { t, isAr } = useLanguage();

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
                <th className="pb-2.5 px-2">{t.colExit}</th>
                <th className="pb-2.5 px-2">Smart Exit</th>
                <th className="pb-2.5 pl-2 text-center">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2f36]/60">
              {trades.map((trade) => {
                const isLong = trade.side === 'LONG';
                const isProfit = trade.pnl >= 0;
                const elapsedMin = ((Date.now() - trade.openedAt) / (1000 * 60)).toFixed(1);

                return (
                  <tr key={trade.id} className="hover:bg-[#1e2329]/50 transition font-mono">
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
                          <div className="text-[10px] text-[#848e9c]">
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

                    {/* SL / TP */}
                    <td className="py-2.5 px-2 text-[10px]">
                      <div className="text-red-400">
                        SL: ${trade.stopLoss.toLocaleString(undefined, { minimumFractionDigits: trade.stopLoss < 1 ? 4 : 2 })} (-2%)
                      </div>
                      <div className="text-emerald-400">
                        TP: ${trade.takeProfit.toLocaleString(undefined, { minimumFractionDigits: trade.takeProfit < 1 ? 4 : 2 })} (+5%)
                      </div>
                    </td>

                    {/* Smart Exit */}
                    <td className="py-2.5 px-2 font-sans">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#1e2329] border border-[#2b2f36] text-[#fcd535] font-mono">
                          <Zap className="h-3 w-3 text-[#fcd535]" />
                          <span>Trailing (&gt;1.5%)</span>
                        </span>
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
    </div>
  );
};

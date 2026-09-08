import React from 'react';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Trade, ExitReason } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface TradeHistoryPanelProps {
  closedTrades: Trade[];
}

export const TradeHistoryPanel: React.FC<TradeHistoryPanelProps> = ({ closedTrades }) => {
  const { t, isAr } = useLanguage();

  const getExitReasonLabel = (reason?: ExitReason | null) => {
    switch (reason) {
      case 'TAKE_PROFIT':
        return { label: isAr ? 'أخذ ربح (+5%)' : 'Take Profit (+5%)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'STOP_LOSS':
        return { label: isAr ? 'وقف خسارة (-2%)' : 'Stop Loss (-2%)', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
      case 'TRAILING_STOP':
        return { label: isAr ? 'وقف متحرك' : 'Trailing Stop', color: 'bg-[#0b0e11] text-[#fcd535] border-[#2b2f36]' };
      case 'TIME_EXIT':
        return { label: isAr ? 'خروج زمني' : 'Time Exit', color: 'bg-[#1e2329] text-[#848e9c] border-[#2b2f36]' };
      case 'PROFIT_RETRACEMENT':
        return { label: isAr ? 'ارتداد ربح' : 'Profit Retrace', color: 'bg-[#1e2329] text-[#fcd535] border-[#2b2f36]' };
      case 'CIRCUIT_BREAKER':
        return { label: isAr ? 'قاطع الدائرة' : 'Circuit Breaker', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
      case 'MANUAL':
        return { label: isAr ? 'إغلاق يدوي' : 'Manual Close', color: 'bg-[#0b0e11] text-[#848e9c] border-[#2b2f36]' };
      default:
        return { label: reason || (isAr ? 'إغلاق' : 'Closed'), color: 'bg-[#0b0e11] text-[#848e9c] border-[#2b2f36]' };
    }
  };

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#fcd535]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#848e9c] font-mono">
            {t.closedTradesTitle} ({closedTrades.length})
          </h2>
        </div>
        <span className="text-[11px] text-[#848e9c] font-mono">
          BINANCE EXECUTED ORDERS
        </span>
      </div>

      {closedTrades.length === 0 ? (
        <div className="text-center py-8 text-[#848e9c] text-xs font-mono">
          {t.noClosedTrades}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-80">
          <table className={`w-full text-xs ${isAr ? 'text-right' : 'text-left'}`}>
            <thead className="sticky top-0 bg-[#181a20] z-10">
              <tr className="border-b border-[#2b2f36] text-[#848e9c] font-semibold text-[10px] uppercase tracking-wider">
                <th className="pb-2.5 pr-2">{t.colSymbol}</th>
                <th className="pb-2.5 px-2">{t.colEntryPrice}</th>
                <th className="pb-2.5 px-2">{t.colClosePrice}</th>
                <th className="pb-2.5 px-2">{t.colMarginSize}</th>
                <th className="pb-2.5 px-2">{t.colPnL}</th>
                <th className="pb-2.5 px-2">{t.colExitReason}</th>
                <th className="pb-2.5 pl-2">{t.colStrategy}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2f36]/60 font-mono">
              {closedTrades.map((trade) => {
                const isProfit = trade.pnl >= 0;
                const exitInfo = getExitReasonLabel(trade.exitReason);

                return (
                  <tr key={trade.id} className="hover:bg-[#1e2329]/50 transition">
                    {/* Symbol & Side */}
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trade.side === 'LONG'
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

                    {/* Close Price */}
                    <td className="py-2.5 px-2 text-[#eaecef]">
                      ${(trade.closePrice || trade.currentPrice).toLocaleString(undefined, {
                        minimumFractionDigits: (trade.closePrice || trade.currentPrice) < 1 ? 4 : 2,
                      })}
                    </td>

                    {/* Margin */}
                    <td className="py-2.5 px-2 text-[#848e9c]">
                      <div className="text-[#eaecef]">${trade.margin.toFixed(2)} USDT</div>
                      <div className="text-[10px]">{trade.size}</div>
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
                        className={`text-[10px] ${
                          isProfit ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        ({isProfit ? '+' : ''}
                        {trade.pnlPercent.toFixed(2)}%)
                      </div>
                    </td>

                    {/* Exit Reason */}
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${exitInfo.color}`}>
                        {exitInfo.label}
                      </span>
                    </td>

                    {/* Strategy */}
                    <td className="py-2.5 pl-2 text-xs font-sans text-[#eaecef]">
                      {trade.strategyName}
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

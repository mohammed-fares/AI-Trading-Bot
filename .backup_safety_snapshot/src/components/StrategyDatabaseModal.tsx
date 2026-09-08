import React, { useState } from 'react';
import {
  X,
  Database,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { StrategyPerformance } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface StrategyDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  performances: StrategyPerformance[];
  onClearDatabase?: () => void;
  onPurgeDatabase?: () => void;
  onRestoreBenchmark?: () => void;
}

export const StrategyDatabaseModal: React.FC<StrategyDatabaseModalProps> = ({
  isOpen,
  onClose,
  performances,
  onClearDatabase,
  onPurgeDatabase,
  onRestoreBenchmark,
}) => {
  const { t, isAr } = useLanguage();
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const purgeFn = onClearDatabase || onPurgeDatabase;

  const symbols = ['ALL', ...Array.from(new Set(performances.map((p) => p.symbol)))];

  const filtered = performances.filter((p) => {
    const matchesSymbol = filterSymbol === 'ALL' || p.symbol === filterSymbol;
    const matchesSearch =
      p.strategyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSymbol && matchesSearch;
  });

  const totalWins = filtered.reduce((sum, p) => sum + (p.wins || 0), 0);
  const totalLosses = filtered.reduce((sum, p) => sum + (p.losses || 0), 0);
  const totalTrades = totalWins + totalLosses;
  const overallWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
  const totalPnl = filtered.reduce((sum, p) => sum + (p.totalPnl || 0), 0);

  const handleConfirmClear = () => {
    if (purgeFn) {
      purgeFn();
      setShowConfirmClear(false);
      setActionNotice(
        isAr
          ? 'تم تفريغ قاعدة البيانات بنجاح! سيبدأ البوت بتسجيل نتائجه الخاصة من الصفر (Pure Self-Learning Mode).'
          : 'Database purged successfully! Bot will self-learn purely from its own future trades (Pure Self-Learning Mode).'
      );
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRestoreBenchmark = () => {
    if (onRestoreBenchmark) {
      onRestoreBenchmark();
      setActionNotice(
        isAr ? 'تم استعادة البيانات الاسترشادية بنجاح.' : 'Benchmark data restored successfully.'
      );
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2b2f36] flex items-center justify-between bg-[#181a20]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#0b0e11] border border-[#2b2f36] flex items-center justify-center text-[#fcd535]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#eaecef] flex items-center gap-2">
                <span>{t.dbModalTitle}</span>
                <span className="text-[10px] font-mono bg-[#0b0e11] text-[#fcd535] border border-[#2b2f36] px-2 py-0.5 rounded">
                  {t.dbModalBadge}
                </span>
              </h2>
              <p className="text-xs text-[#848e9c]">{t.dbModalSub}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#1e2329] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-400 flex items-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Summary Metric Ribbon & Database Management Actions */}
        <div className="p-3.5 border-b border-[#2b2f36] bg-[#0b0e11]/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto flex-1">
            <div className="bg-[#1e2329] border border-[#2b2f36] p-2 rounded-lg">
              <span className="text-[#848e9c] block text-[10px] mb-0.5 font-mono">{t.dbTotalPnl}:</span>
              <span className={`font-mono font-bold text-sm ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`}
              </span>
            </div>
            <div className="bg-[#1e2329] border border-[#2b2f36] p-2 rounded-lg">
              <span className="text-[#848e9c] block text-[10px] mb-0.5 font-mono">{t.dbWinRate}:</span>
              <span className="font-mono text-[#fcd535] font-bold text-sm">
                {overallWinRate.toFixed(1)}%
              </span>
            </div>
            <div className="bg-[#1e2329] border border-[#2b2f36] p-2 rounded-lg">
              <span className="text-[#848e9c] block text-[10px] mb-0.5 font-mono">{t.dbWins}:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {totalWins}
              </span>
            </div>
            <div className="bg-[#1e2329] border border-[#2b2f36] p-2 rounded-lg">
              <span className="text-[#848e9c] block text-[10px] mb-0.5 font-mono">{t.dbLosses}:</span>
              <span className="font-mono text-red-400 font-bold text-sm">
                {totalLosses}
              </span>
            </div>
          </div>

          {/* Database Actions: Purge / Restore */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {performances.length > 0 ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-mono font-semibold transition"
                title={t.dbClearBtn}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.dbClearBtn}</span>
              </button>
            ) : (
              <button
                onClick={handleRestoreBenchmark}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2329] hover:bg-[#2b2f36] text-[#fcd535] border border-[#2b2f36] rounded-lg text-xs font-mono font-semibold transition"
                title={t.dbRestoreBtn}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.dbRestoreBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal overlay for Clear Database */}
        {showConfirmClear && (
          <div className="p-4 bg-rose-500/10 border-b border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <strong className="block text-rose-200">{t.dbClearConfirmTitle}</strong>
                <p className="text-[11px] text-rose-300/80">{t.dbClearConfirmMsg}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1.5 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] border border-[#2b2f36] rounded-lg text-xs font-mono transition"
              >
                {t.dbCancelBtn}
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-mono font-bold transition shadow-sm"
              >
                {t.dbClearConfirmBtn}
              </button>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="p-3.5 border-b border-[#2b2f36] bg-[#181a20] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="h-3.5 w-3.5 text-[#848e9c] shrink-0" />
            <span className="text-xs text-[#848e9c] font-mono shrink-0">{t.dbFilterSymbol}</span>
            <div className="flex items-center gap-1">
              {symbols.map((sym) => (
                <button
                  key={sym}
                  onClick={() => setFilterSymbol(sym)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition ${
                    filterSymbol === sym
                      ? 'bg-[#fcd535] text-[#0b0e11] font-bold shadow-sm'
                      : 'bg-[#1e2329] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#2b2f36] border border-[#2b2f36]'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className={`h-3.5 w-3.5 absolute ${isAr ? 'right-2.5' : 'left-2.5'} top-2 text-[#848e9c]`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.dbSearchPlaceholder}
              className={`w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg ${
                isAr ? 'pr-8 pl-3' : 'pl-8 pr-3'
              } py-1 text-xs text-[#eaecef] placeholder-[#848e9c] focus:outline-none focus:border-[#fcd535]`}
            />
          </div>
        </div>

        {/* Table View / Empty State */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[55vh] bg-[#0b0e11]/30">
          {filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#2b2f36] rounded-xl bg-[#1e2329]/20 p-6">
              <Sparkles className="h-8 w-8 text-[#fcd535] mx-auto mb-2 opacity-80" />
              <h3 className="font-bold text-[#eaecef] text-sm mb-1">{t.dbEmpty}</h3>
              <p className="text-xs text-[#848e9c] max-w-md mx-auto mb-4">{t.dbEmptySub}</p>
              {onRestoreBenchmark && (
                <button
                  onClick={handleRestoreBenchmark}
                  className="px-3 py-1.5 bg-[#1e2329] hover:bg-[#2b2f36] text-[#fcd535] border border-[#2b2f36] rounded-lg text-xs font-mono transition"
                >
                  {t.dbRestoreBtn}
                </button>
              )}
            </div>
          ) : (
            <table className={`w-full text-xs ${isAr ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b border-[#2b2f36] text-[#848e9c] font-semibold sticky top-0 bg-[#181a20] text-[10px] uppercase tracking-wider">
                  <th className="pb-2.5 pr-2">{t.colSymbol}</th>
                  <th className="pb-2.5 px-2">الاستراتيجية / Strategy</th>
                  <th className="pb-2.5 px-2 text-center">{t.dbColWinsLosses}</th>
                  <th className="pb-2.5 px-2 text-center">{t.dbColWinRate}</th>
                  <th className="pb-2.5 px-2 text-center">{t.dbColAvgConf}</th>
                  <th className="pb-2.5 px-2 text-center">{t.dbColBest}</th>
                  <th className="pb-2.5 px-2 text-center">{t.dbColWorst}</th>
                  <th className="pb-2.5 pl-2 text-center">{t.dbColTotalPnL}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2f36]/60 font-mono">
                {filtered.map((item, idx) => (
                  <tr key={`${item.strategyId}-${item.symbol}-${idx}`} className="hover:bg-[#1e2329]/50 transition">
                    <td className="py-2.5 pr-2 font-bold text-[#eaecef]">
                      <span className="bg-[#0b0e11] border border-[#2b2f36] px-2 py-0.5 rounded text-[11px] text-[#fcd535]">
                        {item.symbol}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 font-medium text-[#eaecef]">
                      {item.strategyName}
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <span className="text-emerald-400 font-bold">{item.wins}W</span>
                      <span className="text-[#848e9c] mx-1">/</span>
                      <span className="text-red-400 font-bold">{item.losses}L</span>
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.winRate >= 70
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.winRate > 0
                            ? 'bg-[#1e2329] text-[#eaecef] border border-[#2b2f36]'
                            : 'text-[#848e9c]'
                        }`}
                      >
                        {item.winRate.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-center text-[#fcd535]">
                      {item.avgConfidence.toFixed(1)}%
                    </td>

                    <td className="py-2.5 px-2 text-center text-emerald-400 font-semibold">
                      +${item.bestTrade.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-2 text-center text-red-400 font-semibold">
                      -${Math.abs(item.worstTrade).toFixed(2)}
                    </td>

                    <td className="py-2.5 pl-2 text-center">
                      <span
                        className={`font-bold text-xs ${
                          item.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {item.totalPnl >= 0 ? `+$${item.totalPnl.toFixed(2)}` : `-$${Math.abs(item.totalPnl).toFixed(2)}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2b2f36] bg-[#181a20] flex items-center justify-between text-xs text-[#848e9c]">
          <span className="font-mono text-[11px]">
            {t.dbFooterNotice}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] border border-[#2b2f36] rounded-lg text-xs font-mono transition"
          >
            {t.dbCloseBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

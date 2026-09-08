import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Info,
} from 'lucide-react';
import { CryptoAsset, AuditCheckItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface WatchlistPanelProps {
  assets: CryptoAsset[];
  selectedSymbol: string;
  onSelectAsset: (symbol: string) => void;
  onForceTrade: (symbol: string, side: 'LONG' | 'SHORT') => void;
}

export const WatchlistPanel: React.FC<WatchlistPanelProps> = ({
  assets,
  selectedSymbol,
  onSelectAsset,
  onForceTrade,
}) => {
  const { t, isAr } = useLanguage();
  const [inspectedAsset, setInspectedAsset] = useState<CryptoAsset | null>(null);

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#fcd535]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#848e9c] font-mono">
            {t.watchlistTitle}
          </h2>
        </div>
        <div className="text-[11px] text-[#848e9c] font-mono flex items-center gap-2">
          <span>{t.scannerLive}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Grid of assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {assets.map((asset) => {
          const isSelected = selectedSymbol === asset.symbol;
          const isUpTrend = asset.trend === 'UP';
          const isDownTrend = asset.trend === 'DOWN';
          const hasAudit = asset.auditScore !== undefined;
          const isAuditPassed = asset.auditPassed;

          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset.symbol)}
              className={`border rounded-xl p-3 cursor-pointer transition-all duration-150 relative ${
                isSelected
                  ? 'bg-[#1e2329] border-[#fcd535] shadow-sm'
                  : 'bg-[#1e2329] border-[#2b2f36] hover:border-[#3b404a]'
              }`}
            >
              {/* Asset Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#eaecef] text-sm font-mono tracking-tight">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] px-1 py-0.2 bg-[#0b0e11] text-[#848e9c] rounded border border-[#2b2f36] font-mono">
                      {asset.sector}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#848e9c]">{asset.name}</span>
                </div>

                <div className={`font-mono ${isAr ? 'text-left' : 'text-right'}`}>
                  <div className="font-bold text-[#eaecef] text-sm">
                    ${asset.price.toLocaleString(undefined, {
                      minimumFractionDigits: asset.price < 1 ? 4 : 2,
                      maximumFractionDigits: asset.price < 1 ? 4 : 2,
                    })}
                  </div>
                  <div
                    className={`flex items-center ${isAr ? 'justify-start' : 'justify-end'} text-[11px] font-semibold ${
                      asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {asset.change24h >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 inline" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 inline" />
                    )}
                    {asset.change24h >= 0 ? '+' : ''}
                    {asset.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Technical Indicators & Trend */}
              <div className="bg-[#0b0e11] rounded-lg p-2 border border-[#2b2f36] mb-2 text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#848e9c]">{t.trendLabel}:</span>
                  <span
                    className={`font-semibold px-1.5 py-0.2 rounded ${
                      isUpTrend
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isDownTrend
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-[#181a20] text-[#848e9c] border border-[#2b2f36]'
                    }`}
                  >
                    {isUpTrend ? '🟢 UP' : isDownTrend ? '🔴 DOWN' : '⚪ FLAT'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#848e9c] pt-1 border-t border-[#2b2f36]">
                  <span>RSI: <strong className="text-[#eaecef]">{asset.rsi.toFixed(0)}</strong></span>
                  <span>MACD: <strong className={asset.macdSignal === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'}>
                    {asset.macdSignal === 'BULLISH' ? 'BULL' : 'BEAR'}
                  </strong></span>
                  <span>ADX: <strong className="text-[#fcd535]">{asset.adx.toFixed(0)}</strong></span>
                </div>
              </div>

              {/* High-Precision Quality Audit Status */}
              {hasAudit && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectedAsset(asset);
                  }}
                  className="bg-[#0b0e11] rounded-lg p-1.5 border border-[#2b2f36] hover:border-[#fcd535]/50 transition mb-2 flex items-center justify-between text-[10px] font-mono group"
                  title={isAr ? 'اضغط لعرض تفاصيل التدقيق والفحص الفني' : 'Click to inspect 6 audit pillars'}
                >
                  <span className="text-[#848e9c] flex items-center gap-1">
                    <ShieldCheck className={`h-3 w-3 ${isAuditPassed ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span>{isAr ? 'تدقيق الجودة:' : 'Audit Score:'}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        isAuditPassed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {asset.auditScore}% {isAuditPassed ? (isAr ? 'معتمد 🛡️' : 'PASS 🛡️') : (isAr ? 'قيد الفحص' : 'HOLD')}
                    </span>
                    <Info className="h-2.5 w-2.5 text-[#848e9c] group-hover:text-[#fcd535]" />
                  </div>
                </div>
              )}

              {/* Ensemble Signal Output */}
              <div className="border-t border-[#2b2f36] pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#848e9c] flex items-center gap-1 text-[11px] font-mono">
                    <Sparkles className="h-3 w-3 text-[#fcd535]" />
                    <span>{t.colSignal}:</span>
                  </span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                      asset.ensembleSignal === 'LONG'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : asset.ensembleSignal === 'SHORT'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-[#0b0e11] text-[#848e9c] border border-[#2b2f36]'
                    }`}
                  >
                    {asset.ensembleSignal} ({asset.confidence}%)
                  </span>
                </div>

                {/* Long vs Short score bar */}
                <div className="flex items-center gap-1.5 text-[10px] text-[#848e9c] mb-2 font-mono">
                  <span className="text-emerald-400">L: {asset.longScore}</span>
                  <div className="flex-1 bg-[#0b0e11] rounded-full h-1.5 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${(asset.longScore / (asset.longScore + asset.shortScore || 1)) * 100}%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500 h-full"
                      style={{
                        width: `${(asset.shortScore / (asset.longScore + asset.shortScore || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-red-400">S: {asset.shortScore}</span>
                </div>

                {/* Instant Action buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onForceTrade(asset.symbol, 'LONG');
                    }}
                    className="flex items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-1 rounded-lg text-[10px] font-bold font-mono transition"
                    title={t.instantLong}
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span>{t.instantLong}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onForceTrade(asset.symbol, 'SHORT');
                    }}
                    className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-1 rounded-lg text-[10px] font-bold font-mono transition"
                    title={t.instantShort}
                  >
                    <TrendingDown className="h-3 w-3" />
                    <span>{t.instantShort}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Detail Modal for Watchlist Asset */}
      {inspectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2b2f36]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-[#eaecef]">
                    {isAr ? 'فحص جودة وتدقيق الإشارة المباشرة' : 'Signal Quality Audit Report'}
                  </h3>
                  <p className="text-[11px] text-[#848e9c] font-mono">
                    {inspectedAsset.symbol} // {inspectedAsset.ensembleSignal} ({inspectedAsset.confidence}%)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedAsset(null)}
                className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#1e2329]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Score header */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                inspectedAsset.auditPassed
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div>
                  <span className={`text-xs font-bold block ${inspectedAsset.auditPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {inspectedAsset.auditPassed
                      ? (isAr ? '🛡️ إشارة فائقة الضمان ومعتمدة للتنفيذ' : '🛡️ High-Assurance Verified for Entry')
                      : (isAr ? '⚠️ إشارة قيد الفحص (لم تكتمل جميع الشروط)' : '⚠️ Scrutiny Screening (Pillars Incomplete)')}
                  </span>
                  <p className="text-[11px] text-[#eaecef] mt-0.5">
                    {inspectedAsset.auditVerification
                      ? isAr
                        ? inspectedAsset.auditVerification.arabicRating
                        : inspectedAsset.auditVerification.rating
                      : ''}
                  </p>
                </div>
                <div className={`text-2xl font-bold font-mono ${inspectedAsset.auditPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {inspectedAsset.auditScore ?? 0}/100
                </div>
              </div>

              {/* Verification Checklist */}
              {inspectedAsset.auditVerification?.checks && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#848e9c] font-mono">
                    {isAr ? 'معايير التدقيق الستة' : '6 Verification Pillars'}
                  </h4>
                  {(Object.entries(inspectedAsset.auditVerification.checks) as [string, AuditCheckItem][]).map(([key, check]) => (
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
                      <span className={`font-mono text-xs font-bold ${check.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                        +{check.score}/{check.weight}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reasons list */}
              {inspectedAsset.auditVerification && (
                <div className="p-3 rounded-xl bg-[#0b0e11] border border-[#2b2f36] space-y-1.5 text-xs font-mono">
                  <span className="text-[#848e9c] block font-bold text-[11px]">
                    {isAr ? 'ملخص تحليل الفحص:' : 'Audit Analysis Summary:'}
                  </span>
                  {(isAr ? inspectedAsset.auditVerification.arabicReasons : inspectedAsset.auditVerification.reasons).map((reason, idx) => (
                    <p key={idx} className="text-[#eaecef] flex items-start gap-1.5">
                      <span className="text-[#fcd535]">•</span>
                      <span>{reason}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#1e2329] border-t border-[#2b2f36] flex items-center justify-between">
              <button
                onClick={() => {
                  onForceTrade(inspectedAsset.symbol, inspectedAsset.ensembleSignal === 'SHORT' ? 'SHORT' : 'LONG');
                  setInspectedAsset(null);
                }}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition font-mono"
              >
                {isAr ? 'تنفيذ فوري مباشر ⚡' : 'Execute Instant Trade ⚡'}
              </button>
              <button
                onClick={() => setInspectedAsset(null)}
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

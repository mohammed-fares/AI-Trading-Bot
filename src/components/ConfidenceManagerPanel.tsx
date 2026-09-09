import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Gauge } from 'lucide-react';
import { AdaptiveConfidenceState, BotConfig } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ConfidenceManagerPanelProps {
  confidenceState: AdaptiveConfidenceState;
  config: BotConfig;
  onSimulateWinStreak: () => void;
  onSimulateLossStreak: () => void;
}

export const ConfidenceManagerPanel: React.FC<ConfidenceManagerPanelProps> = ({
  confidenceState,
  config,
  onSimulateWinStreak,
  onSimulateLossStreak,
}) => {
  const { t, isAr } = useLanguage();

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-[#fcd535]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#848e9c] font-mono">
            {t.confidenceTitle}
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#fcd535] bg-[#0b0e11] border border-[#2b2f36] px-2 py-0.5 rounded">
          THRESHOLD: {config.currentConfidence}%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {/* Gauge Visual */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#848e9c] font-semibold mb-2 font-mono">
            <span>{isAr ? 'مقياس عتبة الثقة الديناميكية' : 'DYNAMIC THRESHOLD GAUGE'}</span>
            <span className="font-mono text-[#fcd535] font-bold">{config.currentConfidence}%</span>
          </div>

          <div className="relative pt-2 pb-1">
            <div className="w-full bg-[#0b0e11] rounded-full h-3 border border-[#2b2f36] overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-red-500 via-[#fcd535] to-emerald-400 h-full transition-all duration-300"
                style={{
                  width: `${((config.currentConfidence - config.minConfidence) / (config.maxConfidence - config.minConfidence || 1)) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-[#848e9c] font-mono mt-1">
              <span>MIN ({config.minConfidence}%)</span>
              <span>MID (45%)</span>
              <span>MAX ({config.maxConfidence}%)</span>
            </div>
          </div>

          <p className="text-[10px] text-[#848e9c] mt-2 leading-relaxed">
            {isAr
              ? `يُستخدم لتصفية الإشارات: أي إشارة ثقتها أقل من ${config.currentConfidence}% يتم استبعادها تلقائياً.`
              : `Signal threshold filter: Signals under ${config.currentConfidence}% confidence are filtered out.`}
          </p>
        </div>

        {/* Win Streak Card */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1 font-mono">
              <span className="flex items-center gap-1">
                <ArrowUpCircle className="h-3.5 w-3.5" />
                <span>{t.confidenceWinStreak}</span>
              </span>
              <span className="font-mono">{confidenceState.consecutiveWins} / 5</span>
            </div>
            <p className="text-[11px] text-[#848e9c] leading-relaxed">
              {isAr
                ? 'عند إتمام 5 صفقات رابحة متتالية بنجاح، يُرفع سقف الثقة 5% لزيادة جودة الانتقاء.'
                : 'After 5 consecutive wins, confidence threshold increases by 5% for tighter criteria.'}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#2b2f36] flex items-center justify-between">
            <span className="text-[10px] text-[#848e9c] font-mono">STEP: +5%</span>
            <button
              onClick={onSimulateWinStreak}
              className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-mono transition"
            >
              SIM (+5 WINS)
            </button>
          </div>
        </div>

        {/* Loss Streak Card */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-red-400 mb-1 font-mono">
              <span className="flex items-center gap-1">
                <ArrowDownCircle className="h-3.5 w-3.5" />
                <span>{t.confidenceLossStreak}</span>
              </span>
              <span className="font-mono">{confidenceState.consecutiveLosses} / 3</span>
            </div>
            <p className="text-[11px] text-[#848e9c] leading-relaxed">
              {isAr
                ? 'عند حدوث 3 صفقات خاسرة متتالية، يتم خفض الثقة فوراً بنسبة 10% للتكيف مع تقلبات السوق.'
                : 'After 3 consecutive losses, confidence is reduced by 10% to adapt dynamically.'}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#2b2f36] flex items-center justify-between">
            <span className="text-[10px] text-[#848e9c] font-mono">STEP: -10%</span>
            <button
              onClick={onSimulateLossStreak}
              className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-lg font-mono transition"
            >
              SIM (3 LOSSES)
            </button>
          </div>
        </div>
      </div>

      {/* Adjustments history */}
      {confidenceState.history.length > 0 && (
        <div className="bg-[#0b0e11] rounded-lg p-2.5 border border-[#2b2f36] text-[11px] font-mono text-[#848e9c]">
          <div className="flex items-center justify-between text-[#eaecef] font-bold mb-1">
            <span>{isAr ? 'سجل تعديلات الثقة التلقائية:' : 'Adaptive Adjustments History:'}</span>
            <span>TOTAL: {confidenceState.totalAdjustments}</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {confidenceState.history.slice(-4).map((entry, idx) => (
              <div key={`${entry.id}-${idx}`} className="flex items-center justify-between">
                <span className={entry.type === 'UP' ? 'text-emerald-400' : 'text-red-400'}>
                  {entry.type === 'UP' ? '▲' : '▼'} {entry.reason} (
                  {entry.change > 0 ? `+${entry.change}%` : `${entry.change}%`})
                </span>
                <span className="text-[#eaecef] font-bold">
                  {isAr ? `المستوى: ${entry.newConfidence}%` : `Level: ${entry.newConfidence}%`}
                </span>
                <span className="text-[#848e9c] text-[10px]">{entry.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

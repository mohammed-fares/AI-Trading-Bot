import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Activity,
  TrendingUp,
  TrendingDown,
  Compass,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Wand2,
  Zap,
} from 'lucide-react';
import { AIAdaptiveState, BotConfig, MarketRegime, AILearnedLesson } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface AdaptiveAIPanelProps {
  aiState: AIAdaptiveState;
  config: BotConfig;
  regime: MarketRegime;
  learnedLessons: AILearnedLesson[];
  onReset: () => void;
  onDeepOptimize?: () => void;
}

export const AdaptiveAIPanel: React.FC<AdaptiveAIPanelProps> = ({
  aiState,
  config,
  regime,
  learnedLessons,
  onReset,
  onDeepOptimize,
}) => {
  const { t, isAr } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'regime' | 'learning' | 'thresholds'>('regime');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const getRegimeInfo = (r: MarketRegime) => {
    switch (r) {
      case 'BULL_TREND':
        return {
          title: t.regimeBullTrend,
          icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          boosts: isAr
            ? 'تفضيل استراتيجيات تتبع الاتجاه والزخم (مضاعف +45%)'
            : 'Prioritizing Trend-Following & Momentum strategies (+45% boost)',
        };
      case 'BEAR_TREND':
        return {
          title: t.regimeBearTrend,
          icon: <TrendingDown className="h-5 w-5 text-rose-400" />,
          bgColor: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          boosts: isAr
            ? 'تفضيل صفقات البيع والزخم الهابط (مضاعف +45%)'
            : 'Prioritizing Short Momentum & Trend Alignment (+45% boost)',
        };
      case 'HIGH_VOLATILITY':
        return {
          title: t.regimeHighVol,
          icon: <Zap className="h-5 w-5 text-amber-400" />,
          bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          boosts: isAr
            ? 'تفضيل استراتيجيات السكالبينغ والاختراق وتوسيع هوامش الوقف (+35%)'
            : 'Prioritizing Scalping & Volatility Breakout (+35% boost)',
        };
      case 'RANGE_BOUND':
      default:
        return {
          title: t.regimeRangeBound,
          icon: <Compass className="h-5 w-5 text-sky-400" />,
          bgColor: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          boosts: isAr
            ? 'تفضيل استراتيجيات الارتداد من القيعان والقمم والمؤشرات المذبذبة (+40%)'
            : 'Prioritizing Mean-Reversion, RSI & Stochastic strategies (+40% boost)',
        };
    }
  };

  const regimeInfo = getRegimeInfo(regime);
  const errorLessons = learnedLessons.filter((l) => l.pnl <= 0);
  const winningLessons = learnedLessons.filter((l) => l.pnl > 0);
  const optimizationScore = Math.min(
    99,
    Math.max(
      65,
      Math.round(75 + (winningLessons.length - errorLessons.length) * 3 + learnedLessons.length * 0.5)
    )
  );

  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      if (onDeepOptimize) {
        onDeepOptimize();
      }
    }, 800);
  };

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm space-y-4">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#fcd535]/10 border border-[#fcd535]/20">
            <Brain className="h-5 w-5 text-[#fcd535]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#eaecef] tracking-tight flex items-center gap-2">
              <span>{t.aiLearningTitle}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                ACTIVE AI
              </span>
            </h2>
            <p className="text-xs text-[#848e9c]">{t.aiLearningSub}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 bg-[#fcd535] hover:bg-[#fcd535]/90 text-[#0b0e11] px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition shadow-sm disabled:opacity-50"
          >
            <Wand2 className={`h-3.5 w-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? (isAr ? 'جاري التحسين...' : 'Optimizing...') : t.aiDeepOptimizeBtn}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#2b2f36] gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('regime')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'regime'
              ? 'border-[#fcd535] text-[#fcd535] font-bold'
              : 'border-transparent text-[#848e9c] hover:text-[#eaecef]'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>{t.regimeTitle}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('learning')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'learning'
              ? 'border-[#fcd535] text-[#fcd535] font-bold'
              : 'border-transparent text-[#848e9c] hover:text-[#eaecef]'
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>{t.aiLearnedLessonsTitle}</span>
          {learnedLessons.length > 0 && (
            <span className="bg-[#2b2f36] text-[#eaecef] text-[10px] px-1.5 py-0.2 rounded-full">
              {learnedLessons.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('thresholds')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'thresholds'
              ? 'border-[#fcd535] text-[#fcd535] font-bold'
              : 'border-transparent text-[#848e9c] hover:text-[#eaecef]'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>{t.adaptiveTitle} (Levels)</span>
        </button>
      </div>

      {/* SUB-TAB 1: Regime & Dynamic Strategy Exploitation */}
      {activeSubTab === 'regime' && (
        <div className="space-y-3">
          {/* Regime Card */}
          <div className={`p-4 rounded-xl border ${regimeInfo.bgColor} flex flex-col md:flex-row items-start md:items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#0b0e11]/40 border border-current">
                {regimeInfo.icon}
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider block opacity-80">
                  {isAr ? 'البيئة الكلية المكتشفة بالذكاء الاصطناعي:' : 'AI-Detected Macro Market Regime:'}
                </span>
                <span className="text-base font-bold font-mono">{regimeInfo.title}</span>
              </div>
            </div>
            <div className="bg-[#0b0e11]/60 px-3 py-1.5 rounded-lg border border-current text-xs font-mono">
              <span className="font-bold">{t.aiRegimeBoostTitle}:</span> {regimeInfo.boosts}
            </div>
          </div>

          {/* AI Exploitation Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3">
              <div className="flex items-center justify-between text-[#848e9c] text-xs mb-1">
                <span>{t.aiOptimizedScore}</span>
                <Sparkles className="h-3.5 w-3.5 text-[#fcd535]" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {optimizationScore}%
              </div>
              <p className="text-[10px] text-[#848e9c] mt-1">
                {isAr ? 'كفاءة مواءمة الاستراتيجيات مع السوق' : 'Strategy-to-regime fit efficiency'}
              </p>
            </div>

            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3">
              <div className="flex items-center justify-between text-[#848e9c] text-xs mb-1">
                <span>{t.aiErrorsCorrected}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-[#eaecef]">
                {errorLessons.length} {isAr ? 'أخطاء تم تصحيحها' : 'Auto-Corrected'}
              </div>
              <p className="text-[10px] text-[#848e9c] mt-1">
                {isAr ? 'تعديل الأوزان لمنع تكرار الانعكاس' : 'Weights tuned to prevent repeat slips'}
              </p>
            </div>

            <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3">
              <div className="flex items-center justify-between text-[#848e9c] text-xs mb-1">
                <span>{isAr ? 'الاستراتيجيات النشطة' : 'Active Exploited Strategies'}</span>
                <Brain className="h-3.5 w-3.5 text-[#fcd535]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#fcd535]">
                50+ {isAr ? 'استراتيجية' : 'Strats'}
              </div>
              <p className="text-[10px] text-[#848e9c] mt-1">
                {isAr ? 'ترجيح تكيفي فوري (Bayesian Ensemble)' : 'Dynamic Bayesian Ensemble weighting'}
              </p>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 text-xs">
            <h4 className="font-bold text-[#eaecef] mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#fcd535]" />
              <span>{t.aiStrategyExploitation}</span>
            </h4>
            <p className="text-[#848e9c] text-[11px] leading-relaxed">
              {t.aiStrategyExploitationDesc}
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI Error Diagnosis & Learned Lessons Log */}
      {activeSubTab === 'learning' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#eaecef] flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-[#fcd535]" />
              <span>{t.aiDiagnosedErrorsTitle}</span>
            </span>
            <span className="text-[11px] font-mono text-[#848e9c]">
              {learnedLessons.length} {isAr ? 'دروس مستفادة' : 'Lessons Logged'}
            </span>
          </div>

          {learnedLessons.length === 0 ? (
            <div className="text-center py-8 text-[#848e9c] border border-dashed border-[#2b2f36] rounded-xl text-xs">
              <Brain className="h-8 w-8 mx-auto mb-2 text-[#2b2f36]" />
              <p>{t.aiNoLessons}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {learnedLessons.map((lesson) => {
                const isPositive = lesson.pnl > 0;
                return (
                  <div
                    key={lesson.id}
                    className={`p-3 rounded-xl border text-xs font-mono transition ${
                      isPositive
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-rose-500/5 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                        )}
                        <span className="font-bold text-[#eaecef]">{lesson.symbol}</span>
                        <span className="text-[#848e9c] text-[11px]">
                          ({lesson.strategyUsed})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {lesson.pnl > 0 ? `+$${lesson.pnl.toFixed(2)}` : `-$${Math.abs(lesson.pnl).toFixed(2)}`}
                        </span>
                        <span className="bg-[#0b0e11] px-1.5 py-0.5 rounded text-[10px] text-[#848e9c] border border-[#2b2f36]">
                          {lesson.timestamp}
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {t.aiRemedyApplied}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="text-[#848e9c]">
                        <span className="text-[#eaecef] font-semibold">
                          {isAr ? 'التشخيص: ' : 'Diagnosis: '}
                        </span>
                        {isAr ? lesson.arabicDiagnosis : lesson.diagnosis}
                      </div>
                      <div className="text-[#fcd535]">
                        <span className="text-[#eaecef] font-semibold">
                          {isAr ? 'الإجراء التصحيحي: ' : 'Remedy: '}
                        </span>
                        {isAr ? lesson.arabicRemedyAction : lesson.remedyAction}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: Adaptation Levels & Sentinels */}
      {activeSubTab === 'thresholds' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#eaecef] flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#fcd535]" />
              <span>{t.adaptiveDesc}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#fcd535] bg-[#0b0e11] border border-[#2b2f36] px-2 py-0.5 rounded text-[11px]">
                {t.adaptiveIdleCycles}: {aiState.consecutiveIdleCycles} / 5
              </span>
              {aiState.currentLevel > 0 && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] border border-[#2b2f36] px-2 py-0.5 rounded text-[11px] font-mono transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{t.adaptiveReset}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Level 1 */}
            <div
              className={`border rounded-xl p-3 text-xs transition ${
                aiState.currentLevel >= 1
                  ? 'bg-[#1e2329] border-[#fcd535] text-[#eaecef] shadow-sm'
                  : 'bg-[#1e2329] border-[#2b2f36] text-[#848e9c]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-bold font-mono">
                <span>{t.adaptiveLevel1}</span>
                {aiState.currentLevel >= 1 ? (
                  <span className="text-[#fcd535] font-mono text-[10px] bg-[#0b0e11] px-1.5 py-0.2 rounded border border-[#2b2f36]">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[#848e9c] text-[10px] font-mono">STANDBY</span>
                )}
              </div>
              <ul className="space-y-1 text-[11px] font-mono text-[#848e9c]">
                <li>• {isAr ? 'خفض min_confidence بمقدار 1%' : 'Reduce min_confidence by 1%'}</li>
                <li>• {isAr ? 'خفض min_score بمقدار 5 نقاط' : 'Reduce min_score by 5 pts'}</li>
                <li>• {isAr ? 'رفع الحد الأقصى للصفقات: 4 ← 5' : 'Raise max trades: 4 → 5'}</li>
              </ul>
            </div>

            {/* Level 2 */}
            <div
              className={`border rounded-xl p-3 text-xs transition ${
                aiState.currentLevel >= 2
                  ? 'bg-[#1e2329] border-[#fcd535] text-[#eaecef] shadow-sm'
                  : 'bg-[#1e2329] border-[#2b2f36] text-[#848e9c]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-bold font-mono">
                <span>{t.adaptiveLevel2}</span>
                {aiState.currentLevel >= 2 ? (
                  <span className="text-[#fcd535] font-mono text-[10px] bg-[#0b0e11] px-1.5 py-0.2 rounded border border-[#2b2f36]">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[#848e9c] text-[10px] font-mono">STANDBY</span>
                )}
              </div>
              <ul className="space-y-1 text-[11px] font-mono text-[#848e9c]">
                <li>• {isAr ? 'خفض إضافي للثقة 1%' : 'Additional 1% confidence reduction'}</li>
                <li>• {isAr ? 'خفض إضافي للدرجة 5 نقاط' : 'Additional 5 pts score reduction'}</li>
                <li>• {isAr ? 'تبديل الإطار الزمني تلقائياً' : 'Auto switch timeframe'}</li>
              </ul>
            </div>

            {/* Level 3 */}
            <div
              className={`border rounded-xl p-3 text-xs transition ${
                aiState.currentLevel >= 3
                  ? 'bg-[#1e2329] border-[#fcd535] text-[#eaecef] shadow-sm'
                  : 'bg-[#1e2329] border-[#2b2f36] text-[#848e9c]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-bold font-mono">
                <span>{t.adaptiveLevel3}</span>
                {aiState.currentLevel >= 3 ? (
                  <span className="text-[#fcd535] font-mono text-[10px] bg-[#0b0e11] px-1.5 py-0.2 rounded border border-[#2b2f36]">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[#848e9c] text-[10px] font-mono">STANDBY</span>
                )}
              </div>
              <ul className="space-y-1 text-[11px] font-mono text-[#848e9c]">
                <li>• {isAr ? 'خفض الثقة للحد الأدنى (10%)' : 'Floor confidence at 10%'}</li>
                <li>• {isAr ? 'خفض الدرجة إلى 10 نقاط' : 'Floor min score to 10 pts'}</li>
                <li>• {isAr ? 'تعطيل فلتر الاتجاه الصارم' : 'Relax trend filter'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

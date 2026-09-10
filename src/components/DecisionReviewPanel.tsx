import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  Award,
  Sparkles,
  DollarSign,
  X,
} from 'lucide-react';
import { DecisionReview, Language, TradeSide } from '../types';

interface DecisionReviewPanelProps {
  review: DecisionReview;
  symbol: string;
  side: TradeSide;
  adjustedSizeUSDT?: number;
  language: Language;
  onClose?: () => void;
  isModal?: boolean;
}

export const DecisionReviewPanel: React.FC<DecisionReviewPanelProps> = ({
  review,
  symbol,
  side,
  adjustedSizeUSDT,
  language,
  onClose,
  isModal = true,
}) => {
  const isAr = language === 'ar';
  const isLong = side === 'LONG';

  const getDecisionBadge = () => {
    switch (review.finalDecision) {
      case 'APPROVE':
        return (
          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-sm rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-4 h-4" />
            {isAr ? 'موافقة كاملة (APPROVE)' : 'APPROVED'}
          </span>
        );
      case 'APPROVE_WITH_CAUTION':
        return (
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-sm rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-4 h-4" />
            {isAr ? 'موافقة بحذر (CAUTION)' : 'APPROVED WITH CAUTION'}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-sm rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/10">
            <XCircle className="w-4 h-4" />
            {isAr ? 'مرفوضة (REJECTED)' : 'REJECTED'}
          </span>
        );
    }
  };

  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 text-xs font-black rounded ${
                isLong
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {side}
            </span>
            <h3 className="text-xl font-black text-white font-mono">{symbol}</h3>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تدقيق المراجعة الثلاثية المشدد قبل التنفيذ (Triple Review)'
              : 'Triple-Layer Pre-Execution Scrutiny Audit'}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Decision Summary Card */}
      <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            {isAr ? 'القرار النهائي:' : 'Final Verdict:'}
          </span>
          {getDecisionBadge()}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {isAr ? review.summaryAr : review.summary}
        </p>
      </div>

      {/* 3 Pillars Breakdown */}
      <div className="space-y-2.5 text-xs">
        {/* Base Score */}
        <div className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-2 text-slate-400">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'الدرجة الأساسية (Base Score)' : 'Base Ensemble Score'}</span>
          </div>
          <span className="font-mono font-bold text-white text-sm">
            {review.baseScore}
          </span>
        </div>

        {/* Pillar 1: Open Trades Check */}
        <div className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-2 text-slate-300">
            {review.openTradesCheck.decision === 'PASS' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <div>
              <span className="font-bold">
                {isAr ? '1. فحص الصفقات المفتوحة' : '1. Open Trades Check'}
              </span>
              <div className="text-[10px] text-slate-400">
                {isAr
                  ? review.openTradesCheck.reasonAr
                  : review.openTradesCheck.reason}
              </div>
            </div>
          </div>
          <span
            className={`font-mono font-bold text-sm ${
              review.openTradesCheck.scoreDelta >= 0
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {review.openTradesCheck.scoreDelta >= 0 ? '+' : ''}
            {review.openTradesCheck.scoreDelta}
          </span>
        </div>

        {/* Pillar 2: Strategy Review */}
        <div className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-2 text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bold">
                {isAr ? '2. تقييم الاستراتيجية' : '2. Strategy Ranking'}
              </span>
              <div className="text-[10px] text-slate-400">
                {review.strategyReview.suggestedStrategy} (
                {review.strategyReview.suggestedStrategyWinRate}% Win Rate)
              </div>
            </div>
          </div>
          <span
            className={`font-mono font-bold text-sm ${
              review.strategyReview.scoreDelta >= 0
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {review.strategyReview.scoreDelta >= 0 ? '+' : ''}
            {review.strategyReview.scoreDelta}
          </span>
        </div>

        {/* Pillar 3: Pattern Review */}
        <div className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <div>
              <span className="font-bold">
                {isAr ? '3. النمط السلوكي (Pattern)' : '3. Behavioral Pattern'}
              </span>
              <div className="text-[10px] text-purple-300 font-mono">
                {review.patternReview.currentPatternTag} (
                {review.patternReview.patternConfidence}%)
              </div>
            </div>
          </div>
          <span
            className={`font-mono font-bold text-sm ${
              review.patternReview.scoreDelta >= 0
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {review.patternReview.scoreDelta >= 0 ? '+' : ''}
            {review.patternReview.scoreDelta}
          </span>
        </div>

        {/* AI Insight Score */}
        {review.aiInsightScore !== 0 && (
          <div className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'ذكاء اصطناعي إضافي' : 'AI Insight Bonus'}</span>
            </div>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              +{review.aiInsightScore}
            </span>
          </div>
        )}
      </div>

      {/* Score Total Bar */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {isAr ? 'النتيجة الإجمالية' : 'Final Composite Score'}
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {review.finalScore}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
        </div>

        {adjustedSizeUSDT !== undefined && (
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {isAr ? 'حجم المركز المعتمد' : 'Allocated Margin'}
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono flex items-center justify-end gap-1">
              <DollarSign className="w-4 h-4" />
              {adjustedSizeUSDT.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div
      id="decision-review-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {content}
    </div>
  );
};

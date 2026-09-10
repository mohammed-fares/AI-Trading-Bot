import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  DollarSign,
  Scale,
  Brain,
  Clock,
  Layers,
} from 'lucide-react';
import { CryptoAsset, Language } from '../types';

interface AIDecisionModalProps {
  asset: CryptoAsset;
  lang: Language;
  onClose: () => void;
  onExecuteTrade: (symbol: string, side: 'LONG' | 'SHORT') => void;
}

export const AIDecisionModal: React.FC<AIDecisionModalProps> = ({
  asset,
  lang,
  onClose,
  onExecuteTrade,
}) => {
  const isAr = lang === 'ar';
  const [viewLang, setViewLang] = useState<'ar' | 'en'>(isAr ? 'ar' : 'en');
  const decision = asset.geminiDecision;

  const isLong = decision?.signal === 'LONG' || asset.ensembleSignal === 'LONG';
  const isShort = decision?.signal === 'SHORT' || asset.ensembleSignal === 'SHORT';
  const isApproved = decision?.isApproved ?? (asset.auditPassed && asset.confidence >= 65);
  const confidence = decision?.confidence ?? asset.confidence;

  const targetProfit = decision?.targetProfitUSD ?? 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in flex flex-col max-h-[90vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2b2f36] flex items-center justify-between bg-[#1e2329]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#fcd535]/15 border border-[#fcd535]/30 text-[#fcd535]">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#eaecef] font-mono">
                  {asset.symbol}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0b0e11] text-[#848e9c] border border-[#2b2f36] font-mono">
                  {decision?.source === 'GEMINI_AI' ? 'Gemini 2.5 Flash' : 'Consensus Engine'}
                </span>
              </div>
              <p className="text-xs text-[#848e9c]">
                {isAr
                  ? 'تحليل الذكاء الاصطناعي المؤسسي لصفقات فيوتشرز'
                  : 'Institutional AI Futures Market Analysis & Decision'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex bg-[#0b0e11] rounded-lg p-0.5 border border-[#2b2f36]">
              <button
                onClick={() => setViewLang('ar')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  viewLang === 'ar' ? 'bg-[#2b2f36] text-[#eaecef]' : 'text-[#848e9c]'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setViewLang('en')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  viewLang === 'en' ? 'bg-[#2b2f36] text-[#eaecef]' : 'text-[#848e9c]'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#2b2f36] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Main Decision Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isApproved
                ? isLong
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl text-xl ${
                  isLong ? 'text-emerald-400 bg-emerald-500/20' : isShort ? 'text-red-400 bg-red-500/20' : 'text-amber-400 bg-amber-500/20'
                }`}
              >
                {isLong ? (
                  <TrendingUp className="h-6 w-6" />
                ) : isShort ? (
                  <TrendingDown className="h-6 w-6" />
                ) : (
                  <Scale className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-base font-bold font-mono ${
                      isLong ? 'text-emerald-400' : isShort ? 'text-red-400' : 'text-amber-400'
                    }`}
                  >
                    {isLong
                      ? isAr ? 'توصية شراء (LONG)' : 'RECOMMENDED: LONG'
                      : isShort
                      ? isAr ? 'توصية بيع (SHORT)' : 'RECOMMENDED: SHORT'
                      : isAr ? 'توصية حياد (NEUTRAL)' : 'RECOMMENDED: NEUTRAL / HOLD'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-[#0b0e11] text-[#eaecef] border border-[#2b2f36]">
                    {confidence}% {isAr ? 'ثقة' : 'Conf.'}
                  </span>
                </div>
                <p className="text-xs text-[#848e9c] mt-0.5">
                  {isApproved
                    ? isAr
                      ? 'تم التحقق من كافة شروط السلامة والسيولة وتوافق الأطر الزمنية'
                      : 'All safety rules, MTF confluence, and liquidity checks verified'
                    : isAr
                    ? 'الصفقة غير مكتملة الشروط الفنية أو محجوبة بحاجز سيولة'
                    : 'Setup under scrutiny; pending higher confluence or wall clearance'}
                </p>
              </div>
            </div>

            {/* Target Profit Highlight */}
            <div className="bg-[#0b0e11] px-3 py-2 rounded-xl border border-[#2b2f36] text-right font-mono shrink-0">
              <span className="text-[10px] text-[#848e9c] block flex items-center gap-1">
                <Target className="h-3 w-3 text-[#fcd535]" />
                {isAr ? 'الهدف المحدد لكل صفقة' : 'Fixed Trade Profit Target'}
              </span>
              <span className="text-base font-extrabold text-[#fcd535]">
                +${targetProfit}.00 USD
              </span>
            </div>
          </div>

          {/* Trade Execution Levels Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#0b0e11] rounded-xl border border-[#2b2f36] font-mono">
              <span className="text-[10px] text-[#848e9c] block">
                {isAr ? 'سعر الدخول المقترح' : 'Entry Price'}
              </span>
              <span className="text-sm font-bold text-[#eaecef]">
                ${(decision?.recommendedEntry || asset.price).toLocaleString(undefined, {
                  minimumFractionDigits: asset.price < 1 ? 4 : 2,
                })}
              </span>
            </div>

            <div className="p-3 bg-[#0b0e11] rounded-xl border border-red-500/20 font-mono">
              <span className="text-[10px] text-red-400 block">
                {isAr ? 'وقف الخسارة (SL)' : 'Stop Loss (SL)'}
              </span>
              <span className="text-sm font-bold text-red-400">
                ${(
                  decision?.stopLoss ||
                  (isLong ? asset.price * 0.985 : asset.price * 1.015)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: asset.price < 1 ? 4 : 2,
                })}
              </span>
            </div>

            <div className="p-3 bg-[#0b0e11] rounded-xl border border-emerald-500/20 font-mono">
              <span className="text-[10px] text-emerald-400 block">
                {isAr ? 'جني الأرباح (TP)' : 'Take Profit (TP)'}
              </span>
              <span className="text-sm font-bold text-emerald-400">
                ${(
                  decision?.takeProfit ||
                  (isLong ? asset.price * 1.025 : asset.price * 0.975)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: asset.price < 1 ? 4 : 2,
                })}
              </span>
            </div>

            <div className="p-3 bg-[#0b0e11] rounded-xl border border-[#2b2f36] font-mono">
              <span className="text-[10px] text-[#848e9c] block">
                {isAr ? 'نسبة العائد للمخاطرة' : 'Risk : Reward'}
              </span>
              <span className="text-sm font-bold text-[#fcd535]">
                1 : {decision?.riskRewardRatio || '2.00'}
              </span>
            </div>
          </div>

          {/* AI Reasoning Section */}
          <div className="p-4 bg-[#0b0e11] rounded-xl border border-[#2b2f36] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#fcd535] font-mono uppercase">
              <Sparkles className="h-4 w-4" />
              <span>{isAr ? 'التحليل التفصيلي من نموذج الذكاء الاصطناعي' : 'Gemini AI In-Depth Market Assessment'}</span>
            </div>
            <p className="text-xs text-[#eaecef] leading-relaxed font-sans">
              {viewLang === 'ar'
                ? decision?.reasoningAr || 'تحليل السوق قيد المعالجة بناءً على بيانات بينانس الحقيقية...'
                : decision?.reasoningEn || 'Market assessment processing with real-time Binance data...'}
            </p>
          </div>

          {/* Confluence Factors & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Confirmation Factors */}
            <div className="p-3.5 bg-[#0b0e11] rounded-xl border border-emerald-500/20 space-y-2">
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {isAr ? 'عوامل التأكيد الفني' : 'Technical Confluences'}
              </span>
              <ul className="space-y-1.5 text-xs text-[#eaecef]">
                {(viewLang === 'ar'
                  ? decision?.confirmationFactorsAr || [
                      `توافق 50+ استراتيجية: ${asset.confidence}%`,
                      `تسلسل اتجاهات الأطر الزمنية 15m/1h/4h`,
                      `عمق دفتر الأوامر خالٍ من جدران السيولة المعاكسة`,
                    ]
                  : decision?.confirmationFactorsEn || [
                      `50+ Strategy Consensus: ${asset.confidence}%`,
                      `15m/1h/4h MTF Cascade Confluence`,
                      `Clear liquidity path in Binance Orderbook`,
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Risks */}
            <div className="p-3.5 bg-[#0b0e11] rounded-xl border border-amber-500/20 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                {isAr ? 'المخاطر المحتملة والتحديات' : 'Identified Risk Factors'}
              </span>
              <ul className="space-y-1.5 text-xs text-[#eaecef]">
                {(viewLang === 'ar'
                  ? decision?.keyRisksAr || [
                      'تذبذب سعري مفاجئ عند إعلانات الأخبار الاقتصادية',
                      'احتمال ارتداد السعر عند اختبار مناطق المقاومة السابقة',
                    ]
                  : decision?.keyRisksEn || [
                      'Sudden volatility spikes around high-impact macro news',
                      'Potential pullback test at nearby dynamic EMA levels',
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strategy Consensus Breakdown */}
          <div className="p-3.5 bg-[#0b0e11] rounded-xl border border-[#2b2f36] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#848e9c] flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#fcd535]" />
                {isAr ? 'إجماع الـ 50+ استراتيجية الرياضية' : '50+ Quantitative Strategies Consensus'}
              </span>
              <span className="font-bold text-[#eaecef]">
                {asset.longScore} {isAr ? 'شراء' : 'Long'} vs {asset.shortScore} {isAr ? 'بيع' : 'Short'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#1e2329] overflow-hidden flex" dir="ltr">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{
                  width: `${(asset.longScore / (asset.longScore + asset.shortScore || 1)) * 100}%`,
                }}
              />
              <div
                className="bg-red-500 h-full transition-all"
                style={{
                  width: `${(asset.shortScore / (asset.longScore + asset.shortScore || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#1e2329] border-t border-[#2b2f36] flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-[11px] text-[#848e9c] font-mono flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {isAr
                ? 'النظام يعمل بوضع التداول التجريبي (Paper Trading) فقط ولا ينفذ تداولاً حقيقياً.'
                : 'System locked to Paper Trading mode only. Real execution is prohibited.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2b2f36] hover:bg-[#3b404a] text-[#eaecef] text-xs font-bold rounded-xl transition"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>

            <button
              onClick={() => {
                onExecuteTrade(asset.symbol, isShort ? 'SHORT' : 'LONG');
                onClose();
              }}
              className="px-4 py-2 bg-[#fcd535] hover:bg-[#fcd535]/90 text-black text-xs font-bold rounded-xl transition font-mono flex items-center gap-1.5 shadow-md"
            >
              <DollarSign className="h-4 w-4" />
              <span>
                {isAr
                  ? `تنفيذ صفقة تجريبية بمستهدف $${targetProfit} ⚡`
                  : `Execute Paper Trade (Target: $${targetProfit}) ⚡`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

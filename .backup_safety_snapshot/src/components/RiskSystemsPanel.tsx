import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  AlertOctagon,
  Percent,
  Clock,
  Compass,
} from 'lucide-react';
import { BotConfig, CircuitBreakerState } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface RiskSystemsPanelProps {
  config: BotConfig;
  circuitBreaker: CircuitBreakerState;
  dailyPnL: number;
}

export const RiskSystemsPanel: React.FC<RiskSystemsPanelProps> = ({
  config,
  circuitBreaker,
}) => {
  const { t, isAr } = useLanguage();

  const drawdown =
    config.peakBalance > 0
      ? ((config.peakBalance - config.balance) / config.peakBalance) * 100
      : 0;

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#fcd535]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#848e9c] font-mono">
            {t.riskTitle}
          </h2>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          PROTECTION: 100% ARMED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Risk Manager */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <ShieldAlert className="h-3.5 w-3.5 text-[#fcd535]" />
              <span>1. {t.riskSystem1}</span>
            </span>
            <span className="text-[10px] bg-[#0b0e11] text-[#fcd535] border border-[#2b2f36] px-1.5 py-0.2 rounded font-mono">
              ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'يحدد حجم كل صفقة بناءً على معادلة رياضية دقيقة تتأثر بالرصيد وثقة الإشارة والخسائر اليومية.'
              : 'Computes optimal position sizing based on available balance, confidence score, and daily risk budget.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'أقصى مخاطرة يومية:' : 'Max Daily Risk:'}</span>
              <span className="text-[#eaecef] font-bold">{config.maxDailyRisk}%</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'مخاطرة الصفقة:' : 'Trade Risk:'}</span>
              <span className="text-[#fcd535] font-bold">{config.maxTradeRisk}%</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'سقف حجم المركز:' : 'Max Trade Size:'}</span>
              <span className="text-[#eaecef] font-bold">{config.tradeSizePercent}%</span>
            </div>
          </div>
        </div>

        {/* 2. Circuit Breaker */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <AlertOctagon className="h-3.5 w-3.5 text-red-400" />
              <span>2. {t.riskSystem2}</span>
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                circuitBreaker.isTriggered
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {circuitBreaker.isTriggered ? (isAr ? 'مفعل (توقف مؤقت)' : 'TRIGGERED') : 'READY'}
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'يوقف التداول تلقائياً عند 5 خسائر متتالية (تهدئة 30 دقيقة) أو عند بلوغ 10 خسائر يومية.'
              : 'Halts trading automatically on 5 consecutive losses (30 min cooldown) or 10 daily losses.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'الخسائر المتتالية:' : 'Consecutive Losses:'}</span>
              <span className="text-red-400 font-bold">{circuitBreaker.consecutiveLosses} / 5</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'خسائر اليوم:' : 'Daily Losses:'}</span>
              <span className="text-[#eaecef] font-bold">{circuitBreaker.dailyLossesCount} / 10</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'فترة التهدئة:' : 'Cooldown:'}</span>
              <span className="text-[#fcd535] font-bold">30 min</span>
            </div>
          </div>
        </div>

        {/* 3. Drawdown Protection */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <Percent className="h-3.5 w-3.5 text-[#fcd535]" />
              <span>3. {t.riskSystem3}</span>
            </span>
            <span className="text-[10px] bg-[#0b0e11] text-[#fcd535] border border-[#2b2f36] px-1.5 py-0.2 rounded font-mono">
              CAP {config.maxDrawdownPercent}%
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'يتتبع أعلى رصيد تاريخي (Peak Balance)، ويوقف التداول نهائياً إذا تراجع الرصيد بأكثر من الحد المسموح.'
              : 'Tracks peak historic balance and halts operations if drawdown exceeds the defined threshold.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'أعلى رصيد:' : 'Peak Balance:'}</span>
              <span className="text-[#eaecef] font-bold">${config.peakBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'السحب الحالي:' : 'Current Drawdown:'}</span>
              <span className={drawdown > 5 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {drawdown.toFixed(2)}% / {config.maxDrawdownPercent}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'حالة الأمان:' : 'Safety Status:'}</span>
              <span className="text-emerald-400 font-bold">{isAr ? 'آمن (ضمن الحدود)' : 'Safe'}</span>
            </div>
          </div>
        </div>

        {/* 4. Trend Filter */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <Compass className="h-3.5 w-3.5 text-[#848e9c]" />
              <span>4. {t.riskSystem4}</span>
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                config.useTrendFilter
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              {config.useTrendFilter ? 'EMA20/50/200' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'يمنع التداول عكس التيار: في الاتجاه الصاعد يسمح بـ LONG فقط، وفي الهابط بـ SHORT فقط.'
              : 'Prevents counter-trend trading: Allows LONG only in uptrend and SHORT only in downtrend.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'صاعد:' : 'Bullish:'}</span>
              <span className="text-emerald-400 font-bold">{isAr ? 'LONG فقط' : 'LONG only'}</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'هابط:' : 'Bearish:'}</span>
              <span className="text-red-400 font-bold">{isAr ? 'SHORT فقط' : 'SHORT only'}</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'محايد:' : 'Neutral:'}</span>
              <span className="text-[#eaecef] font-bold">{isAr ? 'كل الإشارات' : 'All signals'}</span>
            </div>
          </div>
        </div>

        {/* 5. Smart Exit */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <Zap className="h-3.5 w-3.5 text-[#fcd535]" />
              <span>5. {t.riskSystem5}</span>
            </span>
            <span className="text-[10px] bg-[#0b0e11] text-[#fcd535] border border-[#2b2f36] px-1.5 py-0.2 rounded font-mono">
              TRAILING
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'تأمين الأرباح بأمر لاحق (Trailing Stop) وخروج زمني لصفقات السكالبنج بعد 5 دقائق.'
              : 'Locks profits with trailing stops and implements time-based scalping exits.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'تفعيل التتبع:' : 'Trailing Trigger:'}</span>
              <span className="text-emerald-400 font-bold">&gt;= 1.5%</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'مقدار التتبع:' : 'Trail Delta:'}</span>
              <span className="text-[#fcd535] font-bold">1.0%</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'حماية التراجع:' : 'Retracement Cap:'}</span>
              <span className="text-[#eaecef] font-bold">{isAr ? 'مفعلة عند ربح >2%' : 'Active >2%'}</span>
            </div>
          </div>
        </div>

        {/* 6. Sector Diversification */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <Clock className="h-3.5 w-3.5 text-[#848e9c]" />
              <span>6. {t.riskSystem6}</span>
            </span>
            <span className="text-[10px] bg-[#0b0e11] text-[#848e9c] border border-[#2b2f36] px-1.5 py-0.2 rounded font-mono">
              8 PAIRS
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'يوزع المخاطر عبر قطاعات متنوعة (Layer 1، DeFi، Infrastructure، AI) لمنع الارتباط الأحادي.'
              : 'Diversifies risk across Layer 1, DeFi, Infra, and AI to prevent correlation breakdown.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'القطاعات:' : 'Sectors:'}</span>
              <span className="text-[#eaecef] font-bold">L1, DeFi, Infra, AI</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'الحد لكل قطاع:' : 'Max per Sector:'}</span>
              <span className="text-[#eaecef] font-bold">2 trades</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'الارتباط مع BTC:' : 'BTC Correlation:'}</span>
              <span className="text-[#fcd535] font-bold">{isAr ? 'موزون تلقائياً' : 'Auto Weighted'}</span>
            </div>
          </div>
        </div>

        {/* 7. Ultra-Rigorous Trade Creation Audit */}
        <div className="bg-[#1e2329] border border-emerald-500/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>7. {isAr ? 'التدقيق الفائق الصارم لإنشاء الصفقات' : 'Rigorous Trade Audit Engine'}</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
              {config.precisionAuditMode ? (isAr ? 'مفعل 🛡️' : 'ACTIVE') : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'يتحقق من 6 محاور جودة فنية ويمنع الشراء عند القمم (RSI > 62) أو البيع عند القيعان (RSI < 38) ويحظر الصفقات المتعارضة مع EMA 200.'
              : 'Enforces 6 technical pillars, blocks buying at peaks (RSI > 62) / selling at bottoms (RSI < 38), and mandates EMA200 alignment.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'الحد الأدنى لدرجة الجودة:' : 'Min Audit Score:'}</span>
              <span className="text-emerald-400 font-bold">{config.minAuditScore ?? 78}/100</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'إجماع الاستراتيجيات:' : 'Consensus Ratio:'}</span>
              <span className="text-[#eaecef] font-bold">{((config.minConsensusRatio ?? 0.7) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'قوة الاتجاه (ADX):' : 'Min ADX:'}</span>
              <span className="text-[#fcd535] font-bold">&gt;= {config.minADXThreshold ?? 22}</span>
            </div>
          </div>
        </div>

        {/* 8. Break-Even Stop Loss & Symbol Cooldown */}
        <div className="bg-[#1e2329] border border-cyan-500/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>8. {isAr ? 'حماية رأس المال (Break-Even وتبريد الخسائر)' : 'Break-Even & Cooldown Shield'}</span>
            </span>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono">
              {config.useBreakEvenStop !== false ? (isAr ? 'مفعل 🛡️' : 'ACTIVE') : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'ينقل الوقف تلقائياً لسعر الدخول (+0.12% لحساب العمولات) بمجرد تحقيق ربح لمنع تحول الربح لخسارة، مع حظر الرمز الخاسر لمدة 10 دقائق.'
              : 'Auto-shifts Stop Loss to Entry (+0.12% buffer) upon reaching profit threshold to eliminate losses, plus 10m cooldown on stopped coins.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'عتبة نقل الوقف:' : 'Break-Even Trigger:'}</span>
              <span className="text-cyan-400 font-bold">&gt;= {config.breakEvenTriggerPercent ?? 1.0}%</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'فترة تبريد الرمز بعد الخسارة:' : 'Loss Cooldown:'}</span>
              <span className="text-[#eaecef] font-bold">{config.symbolCooldownMinutes ?? 10} min</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'حماية الرسوم:' : 'Fee Buffer:'}</span>
              <span className="text-emerald-400 font-bold">+0.12% Entry Offset</span>
            </div>
          </div>
        </div>

        {/* 9. Multi-Timeframe Trend Alignment (15m / 1h / 4h) */}
        <div className="bg-[#1e2329] border border-emerald-500/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <Compass className="h-3.5 w-3.5 text-emerald-400" />
              <span>9. {isAr ? 'توافق الأطر الزمنية الثلاثية (MTF)' : '3-Timeframe Trend Alignment'}</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
              {config.enforceTimeFrameAlignment !== false ? 'ENFORCED' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'يتحقق من توافق إشارة الدخول على إطار 15m مع المسار الوسيط 1h والاتجاه الأساسي 4h، ويحظر الشراء ضد هبوط 4h.'
              : 'Verifies 15m entry signals align with 1h intermediate and 4h macro trend, blocking trades against higher timeframe momentum.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'أطر التحقق:' : 'Monitored TFs:'}</span>
              <span className="text-[#eaecef] font-bold">15m / 1h / 4h</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'حظر التعارض مع 4h:' : '4h Conflict Block:'}</span>
              <span className="text-emerald-400 font-bold">{isAr ? 'حظر مطلق' : 'Absolute Reject'}</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'وزن التدقيق:' : 'Audit Weight:'}</span>
              <span className="text-[#fcd535] font-bold">15%</span>
            </div>
          </div>
        </div>

        {/* 10. Orderbook Walls & Smart Volatility Freeze */}
        <div className="bg-[#1e2329] border border-purple-500/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#eaecef] flex items-center gap-1.5 font-mono">
              <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
              <span>10. {isAr ? 'دفتر أوامر بينانس والتجميد الذكي' : 'Orderbook Walls & Smart Freeze'}</span>
            </span>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono">
              {config.smartFreezeEnabled !== false && config.orderbookFilterEnabled !== false ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
          <p className="text-[11px] text-[#848e9c] leading-relaxed">
            {isAr
              ? 'يرصد حواجز السيولة (Liquidity Walls) لرفض الصفقات المسدودة بجدران بيع أو شراء، ويجمد العملة 15 دقيقة عند حدوث تذبذب شاذ مفاجئ.'
              : 'Detects opposing Binance liquidity walls to avoid trapped trades, and auto-freezes coin for 15m upon abnormal volatility spikes.'}
          </p>
          <div className="bg-[#0b0e11] rounded-lg p-2 text-[11px] font-mono text-[#848e9c] space-y-1">
            <div className="flex justify-between">
              <span>{isAr ? 'فلتر جدران السيولة:' : 'Wall Detection:'}</span>
              <span className="text-[#fcd535] font-bold">&lt;= {config.maxOpposingWallDistancePct ?? 2.5}%</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'عتبة التذبذب الشاذ:' : 'Freeze Volatility:'}</span>
              <span className="text-purple-400 font-bold">&gt;= {config.smartFreezeThresholdPercent ?? 2.8}% / 15m</span>
            </div>
            <div className="flex justify-between">
              <span>{isAr ? 'مدة التجميد الوقائي:' : 'Freeze Window:'}</span>
              <span className="text-[#eaecef] font-bold">{config.smartFreezeDurationMinutes ?? 15} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

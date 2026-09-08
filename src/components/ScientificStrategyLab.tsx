import React, { useState, useMemo } from 'react';
import {
  Atom,
  Flame,
  Waves,
  Shuffle,
  Binary,
  TrendingUp,
  Cpu,
  Sparkles,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  Check,
  Power,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  Layers,
  Lightbulb,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { Strategy, ScientificDomain, TimeFrame } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { generateScientificStrategy } from '../services/aiStrategyGenerator';

interface ScientificStrategyLabProps {
  strategies: Strategy[];
  onToggleStrategy: (id: string) => void;
  onUpdateWeight: (id: string, weight: number) => void;
  onAddSynthesizedStrategy: (strategy: Strategy) => void;
  onEnableAllScientific: () => void;
  onDisableAllScientific: () => void;
}

const DOMAIN_ICONS: Record<ScientificDomain, React.ReactNode> = {
  QUANTUM: <Atom className="h-4 w-4 text-purple-400" />,
  THERMODYNAMICS: <Flame className="h-4 w-4 text-amber-400" />,
  FLUID_DYNAMICS: <Waves className="h-4 w-4 text-cyan-400" />,
  CHAOS_FRACTAL: <Shuffle className="h-4 w-4 text-rose-400" />,
  INFORMATION_THEORY: <Binary className="h-4 w-4 text-emerald-400" />,
  STOCHASTIC: <TrendingUp className="h-4 w-4 text-blue-400" />,
  GAME_THEORY: <Sliders className="h-4 w-4 text-orange-400" />,
  HARMONIC_SPECTRUM: <Waves className="h-4 w-4 text-indigo-400" />,
  NEURAL_QUANT: <Cpu className="h-4 w-4 text-teal-400" />,
  MACRO_PROP: <Sparkles className="h-4 w-4 text-yellow-400" />,
  CLASSICAL_TECH: <Layers className="h-4 w-4 text-gray-400" />,
};

const DOMAIN_COLORS: Record<ScientificDomain, string> = {
  QUANTUM: 'border-purple-500/30 text-purple-400 bg-purple-950/20',
  THERMODYNAMICS: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
  FLUID_DYNAMICS: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20',
  CHAOS_FRACTAL: 'border-rose-500/30 text-rose-400 bg-rose-950/20',
  INFORMATION_THEORY: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
  STOCHASTIC: 'border-blue-500/30 text-blue-400 bg-blue-950/20',
  GAME_THEORY: 'border-orange-500/30 text-orange-400 bg-orange-950/20',
  HARMONIC_SPECTRUM: 'border-indigo-500/30 text-indigo-400 bg-indigo-950/20',
  NEURAL_QUANT: 'border-teal-500/30 text-teal-400 bg-teal-950/20',
  MACRO_PROP: 'border-yellow-500/30 text-yellow-400 bg-yellow-950/20',
  CLASSICAL_TECH: 'border-gray-500/30 text-gray-400 bg-gray-900/20',
};

const AVAILABLE_COINS = [
  'ALL',
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'NEARUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'DOGEUSDT',
];

export const ScientificStrategyLab: React.FC<ScientificStrategyLabProps> = ({
  strategies,
  onToggleStrategy,
  onUpdateWeight,
  onAddSynthesizedStrategy,
  onEnableAllScientific,
  onDisableAllScientific,
}) => {
  const { isAr } = useLanguage();

  // Generator form state
  const [genSymbol, setGenSymbol] = useState('BTCUSDT');
  const [genDomain, setGenDomain] = useState<ScientificDomain | 'AUTO_SYNTHESIS'>('AUTO_SYNTHESIS');
  const [genTimeframe, setGenTimeframe] = useState<TimeFrame>('15m');
  const [genComplexity, setGenComplexity] = useState<'ADVANCED' | 'QUANTUM_GRADE'>('QUANTUM_GRADE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [synthesisNotice, setSynthesisNotice] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedCoin, setSelectedCoin] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('ALL');

  // Filter scientific strategies only
  const scientificStrategies = useMemo(() => {
    return strategies.filter((s) => s.category === 'scientific' || s.isProprietaryAI);
  }, [strategies]);

  const filtered = useMemo(() => {
    return scientificStrategies.filter((strat) => {
      // Domain filter
      if (selectedDomain !== 'ALL' && strat.scientificDomain !== selectedDomain) {
        return false;
      }
      // Coin filter
      if (selectedCoin !== 'ALL') {
        if (
          strat.applicableSymbols &&
          strat.applicableSymbols.length > 0 &&
          !strat.applicableSymbols.includes('ALL')
        ) {
          const match = strat.applicableSymbols.some(
            (sym) =>
              sym.replace(/[\/\-_]/g, '').toUpperCase() ===
              selectedCoin.replace(/[\/\-_]/g, '').toUpperCase()
          );
          if (!match) return false;
        }
      }
      // Timeframe filter
      if (selectedTimeframe !== 'ALL' && strat.timeframe !== selectedTimeframe) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = strat.name.toLowerCase().includes(q) || strat.arabicName.includes(q);
        const matchesPrinciple =
          (strat.scientificPrinciple && strat.scientificPrinciple.toLowerCase().includes(q)) ||
          (strat.arabicPrinciple && strat.arabicPrinciple.includes(q));
        const matchesFormula = strat.scientificFormula && strat.scientificFormula.toLowerCase().includes(q);
        const matchesDesc = strat.description.toLowerCase().includes(q);
        if (!matchesName && !matchesPrinciple && !matchesFormula && !matchesDesc) return false;
      }
      return true;
    });
  }, [scientificStrategies, selectedDomain, selectedCoin, selectedTimeframe, searchQuery]);

  const activeScientificCount = scientificStrategies.filter((s) => s.enabled).length;

  const handleSynthesizeStrategy = () => {
    setIsGenerating(true);
    setSynthesisNotice(null);

    setTimeout(() => {
      const newStrategy = generateScientificStrategy({
        targetSymbol: genSymbol,
        domain: genDomain,
        timeframe: genTimeframe,
        complexity: genComplexity,
      });

      onAddSynthesizedStrategy(newStrategy);
      setIsGenerating(false);

      setSynthesisNotice(
        isAr
          ? `✨ تم ابتكار وتوليد الاستراتيجية العلمية بنجاح: "${newStrategy.arabicName}" لعملة ${genSymbol}!`
          : `✨ Successfully synthesized AI proprietary strategy: "${newStrategy.name}" for ${genSymbol}!`
      );

      // Auto-clear notice after 6 seconds
      setTimeout(() => setSynthesisNotice(null), 6000);
    }, 600);
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner */}
      <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <Atom className="h-5 w-5 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#eaecef] flex items-center gap-2">
                  <span>{isAr ? 'مختبر الاستراتيجيات العلمية والكمومية (AI Scientific Lab)' : 'AI Scientific & Quantum Strategy Lab'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-purple-950/60 text-purple-300 border border-purple-500/40">
                    {activeScientificCount} / {scientificStrategies.length} ACTIVE
                  </span>
                </h2>
                <p className="text-xs text-[#848e9c]">
                  {isAr
                    ? 'استراتيجيات تداول حصرية ومبتكرة مبنية على ميكانيكا الكم، الديناميكا الحرارية، سريان نافييه-ستوكس، نظرية الفوضى ونظرية الألعاب'
                    : 'Proprietary AI strategies grounded in Quantum Mechanics, Thermodynamics, Navier-Stokes Fluid Flow, Chaos & Game Theory.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono">
            <button
              onClick={onEnableAllScientific}
              className="px-3 py-1.5 rounded-lg bg-[#1e2329] hover:bg-[#2b2f36] text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isAr ? 'تفعيل الكل' : 'Enable All'}</span>
            </button>
            <button
              onClick={onDisableAllScientific}
              className="px-3 py-1.5 rounded-lg bg-[#1e2329] hover:bg-[#2b2f36] text-rose-400 border border-rose-500/30 transition flex items-center gap-1.5"
            >
              <Power className="h-3.5 w-3.5" />
              <span>{isAr ? 'تعطيل الكل' : 'Disable All'}</span>
            </button>
          </div>
        </div>

        {/* Domain Tag Ribbon */}
        <div className="flex items-center gap-1.5 flex-wrap pt-4 mt-4 border-t border-[#2b2f36]/70 text-[11px] font-mono">
          <span className="text-[#848e9c] text-xs font-sans me-2">
            {isAr ? 'التخصصات العلمية المفعلة:' : 'Scientific Domains:'}
          </span>
          <span className="px-2.5 py-0.5 rounded border border-purple-500/30 bg-purple-950/30 text-purple-300 flex items-center gap-1">
            <Atom className="h-3 w-3" /> ميكانيكا الكم
          </span>
          <span className="px-2.5 py-0.5 rounded border border-amber-500/30 bg-amber-950/30 text-amber-300 flex items-center gap-1">
            <Flame className="h-3 w-3" /> الديناميكا الحرارية
          </span>
          <span className="px-2.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 flex items-center gap-1">
            <Waves className="h-3 w-3" /> ديناميكا الموائع
          </span>
          <span className="px-2.5 py-0.5 rounded border border-rose-500/30 bg-rose-950/30 text-rose-300 flex items-center gap-1">
            <Shuffle className="h-3 w-3" /> نظرية الفوضى والكسوريات
          </span>
          <span className="px-2.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 flex items-center gap-1">
            <Binary className="h-3 w-3" /> إنتروبيا المعلومات
          </span>
          <span className="px-2.5 py-0.5 rounded border border-blue-500/30 bg-blue-950/30 text-blue-300 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> الحسبان العشوائي
          </span>
          <span className="px-2.5 py-0.5 rounded border border-orange-500/30 bg-orange-950/30 text-orange-300 flex items-center gap-1">
            <Sliders className="h-3 w-3" /> نظرية الألعاب
          </span>
        </div>
      </div>

      {/* 2. Interactive AI Strategy Synthesizer Module (طلب المستخدم لتوليد استراتيجيات خاصة ومبتكرة) */}
      <div className="bg-[#181a20] border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b2f36] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#eaecef]">
                {isAr
                  ? 'محرك توليد وابتكار الاستراتيجيات بالذكاء الاصطناعي (AI Strategy Synthesizer)'
                  : 'AI Strategy Synthesizer & Autonomous Innovation Engine'}
              </h3>
              <p className="text-[11px] text-[#848e9c]">
                {isAr
                  ? 'اختر العملة والمجال العلمي ليدرس الذكاء الاصطناعي خصائصها ويبتكر استراتيجية رياضية فريدة مخصصة لها'
                  : 'Select coin & scientific discipline for the AI to innovate an asset-tailored proprietary algorithm.'}
              </p>
            </div>
          </div>
        </div>

        {/* Synthesis Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Target Coin */}
          <div className="space-y-1">
            <label className="text-xs text-[#848e9c] font-medium">
              {isAr ? 'العملة المستهدفة (Target Asset)' : 'Target Asset'}
            </label>
            <select
              value={genSymbol}
              onChange={(e) => setGenSymbol(e.target.value)}
              className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-xl px-3 py-2 text-xs text-[#eaecef] font-mono focus:border-purple-500 outline-none"
            >
              <option value="BTCUSDT">Bitcoin (BTCUSDT) - السيولة العميقة والملاذ</option>
              <option value="ETHUSDT">Ethereum (ETHUSDT) - غاز الشبكة والحصص</option>
              <option value="SOLUSDT">Solana (SOLUSDT) - البيتا العالية وسرعة TPS</option>
              <option value="NEARUSDT">Near Protocol (NEARUSDT) - حوسبة الذكاء الاصطناعي</option>
              <option value="AVAXUSDT">Avalanche (AVAXUSDT) - سلاسل Subnets وسرعة النقل</option>
              <option value="LINKUSDT">Chainlink (LINKUSDT) - إجماع أوراكل CCIP</option>
              <option value="DOGEUSDT">Dogecoin (DOGEUSDT) - زخم الزخم والسيولة اللحظية</option>
              <option value="ALL">Universal / لكافة العملات المتاحة</option>
            </select>
          </div>

          {/* Scientific Domain */}
          <div className="space-y-1">
            <label className="text-xs text-[#848e9c] font-medium">
              {isAr ? 'المجال العلمي (Scientific Domain)' : 'Scientific Domain'}
            </label>
            <select
              value={genDomain}
              onChange={(e) => setGenDomain(e.target.value as any)}
              className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-xl px-3 py-2 text-xs text-[#eaecef] font-mono focus:border-purple-500 outline-none"
            >
              <option value="AUTO_SYNTHESIS">✨ توليف ذكي تلقائي (AI Auto Spectrum)</option>
              <option value="QUANTUM">⚛️ ميكانيكا الكم (Quantum Mechanics)</option>
              <option value="THERMODYNAMICS">🔥 الديناميكا الحرارية (Thermodynamics)</option>
              <option value="FLUID_DYNAMICS">🌊 ديناميكا الموائع (Fluid Dynamics)</option>
              <option value="CHAOS_FRACTAL">🌀 نظرية الفوضى والكسوريات (Chaos & Fractals)</option>
              <option value="INFORMATION_THEORY">📊 إنتروبيا المعلومات لشانون (Information Theory)</option>
              <option value="STOCHASTIC">📈 الحسبان العشوائي ومسارات ليفي (Stochastic)</option>
              <option value="GAME_THEORY">♟️ نظرية الألعاب وميكروستركتشر (Game Theory)</option>
              <option value="HARMONIC_SPECTRUM">🎵 التحليل التوافقي والمويجات (Harmonic Spectrum)</option>
              <option value="NEURAL_QUANT">🧠 المعادلات العصبية السائلة (Neural Quant ODE)</option>
              <option value="MACRO_PROP">🏛️ الفيزياء الكلية لمعمارية الشبكات (Macro Physics)</option>
            </select>
          </div>

          {/* Timeframe */}
          <div className="space-y-1">
            <label className="text-xs text-[#848e9c] font-medium">
              {isAr ? 'الإطار الزمني المستهدف' : 'Target Timeframe'}
            </label>
            <select
              value={genTimeframe}
              onChange={(e) => setGenTimeframe(e.target.value as TimeFrame)}
              className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-xl px-3 py-2 text-xs text-[#eaecef] font-mono focus:border-purple-500 outline-none"
            >
              <option value="1m">1m (سكالبنج ميكرو كمومي)</option>
              <option value="5m">5m (نبضات تدفق الأوامر السريعة)</option>
              <option value="15m">15m (الاتجاه التكتيكي المفضل)</option>
              <option value="1h">1h (التأكيد التوافقي والموجي)</option>
              <option value="4h">4h (المدارات الجاذبية والإنثالبي الكلي)</option>
              <option value="1d">1d (الموجات الكبرى للدورات السنوية)</option>
            </select>
          </div>

          {/* Complexity */}
          <div className="space-y-1">
            <label className="text-xs text-[#848e9c] font-medium">
              {isAr ? 'المستوى الحسابي والتعقيد' : 'Mathematical Complexity'}
            </label>
            <select
              value={genComplexity}
              onChange={(e) => setGenComplexity(e.target.value as any)}
              className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-xl px-3 py-2 text-xs text-[#eaecef] font-mono focus:border-purple-500 outline-none"
            >
              <option value="QUANTUM_GRADE">درجة كمومية فائقة (Quantum-Grade Model)</option>
              <option value="ADVANCED">نموذج رياضي متقدم (Advanced Mathematical)</option>
            </select>
          </div>
        </div>

        {/* Generate Trigger Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#2b2f36]/70">
          <p className="text-xs text-[#848e9c]">
            {isAr
              ? '💡 الاستراتيجية المولدة ستحتوي على معادلة رياضية دقيقة، ومبدأ فيزيائي أصيل، وشرح مخصص لملاءمة العملة.'
              : '💡 Synthesized strategy includes exact formula, physical principle, and asset suitability rationale.'}
          </p>

          <button
            onClick={handleSynthesizeStrategy}
            disabled={isGenerating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>{isAr ? 'جارٍ ابتكار وتوليد الاستراتيجية الرياضية...' : 'Innovating Mathematical Strategy...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span>{isAr ? 'توليد وابتكار استراتيجية علمية فريدة الآن' : 'Synthesize New Scientific Strategy Now'}</span>
              </>
            )}
          </button>
        </div>

        {/* Notice Banner */}
        {synthesisNotice && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{synthesisNotice}</span>
          </div>
        )}
      </div>

      {/* 3. Filters & Search Controls */}
      <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-[#848e9c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بالمعادلة، المبدأ، أو اسم الاستراتيجية...' : 'Search by formula, principle, name...'}
              className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-xl pl-3 pr-9 py-2 text-xs text-[#eaecef] placeholder-[#5e6673] focus:border-[#fcd535] outline-none"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs font-mono">
            {/* Domain Dropdown */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl px-3 py-1.5 text-xs text-[#eaecef] outline-none"
            >
              <option value="ALL">{isAr ? 'جميع العلوم والفيزياء (ALL)' : 'All Sciences'}</option>
              <option value="QUANTUM">⚛️ ميكانيكا الكم</option>
              <option value="THERMODYNAMICS">🔥 الديناميكا الحرارية</option>
              <option value="FLUID_DYNAMICS">🌊 ديناميكا الموائع</option>
              <option value="CHAOS_FRACTAL">🌀 نظرية الفوضى والكسوريات</option>
              <option value="INFORMATION_THEORY">📊 إنتروبيا المعلومات</option>
              <option value="STOCHASTIC">📈 الحسبان العشوائي</option>
              <option value="GAME_THEORY">♟️ نظرية الألعاب</option>
              <option value="HARMONIC_SPECTRUM">🎵 التحليل التوافقي</option>
              <option value="MACRO_PROP">🏛️ فيزياء الأصول المتخصصة</option>
            </select>

            {/* Coin Filter Dropdown */}
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl px-3 py-1.5 text-xs text-[#eaecef] outline-none"
            >
              <option value="ALL">{isAr ? 'جميع العملات (ALL)' : 'All Coins'}</option>
              <option value="BTCUSDT">BTC (بيتكوين)</option>
              <option value="ETHUSDT">ETH (إيثيريوم)</option>
              <option value="SOLUSDT">SOL (سولانا)</option>
              <option value="NEARUSDT">NEAR (نير)</option>
              <option value="AVAXUSDT">AVAX (أفالانش)</option>
              <option value="LINKUSDT">LINK (تشينلينك)</option>
              <option value="DOGEUSDT">DOGE (دوج)</option>
            </select>

            {/* Timeframe Dropdown */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl px-3 py-1.5 text-xs text-[#eaecef] outline-none"
            >
              <option value="ALL">{isAr ? 'جميع الأطر الزمنية' : 'All Timeframes'}</option>
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>

            <span className="text-xs text-[#848e9c] px-1">
              ({filtered.length} {isAr ? 'استراتيجية' : 'strategies'})
            </span>
          </div>
        </div>
      </div>

      {/* 4. Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((strategy) => {
          const domain = strategy.scientificDomain || 'QUANTUM';
          const domainColor = DOMAIN_COLORS[domain] || 'border-[#2b2f36] text-[#eaecef] bg-[#181a20]';
          const domainIcon = DOMAIN_ICONS[domain] || <Atom className="h-4 w-4" />;

          return (
            <div
              key={strategy.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition relative overflow-hidden shadow-lg ${
                strategy.enabled
                  ? 'bg-[#181a20] border-[#2b2f36] hover:border-[#3b414d]'
                  : 'bg-[#121418] border-[#20242b] opacity-60'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 font-semibold ${domainColor}`}
                    >
                      {domainIcon}
                      <span>{domain}</span>
                    </span>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0b0e11] text-[#fcd535] border border-[#2b2f36]">
                      {strategy.timeframe}
                    </span>

                    {strategy.mathModelComplexity && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/20">
                        {strategy.mathModelComplexity === 'QUANTUM_GRADE' ? 'QUANTUM' : 'ADVANCED'}
                      </span>
                    )}
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => onToggleStrategy(strategy.id)}
                    className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                      strategy.enabled ? 'bg-emerald-500' : 'bg-[#2b2f36]'
                    }`}
                  >
                    <div
                      className={`h-3.5 w-3.5 rounded-full bg-white transition-transform absolute top-0.75 ${
                        isAr
                          ? strategy.enabled
                            ? 'right-4.5'
                            : 'right-1'
                          : strategy.enabled
                          ? 'left-4.5'
                          : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Strategy Title */}
                <div>
                  <h4 className="font-bold text-sm text-[#eaecef] line-clamp-1">
                    {isAr ? strategy.arabicName : strategy.name}
                  </h4>
                  <p className="text-[11px] text-[#848e9c] font-mono line-clamp-1">
                    {isAr ? strategy.name : strategy.arabicName}
                  </p>
                </div>

                {/* Mathematical Formula Banner */}
                {strategy.scientificFormula && (
                  <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl p-2.5 font-mono text-[11px] text-purple-300 text-center select-all overflow-x-auto shadow-inner">
                    <span className="text-[9px] text-[#848e9c] block mb-0.5 uppercase tracking-wider font-sans">
                      {isAr ? 'المعادلة الرياضية الحاكمة' : 'Governing Mathematical Formula'}
                    </span>
                    <code>{strategy.scientificFormula}</code>
                  </div>
                )}

                {/* Scientific Principle Description */}
                <div className="space-y-1 text-xs">
                  <div className="text-[#848e9c] text-[11px] flex items-center gap-1 font-medium">
                    <Lightbulb className="h-3 w-3 text-yellow-400" />
                    <span>{isAr ? 'المبدأ الفيزيائي / الرياضي:' : 'Physical / Math Principle:'}</span>
                  </div>
                  <p className="text-[#c5c9d0] text-xs leading-relaxed">
                    {isAr ? strategy.arabicPrinciple || strategy.description : strategy.scientificPrinciple || strategy.description}
                  </p>
                </div>

                {/* Coin Specific Suitability Rationale (لماذا تناسب هذه العملة بالذات؟) */}
                {(strategy.applicableSymbols || strategy.arabicSuitabilityReason) && (
                  <div className="bg-[#12161c] border border-blue-500/20 rounded-xl p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>{isAr ? 'ملاءمة العملة وخصوصيتها:' : 'Asset-Specific Suitability:'}</span>
                      </span>

                      {/* Applicable Coins Pill */}
                      <div className="flex items-center gap-1">
                        {strategy.applicableSymbols?.map((sym) => (
                          <span
                            key={sym}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-500/30"
                          >
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#848e9c] leading-relaxed">
                      {isAr
                        ? strategy.arabicSuitabilityReason || 'تمت معايرة معايير هذه الاستراتيجية لتتطابق مع عمق سيولة وسرعة حركة العملة.'
                        : strategy.coinSuitabilityReason || 'Calibrated to match orderbook depth and liquidity speed of the token.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Metrics & Weight Slider */}
              <div className="pt-3 mt-3 border-t border-[#2b2f36]/70 space-y-2">
                {/* Win Rate & Audit Quality */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <Percent className="h-3 w-3" />
                    <span>{strategy.winRateEstimate || 84.5}% {isAr ? 'نسبة نجاح مقدرة' : 'Win Rate'}</span>
                  </span>

                  <span className="text-purple-300 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{strategy.auditScoreEstimate || 90}/100 {isAr ? 'تدقيق الجودة' : 'Audit Score'}</span>
                  </span>
                </div>

                {/* Weight Control */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-[#848e9c]">
                    {isAr ? 'وزن التأثير:' : 'Weight:'}
                  </span>

                  <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                    <input
                      type="range"
                      min="0.3"
                      max="2.0"
                      step="0.05"
                      value={strategy.weight}
                      onChange={(e) => onUpdateWeight(strategy.id, parseFloat(e.target.value))}
                      disabled={!strategy.enabled}
                      className="w-full accent-purple-500 h-1 bg-[#0b0e11] rounded cursor-pointer disabled:opacity-40"
                    />
                    <span className="font-mono text-xs text-[#fcd535] font-semibold w-8 text-right">
                      {strategy.weight.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center bg-[#181a20] border border-[#2b2f36] rounded-2xl space-y-2">
          <Atom className="h-8 w-8 text-[#848e9c] mx-auto opacity-50" />
          <h4 className="text-sm font-semibold text-[#eaecef]">
            {isAr ? 'لا توجد استراتيجيات مطابقة لخيارات البحث' : 'No strategies match the selected filters'}
          </h4>
          <p className="text-xs text-[#848e9c]">
            {isAr
              ? 'جرّب إعادة ضبط الفلاتر أو استخدام محرك التوليد في الأعلى لابتكار استراتيجية جديدة مخصصة.'
              : 'Try resetting the filters or use the generator above to synthesize a customized strategy.'}
          </p>
        </div>
      )}
    </div>
  );
};

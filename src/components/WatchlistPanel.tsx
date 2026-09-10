import React, { useState, useMemo } from 'react';
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
  LayoutGrid,
  List,
  Search,
  Zap,
  BarChart3,
  Target,
  Brain,
  Layers,
  Scale,
  DollarSign,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { CryptoAsset, AuditCheckItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { AIDecisionModal } from './AIDecisionModal';
import { BacktestModal } from './BacktestModal';

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
  const { t, isAr, language } = useLanguage();
  const [inspectedAsset, setInspectedAsset] = useState<CryptoAsset | null>(null);
  const [aiInspectedAsset, setAiInspectedAsset] = useState<CryptoAsset | null>(null);
  const [isBacktestOpen, setIsBacktestOpen] = useState<boolean>(false);
  const [backtestSymbol, setBacktestSymbol] = useState<string>('BTCUSDT');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSignal, setFilterSignal] = useState<'ALL' | 'LONG' | 'SHORT' | 'PASSED' | 'AI_APPROVED'>('ALL');

  // Stats calculation
  const totalCount = assets.length;
  const longCount = useMemo(() => assets.filter((a) => a.ensembleSignal === 'LONG').length, [assets]);
  const shortCount = useMemo(() => assets.filter((a) => a.ensembleSignal === 'SHORT').length, [assets]);
  const auditPassedCount = useMemo(() => assets.filter((a) => a.auditPassed).length, [assets]);
  const aiApprovedCount = useMemo(
    () => assets.filter((a) => a.geminiDecision?.isApproved || (a.auditPassed && a.confidence >= 65)).length,
    [assets]
  );

  // Filtered and searched assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.sector.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterSignal === 'LONG') return asset.ensembleSignal === 'LONG';
      if (filterSignal === 'SHORT') return asset.ensembleSignal === 'SHORT';
      if (filterSignal === 'PASSED') return asset.auditPassed === true;
      if (filterSignal === 'AI_APPROVED') {
        return asset.geminiDecision?.isApproved || (asset.auditPassed && asset.confidence >= 65);
      }

      return true;
    });
  }, [assets, searchQuery, filterSignal]);

  const symbolList = useMemo(() => assets.map((a) => a.symbol), [assets]);

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm space-y-4">
      {/* 1. Header Bar with Status Badges & Quick Tools */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-[#2b2f36] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#fcd535]/15 border border-[#fcd535]/30 text-[#fcd535] shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-[#eaecef]">
                {isAr ? 'شاشة مراقبة أزواج بينانس فيوتشرز' : 'Binance Futures Pairs Terminal'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0b0e11] text-[#fcd535] border border-[#2b2f36] font-mono font-bold">
                USDT-M Perpetual
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
                <Target className="h-3 w-3" />
                {isAr ? 'هدف الربح: $20.00 / صفقة' : 'Target: $20.00 / trade'}
              </span>
            </div>
            <p className="text-[11px] text-[#848e9c] mt-0.5">
              {isAr
                ? 'مراقبة حية فورية لبيانات بينانس فيوتشرز مع تحليل الذكاء الاصطناعي Gemini وإجماع 50+ استراتيجية'
                : 'Real-time live Binance Futures streaming with Gemini AI Decision Engine & 50+ Strategy Consensus'}
            </p>
          </div>
        </div>

        {/* View Controls & Backtesting Action */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          {/* Backtest Button */}
          <button
            onClick={() => {
              setBacktestSymbol(selectedSymbol || 'BTCUSDT');
              setIsBacktestOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition shadow-xs"
            title={isAr ? 'اختبار الأداء التاريخي على بيانات بينانس' : 'Run historical backtest on Binance data'}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{isAr ? 'اختبار الأداء التاريخي (Backtest)' : 'Historical Backtest'}</span>
          </button>

          {/* Live Pulse Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] text-[11px] font-mono text-[#848e9c]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">{isAr ? 'بث بينانس نشط' : 'Binance Live'}</span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0b0e11] border border-[#2b2f36] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                viewMode === 'GRID'
                  ? 'bg-[#1e2329] text-[#fcd535] shadow-xs'
                  : 'text-[#848e9c] hover:text-[#eaecef]'
              }`}
              title={isAr ? 'عرض البطاقات المنظمة' : 'Grid View'}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isAr ? 'بطاقات' : 'Grid'}</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                viewMode === 'TABLE'
                  ? 'bg-[#1e2329] text-[#fcd535] shadow-xs'
                  : 'text-[#848e9c] hover:text-[#eaecef]'
              }`}
              title={isAr ? 'عرض الجدول المالي' : 'Table View'}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isAr ? 'جدول' : 'Table'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl p-2.5 flex items-center justify-between">
          <span className="text-[11px] text-[#848e9c] font-medium">
            {isAr ? 'الأزواج المراقبة' : 'Monitored'}
          </span>
          <span className="text-sm font-bold font-mono text-[#eaecef]">{totalCount}</span>
        </div>

        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl p-2.5 flex items-center justify-between">
          <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {isAr ? 'شراء (LONG)' : 'Long'}
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">{longCount}</span>
        </div>

        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl p-2.5 flex items-center justify-between">
          <span className="text-[11px] text-red-400/90 font-medium flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            {isAr ? 'بيع (SHORT)' : 'Short'}
          </span>
          <span className="text-sm font-bold font-mono text-red-400">{shortCount}</span>
        </div>

        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl p-2.5 flex items-center justify-between">
          <span className="text-[11px] text-[#fcd535]/90 font-medium flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            {isAr ? 'معتمد بالتدقيق 🛡️' : 'Passed Audit'}
          </span>
          <span className="text-sm font-bold font-mono text-[#fcd535]">{auditPassedCount}</span>
        </div>

        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-xl p-2.5 flex items-center justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] text-sky-400 font-medium flex items-center gap-1">
            <Brain className="h-3 w-3" />
            {isAr ? 'إشارات Gemini' : 'AI Conviction'}
          </span>
          <span className="text-sm font-bold font-mono text-sky-400">{aiApprovedCount}</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search
            className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#848e9c]`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr ? 'بحث عن زوج (مثال: BTC, ETH, SOL)...' : 'Search pair (e.g. BTC, ETH, SOL)...'
            }
            className={`w-full bg-[#0b0e11] border border-[#2b2f36] rounded-xl ${
              isAr ? 'pr-9 pl-8' : 'pl-9 pr-8'
            } py-1.5 text-xs text-[#eaecef] placeholder-[#848e9c] focus:outline-none focus:border-[#fcd535] transition font-mono`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${isAr ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-[#848e9c] hover:text-[#eaecef]`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterSignal('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'ALL'
                ? 'bg-[#2b2f36] text-[#eaecef] border border-[#3b404a]'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-[#eaecef] border border-[#2b2f36]'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({totalCount})
          </button>

          <button
            onClick={() => setFilterSignal('LONG')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'LONG'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-emerald-400 border border-[#2b2f36]'
            }`}
          >
            🟢 {isAr ? 'شراء' : 'Long'} ({longCount})
          </button>

          <button
            onClick={() => setFilterSignal('SHORT')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'SHORT'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-red-400 border border-[#2b2f36]'
            }`}
          >
            🔴 {isAr ? 'بيع' : 'Short'} ({shortCount})
          </button>

          <button
            onClick={() => setFilterSignal('PASSED')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'PASSED'
                ? 'bg-[#fcd535]/20 text-[#fcd535] border border-[#fcd535]/40'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-[#fcd535] border border-[#2b2f36]'
            }`}
          >
            🛡️ {isAr ? 'معتمد' : 'Audit'} ({auditPassedCount})
          </button>

          <button
            onClick={() => setFilterSignal('AI_APPROVED')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'AI_APPROVED'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-sky-400 border border-[#2b2f36]'
            }`}
          >
            🤖 {isAr ? 'تأكيد Gemini' : 'Gemini'} ({aiApprovedCount})
          </button>
        </div>
      </div>

      {/* 4. Display Mode: Grid Cards View */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#848e9c] font-mono text-xs">
              {isAr ? 'لا توجد أزواج تطابق معايير البحث والفلترة' : 'No pairs match the search or filter criteria'}
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isSelected = selectedSymbol === asset.symbol;
              const isUpTrend = asset.trend === 'UP';
              const isDownTrend = asset.trend === 'DOWN';
              const hasAudit = asset.auditScore !== undefined;
              const isAuditPassed = asset.auditPassed;
              const isLong = asset.ensembleSignal === 'LONG';
              const isShort = asset.ensembleSignal === 'SHORT';

              const mtf = asset.timeframeAlignment;
              const isMtfAligned = mtf ? mtf.isAligned : false;
              const ob = asset.orderbookDepth;

              return (
                <div
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset.symbol)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1e2329] border-[#fcd535] ring-1 ring-[#fcd535]/30 shadow-md'
                      : 'bg-[#1e2329] border-[#2b2f36] hover:border-[#3b404a]'
                  }`}
                >
                  {/* Card Top: Pair Header & Live Price */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#eaecef] text-base font-mono tracking-tight">
                            {asset.symbol}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#0b0e11] text-[#848e9c] rounded border border-[#2b2f36] font-mono">
                            {asset.sector}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#848e9c] block font-sans truncate max-w-[140px]">
                          {asset.name}
                        </span>
                      </div>

                      <div className="font-mono text-right shrink-0" dir="ltr">
                        <div className="font-bold text-[#eaecef] text-sm">
                          ${asset.price.toLocaleString(undefined, {
                            minimumFractionDigits: asset.price < 1 ? 4 : 2,
                            maximumFractionDigits: asset.price < 1 ? 4 : 2,
                          })}
                        </div>
                        <div
                          className={`inline-flex items-center justify-end text-[11px] font-semibold ${
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

                    {/* Multi-Timeframe Alignment & Orderbook Badges */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2.5 text-[10px] font-mono">
                      <div
                        className={`px-2 py-1 rounded-lg border flex items-center gap-1 justify-center ${
                          isMtfAligned
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-[#0b0e11] border-[#2b2f36] text-[#848e9c]'
                        }`}
                        title={
                          mtf
                            ? `15m: ${mtf.tf15m.trend} | 1h: ${mtf.tf1h.trend} | 4h: ${mtf.tf4h.trend}`
                            : 'Timeframe cascade'
                        }
                      >
                        <Layers className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {isMtfAligned
                            ? isAr ? 'توافق أطر 15m/1h/4h' : '15m/1h/4h Aligned'
                            : isAr ? 'أطر زمنية متباينة' : 'MTF Disparate'}
                        </span>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-lg border flex items-center gap-1 justify-center ${
                          ob?.hasOpposingWall
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-[#0b0e11] border-[#2b2f36] text-[#848e9c]'
                        }`}
                        title={ob?.details}
                      >
                        <Scale className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {ob?.hasOpposingWall
                            ? isAr ? 'حاجز سيولة معترض' : 'Opposing Wall'
                            : isAr ? `عمق سليم (${ob?.bidAskRatio || 1.0})` : `Depth OK (${ob?.bidAskRatio || 1.0})`}
                        </span>
                      </div>
                    </div>

                    {/* Technical Indicators Strip */}
                    <div className="grid grid-cols-4 gap-1.5 py-2 border-y border-[#2b2f36] text-[10px] font-mono mb-2.5">
                      <div className="text-center">
                        <span className="text-[#848e9c] block text-[9px] mb-0.5">{isAr ? 'الاتجاه' : 'Trend'}</span>
                        <span
                          className={`font-semibold px-1 py-0.5 rounded text-[10px] block ${
                            isUpTrend
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isDownTrend
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-[#0b0e11] text-[#848e9c]'
                          }`}
                        >
                          {isUpTrend ? '🟢 UP' : isDownTrend ? '🔴 DOWN' : '⚪ FLAT'}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-[#848e9c] block text-[9px] mb-0.5">RSI(14)</span>
                        <span
                          className={`font-bold block py-0.5 ${
                            asset.rsi < 35
                              ? 'text-emerald-400'
                              : asset.rsi > 65
                              ? 'text-red-400'
                              : 'text-[#eaecef]'
                          }`}
                        >
                          {asset.rsi.toFixed(0)}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-[#848e9c] block text-[9px] mb-0.5">MACD</span>
                        <span
                          className={`font-bold block py-0.5 ${
                            asset.macdSignal === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {asset.macdSignal === 'BULLISH' ? 'BULL' : 'BEAR'}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-[#848e9c] block text-[9px] mb-0.5">ADX</span>
                        <span className="font-bold text-[#fcd535] block py-0.5">
                          {asset.adx.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* Signal Recommendation & Leading Strategy */}
                    <div className="space-y-1.5 mb-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#848e9c] flex items-center gap-1 text-[11px]">
                          <Sparkles className="h-3 w-3 text-[#fcd535]" />
                          <span>{t.colSignal}:</span>
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            isLong
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isShort
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-[#0b0e11] text-[#848e9c] border border-[#2b2f36]'
                          }`}
                        >
                          {asset.ensembleSignal} ({asset.confidence}%)
                        </span>
                      </div>

                      {/* Leading Strategy Name */}
                      {asset.leadingStrategy && (
                        <div className="text-[10px] text-emerald-300 font-sans truncate flex items-center gap-1 bg-[#0b0e11] p-1.5 rounded-lg border border-[#2b2f36]">
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-mono shrink-0">
                            {isAr ? 'الاستراتيجية' : 'Strategy'}
                          </span>
                          <span
                            className="truncate text-[#eaecef] font-medium"
                            title={asset.leadingStrategy.arabicName || asset.leadingStrategy.name}
                          >
                            {isAr ? (asset.leadingStrategy.arabicName || asset.leadingStrategy.name) : asset.leadingStrategy.name}
                          </span>
                        </div>
                      )}

                      {/* Consensus Bar */}
                      <div className="flex items-center gap-1.5 text-[10px] text-[#848e9c] font-mono pt-0.5" dir="ltr">
                        <span className="text-emerald-400 text-[9px]">L:{asset.longScore}</span>
                        <div className="flex-1 bg-[#0b0e11] rounded-full h-1.5 overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{
                              width: `${(asset.longScore / (asset.longScore + asset.shortScore || 1)) * 100}%`,
                            }}
                          ></div>
                          <div
                            className="bg-red-500 h-full transition-all"
                            style={{
                              width: `${(asset.shortScore / (asset.longScore + asset.shortScore || 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-red-400 text-[9px]">S:{asset.shortScore}</span>
                      </div>
                    </div>

                    {/* Dual Buttons: Gemini AI Analysis & 8-Pillar Audit */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                      {/* Gemini AI Decision Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAiInspectedAsset(asset);
                        }}
                        className="bg-[#0b0e11] hover:bg-[#1e2329] border border-[#2b2f36] hover:border-[#fcd535]/60 rounded-lg p-1.5 flex items-center justify-between text-[10px] font-mono text-[#eaecef] transition group"
                        title={isAr ? 'عرض تقرير قرار الذكاء الاصطناعي المؤسسي' : 'View Gemini AI Decision Report'}
                      >
                        <span className="flex items-center gap-1 text-[#fcd535]">
                          <Brain className="h-3 w-3" />
                          <span>Gemini AI</span>
                        </span>
                        <span className="text-[#848e9c] group-hover:text-[#eaecef] flex items-center">
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </button>

                      {/* 8-Pillar Audit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedAsset(asset);
                        }}
                        className="bg-[#0b0e11] hover:bg-[#1e2329] border border-[#2b2f36] hover:border-[#3b404a] rounded-lg p-1.5 flex items-center justify-between text-[10px] font-mono text-[#eaecef] transition group"
                        title={isAr ? 'فحص تدقيق الجودة الـ 8 ركائز' : 'Inspect 8-Pillar Audit'}
                      >
                        <span className="flex items-center gap-1">
                          <ShieldCheck className={`h-3 w-3 ${isAuditPassed ? 'text-emerald-400' : 'text-amber-400'}`} />
                          <span>{hasAudit ? `${asset.auditScore}%` : 'Audit'}</span>
                        </span>
                        <Info className="h-3 w-3 text-[#848e9c] group-hover:text-[#eaecef]" />
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom: Instant Trade Execution Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2b2f36]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onForceTrade(asset.symbol, 'LONG');
                      }}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1"
                      title={isAr ? 'فتح صفقة تجريبية شراء (هدف $20)' : 'Open Paper LONG (Target: $20)'}
                    >
                      <Zap className="h-3 w-3" />
                      <span>LONG</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onForceTrade(asset.symbol, 'SHORT');
                      }}
                      className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1"
                      title={isAr ? 'فتح صفقة تجريبية بيع (هدف $20)' : 'Open Paper SHORT (Target: $20)'}
                    >
                      <Zap className="h-3 w-3" />
                      <span>SHORT</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. Display Mode: Clean Table View */}
      {viewMode === 'TABLE' && (
        <div className="border border-[#2b2f36] rounded-xl overflow-hidden bg-[#0b0e11]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono" dir="ltr">
              <thead className="bg-[#1e2329] text-[10px] text-[#848e9c] uppercase border-b border-[#2b2f36]">
                <tr>
                  <th className="py-2.5 px-3">Pair</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">24h</th>
                  <th className="py-2.5 px-3">MTF Cascade</th>
                  <th className="py-2.5 px-3">RSI</th>
                  <th className="py-2.5 px-3">Signal & Consensus</th>
                  <th className="py-2.5 px-3">Gemini AI</th>
                  <th className="py-2.5 px-3">8-Pillar Audit</th>
                  <th className="py-2.5 px-3 text-right">Paper Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2329]">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedSymbol === asset.symbol;
                  const isLong = asset.ensembleSignal === 'LONG';
                  const isShort = asset.ensembleSignal === 'SHORT';
                  const mtf = asset.timeframeAlignment;

                  return (
                    <tr
                      key={asset.symbol}
                      onClick={() => onSelectAsset(asset.symbol)}
                      className={`hover:bg-[#181a20] cursor-pointer transition ${
                        isSelected ? 'bg-[#181a20]/80' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-[#eaecef]">
                        <div className="flex items-center gap-1.5">
                          <span>{asset.symbol}</span>
                          <span className="text-[9px] px-1 py-0.2 bg-[#1e2329] text-[#848e9c] rounded">
                            {asset.sector}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-[#eaecef]">
                        ${asset.price.toLocaleString(undefined, {
                          minimumFractionDigits: asset.price < 1 ? 4 : 2,
                        })}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold ${
                            asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {asset.change24h >= 0 ? '+' : ''}
                          {asset.change24h.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            mtf?.isAligned
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-[#1e2329] text-[#848e9c]'
                          }`}
                        >
                          {mtf?.isAligned ? '15m·1h·4h Aligned' : 'Mixed MTF'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-[#eaecef]">
                        {asset.rsi.toFixed(0)}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isLong
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : isShort
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-[#1e2329] text-[#848e9c]'
                            }`}
                          >
                            {asset.ensembleSignal} ({asset.confidence}%)
                          </span>
                          <span className="text-[10px] text-[#848e9c]">
                            L:{asset.longScore} / S:{asset.shortScore}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAiInspectedAsset(asset);
                          }}
                          className="px-2 py-0.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] flex items-center gap-1"
                        >
                          <Brain className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </td>

                      <td className="py-2.5 px-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedAsset(asset);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 ${
                            asset.auditPassed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          <span>{asset.auditScore || 0}%</span>
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onForceTrade(asset.symbol, 'LONG')}
                            className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded text-[10px] font-bold"
                          >
                            LONG
                          </button>
                          <button
                            onClick={() => onForceTrade(asset.symbol, 'SHORT')}
                            className="px-2 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded text-[10px] font-bold"
                          >
                            SHORT
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Gemini AI Decision Inspector Modal */}
      {aiInspectedAsset && (
        <AIDecisionModal
          asset={aiInspectedAsset}
          lang={language}
          onClose={() => setAiInspectedAsset(null)}
          onExecuteTrade={(symbol, side) => onForceTrade(symbol, side)}
        />
      )}

      {/* 7. Historical Backtest Modal */}
      {isBacktestOpen && (
        <BacktestModal
          symbols={symbolList}
          currentSymbol={backtestSymbol}
          lang={language}
          onClose={() => setIsBacktestOpen(false)}
        />
      )}

      {/* 8. Eight-Pillar Quality Audit Modal */}
      {inspectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#2b2f36] flex items-center justify-between bg-[#1e2329]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#fcd535]/15 border border-[#fcd535]/30 text-[#fcd535]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#eaecef]">
                    {isAr
                      ? `فحص تدقيق الجودة لـ ${inspectedAsset.symbol}`
                      : `8-Pillar Quality Audit: ${inspectedAsset.symbol}`}
                  </h3>
                  <span className="text-[11px] text-[#848e9c]">
                    {isAr
                      ? 'التحقق الصارم من 8 ركائز للمخاطر وتدفق السيولة'
                      : 'Rigorous 8-Pillar Quality & Risk Validation'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectedAsset(null)}
                className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#2b2f36] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Score Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  inspectedAsset.auditPassed
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xl font-bold font-mono ${
                      inspectedAsset.auditPassed ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {inspectedAsset.auditScore || 0}%
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#eaecef] block">
                      {inspectedAsset.auditVerification
                        ? isAr
                          ? inspectedAsset.auditVerification.arabicRating
                          : inspectedAsset.auditVerification.rating
                        : isAr
                        ? 'قيد الفحص'
                        : 'Evaluating'}
                    </span>
                    <span className="text-[11px] text-[#848e9c]">
                      {inspectedAsset.auditPassed
                        ? isAr
                          ? 'استوفت الصفقة المعايير المطلوبة'
                          : 'Passed institutional safety threshold'
                        : isAr
                        ? 'لم تستوفِ بعض الشروط الفنية'
                        : 'Failed one or more safety conditions'}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-[#848e9c]">
                  <span>{isAr ? 'الحد الأدنى للقبول:' : 'Min Required:'} </span>
                  <span className="text-[#fcd535] font-bold">65%</span>
                </div>
              </div>

              {/* Pillars list */}
              {inspectedAsset.auditVerification?.checks && (
                <div className="space-y-2">
                  {Object.entries(inspectedAsset.auditVerification.checks).map(
                    ([key, check]: [string, AuditCheckItem]) => (
                      <div
                        key={key}
                        className="p-2.5 rounded-xl bg-[#0b0e11] border border-[#2b2f36] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {check.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
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
                        <span
                          className={`font-mono text-xs font-bold ${
                            check.passed ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          +{check.score}/{check.weight}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Reasons list */}
              {inspectedAsset.auditVerification && (
                <div className="p-3 rounded-xl bg-[#0b0e11] border border-[#2b2f36] space-y-1.5 text-xs font-mono">
                  <span className="text-[#848e9c] block font-bold text-[11px]">
                    {isAr ? 'ملخص تحليل الفحص:' : 'Audit Analysis Summary:'}
                  </span>
                  {(isAr
                    ? inspectedAsset.auditVerification.arabicReasons
                    : inspectedAsset.auditVerification.reasons
                  ).map((reason, idx) => (
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
                  onForceTrade(
                    inspectedAsset.symbol,
                    inspectedAsset.ensembleSignal === 'SHORT' ? 'SHORT' : 'LONG'
                  );
                  setInspectedAsset(null);
                }}
                className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition font-mono flex items-center gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{isAr ? 'تنفيذ فوري مباشر ⚡' : 'Execute Instant Trade ⚡'}</span>
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

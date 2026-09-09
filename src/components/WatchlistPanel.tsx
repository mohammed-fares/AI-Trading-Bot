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
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSignal, setFilterSignal] = useState<'ALL' | 'LONG' | 'SHORT' | 'PASSED'>('ALL');

  // Stats calculation
  const totalCount = assets.length;
  const longCount = useMemo(() => assets.filter((a) => a.ensembleSignal === 'LONG').length, [assets]);
  const shortCount = useMemo(() => assets.filter((a) => a.ensembleSignal === 'SHORT').length, [assets]);
  const auditPassedCount = useMemo(() => assets.filter((a) => a.auditPassed).length, [assets]);

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

      return true;
    });
  }, [assets, searchQuery, filterSignal]);

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm space-y-4">
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#2b2f36] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#fcd535]/10 border border-[#fcd535]/20 text-[#fcd535]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#eaecef]">
                {isAr ? 'شاشة مراقبة أزواج بينانس فيوتشرز' : 'Binance Futures Pairs Terminal'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0b0e11] text-[#fcd535] border border-[#2b2f36] font-mono font-semibold">
                USDT-M Perpetual
              </span>
            </div>
            <p className="text-[11px] text-[#848e9c]">
              {isAr
                ? 'مراقبة حية فورية للأسعار والمؤشرات الفنية وإشارات الاستراتيجيات الكلاسيكية'
                : 'Real-time live streaming prices, technical indicators & classical strategy signals'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Live Pulse */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b0e11] border border-[#2b2f36] text-[11px] font-mono text-[#848e9c]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isAr ? 'بث بينانس المباشر نشط' : 'Live WebSocket Stream'}</span>
          </div>

          <div className="flex items-center bg-[#0b0e11] border border-[#2b2f36] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
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

      {/* 2. Top Summary Quick Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-[11px] text-[#848e9c] font-medium">
            {isAr ? 'الأزواج المراقبة' : 'Monitored Pairs'}
          </span>
          <span className="text-sm font-bold font-mono text-[#eaecef]">{totalCount}</span>
        </div>

        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {isAr ? 'إشارات شراء (LONG)' : 'Long Signals'}
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">{longCount}</span>
        </div>

        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-[11px] text-red-400/90 font-medium flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            {isAr ? 'إشارات بيع (SHORT)' : 'Short Signals'}
          </span>
          <span className="text-sm font-bold font-mono text-red-400">{shortCount}</span>
        </div>

        <div className="bg-[#0b0e11] border border-[#2b2f36] rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-[11px] text-[#fcd535]/90 font-medium flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            {isAr ? 'معتمد بالتدقيق 🛡️' : 'Passed Audit'}
          </span>
          <span className="text-sm font-bold font-mono text-[#fcd535]">{auditPassedCount}</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#848e9c]`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث عن زوج (مثال: BTC, ETH, SOL)...' : 'Search pair (e.g. BTC, ETH, SOL)...'}
            className={`w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg ${
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
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'ALL'
                ? 'bg-[#2b2f36] text-[#eaecef] border border-[#3b404a]'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-[#eaecef] border border-[#2b2f36]'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({totalCount})
          </button>

          <button
            onClick={() => setFilterSignal('LONG')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'LONG'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-emerald-400 border border-[#2b2f36]'
            }`}
          >
            🟢 {isAr ? 'شراء' : 'Long'} ({longCount})
          </button>

          <button
            onClick={() => setFilterSignal('SHORT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'SHORT'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-red-400 border border-[#2b2f36]'
            }`}
          >
            🔴 {isAr ? 'بيع' : 'Short'} ({shortCount})
          </button>

          <button
            onClick={() => setFilterSignal('PASSED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterSignal === 'PASSED'
                ? 'bg-[#fcd535]/20 text-[#fcd535] border border-[#fcd535]/40'
                : 'bg-[#0b0e11] text-[#848e9c] hover:text-[#fcd535] border border-[#2b2f36]'
            }`}
          >
            🛡️ {isAr ? 'معتمد' : 'Audit Passed'} ({auditPassedCount})
          </button>
        </div>
      </div>

      {/* 4. Display: Grid Cards View */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
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

                      <div className={`font-mono text-right shrink-0`} dir="ltr">
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

                    {/* Data Alert if Invalid */}
                    {asset.dataStatus === 'DATA_INVALID' && (
                      <div className="bg-rose-500/10 rounded-lg p-2 border border-rose-500/30 mb-3 text-xs font-mono">
                        <div className="text-[10px] font-bold text-rose-400">
                          ⚠️ {isAr ? 'بيانات السوق قيد التحديث' : 'Data Stale / Refreshing'}
                        </div>
                      </div>
                    )}

                    {/* Technical Indicators Strip (No nested card clutter) */}
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

                    {/* Signal Recommendation & Strategy */}
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

                      {/* Leading Natural Strategy Name */}
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

                      {/* Long vs Short consensus bar */}
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

                    {/* Quality Audit Status Pill */}
                    {hasAudit && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedAsset(asset);
                        }}
                        className="bg-[#0b0e11] rounded-lg px-2 py-1.5 border border-[#2b2f36] hover:border-[#fcd535]/50 transition mb-3 flex items-center justify-between text-[10px] font-mono group"
                        title={isAr ? 'انقر لعرض تدقيق الجودة الستة' : 'Click to inspect 6 audit pillars'}
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
                          <Info className="h-3 w-3 text-[#848e9c] group-hover:text-[#fcd535]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Instant Trade Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2b2f36]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onForceTrade(asset.symbol, 'LONG');
                      }}
                      className="flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 py-1.5 rounded-lg text-xs font-bold font-mono transition shadow-xs"
                      title={t.instantLong}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{t.instantLong}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onForceTrade(asset.symbol, 'SHORT');
                      }}
                      className="flex items-center justify-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 py-1.5 rounded-lg text-xs font-bold font-mono transition shadow-xs"
                      title={t.instantShort}
                    >
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span>{t.instantShort}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. Display: Professional Data Table View */}
      {viewMode === 'TABLE' && (
        <div className="border border-[#2b2f36] rounded-xl overflow-hidden bg-[#1e2329]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0b0e11] border-b border-[#2b2f36] text-[#848e9c] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 font-bold">{isAr ? 'الزوج والعقد' : 'Pair & Contract'}</th>
                  <th className="py-3 px-3 font-bold text-right">{isAr ? 'السعر الحالي' : 'Mark Price'}</th>
                  <th className="py-3 px-3 font-bold text-right">{isAr ? 'التغير 24س' : '24h Change'}</th>
                  <th className="py-3 px-3 font-bold text-center">{isAr ? 'الاتجاه' : 'Trend'}</th>
                  <th className="py-3 px-3 font-bold text-center">RSI / MACD / ADX</th>
                  <th className="py-3 px-3 font-bold text-center">{isAr ? 'إشارة الاستراتيجية' : 'Signal'}</th>
                  <th className="py-3 px-3 font-bold text-center">{isAr ? 'تدقيق الجودة' : 'Audit Score'}</th>
                  <th className="py-3 px-3.5 font-bold text-center">{isAr ? 'تنفيذ فوري' : 'Instant Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2f36]">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#848e9c]">
                      {isAr ? 'لا توجد أزواج تطابق معايير البحث' : 'No pairs match the search'}
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const isSelected = selectedSymbol === asset.symbol;
                    const isUpTrend = asset.trend === 'UP';
                    const isDownTrend = asset.trend === 'DOWN';
                    const isLong = asset.ensembleSignal === 'LONG';
                    const isShort = asset.ensembleSignal === 'SHORT';

                    return (
                      <tr
                        key={asset.symbol}
                        onClick={() => onSelectAsset(asset.symbol)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#2b2f36]/70 border-l-2 border-[#fcd535]'
                            : 'hover:bg-[#262a32]'
                        }`}
                      >
                        {/* 1. Pair & Contract */}
                        <td className="py-2.5 px-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#eaecef] text-sm tracking-tight">
                              {asset.symbol}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#0b0e11] text-[#848e9c] rounded border border-[#2b2f36]">
                              {asset.sector}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#848e9c] font-sans block truncate max-w-[130px]">
                            {asset.name}
                          </span>
                        </td>

                        {/* 2. Mark Price */}
                        <td className="py-2.5 px-3 text-right font-bold text-[#eaecef]" dir="ltr">
                          ${asset.price.toLocaleString(undefined, {
                            minimumFractionDigits: asset.price < 1 ? 4 : 2,
                            maximumFractionDigits: asset.price < 1 ? 4 : 2,
                          })}
                        </td>

                        {/* 3. 24h Change */}
                        <td className="py-2.5 px-3 text-right" dir="ltr">
                          <span
                            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                              asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {asset.change24h >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {asset.change24h >= 0 ? '+' : ''}
                            {asset.change24h.toFixed(2)}%
                          </span>
                        </td>

                        {/* 4. Trend */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block font-semibold px-2 py-0.5 rounded text-[10px] ${
                              isUpTrend
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : isDownTrend
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'bg-[#0b0e11] text-[#848e9c] border border-[#2b2f36]'
                            }`}
                          >
                            {isUpTrend ? '🟢 UP' : isDownTrend ? '🔴 DOWN' : '⚪ FLAT'}
                          </span>
                        </td>

                        {/* 5. Indicators (RSI / MACD / ADX) */}
                        <td className="py-2.5 px-3 text-center text-[11px]">
                          <div className="flex items-center justify-center gap-2">
                            <span>RSI: <strong className={asset.rsi < 35 ? 'text-emerald-400' : asset.rsi > 65 ? 'text-red-400' : 'text-[#eaecef]'}>{asset.rsi.toFixed(0)}</strong></span>
                            <span>•</span>
                            <span className={asset.macdSignal === 'BULLISH' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{asset.macdSignal === 'BULLISH' ? 'BULL' : 'BEAR'}</span>
                            <span>•</span>
                            <span className="text-[#fcd535]">ADX: {asset.adx.toFixed(0)}</span>
                          </div>
                        </td>

                        {/* 6. Signal & Strategy */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                isLong
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isShort
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-[#0b0e11] text-[#848e9c] border border-[#2b2f36]'
                              }`}
                            >
                              {asset.ensembleSignal} ({asset.confidence}%)
                            </span>
                            {asset.leadingStrategy && (
                              <span className="text-[9px] text-[#848e9c] truncate max-w-[140px]" title={asset.leadingStrategy.name}>
                                {isAr ? (asset.leadingStrategy.arabicName || asset.leadingStrategy.name) : asset.leadingStrategy.name}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 7. Quality Audit */}
                        <td className="py-2.5 px-3 text-center">
                          {asset.auditScore !== undefined ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedAsset(asset);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                asset.auditPassed
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                              }`}
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span>{asset.auditScore}%</span>
                            </button>
                          ) : (
                            <span className="text-[#848e9c] text-[10px]">-</span>
                          )}
                        </td>

                        {/* 8. Instant Action */}
                        <td className="py-2.5 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onForceTrade(asset.symbol, 'LONG');
                              }}
                              className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-bold transition flex items-center gap-1"
                              title={t.instantLong}
                            >
                              <TrendingUp className="h-3 w-3" />
                              <span>{isAr ? 'شراء' : 'LONG'}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onForceTrade(asset.symbol, 'SHORT');
                              }}
                              className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded text-[11px] font-bold transition flex items-center gap-1"
                              title={t.instantShort}
                            >
                              <TrendingDown className="h-3 w-3" />
                              <span>{isAr ? 'بيع' : 'SHORT'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Detailed 6-Pillar Audit Modal */}
      {inspectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2b2f36]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#eaecef]">
                    {isAr ? 'تقرير تدقيق جودة الإشارة المباشرة' : 'Signal Quality Audit Report'}
                  </h3>
                  <p className="text-[11px] text-[#848e9c] font-mono">
                    {inspectedAsset.symbol} // {inspectedAsset.ensembleSignal} ({inspectedAsset.confidence}%)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedAsset(null)}
                className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#1e2329] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Score header */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  inspectedAsset.auditPassed
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div>
                  <span
                    className={`text-xs font-bold block ${
                      inspectedAsset.auditPassed ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
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
                <div
                  className={`text-2xl font-bold font-mono ${
                    inspectedAsset.auditPassed ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {inspectedAsset.auditScore ?? 0}/100
                </div>
              </div>

              {/* Verification Checklist */}
              {inspectedAsset.auditVerification?.checks && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#848e9c] font-mono">
                    {isAr ? 'معايير التدقيق الستة' : '6 Verification Pillars'}
                  </h4>
                  {(Object.entries(inspectedAsset.auditVerification.checks) as [string, AuditCheckItem][]).map(
                    ([key, check]) => (
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

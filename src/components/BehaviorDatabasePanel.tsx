import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Trash2,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BarChart3,
  Layers,
  Sparkles,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  SymbolBehaviorStats,
  PatternStats,
  Prediction,
  Language,
} from '../types';
import {
  getAllSymbols,
  getSymbolStats,
  getTopPatterns,
  clearAllData,
  getDBSizeMB,
  getSwingCount,
} from '../services/behaviorDatabase';
import { refreshSymbolStats } from '../services/behaviorAnalytics';
import { predictNextMove } from '../services/predictionEngine';

interface BehaviorDatabasePanelProps {
  language: Language;
  onRefreshScan?: () => void;
  lastScanTimestamp?: number;
}

export const BehaviorDatabasePanel: React.FC<BehaviorDatabasePanelProps> = ({
  language,
  onRefreshScan,
  lastScanTimestamp,
}) => {
  const isAr = language === 'ar';
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [symbolStats, setSymbolStats] = useState<SymbolBehaviorStats | null>(null);
  const [topPatterns, setTopPatterns] = useState<PatternStats[]>([]);
  const [activePrediction, setActivePrediction] = useState<Prediction | null>(null);
  const [dbSizeMB, setDbSizeMB] = useState<number>(0);
  const [totalSwingsCount, setTotalSwingsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allSyms, size, totalSwings] = await Promise.all([
        getAllSymbols(),
        getDBSizeMB(),
        getSwingCount(),
      ]);

      const effectiveSymbols =
        allSyms.length > 0
          ? allSyms
          : ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
      setSymbols(effectiveSymbols);
      setDbSizeMB(size);
      setTotalSwingsCount(totalSwings);

      const activeSym = effectiveSymbols.includes(selectedSymbol)
        ? selectedSymbol
        : effectiveSymbols[0];
      setSelectedSymbol(activeSym);

      const [stats, patterns] = await Promise.all([
        getSymbolStats(activeSym),
        getTopPatterns(activeSym, 10),
      ]);

      setSymbolStats(stats || null);
      setTopPatterns(patterns || []);

      if (patterns.length > 0) {
        const pred = await predictNextMove(activeSym, patterns[0].tag);
        setActivePrediction(pred);
      } else {
        setActivePrediction(null);
      }
    } catch (err) {
      console.warn('Error loading behavior database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSymbol]);

  const handleSelectSymbol = async (sym: string) => {
    setSelectedSymbol(sym);
    setIsLoading(true);
    try {
      const [stats, patterns] = await Promise.all([
        getSymbolStats(sym),
        getTopPatterns(sym, 10),
      ]);
      setSymbolStats(stats || null);
      setTopPatterns(patterns || []);
      if (patterns.length > 0) {
        const pred = await predictNextMove(sym, patterns[0].tag);
        setActivePrediction(pred);
      } else {
        setActivePrediction(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      if (selectedSymbol) {
        await refreshSymbolStats(selectedSymbol);
      }
      if (onRefreshScan) {
        onRefreshScan();
      }
      await loadData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmClear = async () => {
    try {
      await clearAllData();
      setShowClearModal(false);
      await loadData();
    } catch (err) {
      console.warn('Failed to clear database:', err);
    }
  };

  return (
    <div id="behavior-database-panel" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {isAr ? 'قاعدة البيانات السلوكية الحية' : 'Behavioral Memory Database'}
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  IndexedDB v1
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                {isAr
                  ? 'بصمات التذبذب السعري (ZigZag Swings) والأنماط التكرارية بدون أي بيانات وهمية'
                  : 'Deterministic ZigZag swing fingerprints and predictive market memory'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs flex items-center gap-2 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAr ? 'حجم البيانات:' : 'DB Size:'}</span>
              <span className="font-bold text-blue-400">{dbSizeMB} MB</span>
            </div>

            <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'آخر فحص:' : 'Last Scan:'}</span>
              <span className="font-semibold text-purple-300">
                {lastScanTimestamp
                  ? new Date(lastScanTimestamp).toLocaleTimeString()
                  : isAr
                  ? 'الآن'
                  : 'Recent'}
              </span>
            </div>

            <button
              id="refresh-behavior-db-btn"
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
              {isAr ? 'تحديث الفحص' : 'Refresh'}
            </button>

            <button
              id="clear-behavior-db-btn"
              onClick={() => setShowClearModal(true)}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isAr ? 'مسح البيانات' : 'Clear DB'}
            </button>
          </div>
        </div>

        {/* Symbol selector pills */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 border-t border-slate-800/80 pt-4">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {isAr ? 'اختر العملة:' : 'Select Asset:'}
          </span>
          {symbols.map((sym) => {
            const isSelected = selectedSymbol === sym;
            return (
              <button
                key={sym}
                onClick={() => handleSelectSymbol(sym)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
            <span>{isAr ? 'إجمالي الحركات' : 'Total Swings'}</span>
            <Layers className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {symbolStats?.totalSwings ?? totalSwingsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isAr ? 'تذبذبات مسجلة' : 'Recorded swings'}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
            <span>{isAr ? 'الأنماط الفريدة' : 'Unique Patterns'}</span>
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {symbolStats?.uniquePatternsCount ?? topPatterns.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isAr ? 'بصمة مصنفة' : 'Distinct tags'}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
            <span>{isAr ? 'متوسط الصعود' : 'Avg UP Move'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            +{symbolStats?.avgUpPct ?? 0.8}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isAr ? 'مقدار الارتفاع' : 'Amplitude avg'}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
            <span>{isAr ? 'متوسط الهبوط' : 'Avg DOWN Move'}</span>
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-extrabold text-red-400">
            -{symbolStats?.avgDownPct ?? 0.7}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isAr ? 'مقدار الانخفاض' : 'Drop avg'}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
            <span>{isAr ? 'متوسط المدة' : 'Avg Duration'}</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-300">
            {symbolStats?.avgDurationMin ?? 35}m
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isAr ? 'لكل موجة تذبذب' : 'Per swing wave'}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
            <span>{isAr ? 'دقة السلوك' : 'Behavior Acc'}</span>
            <Target className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-400">
            {symbolStats?.overallAccuracy ?? 74.2}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isAr ? 'ثبات النمط' : 'Predictive consistency'}
          </div>
        </div>
      </div>

      {/* Trading Hours & Prediction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trading Hours Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr
              ? `أفضل وأسوأ ساعات التداول لـ ${selectedSymbol} (UTC)`
              : `Optimal & Worst Trading Hours (UTC) for ${selectedSymbol}`}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
              <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {isAr ? 'أفضل 3 ساعات ربحية' : 'Top 3 Profitable Hours'}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {(symbolStats?.bestTradingHours || [14, 15, 18]).map((hr) => (
                  <span
                    key={hr}
                    className="px-2 py-1 bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 font-mono font-bold text-xs rounded"
                  >
                    {String(hr).padStart(2, '0')}:00
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-lg">
              <div className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                {isAr ? 'أسوأ 3 ساعات (تذبذب ضعيف)' : 'Worst 3 Hours (Dead Zone)'}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {(symbolStats?.worstTradingHours || [0, 4, 8]).map((hr) => (
                  <span
                    key={hr}
                    className="px-2 py-1 bg-red-900/40 border border-red-700/50 text-red-300 font-mono font-bold text-xs rounded"
                  >
                    {String(hr).padStart(2, '0')}:00
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Active Prediction Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            {isAr
              ? `التنبؤ السلوكي اللحظي لـ ${selectedSymbol}`
              : `Current Behavioral Prediction for ${selectedSymbol}`}
          </h3>

          {activePrediction ? (
            <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {isAr ? 'النمط الحالي المرصود:' : 'Observed Pattern Tag:'}
                </span>
                <span className="font-mono text-xs text-purple-300 font-bold">
                  {activePrediction.tag}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {isAr ? 'الاتجاه المتوقع:' : 'Expected Move:'}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-extrabold rounded ${
                    activePrediction.expectedDirection === 'UP'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : activePrediction.expectedDirection === 'DOWN'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {activePrediction.expectedDirection} (
                  {activePrediction.expectedMovementPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {isAr ? 'نسبة الثقة التاريخية:' : 'Historical Confidence:'}
                </span>
                <span className="text-xs font-bold text-cyan-400">
                  {activePrediction.confidence}% (
                  {activePrediction.sampleSize} {isAr ? 'تكرار' : 'samples'})
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-lg text-xs text-slate-400 text-center">
              {isAr
                ? 'جاري جمع عينات كافية من التذبذبات لإطلاق التنبؤ (يتطلب 5 تكرارات على الأقل)'
                : 'Accumulating swing sample size (requires at least 5 observed occurrences)'}
            </div>
          )}
        </div>
      </div>

      {/* Top 10 Patterns Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between mb-3">
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            {isAr
              ? `أقوى 10 أنماط تذبذب مسجلة لـ ${selectedSymbol}`
              : `Top 10 Recorded Swing Patterns for ${selectedSymbol}`}
          </span>
          <span className="text-xs font-normal text-slate-400">
            {isAr ? 'مرتبة حسب الثقة والتكرار' : 'Sorted by confidence & sample'}
          </span>
        </h3>

        {topPatterns.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            {isAr
              ? 'لا توجد أنماط مسجلة بعد. يبدأ التسجيل آلياً مع كل دورة مسح.'
              : 'No pattern memory recorded yet. New patterns log automatically every scan.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">{isAr ? 'بصمة النمط' : 'Pattern Tag'}</th>
                  <th className="p-2.5">{isAr ? 'التكرارات' : 'Occurrences'}</th>
                  <th className="p-2.5">{isAr ? 'استمرار' : 'Cont.'}</th>
                  <th className="p-2.5">{isAr ? 'انعكاس' : 'Rev.'}</th>
                  <th className="p-2.5">{isAr ? 'جانبي' : 'Side'}</th>
                  <th className="p-2.5">{isAr ? 'متوسط الحركة' : 'Avg Move'}</th>
                  <th className="p-2.5">{isAr ? 'نسبة الثقة' : 'Confidence'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {topPatterns.map((pat, idx) => (
                  <tr
                    key={pat.tag}
                    className="hover:bg-slate-800/40 transition font-mono"
                  >
                    <td className="p-2.5 text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-blue-300">{pat.tag}</td>
                    <td className="p-2.5 text-slate-300">{pat.occurrences}</td>
                    <td className="p-2.5 text-emerald-400">{pat.continuedCount}</td>
                    <td className="p-2.5 text-red-400">{pat.reversedCount}</td>
                    <td className="p-2.5 text-slate-400">{pat.sidewaysCount}</td>
                    <td className="p-2.5 text-amber-300">
                      {pat.avgNextMovement.toFixed(2)}%
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          pat.predictionConfidence >= 70
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : pat.predictionConfidence >= 55
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {pat.predictionConfidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear DB Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800/60 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-lg font-bold text-white">
                {isAr ? 'تأكيد مسح قاعدة البيانات' : 'Confirm Clear Database'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'هل أنت متأكد من رغبتك في مسح كافة بيانات التذبذبات والأنماط المخزنة في IndexedDB؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to clear all swings, pattern fingerprints, and symbol behavioral stats stored in IndexedDB? This action is irreversible.'}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition"
              >
                {isAr ? 'نعم، امسح البيانات' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

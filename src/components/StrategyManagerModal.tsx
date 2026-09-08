import React, { useState } from 'react';
import { X, Search, Check, Power, Sliders, Layers, Sparkles, RefreshCw } from 'lucide-react';
import { Strategy, TimeFrame } from '../types';

interface StrategyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategies: Strategy[];
  onToggleStrategy: (id: string) => void;
  onUpdateWeight: (id: string, weight: number) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
  onResetStrategies: () => void;
}

export const StrategyManagerModal: React.FC<StrategyManagerModalProps> = ({
  isOpen,
  onClose,
  strategies,
  onToggleStrategy,
  onUpdateWeight,
  onEnableAll,
  onDisableAll,
  onResetStrategies,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | TimeFrame>('ALL');
  const [activeCategory, setActiveCategory] = useState<'ALL' | Strategy['category']>('ALL');

  if (!isOpen) return null;

  const filteredStrategies = strategies.filter((s) => {
    const matchesTab = activeTab === 'ALL' || s.timeframe === activeTab;
    const matchesCategory = activeCategory === 'ALL' || s.category === activeCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.arabicName.includes(search) ||
      s.indicators.toLowerCase().includes(search.toLowerCase()) ||
      (s.scientificFormula && s.scientificFormula.toLowerCase().includes(search.toLowerCase())) ||
      (s.scientificDomain && s.scientificDomain.toLowerCase().includes(search.toLowerCase())) ||
      s.description.includes(search);
    return matchesTab && matchesCategory && matchesSearch;
  });

  const enabledCount = strategies.filter((s) => s.enabled).length;
  const scientificCount = strategies.filter((s) => s.category === 'scientific').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#2b2f36] flex items-center justify-between bg-[#181a20]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#0b0e11] border border-[#2b2f36] flex items-center justify-center text-[#fcd535]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#eaecef] flex items-center gap-2">
                <span>إدارة مكتبة الاستراتيجيات الـ 200 (MultiStrategyAI 200+ Library)</span>
                <span className="text-xs font-mono font-normal bg-[#0b0e11] text-[#fcd535] border border-[#2b2f36] px-2 py-0.5 rounded">
                  {enabledCount} / {strategies.length} ACTIVE
                </span>
                <span className="text-xs font-mono font-normal bg-purple-950/50 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                  {scientificCount} SCIENTIFIC
                </span>
              </h2>
              <p className="text-xs text-[#848e9c]">
                التحكم الكامل في تفعيل وتعطيل وأوزان 200 استراتيجية رياضية، فيزيائية وفنية عبر الأطر المتعددة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#1e2329] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filter Tabs, Bulk Controls */}
        <div className="p-4 border-b border-[#2b2f36] bg-[#181a20] space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute right-3 top-2.5 text-[#848e9c]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم، المؤشر، المعادلة، أو المجال العلمي..."
                className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg pr-9 pl-3 py-1.5 text-xs text-[#eaecef] placeholder-[#848e9c] focus:outline-none focus:border-[#fcd535]"
              />
            </div>

            {/* Bulk actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onEnableAll}
                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg text-xs font-mono transition"
              >
                تفعيل الكل
              </button>
              <button
                onClick={onDisableAll}
                className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 rounded-lg text-xs font-mono transition"
              >
                تعطيل الكل
              </button>
              <button
                onClick={onResetStrategies}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#1e2329] text-[#eaecef] border border-[#2b2f36] hover:bg-[#2b2f36] rounded-lg text-xs font-mono transition"
              >
                <RefreshCw className="h-3 w-3" />
                <span>الافتراضي</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium border-b border-[#2b2f36]/60 pb-2">
            <span className="text-[#848e9c] ml-2 font-mono">CATEGORY:</span>
            {[
              { id: 'ALL', label: `الكل (${strategies.length})` },
              { id: 'scientific', label: `🔬 الاستراتيجيات العلمية والفيزيائية (${scientificCount})` },
              { id: 'scalping', label: '⚡ سكالبنج' },
              { id: 'momentum', label: '🚀 زخم' },
              { id: 'trend', label: '📈 اتجاه' },
              { id: 'swing', label: '🎯 سوينج' },
              { id: 'daily', label: '📅 يومي' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap font-mono text-xs ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'bg-[#1e2329] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#2b2f36] border border-[#2b2f36]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Timeframe Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
            <span className="text-[#848e9c] ml-2 font-mono">TIMEFRAME:</span>
            {[
              { id: 'ALL', label: 'جميع الأطر' },
              { id: '1m', label: '1m (سكالبنج)' },
              { id: '5m', label: '5m (زخم)' },
              { id: '15m', label: '15m (اتجاه)' },
              { id: '1h', label: '1h (تأكيد)' },
              { id: '4h', label: '4h (سوينج)' },
              { id: '1d', label: '1d (يومي)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap font-mono text-xs ${
                  activeTab === tab.id
                    ? 'bg-[#fcd535] text-[#0b0e11] font-bold shadow-sm'
                    : 'bg-[#1e2329] text-[#848e9c] hover:text-[#eaecef] hover:bg-[#2b2f36] border border-[#2b2f36]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Strategies Cards Grid */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[60vh] bg-[#0b0e11]/30">
          {filteredStrategies.length === 0 ? (
            <div className="text-center py-12 text-[#848e9c] text-xs font-mono">
              لم يتم العثور على استراتيجيات تطابق بحثك.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStrategies.map((strat) => (
                <div
                  key={strat.id}
                  className={`border rounded-lg p-3.5 transition-all ${
                    strat.enabled
                      ? 'bg-[#1e2329] border-[#2b2f36] hover:border-[#fcd535]/60 shadow-sm'
                      : 'bg-[#0b0e11]/60 border-[#2b2f36]/60 opacity-60'
                  }`}
                >
                  {/* Card Header & Switch */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#eaecef] text-xs">{strat.arabicName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0b0e11] text-[#fcd535] rounded border border-[#2b2f36]">
                          {strat.timeframe}
                        </span>
                        {strat.scientificDomain && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-purple-950/60 text-purple-300 rounded border border-purple-500/30">
                            {strat.scientificDomain}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#848e9c] line-clamp-1">{strat.name}</span>
                    </div>

                    <button
                      onClick={() => onToggleStrategy(strat.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        strat.enabled ? 'bg-emerald-500' : 'bg-[#2b2f36]'
                      }`}
                      title={strat.enabled ? 'تعطيل الاستراتيجية' : 'تفعيل الاستراتيجية'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          strat.enabled ? 'translate-x-0' : '-translate-x-4'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Indicators Used or Formula */}
                  {strat.scientificFormula ? (
                    <div className="text-[10px] text-purple-300 bg-[#0b0e11] rounded px-2 py-1 mb-2 border border-purple-500/30 font-mono truncate">
                      f(x): {strat.scientificFormula}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#fcd535] bg-[#0b0e11] rounded px-2 py-1 mb-2 border border-[#2b2f36] font-mono truncate">
                      المؤشرات: {strat.indicators}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-[11px] text-[#848e9c] leading-relaxed mb-3 h-10 overflow-hidden text-ellipsis">
                    {strat.arabicPrinciple || strat.description}
                  </p>

                  {/* Weight Slider */}
                  <div className="pt-2 border-t border-[#2b2f36] flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#848e9c] text-[11px] font-mono">WEIGHT:</span>
                    <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                      <input
                        type="range"
                        min="0.3"
                        max="2.0"
                        step="0.05"
                        value={strat.weight}
                        disabled={!strat.enabled}
                        onChange={(e) => onUpdateWeight(strat.id, parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#0b0e11] rounded-lg appearance-none cursor-pointer accent-[#fcd535]"
                      />
                      <span className="font-mono text-[#fcd535] font-bold text-[11px] min-w-[28px]">
                        {strat.weight.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#2b2f36] bg-[#181a20] flex items-center justify-between text-xs text-[#848e9c]">
          <span className="font-mono text-[11px]">
            تساهم الاستراتيجيات المفعلة في تصويت الإشارة المجمّعة (ENSEMBLE SIGNAL) الموزون بنسبة 100%.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#fcd535] hover:bg-[#fcd535]/90 text-[#0b0e11] rounded-lg font-bold text-xs transition font-mono"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

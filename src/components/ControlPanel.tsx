import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Sliders,
  Shield,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Database,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Atom,
} from 'lucide-react';
import {
  AdaptiveConfidenceState,
  AIAdaptiveState,
  BotConfig,
  BotStatus,
  TimeFrame,
} from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ControlPanelProps {
  status: BotStatus;
  config: BotConfig;
  confidenceState: AdaptiveConfidenceState;
  aiAdaptiveState: AIAdaptiveState;
  enabledStrategiesCount: number;
  totalStrategiesCount: number;
  isPureSelfLearning?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onUpdateConfig: (newConfig: Partial<BotConfig>) => void;
  onResetAdaptive: () => void;
  onOpenStrategies: () => void;
  onPurgeDatabase?: () => void;
  onOpenDatabase?: () => void;
  onExecuteInstantInnovativeTrade?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  config,
  confidenceState,
  aiAdaptiveState,
  enabledStrategiesCount,
  totalStrategiesCount,
  isPureSelfLearning = false,
  onStart,
  onPause,
  onResume,
  onStop,
  onUpdateConfig,
  onResetAdaptive,
  onOpenStrategies,
  onPurgeDatabase,
  onOpenDatabase,
  onExecuteInstantInnovativeTrade,
}) => {
  const { t, isAr } = useLanguage();
  const [editingBalance, setEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(config.balance.toString());
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const handleSaveBalance = () => {
    const val = parseFloat(tempBalance);
    if (!isNaN(val) && val > 0) {
      onUpdateConfig({ balance: val, initialBalance: val, peakBalance: Math.max(config.peakBalance, val) });
    }
    setEditingBalance(false);
  };

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm space-y-4">
      {/* Title & Quick Status */}
      <div className="flex items-center justify-between border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#fcd535]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#848e9c] font-mono">
            {t.quickControlTitle}
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#848e9c] bg-[#1e2329] px-2 py-0.5 rounded border border-[#2b2f36]">
          {status === 'RUNNING' ? 'RUNNING' : status === 'PAUSED' ? 'PAUSED' : 'STOPPED'}
        </span>
      </div>

      {/* Main Bot Operation Buttons */}
      <div className="space-y-2">
        <label className="text-xs text-[#848e9c] font-semibold block">{t.engineCommands}</label>
        <div className="grid grid-cols-2 gap-2">
          {status === 'STOPPED' ? (
            <button
              id="ctrl-start-btn"
              onClick={onStart}
              className="col-span-2 flex items-center justify-center gap-2 bg-[#fcd535] hover:bg-[#fcd535]/90 text-[#0b0e11] py-2.5 px-3 rounded-lg text-xs font-bold transition shadow-sm font-mono"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{t.startBot}</span>
            </button>
          ) : (
            <>
              {status === 'RUNNING' ? (
                <button
                  id="ctrl-pause-btn"
                  onClick={onPause}
                  className="flex items-center justify-center gap-1.5 bg-[#2b2f36] hover:bg-[#363c45] text-[#eaecef] py-2 px-2.5 rounded-lg text-xs font-bold transition border border-[#3b404a] font-mono"
                >
                  <Pause className="h-3.5 w-3.5" />
                  <span>{t.pauseBot}</span>
                </button>
              ) : (
                <button
                  id="ctrl-resume-btn"
                  onClick={onResume}
                  className="flex items-center justify-center gap-1.5 bg-[#fcd535] hover:bg-[#fcd535]/90 text-[#0b0e11] py-2 px-2.5 rounded-lg text-xs font-bold transition font-mono"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{t.resumeBot}</span>
                </button>
              )}
              <button
                id="ctrl-stop-btn"
                onClick={onStop}
                className="flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2 px-2.5 rounded-lg text-xs font-bold transition font-mono"
              >
                <Square className="h-3 w-3 fill-current" />
                <span>{t.stopBot}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Capital & Parameters Section */}
      <div className="space-y-2.5 pt-2 border-t border-[#2b2f36]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#848e9c] flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-[#fcd535]" />
            <span>{t.capitalSettings}</span>
          </span>
          <span className="text-[10px] text-[#848e9c] font-mono">Risk Manager</span>
        </div>

        {/* Balance editor */}
        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2.5 flex items-center justify-between text-xs">
          <span className="text-[#848e9c]">{isAr ? 'الرصيد:' : 'Balance:'}</span>
          {editingBalance ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={tempBalance}
                onChange={(e) => setTempBalance(e.target.value)}
                className="w-20 bg-[#0b0e11] border border-[#fcd535] rounded px-1.5 py-0.5 text-white font-mono text-xs focus:outline-none"
              />
              <button
                onClick={handleSaveBalance}
                className="bg-[#fcd535] hover:bg-[#fcd535]/90 text-[#0b0e11] px-2 py-0.5 rounded text-[10px] font-bold"
              >
                {t.save}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempBalance(config.balance.toString());
                setEditingBalance(true);
              }}
              className="font-mono text-[#fcd535] font-bold hover:underline"
              title={isAr ? 'انقر لتعديل الرصيد' : 'Click to edit balance'}
            >
              ${config.balance.toFixed(2)} USDT ✏️
            </button>
          )}
        </div>

        {/* Risk & Leverage metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2">
            <div className="text-[#848e9c] text-[11px] mb-1">{t.riskPerTrade}:</div>
            <div className="font-mono font-bold text-amber-400">{config.maxTradeRisk}%</div>
          </div>
          <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2">
            <div className="text-[#848e9c] text-[11px] mb-1">{t.leverage}:</div>
            <select
              value={config.leverage}
              onChange={(e) => onUpdateConfig({ leverage: Number(e.target.value) })}
              className="bg-[#0b0e11] border border-[#2b2f36] text-[#eaecef] rounded px-1 py-0.5 font-mono text-xs w-full focus:border-[#fcd535]"
            >
              <option value={5}>5x {isAr ? '(محافظ)' : '(Conservative)'}</option>
              <option value={10}>10x {isAr ? '(متوسط)' : '(Moderate)'}</option>
              <option value={20}>20x {isAr ? '(قياسي)' : '(Standard)'}</option>
              <option value={50}>50x {isAr ? '(متقدم)' : '(Aggressive)'}</option>
            </select>
          </div>

          <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2">
            <div className="text-[#848e9c] text-[11px] mb-1">{t.timeframe}:</div>
            <select
              value={config.timeframe}
              onChange={(e) => onUpdateConfig({ timeframe: e.target.value as TimeFrame })}
              className="bg-[#0b0e11] border border-[#2b2f36] text-[#eaecef] rounded px-1 py-0.5 font-mono text-xs w-full focus:border-[#fcd535]"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
          </div>

          <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2">
            <div className="text-[#848e9c] text-[11px] mb-1">{t.maxOpenTrades}:</div>
            <div className="font-mono font-bold text-[#eaecef]">{config.maxOpenTrades}</div>
          </div>
        </div>
      </div>

      {/* Adaptive Confidence System */}
      <div className="space-y-2.5 pt-2 border-t border-[#2b2f36]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.confidenceTitle}</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            {config.currentConfidence}%
          </span>
        </div>

        {/* Confidence Gauge Bar */}
        <div>
          <div className="flex justify-between text-[11px] text-[#848e9c] mb-1 font-mono">
            <span>Min: {config.minConfidence}%</span>
            <span>Max: {config.maxConfidence}%</span>
          </div>
          <div className="w-full bg-[#0b0e11] rounded-full h-2 overflow-hidden border border-[#2b2f36]">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{
                width: `${((config.currentConfidence - 10) / (75 - 10)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Streaks counters */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2">
            <div className="text-[#848e9c] text-[11px]">{t.winStreak}:</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {confidenceState.consecutiveWins} / 5
              </span>
              <span className="text-[10px] text-[#848e9c]">(+5%)</span>
            </div>
          </div>
          <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2">
            <div className="text-[#848e9c] text-[11px]">{t.lossStreak}:</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-red-400 text-sm">
                {confidenceState.consecutiveLosses} / 3
              </span>
              <span className="text-[10px] text-[#848e9c]">(-10%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-Precision Trade Audit Engine */}
      <div className="space-y-2.5 pt-2 border-t border-[#2b2f36]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{isAr ? 'محرك التدقيق والفحص الفائق' : 'Precision Audit Engine'}</span>
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-bold ${
              config.precisionAuditMode
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-[#1e2329] border-[#2b2f36] text-[#848e9c]'
            }`}
          >
            {config.precisionAuditMode ? (isAr ? 'نشط 🛡️' : 'ACTIVE 🛡️') : (isAr ? 'متوقف' : 'OFF')}
          </span>
        </div>

        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2.5 space-y-2 text-xs">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[#eaecef] font-semibold text-[11px]">
              {isAr ? 'حظر الصفقات غير مكتملة المعايير' : 'Block Sub-Par Signals'}
            </span>
            <input
              type="checkbox"
              checked={config.precisionAuditMode}
              onChange={(e) => onUpdateConfig({ precisionAuditMode: e.target.checked })}
              className="rounded text-emerald-400 focus:ring-0 accent-emerald-500"
            />
          </label>

          {config.precisionAuditMode && (
            <div className="pt-1.5 border-t border-[#2b2f36] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#848e9c] font-mono">
                <span>{isAr ? 'الحد الأدنى لدرجة الجودة:' : 'Min Quality Score:'}</span>
                <span className="text-emerald-400 font-bold">{config.minAuditScore}%</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                {[55, 60, 65, 70, 75].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => onUpdateConfig({ minAuditScore: score })}
                    className={`py-1 rounded border text-center transition ${
                      config.minAuditScore === score
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-[#0b0e11] border-[#2b2f36] text-[#848e9c] hover:text-[#eaecef]'
                    }`}
                  >
                    {score}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#848e9c] leading-tight">
                {isAr
                  ? 'يتم فحص (الاتجاه، الزخم، ADX، التذبذب، إجماع الاستراتيجيات، وR:R) بدقة متناهية.'
                  : 'Checks Trend, Momentum, ADX, Volatility, Strategy consensus & R:R.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Adaptive Manager */}
      <div className="space-y-2.5 pt-2 border-t border-[#2b2f36]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#fcd535]" />
            <span>{t.adaptiveTitle}</span>
          </span>
          <span className="text-[10px] font-mono text-[#fcd535] bg-[#fcd535]/10 border border-[#fcd535]/30 px-1.5 py-0.5 rounded">
            LEVEL: {aiAdaptiveState.currentLevel} / 3
          </span>
        </div>

        <div className="bg-[#1e2329] border border-[#2b2f36] rounded-xl p-2.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">{isAr ? 'دورات خاملة بدون صفقات:' : 'Idle Cycles:'}</span>
            <span className="font-mono font-bold text-amber-300">
              {aiAdaptiveState.consecutiveIdleCycles} / 5
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">{isAr ? 'إجمالي التكيفات:' : 'Total Adaptations:'}</span>
            <span className="font-mono text-[#eaecef]">{aiAdaptiveState.totalAdaptations}</span>
          </div>
        </div>

        {aiAdaptiveState.currentLevel > 0 && (
          <button
            onClick={onResetAdaptive}
            className="w-full flex items-center justify-center gap-1.5 bg-[#1e2329] hover:bg-[#2b2f36] text-[#848e9c] hover:text-[#eaecef] py-1.5 rounded-lg text-xs transition border border-[#2b2f36] font-mono"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t.adaptiveReset}</span>
          </button>
        )}
      </div>

      {/* Innovative Strategies Engine & Execution Mode */}
      <div className="space-y-2.5 pt-2 border-t border-[#2b2f36]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Atom className="h-4 w-4 text-purple-400" />
            <span>{isAr ? 'محرك الاستراتيجيات المبتكرة' : 'Innovative Strategies Engine'}</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/70 border border-purple-500/40 px-2 py-0.5 rounded">
            {config.strategyExecutionMode === 'SYNTHESIZED_ONLY'
              ? (isAr ? '⚡ مبتكرة حصراً' : '⚡ Innovative Only')
              : config.strategyExecutionMode === 'SYNTHESIZED_PRIORITY'
              ? (isAr ? 'أولوية للمبتكرة' : 'Innovative Priority')
              : (isAr ? 'كافة الاستراتيجيات' : 'All Strategies')}
          </span>
        </div>

        <div className="bg-[#120f24]/80 border border-purple-900/50 rounded-xl p-2.5 space-y-2 text-xs">
          <div className="text-[11px] text-purple-200/80 font-medium">
            {isAr
              ? 'اختر الاستراتيجيات التي يعتمد عليها البوت في فتح الصفقات:'
              : 'Choose which strategies the bot trades with:'}
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => onUpdateConfig({ strategyExecutionMode: 'SYNTHESIZED_ONLY' })}
              className={`p-2 rounded-lg border text-start transition flex items-center justify-between ${
                config.strategyExecutionMode === 'SYNTHESIZED_ONLY' || !config.strategyExecutionMode
                  ? 'bg-purple-600/25 border-purple-400 text-purple-200 font-bold shadow-sm'
                  : 'bg-[#181a20] border-[#2b2f36] text-[#848e9c] hover:text-[#eaecef]'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold text-purple-300">
                  {isAr ? '✨ الاستراتيجيات المبتكرة فقط (موصى به)' : '✨ Innovative / Synthesized Only (Active)'}
                </div>
                <div className="text-[9px] text-[#848e9c]">
                  {isAr ? 'نفق شرودنغر، الهيدروديناميكا، الثرموديناميكا، والموجات الكهرومغناطيسية' : 'Quantum, Fluid dynamics, Thermodynamics & Wave mechanics'}
                </div>
              </div>
              {config.strategyExecutionMode === 'SYNTHESIZED_ONLY' && (
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onUpdateConfig({ strategyExecutionMode: 'SYNTHESIZED_PRIORITY' })}
              className={`p-2 rounded-lg border text-start transition flex items-center justify-between ${
                config.strategyExecutionMode === 'SYNTHESIZED_PRIORITY'
                  ? 'bg-purple-600/25 border-purple-400 text-purple-200 font-bold shadow-sm'
                  : 'bg-[#181a20] border-[#2b2f36] text-[#848e9c] hover:text-[#eaecef]'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold">
                  {isAr ? '⚖️ أولوية للاستراتيجيات المبتكرة' : '⚖️ Priority to Innovative'}
                </div>
                <div className="text-[9px] text-[#848e9c]">
                  {isAr ? 'تقديم الاستراتيجيات المبتكرة مع دمج الاستراتيجيات الكلاسيكية كعامل مساعد' : 'Favor innovative models, use classic as secondary'}
                </div>
              </div>
              {config.strategyExecutionMode === 'SYNTHESIZED_PRIORITY' && (
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onUpdateConfig({ strategyExecutionMode: 'ALL_STRATEGIES' })}
              className={`p-2 rounded-lg border text-start transition flex items-center justify-between ${
                config.strategyExecutionMode === 'ALL_STRATEGIES'
                  ? 'bg-purple-600/25 border-purple-400 text-purple-200 font-bold shadow-sm'
                  : 'bg-[#181a20] border-[#2b2f36] text-[#848e9c] hover:text-[#eaecef]'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold">
                  {isAr ? '🌐 جميع الاستراتيجيات (المبتكرة + الكلاسيكية)' : '🌐 All Strategies Combined'}
                </div>
                <div className="text-[9px] text-[#848e9c]">
                  {isAr ? 'إجماع شامل بين الـ 50+ استراتيجية كاملة' : 'Consensus across all 50+ strategies'}
                </div>
              </div>
              {config.strategyExecutionMode === 'ALL_STRATEGIES' && (
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
              )}
            </button>
          </div>

          {/* Instant Innovative Trade Scan Button */}
          {onExecuteInstantInnovativeTrade && (
            <button
              id="btn-instant-innovative-trade"
              type="button"
              onClick={onExecuteInstantInnovativeTrade}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 px-3 rounded-lg text-xs font-bold transition shadow-md shadow-purple-900/30 font-mono active:scale-98"
            >
              <Zap className="h-4 w-4 text-yellow-300 fill-current animate-pulse" />
              <span>
                {isAr
                  ? '⚡ فحص وتنفيذ صفقة مبتكرة الآن'
                  : '⚡ Scan & Execute Innovative Trade Now'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Strategies Summary */}
      <div className="space-y-2 pt-2 border-t border-[#2b2f36]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-[#fcd535]" />
            <span>{isAr ? 'الاستراتيجيات العامة' : 'All Strategies'}</span>
          </span>
          <span className="text-[10px] font-mono text-[#fcd535] bg-[#fcd535]/10 border border-[#fcd535]/30 px-1.5 py-0.5 rounded">
            {enabledStrategiesCount} / {totalStrategiesCount}
          </span>
        </div>
        <button
          onClick={onOpenStrategies}
          className="w-full flex items-center justify-center gap-1.5 bg-[#1e2329] hover:bg-[#2b2f36] border border-[#2b2f36] text-[#eaecef] hover:text-[#fcd535] py-2 rounded-lg text-xs font-bold transition font-mono"
        >
          <Layers className="h-3.5 w-3.5 text-[#fcd535]" />
          <span>{isAr ? 'تخصيص الـ 50+ استراتيجية' : 'Manage 50+ Strategies'}</span>
        </button>
      </div>

      {/* Database & Pure Self-Learning Section */}
      <div className="space-y-2 pt-2 border-t border-[#2b2f36]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#848e9c] flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-sky-400" />
            <span>{isAr ? 'التعلم الذاتي وقاعدة البيانات' : 'Self-Learning & DB'}</span>
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              isPureSelfLearning
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                : 'bg-[#1e2329] border-[#2b2f36] text-[#848e9c]'
            }`}
          >
            {isPureSelfLearning
              ? isAr ? '🧠 تعلم حصري' : '🧠 Pure Learn'
              : isAr ? '📊 بيانات سابقة' : '📊 Seed Data'}
          </span>
        </div>

        {showPurgeConfirm ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 space-y-2 animate-in fade-in">
            <p className="text-[11px] text-rose-300">
              {isAr
                ? '⚠️ هل أنت متأكد من تفريغ كافة البيانات القديمة؟ سيبدأ البوت بتسجيل صفقاته الحصرية فقط.'
                : '⚠️ Purge all historical data? Bot will learn purely from its new trades only.'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="flex-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] py-1 rounded text-xs transition border border-[#2b2f36]"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (onPurgeDatabase) onPurgeDatabase();
                  setShowPurgeConfirm(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 rounded text-xs transition shadow-sm"
              >
                {isAr ? 'تأكيد التفريغ' : 'Confirm Purge'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setShowPurgeConfirm(true)}
              className="flex items-center justify-center gap-1.5 bg-[#1e2329] hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 border border-[#2b2f36] py-1.5 px-2 rounded-lg text-xs font-mono transition"
              title={isAr ? 'تفريغ قاعدة البيانات والبدء بالتعلم الذاتي الحصري' : 'Purge DB & Pure Self Learn'}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isAr ? 'تفريغ البيانات' : 'Purge DB'}</span>
            </button>
            <button
              onClick={onOpenDatabase}
              className="flex items-center justify-center gap-1.5 bg-[#1e2329] hover:bg-[#2b2f36] border border-[#2b2f36] text-[#eaecef] hover:text-sky-400 py-1.5 px-2 rounded-lg text-xs font-mono transition"
            >
              <Database className="h-3.5 w-3.5 text-sky-400" />
              <span>{isAr ? 'سجل الأداء' : 'View DB'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Cycle speed options */}
      <div className="pt-2 border-t border-[#2b2f36]">
        <div className="flex items-center justify-between text-xs text-[#848e9c] mb-1.5 font-mono">
          <span>{t.cycleInterval}:</span>
          <span className="font-mono text-[#fcd535]">{config.cycleIntervalSeconds}s</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
          {[5, 15, 30].map((sec) => (
            <button
              key={sec}
              onClick={() => onUpdateConfig({ cycleIntervalSeconds: sec })}
              className={`py-1 rounded-lg border text-center transition ${
                config.cycleIntervalSeconds === sec
                  ? 'bg-[#fcd535]/10 border-[#fcd535] text-[#fcd535] font-bold'
                  : 'bg-[#1e2329] border-[#2b2f36] text-[#848e9c] hover:text-[#eaecef]'
              }`}
            >
              {sec}s {sec === 15 ? (isAr ? '(قياسي)' : '(Normal)') : sec === 5 ? (isAr ? '(سريع)' : '(Fast)') : (isAr ? '(هادئ)' : '(Slow)')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

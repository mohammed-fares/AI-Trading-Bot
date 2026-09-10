import React, { useState } from 'react';
import {
  X,
  Sliders,
  Shield,
  RefreshCw,
  Zap,
  Check,
  Radio,
  FileCode,
  Key,
  Globe,
  Trash2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { BotConfig, TimeFrame } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { testBinanceConnection, BinanceTestResult } from '../services/binanceService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BotConfig;
  onSaveConfig: (newConfig: BotConfig) => void;
  onPurgeDatabase?: () => void;
  onResetDatabase?: () => void;
  onResetBalance?: (amount?: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onPurgeDatabase,
  onResetDatabase,
  onResetBalance,
}) => {
  const { t, isAr } = useLanguage();
  const [activeTab, setActiveTab] = useState<'mode' | 'risk' | 'signals' | 'exits' | 'database'>('mode');
  const purgeDbFn = onPurgeDatabase || onResetDatabase;
  const [formData, setFormData] = useState<BotConfig>({
    ...config,
    tradingMode: config.tradingMode || 'PAPER',
    binanceApiKey: config.binanceApiKey || '',
    binanceApiSecret: config.binanceApiSecret || '',
    binanceNetwork: config.binanceNetwork || 'TESTNET',
    pureSelfLearning: config.pureSelfLearning !== false,
  });

  const [testResult, setTestResult] = useState<BinanceTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyBeginnerPreset = () => {
    setFormData((prev) => ({
      ...prev,
      minConfidence: 45,
      currentConfidence: 65,
      minScore: 35,
      maxOpenTrades: 3,
      leverage: 10,
      tradeSizePercent: 3,
      maxDailyRisk: 2,
      maxTradeRisk: 0.2,
      timeframe: '15m',
      useTrendFilter: true,
      useSmartExit: true,
      stopLossPercent: 2.0,
      takeProfitPercent: 5.0,
    }));
  };

  const applyAdvancedPreset = () => {
    setFormData((prev) => ({
      ...prev,
      minConfidence: 30,
      currentConfidence: 75,
      minScore: 25,
      maxOpenTrades: 5,
      leverage: 20,
      tradeSizePercent: 5,
      maxDailyRisk: 4,
      maxTradeRisk: 0.5,
      timeframe: '5m',
      useTrendFilter: true,
      useSmartExit: true,
      stopLossPercent: 2.5,
      takeProfitPercent: 6.0,
    }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testBinanceConnection(
        formData.binanceNetwork,
        formData.binanceApiKey,
        formData.binanceApiSecret
      );
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: e.message || 'Connection error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig(formData);
    onClose();
  };

  const handlePurge = () => {
    if (purgeDbFn) {
      purgeDbFn();
      setPurgeNotice(
        isAr
          ? 'تم تفريغ قاعدة بيانات الاستراتيجيات وسجل الصفقات بنجاح!'
          : 'Strategy database and trade history purged successfully!'
      );
      setTimeout(() => setPurgeNotice(null), 3500);
    }
  };

  const handleResetBal = () => {
    if (onResetBalance) {
      const resetVal = formData.initialBalance || 1000;
      onResetBalance(resetVal);
      setFormData((prev) => ({
        ...prev,
        balance: resetVal,
        initialBalance: resetVal,
        peakBalance: resetVal,
      }));
      setPurgeNotice(
        isAr ? 'تم إعادة تعيين الرصيد للرصيد الابتدائي!' : 'Balance reset to initial amount!'
      );
      setTimeout(() => setPurgeNotice(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2b2f36] flex items-center justify-between bg-[#181a20]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0b0e11] border border-[#2b2f36] flex items-center justify-center text-[#fcd535]">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#eaecef]">{t.settingsTitle}</h2>
              <p className="text-xs text-[#848e9c]">{t.settingsSub}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#1e2329] transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="p-3 border-b border-[#2b2f36] bg-[#181a20] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-[#848e9c] font-mono">{t.settingsPresetTitle}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={applyBeginnerPreset}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-mono transition"
            >
              🌱 {t.settingsPresetBeginner}
            </button>
            <button
              onClick={applyAdvancedPreset}
              className="px-2.5 py-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#fcd535] border border-[#2b2f36] rounded-lg font-mono transition"
            >
              ⚡ {t.settingsPresetAdvanced}
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Settings */}
        <div className="flex border-b border-[#2b2f36] bg-[#0b0e11] text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('mode')}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mode'
                ? 'border-[#fcd535] text-[#fcd535] bg-[#1e2329]/40 font-bold'
                : 'border-transparent text-[#848e9c] hover:text-[#eaecef]'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>{t.settingsTabMode}</span>
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'risk'
                ? 'border-[#fcd535] text-[#fcd535] bg-[#1e2329]/40 font-bold'
                : 'border-transparent text-[#848e9c] hover:text-[#eaecef]'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>{t.settingsTabRisk}</span>
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'signals'
                ? 'border-[#fcd535] text-[#fcd535] bg-[#1e2329]/40 font-bold'
                : 'border-transparent text-[#848e9c] hover:text-[#eaecef]'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{t.settingsTabSignals}</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'border-[#fcd535] text-[#fcd535] bg-[#1e2329]/40 font-bold'
                : 'border-transparent text-[#848e9c] hover:text-[#eaecef]'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.settingsTabDatabase}</span>
          </button>
        </div>

        {/* Content Form Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-[#0b0e11]/30">
          {purgeNotice && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
              ✓ {purgeNotice}
            </div>
          )}

          {/* TAB 1: Trading Mode & Binance API */}
          {activeTab === 'mode' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#eaecef] text-sm mb-1 font-mono">
                  {t.settingsTradingModeTitle}
                </h3>
                <p className="text-[#848e9c] text-xs mb-3">{t.settingsTradingModeSub}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, tradingMode: 'PAPER' })}
                    className="p-3.5 rounded-xl border cursor-pointer transition bg-emerald-500/10 border-emerald-500/50 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileCode className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-[#eaecef]">{t.settingsPaperLabel}</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        نشط / Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[#848e9c]">{t.modePaperDesc}</p>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border transition bg-[#1e2329]/50 border-[#2b2f36] opacity-60 cursor-not-allowed"
                    title="Real trading is strictly disabled for risk protection."
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Radio className="h-4 w-4 text-[#848e9c]" />
                      <span className="font-bold text-[#848e9c]">{t.settingsRealLabel}</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        معطل للأمان / Locked
                      </span>
                    </div>
                    <p className="text-[11px] text-[#848e9c]">
                      {isAr
                        ? 'PAPER MODE ONLY (التداول الحقيقي معطل برمجياً لضمان سلامة رأس المال)'
                        : 'PAPER MODE ONLY (Real execution disabled for safety protection)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Binance Network & Credentials */}
              <div className="pt-3 border-t border-[#2b2f36] space-y-3">
                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsBinanceNetwork}</label>
                  <select
                    value={formData.binanceNetwork}
                    onChange={(e) =>
                      setFormData({ ...formData, binanceNetwork: e.target.value as 'TESTNET' | 'PRODUCTION' })
                    }
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-3 py-2 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="TESTNET">{t.settingsTestnet}</option>
                    <option value="PRODUCTION">{t.settingsProduction}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsApiKey}</label>
                  <input
                    type="text"
                    value={formData.binanceApiKey}
                    onChange={(e) => setFormData({ ...formData, binanceApiKey: e.target.value })}
                    placeholder="e.g. 5x8z... (Binance Futures API Key)"
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-3 py-2 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#848e9c] font-mono">{t.settingsApiSecret}</label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-[#fcd535] hover:underline font-mono"
                    >
                      {showSecret ? 'إخفاء / Hide' : 'إظهار / Show'}
                    </button>
                  </div>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={formData.binanceApiSecret}
                    onChange={(e) => setFormData({ ...formData, binanceApiSecret: e.target.value })}
                    placeholder="e.g. 9y2w... (Binance Futures API Secret)"
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-3 py-2 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                {/* Test Connection Button & Result */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] border border-[#2b2f36] rounded-lg font-mono font-semibold transition disabled:opacity-50"
                  >
                    <Globe className="h-4 w-4 text-[#fcd535]" />
                    <span>{isTesting ? t.settingsTesting : t.settingsTestConnection}</span>
                  </button>

                  {testResult && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                        testResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      <span>{testResult.success ? '✓' : '✗'}</span>
                      <span>
                        {testResult.success ? t.settingsConnectionSuccess : t.settingsConnectionFailed}{' '}
                        ({testResult.latencyMs}ms)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Risk & Leverage */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsBalance}</label>
                  <input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsMaxDailyRisk}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.maxDailyRisk}
                    onChange={(e) => setFormData({ ...formData, maxDailyRisk: parseFloat(e.target.value) || 2 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsMaxTradeRisk}</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.maxTradeRisk}
                    onChange={(e) => setFormData({ ...formData, maxTradeRisk: parseFloat(e.target.value) || 0.3 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsLeverage}</label>
                  <input
                    type="number"
                    value={formData.leverage}
                    onChange={(e) => setFormData({ ...formData, leverage: parseInt(e.target.value) || 10 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsMaxOpen}</label>
                  <input
                    type="number"
                    value={formData.maxOpenTrades}
                    onChange={(e) => setFormData({ ...formData, maxOpenTrades: parseInt(e.target.value) || 3 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsTradeSize}</label>
                  <input
                    type="number"
                    value={formData.tradeSizePercent}
                    onChange={(e) => setFormData({ ...formData, tradeSizePercent: parseFloat(e.target.value) || 3 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#2b2f36]">
                <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsMaxDrawdown}</label>
                <input
                  type="number"
                  value={formData.maxDrawdownPercent}
                  onChange={(e) => setFormData({ ...formData, maxDrawdownPercent: parseFloat(e.target.value) || 5 })}
                  className="w-full max-w-xs bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Signals & Exits */}
          {activeTab === 'signals' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsTimeframe}</label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value as TimeFrame })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                    <option value="4h">4h</option>
                    <option value="1d">1d</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsMinScore}</label>
                  <input
                    type="number"
                    value={formData.minScore}
                    onChange={(e) => setFormData({ ...formData, minScore: parseInt(e.target.value) || 25 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsMinConf}</label>
                  <input
                    type="number"
                    value={formData.minConfidence}
                    onChange={(e) => setFormData({ ...formData, minConfidence: parseInt(e.target.value) || 40 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsStopLoss}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.stopLossPercent}
                    onChange={(e) => setFormData({ ...formData, stopLossPercent: parseFloat(e.target.value) || 2.0 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[#848e9c] block mb-1 font-mono">{t.settingsTakeProfit}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.takeProfitPercent}
                    onChange={(e) => setFormData({ ...formData, takeProfitPercent: parseFloat(e.target.value) || 5.0 })}
                    className="w-full bg-[#1e2329] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-lg bg-[#1e2329] border border-[#2b2f36] cursor-pointer hover:border-[#fcd535]/50 transition">
                  <input
                    type="checkbox"
                    checked={formData.useTrendFilter}
                    onChange={(e) => setFormData({ ...formData, useTrendFilter: e.target.checked })}
                    className="rounded text-[#fcd535] focus:ring-0 accent-[#fcd535]"
                  />
                  <div>
                    <span className="font-semibold text-[#eaecef]">{t.settingsTrendFilter}</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-lg bg-[#1e2329] border border-[#2b2f36] cursor-pointer hover:border-[#fcd535]/50 transition">
                  <input
                    type="checkbox"
                    checked={formData.useSmartExit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        useSmartExit: e.target.checked,
                        smartExitEnabled: e.target.checked,
                      })
                    }
                    className="rounded text-[#fcd535] focus:ring-0 accent-[#fcd535]"
                  />
                  <div>
                    <span className="font-semibold text-[#eaecef]">{t.settingsSmartExit}</span>
                  </div>
                </label>
              </div>

              {/* Adaptive Smart Exit Section (Phase 1) */}
              <div className="p-3.5 rounded-xl bg-[#1e2329] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-[#eaecef] text-xs block">
                        {t.smartExitHeaderTitle}
                      </span>
                      <span className="text-[10px] text-[#848e9c]">
                        {t.smartExitHeaderDesc}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.smartExitEnabled ?? formData.useSmartExit ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smartExitEnabled: e.target.checked,
                        useSmartExit: e.target.checked,
                      })
                    }
                    className="rounded text-amber-400 focus:ring-0 accent-amber-500 h-4 w-4 cursor-pointer"
                  />
                </div>

                {(formData.smartExitEnabled ?? formData.useSmartExit ?? true) && (
                  <div className="space-y-3 pt-2 border-t border-[#2b2f36] text-xs font-mono">
                    {/* Row 1: Min Profit to activate, Min Drop Ratio, Max Drop Ratio */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[#848e9c] block mb-1 text-[11px]">
                          {t.smartExitMinProfitLabel}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1.0"
                          max="20.0"
                          value={formData.smartExitMinProfitPercent ?? 5.0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smartExitMinProfitPercent: parseFloat(e.target.value) || 5.0,
                            })
                          }
                          className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[#848e9c] block mb-1 text-[11px]">
                          {t.smartExitMinDropLabel}
                        </label>
                        <input
                          type="number"
                          step="1.0"
                          min="5.0"
                          max="25.0"
                          value={formData.smartExitMinDropRatio ?? 10.0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smartExitMinDropRatio: parseFloat(e.target.value) || 10.0,
                            })
                          }
                          className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[#848e9c] block mb-1 text-[11px]">
                          {t.smartExitMaxDropLabel}
                        </label>
                        <input
                          type="number"
                          step="1.0"
                          min="15.0"
                          max="50.0"
                          value={formData.smartExitMaxDropRatio ?? 35.0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smartExitMaxDropRatio: parseFloat(e.target.value) || 35.0,
                            })
                          }
                          className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Row 2: Trend separation toggle & Ratios */}
                    <div className="p-2.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] space-y-2">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-semibold text-[#eaecef] text-[11px]">
                          {t.smartExitSeparateTrendLabel}
                        </span>
                        <input
                          type="checkbox"
                          checked={formData.smartExitSeparateTrendRatios ?? true}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smartExitSeparateTrendRatios: e.target.checked,
                            })
                          }
                          className="rounded text-amber-400 focus:ring-0 accent-amber-500 h-4 w-4 shrink-0"
                        />
                      </label>

                      {(formData.smartExitSeparateTrendRatios ?? true) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#1e2329]">
                          <div>
                            <span className="text-[#848e9c] block text-[10px] mb-1">
                              {t.smartExitUptrendRatioLabel}
                            </span>
                            <input
                              type="number"
                              step="1.0"
                              min="10.0"
                              max="40.0"
                              value={formData.smartExitUptrendDropRatio ?? 25.0}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  smartExitUptrendDropRatio: parseFloat(e.target.value) || 25.0,
                                })
                              }
                              className="w-full bg-[#181a20] border border-[#2b2f36] rounded px-2.5 py-1 text-emerald-400 font-bold"
                            />
                          </div>

                          <div>
                            <span className="text-[#848e9c] block text-[10px] mb-1">
                              {t.smartExitDowntrendRatioLabel}
                            </span>
                            <input
                              type="number"
                              step="1.0"
                              min="5.0"
                              max="30.0"
                              value={formData.smartExitDowntrendDropRatio ?? 15.0}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  smartExitDowntrendDropRatio: parseFloat(e.target.value) || 15.0,
                                })
                              }
                              className="w-full bg-[#181a20] border border-[#2b2f36] rounded px-2.5 py-1 text-rose-400 font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 3: AI / Momentum Toggle & Volatility Window */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] cursor-pointer hover:border-amber-500/40 transition">
                        <div className="pr-2">
                          <span className="font-semibold text-[#eaecef] text-[11px] block">
                            {t.smartExitUseAILabel}
                          </span>
                          <span className="text-[9px] text-[#848e9c]">
                            {isAr ? 'توسيع/تضييق نسبة التراجع حسب مؤشرات الزخم' : 'Dynamic ratio adaptation via momentum'}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.smartExitUseAIMomentum ?? true}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smartExitUseAIMomentum: e.target.checked,
                            })
                          }
                          className="rounded text-amber-400 focus:ring-0 accent-amber-500 h-4 w-4 shrink-0"
                        />
                      </label>

                      <div className="p-2.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-[#eaecef] text-[11px] block">
                            {t.smartExitVolWindowLabel}
                          </span>
                          <span className="text-[9px] text-[#848e9c]">
                            {isAr ? 'قياس تذبذب ATR وحركة الشموع' : 'ATR & candle swing window'}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          step="5"
                          value={formData.smartExitVolatilityWindowMin ?? 15}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smartExitVolatilityWindowMin: parseInt(e.target.value) || 15,
                            })
                          }
                          className="w-16 bg-[#181a20] border border-[#2b2f36] rounded px-2 py-1 text-amber-400 font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* High-Precision Trade Audit Section */}
              <div className="p-3.5 rounded-xl bg-[#1e2329] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-[#eaecef] text-xs block">
                        {isAr ? 'محرك الفحص والتدقيق الفائق لصفقات عالية الضمان' : 'High-Precision Trade Audit Engine'}
                      </span>
                      <span className="text-[10px] text-[#848e9c]">
                        {isAr
                          ? 'فحص شامل عبر 6 محاور فنية لمنع الصفقات المتذبذبة'
                          : 'Comprehensive 6-pillar validation to eliminate choppy setups'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.precisionAuditMode}
                    onChange={(e) => setFormData({ ...formData, precisionAuditMode: e.target.checked })}
                    className="rounded text-emerald-400 focus:ring-0 accent-emerald-500 h-4 w-4"
                  />
                </div>

                {formData.precisionAuditMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[#2b2f36] text-xs font-mono">
                    <div>
                      <label className="text-[#848e9c] block mb-1 text-[11px]">
                        {isAr ? 'الحد الأدنى للجودة (Score)' : 'Min Audit Score'}
                      </label>
                      <select
                        value={formData.minAuditScore}
                        onChange={(e) => setFormData({ ...formData, minAuditScore: parseInt(e.target.value) || 75 })}
                        className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                      >
                        <option value={70}>70% ({isAr ? 'مرن' : 'Moderate'})</option>
                        <option value={75}>75% ({isAr ? 'قياسي موصى به' : 'Recommended'})</option>
                        <option value={80}>80% ({isAr ? 'صارم عالي الضمان' : 'Strict High-Win'})</option>
                        <option value={85}>85% ({isAr ? 'فائق النقاء' : 'Ultra Pure'})</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#848e9c] block mb-1 text-[11px]">
                        {isAr ? 'إجماع الاستراتيجيات' : 'Min Consensus'}
                      </label>
                      <select
                        value={formData.minConsensusRatio}
                        onChange={(e) => setFormData({ ...formData, minConsensusRatio: parseFloat(e.target.value) || 0.65 })}
                        className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] focus:outline-none focus:border-emerald-500"
                      >
                        <option value={0.55}>55%</option>
                        <option value={0.65}>65% ({isAr ? 'موصى به' : 'Optimal'})</option>
                        <option value={0.75}>75% ({isAr ? 'إجماع قوي' : 'Strong'})</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#848e9c] block mb-1 text-[11px]">
                        {isAr ? 'قوة الاتجاه (ADX)' : 'Min ADX Strength'}
                      </label>
                      <select
                        value={formData.minADXThreshold}
                        onChange={(e) => setFormData({ ...formData, minADXThreshold: parseInt(e.target.value) || 20 })}
                        className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] focus:outline-none focus:border-emerald-500"
                      >
                        <option value={15}>15 ({isAr ? 'حتى في التذبذب' : 'Low'})</option>
                        <option value={20}>20 ({isAr ? 'اتجاه واضح' : 'Trending'})</option>
                        <option value={25}>25 ({isAr ? 'زخم قوي' : 'Strong Trend'})</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#848e9c] block mb-1 text-[11px]">
                        {isAr ? 'نسبة العائد/المخاطرة R:R' : 'Min R:R Ratio'}
                      </label>
                      <select
                        value={formData.requireRRRatio}
                        onChange={(e) => setFormData({ ...formData, requireRRRatio: parseFloat(e.target.value) || 2.0 })}
                        className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] focus:outline-none focus:border-emerald-500"
                      >
                        <option value={1.5}>1 : 1.5</option>
                        <option value={2.0}>1 : 2.0 ({isAr ? 'قياسي' : 'Standard'})</option>
                        <option value={2.5}>1 : 2.5 ({isAr ? 'غير متماثل' : 'Asymmetric'})</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Anti-Loss Safeguards & Break-Even Section */}
              <div className="p-3.5 rounded-xl bg-[#1e2329] border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-cyan-400" />
                  <div>
                    <span className="font-bold text-[#eaecef] text-xs block">
                      {isAr ? 'حماية رأس المال وضمان عدم تكرار الخسائر' : 'Anti-Loss Capital Shield & Break-Even'}
                    </span>
                    <span className="text-[10px] text-[#848e9c]">
                      {isAr
                        ? 'إجراءات وقائية متقدمة لمنع انعكاس الصفقات الرابحة وتفادي الصفقات السيئة'
                        : 'Prevent profit reversal and eliminate repetitive coin stop-outs'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#2b2f36]">
                  {/* Break-Even Toggle */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] cursor-pointer hover:border-cyan-500/40 transition">
                    <div className="pr-2">
                      <span className="font-semibold text-[#eaecef] text-xs block">
                        {t.breakEvenStopTitle}
                      </span>
                      <span className="text-[10px] text-[#848e9c]">
                        {t.breakEvenStopDesc}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.useBreakEvenStop ?? true}
                      onChange={(e) => setFormData({ ...formData, useBreakEvenStop: e.target.checked })}
                      className="rounded text-cyan-400 focus:ring-0 accent-cyan-500 h-4 w-4 shrink-0"
                    />
                  </label>

                  {/* Strict Anti-Loss Filter */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] cursor-pointer hover:border-cyan-500/40 transition">
                    <div className="pr-2">
                      <span className="font-semibold text-[#eaecef] text-xs block">
                        {t.strictAntiLossTitle}
                      </span>
                      <span className="text-[10px] text-[#848e9c]">
                        {t.strictAntiLossDesc}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.strictAntiLossFilter ?? true}
                      onChange={(e) => setFormData({ ...formData, strictAntiLossFilter: e.target.checked })}
                      className="rounded text-cyan-400 focus:ring-0 accent-cyan-500 h-4 w-4 shrink-0"
                    />
                  </label>

                  {/* Multi-Timeframe Alignment (15m / 1h / 4h) */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] cursor-pointer hover:border-emerald-500/40 transition">
                    <div className="pr-2">
                      <span className="font-semibold text-emerald-400 text-xs block">
                        {t.tfaTitle}
                      </span>
                      <span className="text-[10px] text-[#848e9c]">
                        {t.tfaDesc}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enforceTimeFrameAlignment ?? true}
                      onChange={(e) => setFormData({ ...formData, enforceTimeFrameAlignment: e.target.checked })}
                      className="rounded text-emerald-400 focus:ring-0 accent-emerald-500 h-4 w-4 shrink-0"
                    />
                  </label>

                  {/* Orderbook Liquidity Filter */}
                  <div className="p-2.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="pr-2">
                        <span className="font-semibold text-[#eaecef] text-xs block">
                          {t.orderbookDepthTitle}
                        </span>
                        <span className="text-[10px] text-[#848e9c]">
                          {t.orderbookLiquidityWalls}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.orderbookFilterEnabled ?? true}
                        onChange={(e) => setFormData({ ...formData, orderbookFilterEnabled: e.target.checked })}
                        className="rounded text-[#fcd535] focus:ring-0 accent-[#fcd535] h-4 w-4 shrink-0"
                      />
                    </label>
                    {formData.orderbookFilterEnabled && (
                      <div className="pt-1 border-t border-[#1e2329] flex items-center justify-between text-xs">
                        <span className="text-[#848e9c] text-[11px]">
                          {isAr ? 'أقصى مسافة لحاجز السيولة المعاكس (%):' : 'Max Opposing Wall Distance (%):'}
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min="1.0"
                          max="5.0"
                          value={formData.maxOpposingWallDistancePct ?? 2.5}
                          onChange={(e) => setFormData({ ...formData, maxOpposingWallDistancePct: parseFloat(e.target.value) || 2.5 })}
                          className="w-20 bg-[#181a20] border border-[#2b2f36] rounded px-2 py-1 text-[#fcd535] font-bold text-center"
                        />
                      </div>
                    )}
                  </div>

                  {/* Smart Volatility Freeze */}
                  <div className="p-2.5 rounded-lg bg-[#0b0e11] border border-[#2b2f36] space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="pr-2">
                        <span className="font-semibold text-purple-400 text-xs block">
                          {t.smartFreezeTitle}
                        </span>
                        <span className="text-[10px] text-[#848e9c]">
                          {t.smartFreezeDesc}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.smartFreezeEnabled ?? true}
                        onChange={(e) => setFormData({ ...formData, smartFreezeEnabled: e.target.checked })}
                        className="rounded text-purple-400 focus:ring-0 accent-purple-500 h-4 w-4 shrink-0"
                      />
                    </label>
                    {formData.smartFreezeEnabled && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1e2329] text-xs">
                        <div>
                          <span className="text-[#848e9c] block text-[10px]">
                            {isAr ? 'عتبة التذبذب الشاذ (%):' : 'Volatility Anomaly (%):'}
                          </span>
                          <input
                            type="number"
                            step="0.2"
                            min="1.5"
                            max="6.0"
                            value={formData.smartFreezeThresholdPercent ?? 2.8}
                            onChange={(e) => setFormData({ ...formData, smartFreezeThresholdPercent: parseFloat(e.target.value) || 2.8 })}
                            className="w-full bg-[#181a20] border border-[#2b2f36] rounded px-2 py-1 text-purple-400 font-bold text-center"
                          />
                        </div>
                        <div>
                          <span className="text-[#848e9c] block text-[10px]">
                            {isAr ? 'مدة التجميد (دقيقة):' : 'Freeze Duration (min):'}
                          </span>
                          <input
                            type="number"
                            min="5"
                            max="60"
                            value={formData.smartFreezeDurationMinutes ?? 15}
                            onChange={(e) => setFormData({ ...formData, smartFreezeDurationMinutes: parseInt(e.target.value) || 15 })}
                            className="w-full bg-[#181a20] border border-[#2b2f36] rounded px-2 py-1 text-[#eaecef] font-bold text-center"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Symbol Cooldown & Trigger Threshold */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs font-mono">
                    <div>
                      <label className="text-[#848e9c] block mb-1 text-[11px]">
                        {isAr ? 'عتبة تفعيل Break-Even (% ربح)' : 'Break-Even Trigger (% Profit)'}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="3.0"
                        value={formData.breakEvenTriggerPercent ?? 1.0}
                        onChange={(e) => setFormData({ ...formData, breakEvenTriggerPercent: parseFloat(e.target.value) || 1.0 })}
                        className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-[#848e9c] block mb-1 text-[11px]">
                        {t.symbolCooldownTitle}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.symbolCooldownMinutes ?? 10}
                        onChange={(e) => setFormData({ ...formData, symbolCooldownMinutes: parseInt(e.target.value) || 10 })}
                        className="w-full bg-[#0b0e11] border border-[#2b2f36] rounded-lg px-2.5 py-1.5 text-[#eaecef] font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Database & Pure Self Learning */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#1e2329] border border-[#2b2f36]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pureSelfLearning}
                    onChange={(e) => setFormData({ ...formData, pureSelfLearning: e.target.checked })}
                    className="mt-0.5 rounded text-[#fcd535] accent-[#fcd535]"
                  />
                  <div>
                    <span className="font-bold text-[#eaecef] text-sm block mb-1">
                      {t.settingsPureLearningTitle}
                    </span>
                    <p className="text-[11px] text-[#848e9c] leading-relaxed">
                      {t.settingsPureLearningDesc}
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-[#2b2f36] space-y-3">
                <h4 className="font-bold text-[#eaecef] text-xs font-mono uppercase tracking-wider">
                  إعادة ضبط وتفريغ البيانات (Database Purge & Reset)
                </h4>

                <div className="flex flex-wrap gap-2.5">
                  {onPurgeDatabase && (
                    <button
                      type="button"
                      onClick={handlePurge}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-mono font-bold transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t.settingsResetHistoryBtn}</span>
                    </button>
                  )}

                  {onResetBalance && (
                    <button
                      type="button"
                      onClick={handleResetBal}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#1e2329] hover:bg-[#2b2f36] text-[#fcd535] border border-[#2b2f36] rounded-lg text-xs font-mono font-semibold transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>{t.settingsResetBalanceBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2b2f36] bg-[#181a20] flex items-center justify-between">
          <button
            onClick={() => setFormData({ ...config })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2329] hover:bg-[#2b2f36] text-[#848e9c] hover:text-[#eaecef] border border-[#2b2f36] rounded-lg text-xs font-mono transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{t.settingsRevertBtn}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#fcd535] hover:bg-[#fcd535]/90 text-[#0b0e11] rounded-lg text-xs font-bold font-mono transition shadow-sm"
          >
            <Check className="h-4 w-4" />
            <span>{t.settingsSaveBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

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
  onResetBalance?: () => void;
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
      onResetBalance();
      setFormData((prev) => ({ ...prev, balance: prev.initialBalance || 1000 }));
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
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      formData.tradingMode === 'PAPER'
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                        : 'bg-[#1e2329] border-[#2b2f36] hover:border-[#3b404a]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileCode className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-[#eaecef]">{t.settingsPaperLabel}</span>
                    </div>
                    <p className="text-[11px] text-[#848e9c]">{t.modePaperDesc}</p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, tradingMode: 'REAL' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      formData.tradingMode === 'REAL'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                        : 'bg-[#1e2329] border-[#2b2f36] hover:border-[#3b404a]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Radio className="h-4 w-4 text-amber-400" />
                      <span className="font-bold text-[#eaecef]">{t.settingsRealLabel}</span>
                    </div>
                    <p className="text-[11px] text-[#848e9c]">{t.modeRealDesc}</p>
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
                    onChange={(e) => setFormData({ ...formData, useSmartExit: e.target.checked })}
                    className="rounded text-[#fcd535] focus:ring-0 accent-[#fcd535]"
                  />
                  <div>
                    <span className="font-semibold text-[#eaecef]">{t.settingsSmartExit}</span>
                  </div>
                </label>
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

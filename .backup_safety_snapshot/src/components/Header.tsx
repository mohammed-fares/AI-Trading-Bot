import React from 'react';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Cpu,
  Zap,
  BookOpen,
  Sliders,
  Database,
  Globe,
  Radio,
  FileCode,
} from 'lucide-react';
import { BotStatus, MarketSentiment } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  status: BotStatus;
  tradingMode?: 'PAPER' | 'REAL';
  onToggleTradingMode?: () => void;
  cycleCountdown?: number;
  cycleInterval?: number;
  sentiment?: MarketSentiment;
  fearGreedIndex?: { score: number; classification: string };
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onManualCycle?: () => void;
  onOpenSettings: () => void;
  onOpenStrategies: () => void;
  onOpenDatabase: () => void;
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  tradingMode = 'PAPER',
  onToggleTradingMode,
  cycleCountdown = 15,
  sentiment,
  fearGreedIndex,
  onStart,
  onPause,
  onResume,
  onStop,
  onManualCycle,
  onOpenSettings,
  onOpenStrategies,
  onOpenDatabase,
  onOpenDocs,
}) => {
  const { t, language, toggleLanguage, isAr } = useLanguage();

  const safeSentiment: MarketSentiment = sentiment || {
    fearAndGreedIndex: fearGreedIndex?.score ?? 65,
    sentimentLabel: (fearGreedIndex?.classification as MarketSentiment['sentimentLabel']) || 'Greed',
    arabicLabel: 'طمع',
    marketCondition: 'تذبذب عالي',
  };

  const fearScore = safeSentiment.fearAndGreedIndex ?? 50;
  const sentimentText = isAr
    ? safeSentiment.arabicLabel || 'محايد'
    : safeSentiment.sentimentLabel || 'Neutral';

  return (
    <header className="bg-[#181a20] border-b border-[#2b2f36] text-[#eaecef] px-3 sm:px-4 lg:px-6 py-2.5 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Brand, Connection & Mode */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#fcd535] rounded-lg flex items-center justify-center text-[#0b0e11] font-bold text-base shadow-sm">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm sm:text-base text-[#eaecef] tracking-tight">
                  {t.appTitle}
                </h1>
                <span className="text-[#fcd535] text-[10px] font-mono px-1.5 py-0.5 bg-[#fcd535]/10 border border-[#fcd535]/30 rounded">
                  {t.version}
                </span>
              </div>
              <p className="text-[11px] text-[#848e9c] flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{t.connected}</span>
              </p>
            </div>
          </div>

          {/* Trading Mode Badge & Seamless Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#12161c] p-1 rounded-lg border border-[#2b2f36]">
              <button
                id="trading-mode-toggle-paper"
                onClick={() => {
                  if (tradingMode !== 'PAPER' && onToggleTradingMode) {
                    onToggleTradingMode();
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition ${
                  tradingMode === 'PAPER'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm font-bold'
                    : 'text-[#848e9c] hover:text-[#eaecef]'
                }`}
                title={t.modePaperDesc}
              >
                <FileCode className="h-3 w-3 text-emerald-400" />
                <span>{isAr ? 'تجريبي (بيانات حية)' : 'Paper (Live)'}</span>
              </button>

              <button
                id="trading-mode-toggle-real"
                onClick={() => {
                  if (tradingMode !== 'REAL' && onToggleTradingMode) {
                    onToggleTradingMode();
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition ${
                  tradingMode === 'REAL'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm font-bold'
                    : 'text-[#848e9c] hover:text-[#eaecef]'
                }`}
                title={t.modeRealDesc}
              >
                <Radio className="h-3 w-3 animate-pulse text-amber-400" />
                <span>{isAr ? 'حقيقي (Binance API)' : 'Real (Live API)'}</span>
              </button>
            </div>

            {/* System Status Pill */}
            {status === 'RUNNING' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{t.statusRunning}</span>
              </span>
            )}
            {status === 'PAUSED' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{t.statusPaused}</span>
              </span>
            )}
            {status === 'STOPPED' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>{t.statusStopped}</span>
              </span>
            )}
          </div>
        </div>

        {/* Live Cycle Countdown & Sentiment */}
        <div className="flex items-center gap-3 bg-[#1e2329] border border-[#2b2f36] px-3 py-1 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 text-[#848e9c]">
            <Zap className="h-3.5 w-3.5 text-[#fcd535]" />
            <span className="text-[11px] uppercase font-mono">{t.cycleLabel}</span>
            <span className="font-mono text-[#fcd535] font-bold bg-[#0b0e11] px-1.5 py-0.5 rounded border border-[#2b2f36]">
              {status === 'RUNNING' ? `${cycleCountdown}s` : t.idle}
            </span>
          </div>
          <span className="text-[#2b2f36]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#848e9c] text-[11px] uppercase font-mono">{t.sentimentLabel}</span>
            <span
              className={`font-semibold font-mono text-xs ${
                fearScore > 60
                  ? 'text-emerald-400'
                  : fearScore < 40
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {sentimentText} ({fearScore})
            </span>
          </div>
        </div>

        {/* Action Controls & Language Switcher */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 justify-end w-full lg:w-auto">
          {/* Main Bot State Buttons */}
          {status === 'STOPPED' ? (
            <button
              id="header-start-btn"
              onClick={onStart}
              className="flex items-center gap-1.5 bg-[#fcd535] hover:bg-[#fcd535]/90 text-[#0b0e11] px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{t.btnStart}</span>
            </button>
          ) : status === 'RUNNING' ? (
            <button
              id="header-pause-btn"
              onClick={onPause}
              className="flex items-center gap-1.5 bg-[#2b2f36] hover:bg-[#363c45] text-[#eaecef] px-3 py-1.5 rounded-lg text-xs font-bold transition border border-[#3b404a]"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>{t.btnPause}</span>
            </button>
          ) : (
            <button
              id="header-resume-btn"
              onClick={onResume}
              className="flex items-center gap-1.5 bg-[#fcd535] hover:bg-[#fcd535]/90 text-[#0b0e11] px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{t.btnResume}</span>
            </button>
          )}

          {status !== 'STOPPED' && (
            <button
              id="header-stop-btn"
              onClick={onStop}
              className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>{t.btnStop}</span>
            </button>
          )}

          <button
            id="header-cycle-now-btn"
            onClick={onManualCycle}
            className="flex items-center gap-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#848e9c] hover:text-[#eaecef] px-2.5 py-1.5 rounded-lg text-xs transition border border-[#2b2f36]"
            title={t.btnInstantCycle}
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#fcd535]" />
            <span className="hidden sm:inline">{t.btnInstantCycle}</span>
          </button>

          {/* Modals & Nav */}
          <button
            id="nav-strategies-btn"
            onClick={onOpenStrategies}
            className="flex items-center gap-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] px-2.5 py-1.5 rounded-lg text-xs transition border border-[#2b2f36]"
          >
            <Cpu className="h-3.5 w-3.5 text-[#fcd535]" />
            <span className="hidden md:inline">{t.btnStrategies}</span>
          </button>

          <button
            id="nav-database-btn"
            onClick={onOpenDatabase}
            className="flex items-center gap-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] px-2.5 py-1.5 rounded-lg text-xs transition border border-[#2b2f36]"
          >
            <Database className="h-3.5 w-3.5 text-sky-400" />
            <span>{t.btnDatabase}</span>
          </button>

          <button
            id="nav-settings-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] px-2.5 py-1.5 rounded-lg text-xs transition border border-[#2b2f36]"
          >
            <Sliders className="h-3.5 w-3.5 text-[#848e9c]" />
            <span>{t.btnSettings}</span>
          </button>

          <button
            id="nav-docs-btn"
            onClick={onOpenDocs}
            className="flex items-center gap-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#fcd535] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border border-[#2b2f36]"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#fcd535]" />
            <span className="hidden sm:inline">{t.btnDocs}</span>
          </button>

          {/* Bilingual Language Switcher */}
          <button
            id="language-toggle-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-[#0b0e11] hover:bg-[#2b2f36] text-[#fcd535] border border-[#2b2f36] px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition shadow-sm"
            title="Switch Language / تبديل اللغة"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

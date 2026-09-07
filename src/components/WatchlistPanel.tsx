import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { CryptoAsset } from '../types';
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

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#fcd535]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#848e9c] font-mono">
            {t.watchlistTitle}
          </h2>
        </div>
        <div className="text-[11px] text-[#848e9c] font-mono flex items-center gap-2">
          <span>{t.scannerLive}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Grid of assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {assets.map((asset) => {
          const isSelected = selectedSymbol === asset.symbol;
          const isUpTrend = asset.trend === 'UP';
          const isDownTrend = asset.trend === 'DOWN';

          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset.symbol)}
              className={`border rounded-xl p-3 cursor-pointer transition-all duration-150 relative ${
                isSelected
                  ? 'bg-[#1e2329] border-[#fcd535] shadow-sm'
                  : 'bg-[#1e2329] border-[#2b2f36] hover:border-[#3b404a]'
              }`}
            >
              {/* Asset Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#eaecef] text-sm font-mono tracking-tight">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] px-1 py-0.2 bg-[#0b0e11] text-[#848e9c] rounded border border-[#2b2f36] font-mono">
                      {asset.sector}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#848e9c]">{asset.name}</span>
                </div>

                <div className={`font-mono ${isAr ? 'text-left' : 'text-right'}`}>
                  <div className="font-bold text-[#eaecef] text-sm">
                    ${asset.price.toLocaleString(undefined, {
                      minimumFractionDigits: asset.price < 1 ? 4 : 2,
                      maximumFractionDigits: asset.price < 1 ? 4 : 2,
                    })}
                  </div>
                  <div
                    className={`flex items-center ${isAr ? 'justify-start' : 'justify-end'} text-[11px] font-semibold ${
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

              {/* Technical Indicators & Trend */}
              <div className="bg-[#0b0e11] rounded-lg p-2 border border-[#2b2f36] mb-2.5 text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#848e9c]">{t.trendLabel}:</span>
                  <span
                    className={`font-semibold px-1.5 py-0.2 rounded ${
                      isUpTrend
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isDownTrend
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-[#181a20] text-[#848e9c] border border-[#2b2f36]'
                    }`}
                  >
                    {isUpTrend ? '🟢 UP' : isDownTrend ? '🔴 DOWN' : '⚪ FLAT'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#848e9c] pt-1 border-t border-[#2b2f36]">
                  <span>RSI: <strong className="text-[#eaecef]">{asset.rsi.toFixed(0)}</strong></span>
                  <span>MACD: <strong className={asset.macdSignal === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'}>
                    {asset.macdSignal === 'BULLISH' ? 'BULL' : 'BEAR'}
                  </strong></span>
                  <span>ADX: <strong className="text-[#fcd535]">{asset.adx.toFixed(0)}</strong></span>
                </div>
              </div>

              {/* Ensemble Signal Output */}
              <div className="border-t border-[#2b2f36] pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#848e9c] flex items-center gap-1 text-[11px] font-mono">
                    <Sparkles className="h-3 w-3 text-[#fcd535]" />
                    <span>{t.colSignal}:</span>
                  </span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                      asset.ensembleSignal === 'LONG'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : asset.ensembleSignal === 'SHORT'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-[#0b0e11] text-[#848e9c] border border-[#2b2f36]'
                    }`}
                  >
                    {asset.ensembleSignal} ({asset.confidence}%)
                  </span>
                </div>

                {/* Long vs Short score bar */}
                <div className="flex items-center gap-1.5 text-[10px] text-[#848e9c] mb-2 font-mono">
                  <span className="text-emerald-400">L: {asset.longScore}</span>
                  <div className="flex-1 bg-[#0b0e11] rounded-full h-1.5 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${(asset.longScore / (asset.longScore + asset.shortScore || 1)) * 100}%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500 h-full"
                      style={{
                        width: `${(asset.shortScore / (asset.longScore + asset.shortScore || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-red-400">S: {asset.shortScore}</span>
                </div>

                {/* Instant Action buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onForceTrade(asset.symbol, 'LONG');
                    }}
                    className="flex items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-1 rounded-lg text-[10px] font-bold font-mono transition"
                    title={t.instantLong}
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span>{t.instantLong}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onForceTrade(asset.symbol, 'SHORT');
                    }}
                    className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-1 rounded-lg text-[10px] font-bold font-mono transition"
                    title={t.instantShort}
                  >
                    <TrendingDown className="h-3 w-3" />
                    <span>{t.instantShort}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

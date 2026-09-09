import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { BotCycleStep } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface LogMessage {
  id: string;
  time: string;
  text: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'DANGER';
}

interface SystemLogsPanelProps {
  logs: LogMessage[];
  currentCycleStep: BotCycleStep;
  onClearLogs: () => void;
}

export const SystemLogsPanel: React.FC<SystemLogsPanelProps> = ({
  logs,
  currentCycleStep,
  onClearLogs,
}) => {
  const { t, isAr } = useLanguage();

  const cycleSteps = [
    { step: 1, label: isAr ? '1. الصفقات والـ SL/TP' : '1. Trades & Exit' },
    { step: 2, label: isAr ? '2. الأمان والرصيد' : '2. Risk & Bal' },
    { step: 3, label: isAr ? '3. فحص التكيف' : '3. Adaptation' },
    { step: 4, label: isAr ? '4. مؤشر المشاعر' : '4. Sentiment' },
    { step: 5, label: isAr ? '5. مسح العملات' : '5. Market Scan' },
    { step: 6, label: isAr ? '6. الإشارات المجمعة' : '6. Ensemble' },
    { step: 7, label: isAr ? '7. إتمام الدورة' : '7. Finalize' },
  ];

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm space-y-3">
      {/* Bot Cycle Flow Steps */}
      <div className="border-b border-[#2b2f36] pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#848e9c] flex items-center gap-1.5 font-mono">
            <Terminal className="h-3.5 w-3.5 text-[#fcd535]" />
            <span>{t.logsCycleFlow}</span>
          </span>
          <span className="text-[10px] text-[#fcd535] font-mono">
            STEP {currentCycleStep} / 7
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-[10px] font-mono">
          {cycleSteps.map((s) => {
            const isActive = currentCycleStep === s.step;
            return (
              <div
                key={s.step}
                className={`p-1.5 rounded border text-center transition ${
                  isActive
                    ? 'bg-[#1e2329] border-[#fcd535] text-[#fcd535] font-bold shadow-sm'
                    : 'bg-[#0b0e11] border-[#2b2f36] text-[#848e9c]'
                }`}
              >
                {s.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log list Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#848e9c] font-mono uppercase tracking-wider">
          {t.logsTitle}:
        </span>
        <button
          onClick={onClearLogs}
          className="text-[#848e9c] hover:text-[#eaecef] text-[10px] font-mono flex items-center gap-1 transition"
          title={t.logsClear}
        >
          <Trash2 className="h-3 w-3" />
          <span>{t.logsClear}</span>
        </button>
      </div>

      {/* Terminal logs */}
      <div className="bg-[#0b0e11] rounded-lg p-3 border border-[#2b2f36] font-mono text-[11px] max-h-44 overflow-y-auto space-y-1.5">
        {logs.length === 0 ? (
          <div className="text-[#848e9c] text-center py-4">{t.logsWaiting}</div>
        ) : (
          logs.map((log, idx) => (
            <div key={`${log.id}-${idx}`} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[#848e9c] text-[10px] shrink-0">{log.time}</span>
              <span
                className={`shrink-0 font-bold ${
                  log.type === 'SUCCESS'
                    ? 'text-emerald-400'
                    : log.type === 'WARN'
                    ? 'text-[#fcd535]'
                    : log.type === 'DANGER'
                    ? 'text-red-400'
                    : 'text-[#848e9c]'
                }`}
              >
                [{log.type}]
              </span>
              <span className="text-[#eaecef]">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

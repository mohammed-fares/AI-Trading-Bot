import React, { useState } from 'react';
import { X, BookOpen, ChevronLeft, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { id: 'sec1', title: '1. نظرة عامة والأهداف' },
  { id: 'sec2', title: '2. الهيكل العام للنظام' },
  { id: 'sec3', title: '3. المكونات البرمجية الرئيسية' },
  { id: 'sec4', title: '4. دورة التداول ودورة حياة الصفقة' },
  { id: 'sec5', title: '5. الاستراتيجيات (50+) والإشارة المجمعة' },
  { id: 'sec6', title: '6. أنظمة الحماية الستة' },
  { id: 'sec7', title: '7. الذكاء الاصطناعي والتكيف التلقائي' },
  { id: 'sec8', title: '8. واجهة المستخدم والمراقبة' },
  { id: 'sec9', title: '9. سير العمل الكامل' },
  { id: 'sec10', title: '10. التوصيات وإعدادات الأمان' },
];

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('sec1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#181a20] border border-[#2b2f36] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2b2f36] flex items-center justify-between bg-[#181a20]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0b0e11] border border-[#2b2f36] flex items-center justify-center text-[#fcd535]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#eaecef]">
                🤖 AI Trading Bot v19.0 - الوصف الكامل والشرح التفصيلي
              </h2>
              <p className="text-xs text-[#848e9c]">الدليل المرجعي الشامل للمعمارية، الخوارزميات، ونظام الحماية</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#848e9c] hover:text-[#eaecef] p-1.5 rounded-lg hover:bg-[#1e2329] transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-64 border-l border-[#2b2f36] p-3 bg-[#0b0e11]/40 overflow-y-auto hidden md:block">
            <span className="text-[11px] font-bold text-[#848e9c] uppercase tracking-wider block mb-2 px-2 font-mono">
              TABLE OF CONTENTS
            </span>
            <div className="space-y-1">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                    activeSection === sec.id
                      ? 'bg-[#fcd535] text-[#0b0e11] font-bold shadow-sm'
                      : 'text-[#848e9c] hover:bg-[#1e2329] hover:text-[#eaecef]'
                  }`}
                >
                  <span>{sec.title}</span>
                  {activeSection === sec.id && <ChevronLeft className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section Reader Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-[#eaecef] text-xs leading-relaxed text-right bg-[#0b0e11]/20">
            {/* Section 1 */}
            {activeSection === 'sec1' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <span>1. نظرة عامة والأهداف (Overview & Objectives)</span>
                </h3>
                <p className="text-sm">
                  <strong>AI Trading Bot v19.0</strong> هو نظام تداول آلي متكامل مخصص للعمل على منصة <strong>Binance Futures (العقود المستقبلية)</strong>. يعتمد النظام على تقنيات الذكاء الاصطناعي والتعلم الآلي لتحليل الأسواق لحظياً واتخاذ قرارات التداول الآلية بدون عواطف بشرية.
                </p>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-slate-900 text-white font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">الهدف</th>
                        <th className="p-2.5">الوصف التفصيلي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-sans">
                      <tr>
                        <td className="p-2.5 font-bold text-cyan-400">تحليل السوق</td>
                        <td className="p-2.5 text-slate-300">استخدام مؤشرات فنية متعددة (RSI, MACD, Bollinger, EMAs) وتحليل المشاعر (Fear & Greed Index).</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-emerald-400">اتخاذ القرار</td>
                        <td className="p-2.5 text-slate-300">نظام إشارات مجمعة (Ensemble Voting) من 50+ استراتيجية تداول متزامنة عبر أطر زمنية من 1m إلى 1d.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-amber-400">إدارة المخاطر</td>
                        <td className="p-2.5 text-slate-300">حماية رأس المال من خلال 6 أنظمة أمان (مدير المخاطر، قاطع الدائرة، حماية السحب، فلتر الاتجاه، الخروج الذكي، إدارة القطاعات).</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-purple-400">التكيف الذكي</td>
                        <td className="p-2.5 text-slate-300">تعديل الإعدادات تلقائياً عبر 3 مستويات مدروسة عند غياب الفرص لفترات متتالية.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-blue-400">التعلم الذاتي</td>
                        <td className="p-2.5 text-slate-300">قاعدة بيانات لتسجيل أداء الاستراتيجيات لكل عملة ومقارنة نسب الفوز والأرباح وتحديث الأوزان.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 2 */}
            {activeSection === 'sec2' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  2. الهيكل العام للنظام (System Architecture)
                </h3>
                <p>
                  ينقسم النظام إلى ثلاث طبقات رئيسية: واجهة المستخدم الرسومية (Web UI)، خادم التحكم والتوجيه، ومحرك التداول التنفيذي المرتبط بمنصات التداول ومزودي البيانات.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 text-left overflow-x-auto leading-relaxed">
                  <pre>{`┌─────────────────────────────────────────────────────────────────────────┐
│                        AI Trading Bot v19.0                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    واجهة المستخدم (Web UI)                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │   │
│  │  │ Dashboard│ │ Control │ │Strategy │ │  DB     │ │   AI    │ │   │
│  │  │   Stats  │ │  Panel  │ │ Manager │ │ Viewer  │ │Adaptive │ │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Flask / Node API Engine                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Trading Bot (bot.py)                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│         ┌──────────────────────────┼──────────────────────────┐        │
│         ▼                          ▼                          ▼        │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐   │
│  │   Exchange  │          │  CoinMarket │          │  Sentiment  │   │
│  │   (Binance) │          │    Cap API  │          │    API      │   │
│  └─────────────┘          └─────────────┘          └─────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`}</pre>
                </div>
              </div>
            )}

            {/* Section 3 */}
            {activeSection === 'sec3' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  3. المكونات البرمجية الرئيسية (Core Components)
                </h3>
                <div className="space-y-3">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-cyan-400 block mb-1">3.1 TradingBot (القلب الرئيسي)</strong>
                    <p className="text-slate-400">
                      يدير الاتصال بمنصة Binance Futures، قائمة المراقبة، وتنسيق استدعاء مديري المخاطر، التكيف الذكي، الفلاتر، ونظام الثقة.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-emerald-400 block mb-1">3.2 AdaptiveConfidenceManager (نظام الثقة التكيفي)</strong>
                    <p className="text-slate-400">
                      الحد الأدنى 15%، الحد الأقصى 75%. المنطق: عند نجاح 5 صفقات متتالية يتم رفع الثقة 5%، وعند فشل 3 صفقات متتالية يتم خفض الثقة 10%.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-purple-400 block mb-1">3.3 AIAdaptiveManager (التكيف الذكي)</strong>
                    <p className="text-slate-400">
                      يعمل بعد 5 دورات متتالية بدون صفقات عبر 3 مستويات (خفض معايير الثقة والدرجة، توسيع الفريم، وتعطيل فلتر الاتجاه).
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-blue-400 block mb-1">3.4 MultiStrategyAI (الذكاء المتعدد)</strong>
                    <p className="text-slate-400">
                      يدير 50+ استراتيجية ويولد الإشارة المجمعة (Ensemble Voting) بحساب المجموع المرجح للأوزان ونسب الثقة.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4 */}
            {activeSection === 'sec4' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  4. دورة التداول ودورة حياة الصفقة (Trade Cycle & Lifecycle)
                </h3>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 text-left overflow-x-auto text-[11px]">
                  <pre>{`دورة البوت الكاملة (كل 15 ثانية):
الخطوة 1: تحديث الصفقات المفتوحة (الأسعار، PnL، Smart Exit، SL/TP)
الخطوة 2: التحقق من حالة التداول (Pause / max_open / الرصيد)
الخطوة 3: فحص نظام التكيف الذكي (5 دورات خاملة)
الخطوة 4: تحليل المشاعر (مؤشر الخوف والطمع)
الخطوة 5: تحديث قائمة المراقبة (CoinMarketCap / Binance)
الخطوة 6: تقييم العملات وفتح الصفقات المطابقة للشروط
الخطوة 7: الانتظار 15 ثانية وتكرار الدورة`}</pre>
                </div>
              </div>
            )}

            {/* Section 5 */}
            {activeSection === 'sec5' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  5. الاستراتيجيات (50+) ونظام التصويت المجمّع (Ensemble Voting)
                </h3>
                <p>
                  يحتوي البوت على أكثر من 50 استراتيجية مختلفة تغطي الأطر الزمنية 1m، 5m، 15m، 1h، 4h، و 1d.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-left text-slate-300 overflow-x-auto leading-relaxed">
                  <pre>{`مثال حساب الإشارة المجمعة (Ensemble Voting):
├── Scalping 1m: LONG (0.65) × وزن 1.0 = 0.65
├── MACD 1m: LONG (0.70) × وزن 1.0 = 0.70
├── RSI 5m: LONG (0.55) × وزن 1.0 = 0.55
├── Trend 15m: LONG (0.80) × وزن 1.0 = 0.80
├── MACD 1h: SHORT (0.60) × وزن 1.0 = 0.60
├── RSI 4h: SHORT (0.50) × وزن 1.0 = 0.50
└── Daily Trend: LONG (0.75) × وزن 1.0 = 0.75

حساب النتائج:
LONG Score = 0.65 + 0.70 + 0.55 + 0.80 + 0.75 = 3.45
SHORT Score = 0.60 + 0.50 = 1.10
الثقة الإجمالية: 3.45 / (3.45 + 1.10) = 75.8%
القرار: فتح صفقة LONG بثقة 75.8%`}</pre>
                </div>
              </div>
            )}

            {/* Section 6 */}
            {activeSection === 'sec6' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  6. أنظمة الحماية الستة (The 6 Safety Protections)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-cyan-400 block mb-1">6.1 Risk Manager</strong>
                    <p className="text-slate-400">
                      معادلة حجم الصفقة تعتمد على الرصيد، المخاطرة اليومية 2%، ومخاطرة الصفقة 0.3%، مع تخفيض عند الخسائر وسقف 5% من الرصيد.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-rose-400 block mb-1">6.2 Circuit Breaker</strong>
                    <p className="text-slate-400">
                      إيقاف التداول 30 دقيقة عند 5 خسائر متتالية، وإيقاف حتى اليوم التالي عند 10 خسائر يومية.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block mb-1">6.3 Drawdown Protection</strong>
                    <p className="text-slate-400">
                      تتبع قمة الرصيد (Peak Balance) والإيقاف الفوري إذا تجاوز السحب 10%.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-emerald-400 block mb-1">6.4 Trend Filter</strong>
                    <p className="text-slate-400">
                      منع التداول ضد الاتجاه العام بالاعتماد على توافق EMA20 و EMA50 و EMA200.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-yellow-400 block mb-1">6.5 Smart Exit</strong>
                    <p className="text-slate-400">
                      تأمين الأرباح: Trailing Stop عند ربح ≥ 1.5%، خروج زمني للسكالبنج بعد 5 دقائق، وحماية التراجع 40% من أعلى قمة ربح &gt;2%.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-purple-400 block mb-1">6.6 Sector Manager</strong>
                    <p className="text-slate-400">
                      توزيع رأس المال عبر عملات وقطاعات متعددة لمنع تركز المخاطرة في قطاع واحد.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 7 */}
            {activeSection === 'sec7' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  7. الذكاء الاصطناعي والتكيف التلقائي (AI & Adaptive Intelligence)
                </h3>
                <p>
                  يدمج النظام محرك تعلم آلي لضبط الأوزان وفقاً للنتائج السابقة، ونظام تكيف هرمي من 3 مستويات يتدخل عند ركود السوق.
                </p>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-300">مستويات التكيف التلقائي:</div>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    <li><strong>المستوى 1:</strong> خفض min_confidence بنسبة 1%، خفض min_score بمقدار 5، وزيادة max_open إلى 5.</li>
                    <li><strong>المستوى 2:</strong> خفض إضافي 1% و 5 نقاط، وتوسيع الإطار الزمني من 1h إلى 4h.</li>
                    <li><strong>المستوى 3:</strong> خفض الثقة إلى 10%، الدرجة إلى 10، وتعطيل فلتر الاتجاه (use_trend_filter: False).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Section 8, 9, 10 */}
            {(activeSection === 'sec8' || activeSection === 'sec9' || activeSection === 'sec10') && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  {SECTIONS.find((s) => s.id === activeSection)?.title}
                </h3>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <strong className="text-cyan-400 block">التوصيات المعتمدة للتشغيل:</strong>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">🌱 للمبتدئين (آمن ومحافظ):</span>
                      <p className="text-slate-400 leading-relaxed">
                        min_confidence: 15% | min_score: 25 | max_open: 3 | leverage: 10x | trade_size: 10% | max_trade_risk: 0.2% | timeframe: 1h
                      </p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-purple-400 font-bold block mb-1">⚡ للمتقدمين (سريع وعدواني):</span>
                      <p className="text-slate-400 leading-relaxed">
                        min_confidence: 10% | min_score: 15 | max_open: 6 | leverage: 20x | trade_size: 15% | max_trade_risk: 0.5% | timeframe: 15m
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2b2f36] bg-[#181a20] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            {SECTIONS.findIndex((s) => s.id === activeSection) > 0 && (
              <button
                onClick={() => {
                  const idx = SECTIONS.findIndex((s) => s.id === activeSection);
                  setActiveSection(SECTIONS[idx - 1].id);
                }}
                className="flex items-center gap-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#848e9c] hover:text-[#eaecef] border border-[#2b2f36] px-3 py-1.5 rounded-lg text-xs transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span>القسم السابق</span>
              </button>
            )}
            {SECTIONS.findIndex((s) => s.id === activeSection) < SECTIONS.length - 1 && (
              <button
                onClick={() => {
                  const idx = SECTIONS.findIndex((s) => s.id === activeSection);
                  setActiveSection(SECTIONS[idx + 1].id);
                }}
                className="flex items-center gap-1 bg-[#1e2329] hover:bg-[#2b2f36] text-[#848e9c] hover:text-[#eaecef] border border-[#2b2f36] px-3 py-1.5 rounded-lg text-xs transition"
              >
                <span>القسم التالي</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1e2329] hover:bg-[#2b2f36] text-[#eaecef] border border-[#2b2f36] rounded-lg text-xs font-mono transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

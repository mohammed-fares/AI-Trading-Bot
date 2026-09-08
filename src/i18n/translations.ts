export type Language = 'ar' | 'en';

export interface Translations {
  // Brand & Header
  appTitle: string;
  version: string;
  connected: string;
  latency: string;
  statusRunning: string;
  statusPaused: string;
  statusStopped: string;
  cycleLabel: string;
  sentimentLabel: string;
  cycleUnit: string;
  idle: string;
  btnStart: string;
  btnPause: string;
  btnResume: string;
  btnStop: string;
  btnInstantCycle: string;
  btnStrategies: string;
  btnDatabase: string;
  btnSettings: string;
  btnDocs: string;
  modePaper: string;
  modeReal: string;
  modePaperDesc: string;
  modeRealDesc: string;

  // Tabs
  tabDashboard: string;
  tabProtection: string;
  tabAdaptiveAI: string;
  tabHistory: string;

  // KPIs
  kpiBalance: string;
  kpiTotalEquity: string;
  kpiDailyPnL: string;
  kpiUnrealizedPnL: string;
  kpiWinRate: string;
  kpiMarginUsage: string;
  kpiAvailableBalance: string;
  kpiDailyTrades: string;
  kpiMaxDrawdown: string;
  kpiCircuitBreakerActive: string;

  // Watchlist & Market Screener
  screenerTitle: string;
  screenerSub: string;
  watchlistTitle: string;
  scannerLive: string;
  trendLabel: string;
  colSymbol: string;
  colPrice: string;
  colChange24h: string;
  colTrend: string;
  colIndicators: string;
  colEnsembleSignal: string;
  colSignal: string;
  colAction: string;
  btnLong: string;
  btnShort: string;
  instantLong: string;
  instantShort: string;
  signalStrongLong: string;
  signalStrongShort: string;
  signalNeutral: string;

  // Active Trades Panel
  activeTradesTitle: string;
  activeTradesSub: string;
  noActiveTrades: string;
  noActiveTradesSub: string;
  colEntryPrice: string;
  colCurrentPrice: string;
  colMarginSize: string;
  colPnL: string;
  colExit: string;
  btnClose: string;
  trailingActive: string;

  // PnL Chart & Controls
  chartTitle: string;
  chartSub: string;
  cycleStepTitle: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  step6: string;
  step7: string;

  // Control Panel
  quickControlTitle: string;
  engineCommands: string;
  startBot: string;
  pauseBot: string;
  resumeBot: string;
  stopBot: string;
  capitalSettings: string;
  save: string;
  riskPerTrade: string;
  leverage: string;
  timeframe: string;
  maxOpenTrades: string;
  winStreak: string;
  lossStreak: string;
  cycleInterval: string;

  // Strategy Database Modal
  dbModalTitle: string;
  dbModalBadge: string;
  dbModalSub: string;
  dbTotalPnl: string;
  dbWinRate: string;
  dbWins: string;
  dbLosses: string;
  dbClearBtn: string;
  dbRestoreBtn: string;
  dbClearConfirmTitle: string;
  dbClearConfirmMsg: string;
  dbClearConfirmBtn: string;
  dbCancelBtn: string;
  dbFilterSymbol: string;
  dbSearchPlaceholder: string;
  dbEmpty: string;
  dbEmptySub: string;
  dbCloseBtn: string;
  dbFooterNotice: string;
  dbColWinsLosses: string;
  dbColWinRate: string;
  dbColAvgConf: string;
  dbColBest: string;
  dbColWorst: string;
  dbColTotalPnL: string;

  // Settings Modal
  settingsTitle: string;
  settingsSub: string;
  settingsTabMode: string;
  settingsTabRisk: string;
  settingsTabSignals: string;
  settingsTabExits: string;
  settingsTabDatabase: string;
  settingsPresetTitle: string;
  settingsPresetBeginner: string;
  settingsPresetAdvanced: string;
  settingsTradingModeTitle: string;
  settingsTradingModeSub: string;
  settingsPaperLabel: string;
  settingsRealLabel: string;
  settingsBinanceNetwork: string;
  settingsTestnet: string;
  settingsProduction: string;
  settingsApiKey: string;
  settingsApiSecret: string;
  settingsTestConnection: string;
  settingsTesting: string;
  settingsConnectionSuccess: string;
  settingsConnectionFailed: string;
  settingsBalance: string;
  settingsMaxDailyRisk: string;
  settingsMaxTradeRisk: string;
  settingsLeverage: string;
  settingsMaxOpen: string;
  settingsTradeSize: string;
  settingsTimeframe: string;
  settingsMinScore: string;
  settingsMinConf: string;
  settingsStopLoss: string;
  settingsTakeProfit: string;
  settingsMaxDrawdown: string;
  settingsTrendFilter: string;
  settingsSmartExit: string;
  settingsPureLearningTitle: string;
  settingsPureLearningDesc: string;
  settingsResetHistoryBtn: string;
  settingsResetBalanceBtn: string;
  settingsSaveBtn: string;
  settingsRevertBtn: string;

  // Strategy Manager Modal
  stratManagerTitle: string;
  stratManagerSub: string;
  stratActiveCount: string;
  stratSearchPlaceholder: string;
  stratAll: string;
  stratScalping: string;
  stratMomentum: string;
  stratTrend: string;
  stratSwing: string;
  stratDaily: string;
  stratEnableAll: string;
  stratDisableAll: string;

  // Protection & AI Panels
  protectionTitle: string;
  riskTitle: string;
  riskSystem1: string;
  riskSystem2: string;
  riskSystem3: string;
  riskSystem4: string;
  riskSystem5: string;
  riskSystem6: string;
  cbActive: string;
  cbInactive: string;
  adaptiveAITitle: string;
  adaptiveTitle: string;
  adaptiveReset: string;
  adaptiveDesc: string;
  adaptiveIdleCycles: string;
  adaptiveLevel1: string;
  adaptiveLevel2: string;
  adaptiveLevel3: string;
  adaptiveLevel: string;
  idleCycles: string;
  confidenceTitle: string;
  currentConfidence: string;
  consecutiveWins: string;
  consecutiveLosses: string;
  confidenceWinStreak: string;
  confidenceLossStreak: string;

  // Regime & AI Self-Learning
  regimeTitle: string;
  regimeBullTrend: string;
  regimeBearTrend: string;
  regimeRangeBound: string;
  regimeHighVol: string;
  aiLearningTitle: string;
  aiLearningSub: string;
  aiOptimizedScore: string;
  aiErrorsCorrected: string;
  aiDeepOptimizeBtn: string;
  aiDiagnosedErrorsTitle: string;
  aiLearnedLessonsTitle: string;
  aiRemedyApplied: string;
  aiNoLessons: string;
  aiStrategyExploitation: string;
  aiStrategyExploitationDesc: string;
  aiRegimeBoostTitle: string;

  // Trade History
  historyTitle: string;
  historySub: string;
  noHistory: string;
  colClosedAt: string;
  colReason: string;
  closedTradesTitle: string;
  noClosedTrades: string;
  colClosePrice: string;
  colExitReason: string;
  colStrategy: string;

  // System Logs
  logsTitle: string;
  logsCycleFlow: string;
  logsClear: string;
  logsWaiting: string;
  btnClearLogs: string;

  // Documentation
  docsTitle: string;
  docsSub: string;
  docsClose: string;

  // Precision Audit & High Assurance
  precisionAuditTitle: string;
  precisionAuditSub: string;
  precisionAuditBadge: string;
  auditPassedBadge: string;
  auditPendingBadge: string;
  auditScoreLabel: string;
  auditChecksLabel: string;
  auditSuperMajority: string;
  auditTrendCascade: string;
  auditMomentumConfluence: string;
  auditTrendStrength: string;
  auditExtensionBuffer: string;
  auditRiskReward: string;
  auditTimeFrameAlignment: string;
  auditOrderbookDepth: string;
  smartFreezeTitle: string;
  smartFreezeDesc: string;
  smartFreezeActive: string;
  orderbookDepthTitle: string;
  orderbookLiquidityWalls: string;
  tfaTitle: string;
  tfaDesc: string;
  auditMinScore: string;
  auditMinConsensus: string;
  auditMinADX: string;
  auditMinRR: string;
  breakEvenStopTitle: string;
  breakEvenStopDesc: string;
  strictAntiLossTitle: string;
  strictAntiLossDesc: string;
  symbolCooldownTitle: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    // Brand & Header
    appTitle: 'AI TRADING BOT',
    version: 'v19.0',
    connected: 'متصل بالسوق // استجابة 14ms',
    latency: '14ms',
    statusRunning: 'نشط - تداول مباشر',
    statusPaused: 'توقف مؤقت - وضع الاستعداد',
    statusStopped: 'متوقف',
    cycleLabel: 'الدورة:',
    sentimentLabel: 'المشاعر:',
    cycleUnit: 'ثانية',
    idle: 'جاهز',
    btnStart: 'بدء التداول',
    btnPause: 'توقف مؤقت',
    btnResume: 'استئناف',
    btnStop: 'إيقاف كامل',
    btnInstantCycle: 'دورة فورية',
    btnStrategies: 'الاستراتيجيات (50+)',
    btnDatabase: 'قاعدة البيانات',
    btnSettings: 'الإعدادات',
    btnDocs: 'الدليل والتوجيه',
    modePaper: 'تجريبي (Paper)',
    modeReal: 'حقيقي (Real API)',
    modePaperDesc: 'تداول تجريبي يحاكي أسعار عقود بينانس المستقبلية دون مخاطرة برأس المال',
    modeRealDesc: 'تداول حقيقي متصل بمفاتيح API في بينانس فيوتشرز مع تنفيذ حي',

    // Tabs
    tabDashboard: 'لوحة التداول المباشرة',
    tabProtection: 'الحماية وقواطع الدائرة',
    tabAdaptiveAI: 'الذكاء الاصطناعي والثقة',
    tabHistory: 'سجل الصفقات والعمليات',

    // KPIs
    kpiBalance: 'الرصيد الإجمالي',
    kpiTotalEquity: 'القيمة الكلية',
    kpiDailyPnL: 'أرباح اليوم',
    kpiUnrealizedPnL: 'الأرباح غير المحققة',
    kpiWinRate: 'نسبة النجاح',
    kpiMarginUsage: 'الهامش المستخدم',
    kpiAvailableBalance: 'الرصيد المتاح',
    kpiDailyTrades: 'صفقات اليوم',
    kpiMaxDrawdown: 'السحب الأقصى',
    kpiCircuitBreakerActive: 'قاطع الدائرة مفعل لحماية الحساب',

    // Watchlist
    screenerTitle: 'شاشة مراقبة العملات والسيولة اللحظية',
    screenerSub: 'BINANCE FUTURES USDT-M // فحص فني متعدد المؤشرات',
    watchlistTitle: 'شاشة مراقبة أزواج بينانس فيوتشرز',
    scannerLive: 'فحص حي',
    trendLabel: 'الاتجاه العام:',
    colSymbol: 'الزوج والقطاع',
    colPrice: 'السعر الحالي',
    colChange24h: 'تغير 24س',
    colTrend: 'الاتجاه العام',
    colIndicators: 'المؤشرات (RSI / MACD / ADX)',
    colEnsembleSignal: 'الإشارة المجمعة (Ensemble)',
    colSignal: 'الإشارة',
    colAction: 'تداول يدوي',
    btnLong: 'شراء (LONG)',
    btnShort: 'بيع (SHORT)',
    instantLong: 'شراء فوري LONG',
    instantShort: 'بيع فوري SHORT',
    signalStrongLong: 'شراء قوي',
    signalStrongShort: 'بيع قوي',
    signalNeutral: 'محايد',

    // Active Trades
    activeTradesTitle: 'الصفقات المفتوحة ومراقبة الأهداف',
    activeTradesSub: 'BINANCE FUTURES // متابعة حية ووقف متحرك',
    noActiveTrades: 'لا توجد صفقات مفتوحة حالياً',
    noActiveTradesSub: 'يقوم البوت بالبحث المستمر عن فرص توافق شروط الدخول. يمكنك أيضاً فتح صفقة يدوية فورية من جدول المراقبة أعلاه.',
    colEntryPrice: 'سعر الدخول',
    colCurrentPrice: 'السعر الحالي',
    colMarginSize: 'الهامش / الحجم',
    colPnL: 'الربح/الخسارة',
    colExit: 'الأهداف (SL / TP)',
    btnClose: 'إغلاق فوري',
    trailingActive: 'الوقف المتحرك نشط',

    // PnL Chart & Controls
    chartTitle: 'منحنى نمو رأس المال التراكمي (Equity Curve)',
    chartSub: 'تتبع لحظي للرصيد مع كل دورة تنفيذ وإغلاق صفقة',
    cycleStepTitle: 'مراحل دورة عمل البوت المتكاملة (7 خطوات)',
    step1: '1. تحديث الصفقات المفتوحة وفحص Smart Exit',
    step2: '2. فحص السحب الأقصى وقاطع الدائرة',
    step3: '3. فحص التكيف التلقائي للذكاء الاصطناعي',
    step4: '4. تحديث المؤشرات الفنية لأزواج العملات',
    step5: '5. حساب الإشارات المجمعة وأوزان الاستراتيجيات',
    step6: '6. إدارة المخاطر وتحديد حجم المركز (Kelly/ATR)',
    step7: '7. تنفيذ الأوامر وحفظ الأداء في قاعدة البيانات',

    // Control Panel
    quickControlTitle: 'لوحة التحكم والتشغيل السريع',
    engineCommands: 'أوامر المحرك:',
    startBot: 'بدء التشغيل',
    pauseBot: 'إيقاف مؤقت',
    resumeBot: 'استئناف',
    stopBot: 'إيقاف كلي',
    capitalSettings: 'إعدادات رأس المال والرافعة:',
    save: 'حفظ',
    riskPerTrade: 'المخاطرة لكل صفقة (%)',
    leverage: 'الرافعة المالية',
    timeframe: 'الإطار الزمني الأساسي',
    maxOpenTrades: 'أقصى عدد صفقات مفتوحة',
    winStreak: 'متتالية الأرباح',
    lossStreak: 'متتالية الخسائر',
    cycleInterval: 'مدة الدورة (ثانية)',

    // Strategy Database Modal
    dbModalTitle: 'قاعدة بيانات أداء الاستراتيجيات والتعلم الآلي',
    dbModalBadge: 'ذاكرة البوت التكيفية',
    dbModalSub: 'توثيق دقيق لنتائج كل استراتيجية وكل زوج عملات لحساب الأوزان التكيفية والتعلم الذاتي المستمر',
    dbTotalPnl: 'إجمالي الأرباح المسجلة',
    dbWinRate: 'نسبة النجاح الكلية',
    dbWins: 'صفقات رابحة',
    dbLosses: 'صفقات خاسرة',
    dbClearBtn: 'تفريغ قاعدة البيانات (بدء التعلم من الصفر)',
    dbRestoreBtn: 'استعادة البيانات القياسية (Benchmark)',
    dbClearConfirmTitle: 'تأكيد تفريغ قاعدة البيانات والبدء من الصفر',
    dbClearConfirmMsg: 'هل أنت متأكد من تفريغ كافة سجلات الاستراتيجيات والصفقات؟ سيبدأ البوت بالتعلم الذاتي الخالص بناءً على نتائجه المباشرة الخاصة فقط دون الاعتماد على أي بيانات سابقة.',
    dbClearConfirmBtn: 'نعم، تفريغ وبدء التعلم من الصفر',
    dbCancelBtn: 'إلغاء',
    dbFilterSymbol: 'تصفية حسب الزوج:',
    dbSearchPlaceholder: 'ابحث عن استراتيجية...',
    dbEmpty: 'قاعدة البيانات فارغة حالياً (وضع التعلم الذاتي الخالص)',
    dbEmptySub: 'البوت جاهز لتوثيق نتائجه الخاصة. بمجرد إغلاق أول صفقة تداول ستظهر إحصائيات الأداء التفصيلية هنا.',
    dbCloseBtn: 'إغلاق',
    dbFooterNotice: 'يتم تحديث هذه البيانات تلقائياً مع كل صفقة مغلقة لتغذية محرك الترجيح الذكي وتدريب الأوزان.',
    dbColWinsLosses: 'الصفقات (ربح / خسارة)',
    dbColWinRate: 'نسبة الفوز',
    dbColAvgConf: 'متوسط الثقة',
    dbColBest: 'أفضل صفقة',
    dbColWorst: 'أسوأ صفقة',
    dbColTotalPnL: 'صافي الأرباح',

    // Settings Modal
    settingsTitle: 'إعدادات البوت والاتصال وإدارة المخاطر',
    settingsSub: 'ضبط وضع التداول، مفاتيح API، معايير المخاطرة، وإدارة قاعدة البيانات',
    settingsTabMode: 'وضع التداول وAPI',
    settingsTabRisk: 'المخاطرة والرافعة',
    settingsTabSignals: 'الإشارات والثقة',
    settingsTabExits: 'وقف الخسارة والخروج',
    settingsTabDatabase: 'قاعدة البيانات والذاكرة',
    settingsPresetTitle: 'تكوينات جاهزة مقترحة:',
    settingsPresetBeginner: 'محافظ (للمبتدئين)',
    settingsPresetAdvanced: 'جريء (للمحترفين)',
    settingsTradingModeTitle: 'وضع تنفيذ التداول',
    settingsTradingModeSub: 'التبديل بين التداول التجريبي المحاكي والتداول الحي الحقيقي على Binance Futures',
    settingsPaperLabel: 'تداول تجريبي (Paper Trading)',
    settingsRealLabel: 'تداول حقيقي (Live Binance API)',
    settingsBinanceNetwork: 'شبكة بينانس فيوتشرز:',
    settingsTestnet: 'شبكة بينانس التجريبية (Binance Futures Testnet)',
    settingsProduction: 'شبكة بينانس الحقيقية (Binance Futures Production)',
    settingsApiKey: 'مفتاح API بينانس (Binance API Key):',
    settingsApiSecret: 'المفتاح السري (Binance API Secret):',
    settingsTestConnection: 'فحص الاتصال بـ Binance API',
    settingsTesting: 'جاري فحص الاتصال...',
    settingsConnectionSuccess: 'تم الاتصال بنجاح! تم التحقق من استجابة خوادم بينانس.',
    settingsConnectionFailed: 'فشل الاتصال. يرجى التأكد من صحة المفاتيح والشبكة.',
    settingsBalance: 'رأس المال المخصص (USDT):',
    settingsMaxDailyRisk: 'أقصى مخاطرة يومية إجمالية (%):',
    settingsMaxTradeRisk: 'أقصى مخاطرة للصفقة الواحدة (%):',
    settingsLeverage: 'الرافعة المالية الافتراضية:',
    settingsMaxOpen: 'الحد الأقصى للصفقات المفتوحة المتزامنة:',
    settingsTradeSize: 'حجم الصفقة كنسبة من الرصيد (%):',
    settingsTimeframe: 'الإطار الزمني الافتراضي:',
    settingsMinScore: 'الحد الأدنى لنقاط الإشارة (Min Score):',
    settingsMinConf: 'الحد الأدنى للثقة المطلوبة (%):',
    settingsStopLoss: 'وقف الخسارة المبدئي (%):',
    settingsTakeProfit: 'جني الأرباح المبدئي (%):',
    settingsMaxDrawdown: 'السحب الأقصى المسموح للحساب (%):',
    settingsTrendFilter: 'تفعيل فلتر الاتجاه العام (يمنع الصفقات المعاكسة)',
    settingsSmartExit: 'تفعيل الخروج الذكي (وقف متحرك وخروج زمني)',
    settingsPureLearningTitle: 'وضع التعلم الذاتي الخالص (Pure Self-Learning):',
    settingsPureLearningDesc: 'عند تفعيله، يتجاهل البوت أي بيانات سابقة مسجلة مسبقاً، ويبني قراراته وقاعدة بياناته حصرياً بناءً على نتائجه الحقيقية.',
    settingsResetHistoryBtn: 'تفريغ قاعدة البيانات ومسح السجلات',
    settingsResetBalanceBtn: 'إعادة ضبط الرصيد إلى القيمة الأصلية',
    settingsSaveBtn: 'حفظ وتطبيق الإعدادات',
    settingsRevertBtn: 'تراجع عن التعديلات',

    // Strategy Manager Modal
    stratManagerTitle: 'إدارة 50+ استراتيجية تداول خوارزمية',
    stratManagerSub: 'تفعيل/تعطيل الاستراتيجيات وضبط الأوزان النسبية للتصويت التجميعي',
    stratActiveCount: 'استراتيجيات مفعلة',
    stratSearchPlaceholder: 'ابحث باسم الاستراتيجية أو المؤشرات...',
    stratAll: 'الكل',
    stratScalping: 'سكالبينج (1m-5m)',
    stratMomentum: 'زخم (15m)',
    stratTrend: 'تتبع الاتجاه (1h)',
    stratSwing: 'سوينغ (4h)',
    stratDaily: 'يومي (1d)',
    stratEnableAll: 'تفعيل الكل',
    stratDisableAll: 'تعطيل الكل',

    // Protection & AI Panels
    protectionTitle: 'أنظمة حماية الحساب وقواطع الدائرة',
    riskTitle: 'أنظمة إدارة المخاطر والحماية الستة المتكاملة',
    riskSystem1: 'نظام إدارة المخاطر (0.3% صفقة / 2.0% يومياً)',
    riskSystem2: 'قاطع الدائرة الآلي (Circuit Breaker)',
    riskSystem3: 'حماية السحب الأقصى (Max Drawdown 10%)',
    riskSystem4: 'الخروج الذكي (Smart Exit & Trailing Stop)',
    riskSystem5: 'فلتر الاتجاه العام الصارم (Macro Trend Filter)',
    riskSystem6: 'تحديد حجم المراكز التكيفي (Kelly Criterion & ATR)',
    cbActive: 'مفعل - تم تعليق التداول لحماية رأس المال',
    cbInactive: 'طبيعي - أنظمة الحماية في وضع الاستعداد',
    adaptiveAITitle: 'محرك الذكاء الاصطناعي التكيفي (Adaptive AI)',
    adaptiveTitle: 'محرك التكيف التلقائي للذكاء الاصطناعي',
    adaptiveReset: 'إعادة ضبط التكيف',
    adaptiveDesc: 'يقوم البوت تلقائياً بتعديل شروط الدخول وتخفيف القيود عند هدوء السوق وتراجع الفرص (بعد 5 دورات متتالية خاملة)',
    adaptiveIdleCycles: 'الدورات الخاملة المتتالية',
    adaptiveLevel1: 'المستوى 1: خفض الثقة بنسبة 1% ونقاط الإشارة بمقدار 5 مع زيادة الصفقات المفتوحة',
    adaptiveLevel2: 'المستوى 2: خفض إضافي للثقة وتوسيع نطاق الفرص المقبولة',
    adaptiveLevel3: 'المستوى 3: إيقاف فلتر الاتجاه مؤقتاً لاقتناص فرص الارتداد المعاكس',
    adaptiveLevel: 'المستوى التكيفي الحالي',
    idleCycles: 'دورات خاملة متتالية',
    confidenceTitle: 'مدير الثقة التكيفية (Confidence Manager)',
    currentConfidence: 'نسبة الثقة المطلوبة حالياً',
    consecutiveWins: 'صفقات رابحة متتالية',
    consecutiveLosses: 'صفقات خاسرة متتالية',
    confidenceWinStreak: 'رفع الثقة تلقائياً بعد 5 صفقات رابحة متتالية (+5%)',
    confidenceLossStreak: 'خفض الثقة التلقائي الوقائي بعد 3 صفقات خاسرة (-10%)',

    // Regime & AI Self-Learning
    regimeTitle: 'نظام وبيئة السوق العامة (Market Regime)',
    regimeBullTrend: 'اتجاه صاعد قوي (Bull Trend)',
    regimeBearTrend: 'اتجاه هابط حاد (Bear Trend)',
    regimeRangeBound: 'نطاق عرضي وتماسك (Range-Bound)',
    regimeHighVol: 'تذبذب واختراق سعري عالي (High Volatility)',
    aiLearningTitle: 'محرك التعلم الذاتي وتشخيص الأخطاء بالذكاء الاصطناعي',
    aiLearningSub: 'يقوم الذكاء الاصطناعي بتحليل أسباب الخروج لكل صفقة وتصحيح أوزان الاستراتيجيات تلقائياً',
    aiOptimizedScore: 'معدل جودة التحسين الذاتي',
    aiErrorsCorrected: 'الأخطاء المصححة ذاتياً',
    aiDeepOptimizeBtn: 'تشغيل تحسين وتدريب عميق للأوزان',
    aiDiagnosedErrorsTitle: 'تشخيص أخطاء الصفقات والإجراءات التصحيحية',
    aiLearnedLessonsTitle: 'سجل الدروس المستفادة والقرارات التصحيحية',
    aiRemedyApplied: 'تم التطبيق',
    aiNoLessons: 'لا توجد دروس مسجلة بعد - سيتعلم البوت تلقائياً فور إغلاق الصفقات',
    aiStrategyExploitation: 'الاستغلال الذكي للاستراتيجيات الـ 50+',
    aiStrategyExploitationDesc: 'يقوم البوت برفع أوزان الاستراتيجيات الرابحة وتكييفها فورياً مع نظام السوق السائد',
    aiRegimeBoostTitle: 'مضاعف الترجيح حسب بيئة السوق',

    // Trade History
    historyTitle: 'سجل الصفقات المغلقة والتنفيذ',
    historySub: 'سجل تدقيق كامل للصفقات المنتهية مع أسباب الخروج وصافي الربح',
    noHistory: 'لا توجد صفقات مغلقة حتى الآن',
    colClosedAt: 'وقت الإغلاق',
    colReason: 'سبب الخروج',
    closedTradesTitle: 'سجل الصفقات المنتهية',
    noClosedTrades: 'لا توجد صفقات منتهية حالياً',
    colClosePrice: 'سعر الإغلاق',
    colExitReason: 'سبب الخروج',
    colStrategy: 'الاستراتيجية المستخدمة',

    // System Logs
    logsTitle: 'سجل قرارات البوت والأحداث اللحظية',
    logsCycleFlow: 'خطوات دورة التنفيذ اللحظية:',
    logsClear: 'مسح السجلات',
    logsWaiting: 'في انتظار بدء دورة التداول القادمة...',
    btnClearLogs: 'مسح السجلات',

    // Documentation
    docsTitle: 'دليل تشغيل البوت والأنظمة المتكاملة v19.0',
    docsSub: 'توثيق شامل للهيكلية، الاستراتيجيات، إدارة المخاطر، وإرشادات الرفع على الاستضافة',
    docsClose: 'إغلاق الدليل',

    // Precision Audit & High Assurance
    precisionAuditTitle: 'نظام التدقيق والفحص الفائق لصفقات عالية الدقة',
    precisionAuditSub: 'فلترة واختبار 6 معايير فنية صارمة لضمان أعلى نسبة نجاح قبل فتح أي صفقة',
    precisionAuditBadge: 'تدقيق فائق (Ultra Precision)',
    auditPassedBadge: 'صفقة معتمدة 🛡️',
    auditPendingBadge: 'قيد الفحص ⚠️',
    auditScoreLabel: 'درجة التدقيق',
    auditChecksLabel: 'معايير الفحص الفني الستة',
    auditSuperMajority: 'إجماع كاسح للاستراتيجيات',
    auditTrendCascade: 'تسلسل الاتجاه والمتوسطات',
    auditMomentumConfluence: 'توافق الزخم (RSI & MACD)',
    auditTrendStrength: 'قوة الاتجاه وفلتر التذبذب (ADX)',
    auditExtensionBuffer: 'حيز الحركة وتجنب الامتداد',
    auditRiskReward: 'نسبة العائد للمخاطرة (R:R)',
    auditTimeFrameAlignment: 'توافق الأطر الزمنية (15m / 1h / 4h)',
    auditOrderbookDepth: 'عمق دفتر أوامر بينانس وجدران السيولة',
    smartFreezeTitle: 'نظام التجميد الذكي للحماية من التذبذب الحاد (15m)',
    smartFreezeDesc: 'تعليق فوري للتداول على أي عملة تشهد تقلبات سعرية شاذة تفوق الحد الآمن لحماية رأس المال',
    smartFreezeActive: 'تجميد ذكي نشط ❄️',
    orderbookDepthTitle: 'تحليل عمق دفتر الأوامر (Binance Orderbook Depth)',
    orderbookLiquidityWalls: 'جدران السيولة المعترضة (Liquidity Walls)',
    tfaTitle: 'توافق الأطر الزمنية المتعددة (MTF Cascade)',
    tfaDesc: 'ضمان توافق اتجاه الدخول (15m) مع الاتجاه المتوسط (1h) والاتجاه الكلي الأكبر (4h)',
    auditMinScore: 'الحد الأدنى لدرجة التدقيق',
    auditMinConsensus: 'الحد الأدنى لإجماع الاستراتيجيات',
    auditMinADX: 'الحد الأدنى لقوة الاتجاه (ADX)',
    auditMinRR: 'الحد الأدنى لنسبة العائد للمخاطرة',
    breakEvenStopTitle: 'نقل الوقف لسعر الدخول (Break-Even Stop)',
    breakEvenStopDesc: 'تفعيل نقل وقف الخسارة تلقائياً لنقطة الدخول +0.12% بمجرد تحقيق ربح لمنع أي خسارة على الإطلاق',
    strictAntiLossTitle: 'فلتر منع الخسائر الصارم (Anti-Loss Shield)',
    strictAntiLossDesc: 'حظر الصفقات دون متوسط 200 وحظر الشراء عند القمم (RSI > 62) أو البيع عند القيعان (RSI < 38)',
    symbolCooldownTitle: 'فترة تبريد الرمز بعد الخسارة (دقائق)',
  },
  en: {
    // Brand & Header
    appTitle: 'AI TRADING BOT',
    version: 'v19.0',
    connected: 'CONNECTED // 14ms latency',
    latency: '14ms',
    statusRunning: 'ACTIVE - LIVE TRADING',
    statusPaused: 'PAUSED - STANDBY',
    statusStopped: 'STOPPED',
    cycleLabel: 'CYCLE:',
    sentimentLabel: 'SENTIMENT:',
    cycleUnit: 's',
    idle: 'IDLE',
    btnStart: 'Start Trading',
    btnPause: 'Pause',
    btnResume: 'Resume',
    btnStop: 'Emergency Stop',
    btnInstantCycle: 'Instant Cycle',
    btnStrategies: 'Strategies (50+)',
    btnDatabase: 'Database',
    btnSettings: 'Settings',
    btnDocs: 'Documentation',
    modePaper: 'Paper Trading',
    modeReal: 'Real Live API',
    modePaperDesc: 'Simulated environment mirroring Binance Futures with zero financial risk',
    modeRealDesc: 'Live execution on Binance Futures accounts via official API keys',

    // Tabs
    tabDashboard: 'Live Trading Dashboard',
    tabProtection: 'Protection & Circuit Breakers',
    tabAdaptiveAI: 'Adaptive AI & Confidence',
    tabHistory: 'Trade History & Audit Logs',

    // KPIs
    kpiBalance: 'Account Balance',
    kpiTotalEquity: 'Total Equity',
    kpiDailyPnL: 'Daily PnL',
    kpiUnrealizedPnL: 'Unrealized PnL',
    kpiWinRate: 'Win Rate',
    kpiMarginUsage: 'Margin Usage',
    kpiAvailableBalance: 'Available Balance',
    kpiDailyTrades: 'Daily Trades',
    kpiMaxDrawdown: 'Max Drawdown',
    kpiCircuitBreakerActive: 'Circuit Breaker Triggered - Safety Locked',

    // Watchlist
    screenerTitle: 'Live Market Screener & Liquidity Monitor',
    screenerSub: 'BINANCE FUTURES USDT-M // Multi-indicator Technical Analysis',
    watchlistTitle: 'Binance Futures Watchlist & Market Screener',
    scannerLive: 'LIVE FEED',
    trendLabel: 'Macro Trend:',
    colSymbol: 'Pair & Sector',
    colPrice: 'Current Price',
    colChange24h: '24h Change',
    colTrend: 'Macro Trend',
    colIndicators: 'Technicals (RSI / MACD / ADX)',
    colEnsembleSignal: 'Ensemble Signal',
    colSignal: 'Signal',
    colAction: 'Manual Action',
    btnLong: 'BUY / LONG',
    btnShort: 'SELL / SHORT',
    instantLong: 'Instant BUY / LONG',
    instantShort: 'Instant SELL / SHORT',
    signalStrongLong: 'Strong Long',
    signalStrongShort: 'Strong Short',
    signalNeutral: 'Neutral',

    // Active Trades
    activeTradesTitle: 'Active Positions & Smart Exit Monitor',
    activeTradesSub: 'BINANCE FUTURES // Real-time Tracking & Trailing Stops',
    noActiveTrades: 'No Active Positions Currently',
    noActiveTradesSub: 'The bot is continuously scanning market opportunities based on entry criteria. You can also trigger manual trades from the watchlist above.',
    colEntryPrice: 'Entry Price',
    colCurrentPrice: 'Mark Price',
    colMarginSize: 'Margin / Size',
    colPnL: 'PnL (USD / %)',
    colExit: 'Exit Targets (SL / TP)',
    btnClose: 'Close Now',
    trailingActive: 'Trailing Stop Active',

    // PnL Chart & Controls
    chartTitle: 'Portfolio Equity Curve & Growth',
    chartSub: 'Real-time account balance tracking per execution cycle and closed trade',
    cycleStepTitle: 'Bot 7-Step Lifecycle Pipeline',
    step1: '1. Active Trades & Smart Exit check',
    step2: '2. Drawdown & Circuit Breaker audit',
    step3: '3. AI Market Adaptation evaluation',
    step4: '4. Asset Technicals & Trend scan',
    step5: '5. Ensemble Signal & Strategy weights',
    step6: '6. Risk management & Position sizing',
    step7: '7. Order execution & Performance update',

    // Control Panel
    quickControlTitle: 'Quick Controls & Engine Operations',
    engineCommands: 'Engine Commands:',
    startBot: 'Start Bot',
    pauseBot: 'Pause Bot',
    resumeBot: 'Resume Bot',
    stopBot: 'Emergency Stop',
    capitalSettings: 'Capital & Leverage Setup:',
    save: 'Save',
    riskPerTrade: 'Risk Per Trade (%)',
    leverage: 'Leverage',
    timeframe: 'Primary Timeframe',
    maxOpenTrades: 'Max Open Trades',
    winStreak: 'Win Streak',
    lossStreak: 'Loss Streak',
    cycleInterval: 'Cycle Interval (s)',

    // Strategy Database Modal
    dbModalTitle: 'Strategy Performance Database (ML Memory)',
    dbModalBadge: 'Dynamic Ensemble Learning Memory',
    dbModalSub: 'Granular tracking of win rates and net profits per strategy and symbol to guide dynamic weighting',
    dbTotalPnl: 'Total Recorded PnL',
    dbWinRate: 'Overall Win Rate',
    dbWins: 'Winning Trades',
    dbLosses: 'Losing Trades',
    dbClearBtn: 'Clear Database (Learn from Scratch)',
    dbRestoreBtn: 'Restore Benchmark Data',
    dbClearConfirmTitle: 'Confirm Database Purge',
    dbClearConfirmMsg: 'Are you sure you want to purge all strategy records and trade history? The bot will start completely from scratch, recording purely its own future live results without any legacy data.',
    dbClearConfirmBtn: 'Yes, Purge and Start from Scratch',
    dbCancelBtn: 'Cancel',
    dbFilterSymbol: 'Filter by Symbol:',
    dbSearchPlaceholder: 'Search strategy...',
    dbEmpty: 'Database is currently empty (Pure Self-Learning Mode)',
    dbEmptySub: 'The bot is ready to record its own fresh track record. As soon as the first trade closes, detailed performance statistics will appear here.',
    dbCloseBtn: 'Close',
    dbFooterNotice: 'Data is automatically updated upon every position closure to train the machine learning ensemble weights.',
    dbColWinsLosses: 'Trades (Wins / Losses)',
    dbColWinRate: 'Win Rate',
    dbColAvgConf: 'Avg Confidence',
    dbColBest: 'Best Trade',
    dbColWorst: 'Worst Trade',
    dbColTotalPnL: 'Net Total PnL',

    // Settings Modal
    settingsTitle: 'Bot Configuration & Risk Parameters',
    settingsSub: 'Configure trading mode, API credentials, risk limits, and safety filters',
    settingsTabMode: 'Trading Mode & API',
    settingsTabRisk: 'Risk & Leverage',
    settingsTabSignals: 'Signals & Confidence',
    settingsTabExits: 'SL/TP & Smart Exits',
    settingsTabDatabase: 'Database & Memory',
    settingsPresetTitle: 'Recommended Presets:',
    settingsPresetBeginner: 'Conservative (Beginner)',
    settingsPresetAdvanced: 'Aggressive (Advanced)',
    settingsTradingModeTitle: 'Trading Execution Mode',
    settingsTradingModeSub: 'Toggle between risk-free paper simulation and live Binance Futures execution',
    settingsPaperLabel: 'Paper Trading (Simulation)',
    settingsRealLabel: 'Real Trading (Live Binance API)',
    settingsBinanceNetwork: 'Binance Futures Network:',
    settingsTestnet: 'Binance Futures Testnet',
    settingsProduction: 'Binance Futures Live Production',
    settingsApiKey: 'Binance API Key:',
    settingsApiSecret: 'Binance API Secret:',
    settingsTestConnection: 'Test Binance API Connection',
    settingsTesting: 'Verifying connection...',
    settingsConnectionSuccess: 'Connection successful! Server response verified.',
    settingsConnectionFailed: 'Connection failed. Please check your credentials and network.',
    settingsBalance: 'Initial Balance (USDT):',
    settingsMaxDailyRisk: 'Max Daily Risk (%):',
    settingsMaxTradeRisk: 'Max Trade Risk (%):',
    settingsLeverage: 'Default Leverage:',
    settingsMaxOpen: 'Max Open Positions:',
    settingsTradeSize: 'Trade Size (% of Balance):',
    settingsTimeframe: 'Default Timeframe:',
    settingsMinScore: 'Minimum Signal Score:',
    settingsMinConf: 'Minimum Required Confidence (%):',
    settingsStopLoss: 'Stop Loss (%):',
    settingsTakeProfit: 'Take Profit (%):',
    settingsMaxDrawdown: 'Max Account Drawdown (%):',
    settingsTrendFilter: 'Enable Trend Filter (Blocks trades counter to macro trend)',
    settingsSmartExit: 'Enable Smart Exit (Trailing stops & time-based exits)',
    settingsPureLearningTitle: 'Pure Self-Learning Mode:',
    settingsPureLearningDesc: 'When enabled, the bot disregards pre-filled benchmark data and records strategy statistics strictly from its own live trading history.',
    settingsResetHistoryBtn: 'Purge Database & Reset History',
    settingsResetBalanceBtn: 'Reset Balance to Initial Amount',
    settingsSaveBtn: 'Save & Apply Settings',
    settingsRevertBtn: 'Revert Changes',

    // Strategy Manager Modal
    stratManagerTitle: '50+ Algorithmic Strategies Manager',
    stratManagerSub: 'Enable/disable strategies and configure weights for ensemble voting',
    stratActiveCount: 'Active Strategies',
    stratSearchPlaceholder: 'Search by strategy name or indicators...',
    stratAll: 'All',
    stratScalping: 'Scalping (1m-5m)',
    stratMomentum: 'Momentum (15m)',
    stratTrend: 'Trend Following (1h)',
    stratSwing: 'Swing (4h)',
    stratDaily: 'Daily (1d)',
    stratEnableAll: 'Enable All',
    stratDisableAll: 'Disable All',

    // Protection & AI Panels
    protectionTitle: 'Account Protection & Circuit Breakers',
    riskTitle: 'Integrated 6-Layer Risk & Safety Protections',
    riskSystem1: 'Strict Capital Risk Limits (0.3% per trade / 2.0% daily max)',
    riskSystem2: 'Automated Circuit Breaker (halts on 5 losses or 10 daily)',
    riskSystem3: 'Portfolio Drawdown Sentinel (10% max drawdown ceiling)',
    riskSystem4: 'Smart Multi-Condition Exit & Trailing Stop Engine',
    riskSystem5: 'Triple EMA Trend Alignment Filter (Blocks counter-trend trades)',
    riskSystem6: 'Adaptive Position Sizing via Half-Kelly & ATR Volatility',
    cbActive: 'Triggered - Trading suspended to protect capital',
    cbInactive: 'Normal - Protections on standby',
    adaptiveAITitle: 'Adaptive AI Market Engine',
    adaptiveTitle: 'Adaptive AI Engine Controller',
    adaptiveReset: 'Reset AI Adaptive Settings',
    adaptiveDesc: 'The bot automatically relaxes filter thresholds when market opportunities dry up (after 5 consecutive idle cycles).',
    adaptiveIdleCycles: 'Consecutive Idle Cycles',
    adaptiveLevel1: 'Level 1: Lower confidence threshold by 1% and minimum score by 5 points',
    adaptiveLevel2: 'Level 2: Further confidence relaxation and expanded opportunity pool',
    adaptiveLevel3: 'Level 3: Temporarily bypass trend filter to capture counter-trend reversals',
    adaptiveLevel: 'Current Adaptation Level',
    idleCycles: 'Consecutive Idle Cycles',
    confidenceTitle: 'Adaptive Confidence Manager',
    currentConfidence: 'Dynamic Required Confidence',
    consecutiveWins: 'Consecutive Wins',
    consecutiveLosses: 'Consecutive Losses',
    confidenceWinStreak: 'Automatic confidence upgrade after 5 consecutive wins (+5%)',
    confidenceLossStreak: 'Protective confidence downgrade after 3 consecutive losses (-10%)',

    // Regime & AI Self-Learning
    regimeTitle: 'Macro Market Regime Detection',
    regimeBullTrend: 'Strong Bullish Trend',
    regimeBearTrend: 'Sharp Bearish Trend',
    regimeRangeBound: 'Consolidation & Range-Bound',
    regimeHighVol: 'High Volatility & Breakout',
    aiLearningTitle: 'AI Self-Learning & Error Diagnostics Engine',
    aiLearningSub: 'Autonomous post-mortem analysis of every closed trade with automatic strategy weight corrections',
    aiOptimizedScore: 'Self-Optimization Score',
    aiErrorsCorrected: 'Auto-Corrected Errors',
    aiDeepOptimizeBtn: 'Run Deep AI Weight Optimization',
    aiDiagnosedErrorsTitle: 'Trade Error Diagnoses & Remedial Actions',
    aiLearnedLessonsTitle: 'Learned Lessons & Adaptive Adjustments Log',
    aiRemedyApplied: 'APPLIED',
    aiNoLessons: 'No lessons recorded yet - the bot will learn autonomously as trades complete',
    aiStrategyExploitation: '50+ Strategy Dynamic Exploitation',
    aiStrategyExploitationDesc: 'The AI amplifies top-performing strategies and adjusts weights to the prevailing market regime',
    aiRegimeBoostTitle: 'Regime Weight Multiplier',

    // Trade History
    historyTitle: 'Closed Trades & Execution History',
    historySub: 'Audit log of all finalized trades with exit reasons and net profit',
    noHistory: 'No closed trades recorded yet',
    colClosedAt: 'Closed At',
    colReason: 'Exit Reason',
    closedTradesTitle: 'Closed Trades History',
    noClosedTrades: 'No closed trades recorded yet',
    colClosePrice: 'Close Price',
    colExitReason: 'Exit Reason',
    colStrategy: 'Strategy Used',

    // System Logs
    logsTitle: 'Real-Time System & Decision Logs',
    logsCycleFlow: 'Active cycle execution sequence:',
    logsClear: 'Clear Logs',
    logsWaiting: 'Waiting for next trading cycle...',
    btnClearLogs: 'Clear Logs',

    // Documentation
    docsTitle: 'Bot System Manual & Operations Guide v19.0',
    docsSub: 'Architecture overview, 50+ strategy logic, risk guidelines, and hosting deployment',
    docsClose: 'Close Manual',

    // Precision Audit & High Assurance
    precisionAuditTitle: 'High-Precision Trade Verification & Scrutiny Engine',
    precisionAuditSub: 'Filtering and testing 6 rigorous technical criteria to ensure maximum probability before opening trades',
    precisionAuditBadge: 'Ultra Precision',
    auditPassedBadge: 'Verified 🛡️',
    auditPendingBadge: 'Auditing ⚠️',
    auditScoreLabel: 'Audit Score',
    auditChecksLabel: '6 Technical Quality Pillars',
    auditSuperMajority: 'Super-Majority Strategy Consensus',
    auditTrendCascade: 'Trend & Moving Average Cascade',
    auditMomentumConfluence: 'Momentum Confluence (RSI & MACD)',
    auditTrendStrength: 'Trend Velocity & ADX Strength',
    auditExtensionBuffer: 'Volatility Clearance Buffer',
    auditRiskReward: 'Asymmetric Risk-to-Reward Ratio',
    auditTimeFrameAlignment: 'Time-Frame Alignment (15m / 1h / 4h)',
    auditOrderbookDepth: 'Binance Orderbook & Liquidity Walls',
    smartFreezeTitle: 'Smart Freeze Volatility Protection (15m)',
    smartFreezeDesc: 'Immediately freezes trading on symbols exhibiting abnormal 15m price swings above threshold',
    smartFreezeActive: 'Smart Freeze Active ❄️',
    orderbookDepthTitle: 'Binance Orderbook Depth Analysis',
    orderbookLiquidityWalls: 'Opposing Liquidity Walls',
    tfaTitle: 'Multi-Timeframe Alignment (MTF Cascade)',
    tfaDesc: 'Guarantees tactical 15m entry aligns with 1h intermediate and 4h macro direction',
    auditMinScore: 'Min Audit Score',
    auditMinConsensus: 'Min Strategy Consensus',
    auditMinADX: 'Min ADX Strength',
    auditMinRR: 'Min Risk-Reward Ratio',
    breakEvenStopTitle: 'Break-Even Stop Protection',
    breakEvenStopDesc: 'Auto-shifts Stop Loss to Entry +0.12% once trade enters profit to guarantee zero loss',
    strictAntiLossTitle: 'Strict Anti-Loss Shield',
    strictAntiLossDesc: 'Enforces EMA200 alignment and blocks top buying (RSI > 62) and bottom shorting (RSI < 38)',
    symbolCooldownTitle: 'Symbol Loss Cooldown (Minutes)',
  },
};

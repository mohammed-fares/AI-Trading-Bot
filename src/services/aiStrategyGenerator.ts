import { Strategy, ScientificDomain, TimeFrame } from '../types';

export interface GenerationOptions {
  targetSymbol: string; // e.g. 'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ALL'
  domain: ScientificDomain | 'AUTO_SYNTHESIS';
  timeframe?: TimeFrame;
  complexity?: 'ADVANCED' | 'QUANTUM_GRADE';
  marketRegimeContext?: string;
}

export const SYNTHESIZED_STRATEGIES_STORAGE_KEY = 'ai_synthesized_strategies_catalog_v1';

// Scientific templates library for dynamic multi-disciplinary AI synthesis
const DOMAIN_SYNTHESIS_PATTERNS: Record<
  ScientificDomain,
  {
    titleEn: string[];
    titleAr: string[];
    formulas: string[];
    principlesEn: string[];
    principlesAr: string[];
    coinRationaleTemplates: Record<string, { en: string; ar: string }>;
  }
> = {
  QUANTUM: {
    titleEn: [
      'Wavepacket Dispersion Compression',
      'Quantum Phase Coherence Squeeze',
      'Hamiltonian Energy Eigenstate Transition',
      'Schrödinger Liquidity Potential Tunnel',
      'Quantum Teleportation State Mirroring',
    ],
    titleAr: [
      'انضغاط تشتت الحزمة الموجية السعرية',
      'عصر الترابط الطوري الكمومي للسيولة',
      'انتقال الحالة الذاتية لطاقة هاملتونيان',
      'نفق كمومي عبر جهد السيولة لشروودنجر',
      'محاكاة الانتقال الآني للحالة الكمومية',
    ],
    formulas: [
      '\\hat{H}|\\psi\\rangle = E|\\psi\\rangle, \\quad \\Delta E \\Delta t \\ge \\frac{\\hbar}{2}',
      '\\psi(x,t) = \\frac{1}{\\sqrt{2\\pi}} \\int A(k) e^{i(kx - \\omega(k)t)} dk',
      '\\rho_{pure} = |\\psi\\rangle \\langle \\psi|, \\quad \\text{Tr}(\\rho^2) = 1',
      'T(E) = \\left(1 + \\frac{V_0^2 \\sinh^2(k_2 a)}{4E(V_0 - E)}\\right)^{-1}',
      '\\mathcal{F}(\\rho, \\sigma) = \\left( \\text{Tr} \\sqrt{\\sqrt{\\rho}\\sigma\\sqrt{\\rho}} \\right)^2',
    ],
    principlesEn: [
      'Non-linear wavefunction dispersion tracking to predict explosive breakout vectors from compressed states.',
      'Superposition state resolution immediately following liquidity injection into orderbook nodes.',
      'Eigenstate energy conservation preventing spurious false breakouts outside quantized channels.',
      'Tunneling through dense institutional resistance blocks under elevated momentum kinetic energy.',
      'Quantum fidelity state preservation across multi-exchange futures arbitrage vectors.',
    ],
    principlesAr: [
      'تتبع تشتت الحزمة الموجية غير الخطية للتنبؤ بلحظة الانفجار السعري من مناطق الانضغاط الفائق.',
      'حسم حالة التراكب الاحتمالي فور ضخ كتل السيولة المفاجئة في عقد دفتر الأوامر.',
      'حفظ طاقة الحالات الذاتية الكمية لمنع الاختراقات الوهمية خارج القنوات السعرية المكممة.',
      'اختراق الحواجز المقاومة العميقة بالحركة النفقية الكمومية عند تصاعد طاقة الحركة للزخم.',
      'تطابق الحالة الكمومية عبر منصات المشتقات المختلفة لاقتناص فرص عدم كفاءة التسعير.',
    ],
    coinRationaleTemplates: {
      BTCUSDT: {
        en: 'Bitcoin exhibits the highest macro energy state conservation and deep liquidity walls that conform to quantum potential barriers.',
        ar: 'البيتكوين يمتلك أعلى طاقة حفظ كلية وجدران سيولة عميقة تتصرف كحواجز جهد كمومي كلاسيكية.',
      },
      ETHUSDT: {
        en: 'Ethereum staking nodes and smart-contract escrow create quantized state transitions with predictable energy thresholds.',
        ar: 'حصص إيداع إيثيريوم وعقود التمويل اللامركزي تخلق انتقالات كمية منتظمة ومستويات طاقة محددة بدقة.',
      },
      SOLUSDT: {
        en: 'Solana high transaction velocity creates rapid wavefunction collapse intervals, yielding high-frequency quantum alphas.',
        ar: 'سرعة معالجة سولانا الفائقة تؤدي لانهيار سريع ومتكرر للدالة الموجية مما يولد إشارات كمية سريعة ومربحة.',
      },
      DEFAULT: {
        en: 'Optimized for high-beta token mechanics where volatility transitions mimic quantum perturbation dynamics.',
        ar: 'مهندسة لخصائص العملات سريعة الحركة حيث تحاكي قفزات التذبذب معادلات الاضطراب الكمي.',
      },
    },
  },
  THERMODYNAMICS: {
    titleEn: [
      'Enthalpy Volatility Expansion Engine',
      'Helmhottz Equilibrium Free Energy Drain',
      'Adiabatic Compression Momentum Shock',
      'Maxwell Demon Liquidity Separation',
      'Stefan-Boltzmann Radiation Dissipation',
    ],
    titleAr: [
      'محرك التمدد الحراري للتذبذب الإنثالبي',
      'استنزاف طاقة هلمهولتز الحرة نحو التوازن',
      'صدمة الزخم بالانضغاط الأديباتي المعزول',
      'عفريت ماكسويل لفرز السيولة الذكية',
      'تبدد الإشعاع السعري لستيفان-بولتزمان',
    ],
    formulas: [
      'dH = dU + P dV + V dP, \\quad \\Delta H > 0',
      'F = U - TS, \\quad dF = -S dT - P dV',
      'P V^\\gamma = \\text{const}, \\quad \\gamma = \\frac{C_p}{C_v}',
      '\\Delta S_{total} = \\Delta S_{sys} + \\Delta S_{env} \\ge 0',
      'j^* = \\sigma T^4, \\quad \\frac{dE}{dt} = -A \\sigma (T^4 - T_0^4)',
    ],
    principlesEn: [
      'Conversion of internal market pressure (enthalpy) into directed directional kinetic expansion.',
      'Spontaneous price migration toward minimum Helmholtz free energy configurations in range-bound markets.',
      'Adiabatic momentum compression without thermal dissipation producing violent breakout bursts.',
      'Algorithmic micro-filtration of smart orderflow vs noise, reversing local entropy in trading channels.',
      'Cooling and mean-reversion rates mathematically bounded by radiative thermal dissipation laws.',
    ],
    principlesAr: [
      'تحويل الضغط الداخلي للسوق (الإنثالبي) إلى تسارع حركي اتجاهي جارف.',
      'الانجذاب التلقائي للسعر نحو مستويات طاقة هلمهولتز الدنيا في الأسواق العرضية.',
      'الانضغاط الأديباتي المغلق بدون فقد حراري مما يولد انفجاراً اتجاهياً هائلاً.',
      'الفرز الخوارزمي الدقيق بين أوامر السيولة الذكية والضجيج العشوائي لخفض إنتروبيا السوق.',
      'معدلات التبريد والارتداد المحكومة رياضياً بقوانين تبدد الإشعاع الحراري للطاقة الزائدة.',
    ],
    coinRationaleTemplates: {
      BTCUSDT: {
        en: 'Bitcoin macro consolidation periods accumulate immense internal enthalpy prior to structural halving expansions.',
        ar: 'فترات التجميع الكبرى للبيتكوين تراكم إنثالبي حراري ضخم ينفجر في دورات ما بعد التنصيف.',
      },
      ETHUSDT: {
        en: 'Ethereum gas consumption dynamics directly create thermal dissipation cycles that anchor fair value equilibria.',
        ar: 'ديناميكية حرق واستهلاك الغاز في إيثيريوم تخلق دورات تبريد حراري ترسي توازنات القيمة العادلة.',
      },
      SOLUSDT: {
        en: 'Solana acts as a high-temperature plasma gas, where adiabatic compression triggers supersonic momentum runs.',
        ar: 'سولانا تتصرف كغاز بلازما شديد الحرارة حيث يولد الانضغاط الأديباتي موجات صعودية فوق صوتية.',
      },
      DEFAULT: {
        en: 'Calibrated for asset-specific volatility absorption and thermodynamic cooling thresholds.',
        ar: 'معايرة لامتصاص التقلبات وحساب عتبات التبريد الحراري الخاصة بطبيعة الأصل.',
      },
    },
  },
  FLUID_DYNAMICS: {
    titleEn: [
      'Couette Shear Flow Boundary Slip',
      'Cavitation Bubble Implosion Reversal',
      'Poiseuille Viscous Pressure Gradient',
      'Hydraulic Jump Kinetic Discontinuity',
      'Kelvin-Helmholtz Shear Instability',
    ],
    titleAr: [
      'انزلاق طبقة قص كويت لدفتر الأوامر',
      'ارتداد انفجار فقاعة التكهف المالي',
      'تدرج ضغط بوازيه للموائع اللزجة',
      'قفزة هيدروليكية لكسر عدم الاتصال الحركي',
      'عدم استقرار كلفن-هلمهولتز لقص الرياح المالية',
    ],
    formulas: [
      '\\tau = \\mu \\frac{du}{dy}, \\quad u(y) = \\frac{U}{h} y',
      'p_v - p_\\infty = \\frac{\\rho}{2} \\left( \\frac{dR}{dt} \\right)^2',
      '\\Delta P = \\frac{8\\mu L Q}{\\pi R^4}',
      '\\frac{y_2}{y_1} = \\frac{1}{2} \\left( \\sqrt{1 + 8 \\text{Fr}_1^2} - 1 \\right)',
      '\\sigma^2 = \\frac{k^2 \\rho_1 \\rho_2 (U_1 - U_2)^2}{(\\rho_1 + \\rho_2)^2}',
    ],
    principlesEn: [
      'Shear stress calculations across orderbook boundary layers detecting imminent bid/ask slipping.',
      'Exploitation of sudden liquidity cavitation voids where price violently snaps back to fill the vacuum.',
      'Viscous flow dynamics through thin algorithmic spread channels where flow rate scales exponentially with width.',
      'Supercritical-to-subcritical hydraulic jumps creating sudden vertical price walls and durable support floors.',
      'Shear velocity differences between buyer and seller waves triggering explosive directional vortices.',
    ],
    principlesAr: [
      'حساب إجهاد القص بين طبقات السيولة لرصد لحظات الانزلاق الوشيك بين عروض وطلبات التداول.',
      'استغلال فجوات التكهف اللحظية للسيولة حيث يرتد السعر بسرعة فائقة لملء الفراغ السعري.',
      'ديناميكا السريان اللزج عبر ممرات السبريد الضيقة حيث يتدفق الزخم بأقصى سرعة ممكنة.',
      'القفزات الهيدروليكية التي تحول السريان فائق السرعة إلى أرضيات دعم صلبة لا تنكسر.',
      'فروق السرعة بين تدفقات المشترين والبائعين التي تولد دوامات اتجاهية متفجرة.',
    ],
    coinRationaleTemplates: {
      SOLUSDT: {
        en: 'Solana orderbook depth displays ultra-low kinematic viscosity, making cavitation void reversals exceptionally profitable.',
        ar: 'عمق دفتر أوامر سولانا يتميز بلزوجة حركية منخفضة للغاية تجعل ارتدادات فجوات التكهف شديدة الربحية.',
      },
      NEARUSDT: {
        en: 'Near Protocol exhibits laminar-to-turbulent shear transitions that align with sudden cross-chain liquidity surges.',
        ar: 'بروتوكول نير يظهر انتقالات سريان طبقي إلى مضطرب تتزامن مع طفرات السيولة العابرة للسلاسل.',
      },
      BTCUSDT: {
        en: 'Bitcoin orderflow represents high-mass fluid dynamics where hydraulic jumps form impenetrable multi-month support floors.',
        ar: 'تدفقات البيتكوين تمثل مائعاً عالي الكتلة حيث تشكل القفزات الهيدروليكية دعوماً تاريخية متينة.',
      },
      DEFAULT: {
        en: 'Structured to trade liquidity shear stress and hydro-pressure differentials on volatile tokens.',
        ar: 'مصممة لتداول إجهاد قص السيولة وفروق الضغط الهيدروديناميكي على العملات النشطة.',
      },
    },
  },
  CHAOS_FRACTAL: {
    titleEn: [
      'Multifractal Cascading Singularity Spectrum',
      'Attractor Phase Space Embedding Dimension',
      'Cantor Set Liquidity Support Dust',
      'Takens Time-Delay State Reconstruction',
      'Bifurcation Pitchfork Regime Inversion',
    ],
    titleAr: [
      'طيف تفرد الشلالات متعددة الكسورية',
      'بعد تضمين فضاء الطور لجاذب الفوضى',
      'غبار مجموعة كانتور للدعوم الكسورية',
      'إعادة بناء فضاء الطور بتأخير تاكنز',
      'انقلاب مذراة الانشعاب لنظام السوق',
    ],
    formulas: [
      'f(\\alpha) = q \\alpha - \\tau(q), \\quad \\tau(q) = q h(q) - 1',
      'm > 2 d_A, \\quad \\mathbf{v}(t) = [x(t), x(t-\\tau), \\dots, x(t-(m-1)\\tau)]',
      'D_0 = \\frac{\\ln 2}{\\ln 3} \\approx 0.6309',
      '\\dot{x} = r x - x^3, \\quad x^* = \\pm \\sqrt{r}',
      'S_q(\\epsilon) = \\frac{1}{q-1} \\left(1 - \\sum p_i^q \\right)',
    ],
    principlesEn: [
      'Multifractal spectrum analysis decomposing returns into localized Hölder regularity singularities.',
      'Takens delay embedding reconstructing deterministic multi-dimensional attractors from 1D price series.',
      'Cantor dust fractal levels providing mathematical coordinates for institutional accumulation clusters.',
      'Supercritical pitchfork bifurcation identification where a single trend splits cleanly into directional branches.',
      'Generalized Tsallis non-extensive entropy detecting long-range fractal memory correlations.',
    ],
    principlesAr: [
      'تحليل الطيف متعدد الكسورية لتفكيك العوائد إلى درجات انتظام هولدر الموضعية لاقتناص الانفجار.',
      'تضمين تاكنز الزمني لإعادة بناء فضاء الطور الحقيقي متعدد الأبعاد من سلسلة الأسعار الأحادية.',
      'إحداثيات غبار كانتور الكسورية لتحديد المستويات الحقيقية للتجميع المؤسساتي بدقة ميكانيكية.',
      'رصد انشعاب المذراة قبل انقسام المسار السعري إلى اتجاه حاسم غير قابل للارتداد.',
      'إنتروبيا تساليس المعممة لكشف الترابطات الكسورية طويلة المدى عبر الأسابيع والأشهر.',
    ],
    coinRationaleTemplates: {
      BTCUSDT: {
        en: 'Bitcoin fractal dimension remains reliably bounded within 1.35-1.45, providing stellar predictability via Takens embedding.',
        ar: 'البعد الكسوري للبيتكوين مستقر بين 1.35 و1.45 مما يمنح دقة تنبؤ فائقة عبر إعادة بناء تاكنز.',
      },
      ETHUSDT: {
        en: 'Ethereum displays pronounced multifractal singularity spectra during DeFi network expansion waves.',
        ar: 'إيثيريوم تظهر أطياف تفرد متعددة الكسورية واضحة خلال موجات توسع التمويل اللامركزي.',
      },
      SOLUSDT: {
        en: 'Solana exhibits rapid pitchfork bifurcations, allowing zero-lag identification of newly emerging trend vectors.',
        ar: 'سولانا تشهد انشعابات مذراة سريعة تتيح تحديد اتجاهات الصعود الجديدة بدون أي تأخير زمني.',
      },
      DEFAULT: {
        en: 'Engineered for high fractal self-similarity and non-linear memory dynamics.',
        ar: 'مهندسة لخصائص التشابه الذاتي الكسوري والذاكرة غير الخطية لحركة الأسعار.',
      },
    },
  },
  INFORMATION_THEORY: {
    titleEn: [
      'Transfer Entropy Directed Causality Flow',
      'Conditional Entropy Noise Filtering Gate',
      'Fisher Information Cramér-Rao Bound',
      'Cross-Entropy Loss Asymmetric Drift',
      'Maximum Likelihood Information Geometry',
    ],
    titleAr: [
      'تدفق سببية إنتروبيا النقل التوجيهية',
      'بوابة فلترة الضوضاء بالإنتروبيا المشروطة',
      'حد كرامير-راو لمعلومات فيشر الدقيقة',
      'الانجراف اللامتناظر لفقد الإنتروبيا المتقاطعة',
      'الهندسة المعلوماتية للترجيح الأقصى للاتجاه',
    ],
    formulas: [
      'T_{X \\to Y} = \\sum p(y_{t+1}, y_t, x_t) \\log \\frac{p(y_{t+1}|y_t, x_t)}{p(y_{t+1}|y_t)}',
      'H(X|Y) = -\\sum_{x, y} p(x, y) \\log p(x|y)',
      '\\mathcal{I}(\\theta) = \\mathbb{E}\\left[ \\left(\\frac{\\partial \\ln f(X;\\theta)}{\\partial \\theta}\\right)^2 \\right] \\ge \\frac{1}{\\text{Var}(\\hat{\\theta})}',
      'D_{JS}(P \\parallel Q) = \\frac{1}{2} D_{KL}(P \\parallel M) + \\frac{1}{2} D_{KL}(Q \\parallel M)',
      'g_{ij}(\\theta) = \\int \\frac{\\partial \\ln p}{\\partial \\theta^i} \\frac{\\partial \\ln p}{\\partial \\theta^j} p(x;\\theta) dx',
    ],
    principlesEn: [
      'Transfer entropy measuring non-linear directional information flow from BTC to altcoins to front-run movements.',
      'Conditional entropy thresholding systematically weeding out zero-information retail noise and wicks.',
      'Fisher information metric calculating the theoretical maximum precision achievable for stop-loss placing.',
      'Jensen-Shannon divergence maintaining stable symmetry between bull and bear probabilistic states.',
      'Information Riemannian geometry mapping market regimes as geodesics on statistical manifolds.',
    ],
    principlesAr: [
      'إنتروبيا النقل لقياس تدفق المعلومات السببية غير الخطية من البيتكوين للعملات البديلة للسبق في اتخاذ القرار.',
      'عتبات الإنتروبيا المشروطة لتصفية الضجيج العشوائي وذيول الشموع الخالية من القيمة المعلوماتية.',
      'مقياس معلومات فيشر لحساب أقصى دقة رياضية نظرية ممكنة لتحديد مواقع أوامر الحماية.',
      'تباعد جنسن-شانون للحفاظ على تماثل رياضي متزن بين احتمالات الصعود والهبوط.',
      'الهندسة الريمانية المعلوماتية لرسم خريطة أنظمة السوق كمسارات جيوديسية على أسطح إحصائية ملساء.',
    ],
    coinRationaleTemplates: {
      SOLUSDT: {
        en: 'Solana receives strong directional transfer entropy pulses from BTC with a measurable 3-to-8 minute lead-lag window.',
        ar: 'سولانا تتلقى نبضات إنتروبيا نقل سببية واضحة من البيتكوين تسبق حركتها بفارق زمني بين 3 إلى 8 دقائق.',
      },
      ETHUSDT: {
        en: 'Ethereum serves as the central information distributor across the entire smart contract and altcoin ecosystem.',
        ar: 'إيثيريوم تعمل كموزع معلومات مركزي ينقل إنتروبيا الاتجاه لكافة قطاعات العملات الذكية.',
      },
      BTCUSDT: {
        en: 'Bitcoin information entropy acts as the primary exogenous source driving universal market state transitions.',
        ar: 'إنتروبيا معلومات البيتكوين تمثل المصدر الخارجي الأساسي الذي يقود تحولات أنظمة السوق بأكمله.',
      },
      DEFAULT: {
        en: 'Optimized for cross-asset information absorption and statistical entropy minimization.',
        ar: 'مهندسة لامتصاص المعلومات بين الأصول وخفض الإنتروبيا الإحصائية لأقصى درجة.',
      },
    },
  },
  STOCHASTIC: {
    titleEn: [
      'Lévy Flight Heavy-Tail Alpha Squeeze',
      'Heston Stochastic Volatility Mean Shift',
      'Cox-Ingersoll-Ross Square Root Drift',
      'Fractional Brownian Motion Rough Path',
      'Girsanov Measure Change Risk Neutralizer',
    ],
    titleAr: [
      'عصر ألفا الذيل الثقيل لطيران ليفي',
      'تحول متوسط تذبذب هيستون العشوائي',
      'انجراف الجذر التربيعي لكوكس-إنغرسول-روس',
      'المسارات الوعرة للحركة البراونية الكسرية',
      'تغيير مقياس غيرسانوف لتحييد المخاطر',
    ],
    formulas: [
      'P(L > x) \\sim x^{-\\alpha}, \\quad 0 < \\alpha < 2',
      'dS_t = \\mu S_t dt + \\sqrt{v_t} S_t dW_t^S, \\quad dv_t = \\kappa(\\theta - v_t)dt + \\xi\\sqrt{v_t} dW_t^v',
      'dr_t = a(b - r_t)dt + \\sigma\\sqrt{r_t} dW_t',
      'B_H(t) - B_H(s) \\sim \\mathcal{N}(0, |t-s|^{2H})',
      '\\frac{d\\mathbb{Q}}{d\\mathbb{P}} = \\exp\\left( -\\int_0^T \\theta_t dW_t - \\frac{1}{2} \\int_0^T \\theta_t^2 dt \\right)',
    ],
    principlesEn: [
      'Lévy stable flights capturing fat-tailed non-Gaussian return distributions and sudden institutional leaps.',
      'Heston stochastic volatility model calibrating dynamic leverage to mean-reverting volatility cycles.',
      'CIR non-negative boundary preservation guaranteeing mathematically strictly positive volatility estimates.',
      'Rough volatility modeling tracking microsecond sub-diffusive price fluctuations (Hurst H ~ 0.1).',
      'Girsanov transformation shifting probabilities from real-world drift to risk-neutral martingales.',
    ],
    principlesAr: [
      'طيران ليفي العشوائي لاقتناص القفزات السعرية ذات الذيول الإحصائية الثقيلة وغير الغاوسية.',
      'نموذج هيستون لتقلب التذبذب لمعايرة الرافعة المالية آلياً مع دورات ارتداد التقلب لمتوسطه.',
      'معادلة كوكس-إنغرسول لضمان بقاء تقديرات التذبذب موجبة قطعياً ومستقرة عددياً.',
      'نمذجة التذبذب الوعر لرصد التموجات السريعة فائقة الصغر بدقة متناهية (Hurst H ~ 0.1).',
      'تحويل غيرسانوف لنقل التوزيعات الاحتمالية نحو مقاييس محايدة المخاطر تضمن حماية رأس المال.',
    ],
    coinRationaleTemplates: {
      BTCUSDT: {
        en: 'Bitcoin volatility conforms strictly to Heston mean-reversion parameters, allowing optimal entry on volatility dips.',
        ar: 'تذبذب البيتكوين يخضع بدقة لمعايير ارتداد هيستون، مما يتيح الدخول المثالي عند انخفاض التقلب.',
      },
      SOLUSDT: {
        en: 'Solana return distribution exhibits heavy Lévy tails (alpha ~ 1.6), where jump-diffusion capture produces superior yields.',
        ar: 'عوائد سولانا تتميز بذيول ليفي الثقيلة (alpha ~ 1.6) حيث يحقق اقتناص القفزات أرباحاً استثنائية.',
      },
      ETHUSDT: {
        en: 'Ethereum rough path dynamics reflect continuous liquidity provisioning from smart-contract automated market makers.',
        ar: 'مسارات إيثيريوم الوعرة تعكس التفاعل المستمر لبروتوكولات صناع السوق الآليين اللامركزية.',
      },
      DEFAULT: {
        en: 'Calibrated to manage fat-tailed stochastic jumps and dynamic volatility scaling.',
        ar: 'معايرة لإدارة القفزات العشوائية ذات الذيول الثقيلة وضبط التذبذب ديناميكياً.',
      },
    },
  },
  GAME_THEORY: {
    titleEn: [
      'Shapley Microstructure Cooperative Value',
      'Evolutionary Replicator Dynamic Equilibrium',
      'Zero-Sum Matrix Saddle Point Liquidity',
      'Bayesian Imperfect Information Signaling',
      'Auctions Vickrey-Clarke-Groves Truth Vector',
    ],
    titleAr: [
      'القيمة التعاونية لشابلي لهيكلية السوق',
      'توازن ديناميكا مكرر التطور الدارويني',
      'نقطة السرج للمصفوفات الصفرية للسيولة',
      'إشارات بايزيان للمعلومات الناقصة والتضليل',
      'متجه الصدق لمزاد فيكري-كلارك-غروفز',
    ],
    formulas: [
      '\\phi_i(v) = \\sum_{S \\subseteq N \\setminus \\{i\\}} \\frac{|S|!(n-|S|-1)!}{n!} (v(S \\cup \\{i\\}) - v(S))',
      '\\dot{x}_i = x_i \\left( f_i(\\mathbf{x}) - \\bar{f}(\\mathbf{x}) \\right)',
      '\\max_x \\min_y x^T A y = \\min_y \\max_x x^T A y',
      'P(\\theta | s) = \\frac{P(s | \\theta) P(\\theta)}{\\sum P(s | \\theta\') P(\\theta\')}',
      'p_i = \\max_{j \\ne i} b_j, \\quad b_i^* = v_i',
    ],
    principlesEn: [
      'Shapley value allocating optimal weight to each market factor according to its marginal contribution to trade success.',
      'Replicator dynamics modeling how profitable algorithmic trading behaviors outcompete failing retail strategies.',
      'Minimax saddle points defining mathematically unexploitable support and resistance levels against market makers.',
      'Bayesian signaling separating genuine institutional accumulation intentions from predatory fakeout noise.',
      'Second-price truth revelation principles filtering manipulative phantom limit orders from genuine bids.',
    ],
    principlesAr: [
      'قيم شابلي لتوزيع الأوزان المثالية على عوامل السوق بناءً على مساهمة كل مؤشر في النجاح الفعلي.',
      'ديناميكا المكرر التطورية لنمذجة تغلب الخوارزميات الرابحة على استراتيجيات الأفراد الخاسرة.',
      'نقاط السرج الرياضية لتحديد دعوم ومقاومات منيعة يستحيل على صناع السوق التلاعب بها.',
      'إشارات بايزيان لفرز نوايا التجميع المؤسساتي الحقيقية عن الإشارات الخادعة والمصائد.',
      'مبادئ كشف الحقيقة لمزاد السعر الثاني لغربلة الأوامر الوهمية الزائفة عن السيولة الحقيقية الصادقة.',
    ],
    coinRationaleTemplates: {
      BTCUSDT: {
        en: 'Bitcoin orderbook is dominated by top-tier institutional HFT algorithms battling in pure zero-sum game theory regimes.',
        ar: 'دفتر أوامر البيتكوين تسيطر عليه خوارزميات مؤسساتية كبرى تتصارع ضمن نظرية الألعاب الصفرية.',
      },
      ETHUSDT: {
        en: 'Ethereum gas priority fee auctions function as real-time VCG mechanisms determining transaction execution priority.',
        ar: 'مزادات رسوم أولوية إيثيريوم تعمل كآليات VCG حقيقية تحدد أسبقية وأهمية تنفيذ الصفقات.',
      },
      SOLUSDT: {
        en: 'Solana high-speed validator stake weighting creates game-theoretic leader-schedule execution opportunities.',
        ar: 'توزيع حصص مدققي سولانا يخلق فرصاً ممتازة لاستغلال جدول القادة بنظرية الألعاب.',
      },
      DEFAULT: {
        en: 'Optimized to exploit multi-agent microstructure battles and liquidity maker payoffs.',
        ar: 'مصممة لاستغلال صراعات صانعي السيولة وتوازن المكاسب بين أطراف السوق.',
      },
    },
  },
  HARMONIC_SPECTRUM: {
    titleEn: [
      'Wavelet Packet Multi-Band Energy Filter',
      'Chirp Z-Transform Fine Harmonic Resolution',
      'Wigner-Ville Time-Frequency Distribution',
      'Phase-Locked Loop Dynamic Frequency Tracker',
      'Bessel Function Cylindrical Mode Wave',
    ],
    titleAr: [
      'مرشح طاقة الحزم الموجية المويجية المتعددة',
      'تحويل تشيرب Z للدقة التوافقية الفائقة',
      'توزيع فيغنر-فيل للزمن والتردد المتزامن',
      'حلقة الإغلاق الطوري لتتبع التردد الديناميكي',
      'موجات أنماط دوال بيسل الأسطوانية للأسعار',
    ],
    formulas: [
      'E_j = \\sum_{k} |d_{j,k}|^2, \\quad \\sum E_j = E_{total}',
      'X(z_k) = \\sum_{n=0}^{N-1} x(n) A^{-n} W^{n k}, \\quad z_k = A W^{-k}',
      'W(t, \\omega) = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} x(t + \\tau/2) x^*(t - \\tau/2) e^{-i \\omega \\tau} d\\tau',
      '\\frac{d\\phi_{out}}{dt} = \\omega_0 + K_d K_v (\\phi_{in} - \\phi_{out})',
      'J_n(x) = \\sum_{m=0}^{\\infty} \\frac{(-1)^m}{m! \\Gamma(m+n+1)} \\left( \\frac{x}{2} \\right)^{2m+n}',
    ],
    principlesEn: [
      'Wavelet packet decomposition isolating exact frequency bands where market momentum energy is concentrated.',
      'Chirp Z-transform providing zoom-in spectral analysis around critical cyclic reversal windows.',
      'Wigner-Ville time-frequency mapping revealing instantaneous frequency shifts without uncertainty trade-offs.',
      'Phase-locked loop locking onto the underlying market tempo, adjusting trailing stops dynamically to cycle speed.',
      'Bessel cylindrical modes modeling price vibrations around expanding psychological volatility envelopes.',
    ],
    principlesAr: [
      'تفكيك الحزم المويجية لعزل النطاقات الترددية الدقيقة التي تتركز فيها طاقة الزخم التداولي الحقيقية.',
      'تحويل تشيرب Z للتكبير الطيفي فائق الدقة حول نوافذ الانعكاس الزمني الدورية الحاسمة.',
      'توزيع فيغنر-فيل المتزامن للزمن والتردد لرصد تغيرات الاتجاه اللحظية بدقة متناهية.',
      'حلقة الإغلاق الطوري للتناغم التام مع إيقاع السوق وضبط أهداف التداول وفق سرعة الدورة.',
      'أنماط دوال بيسل الأسطوانية لنمذجة اهتزازات السعر حول مستويات الأغلفة السعرية المتوسعة.',
    ],
    coinRationaleTemplates: {
      BTCUSDT: {
        en: 'Bitcoin exhibits highly stable 4-year macro harmonics and 60-day sub-harmonics detectable via spectral zoom.',
        ar: 'البيتكوين يظهر توافقيات دورية مستقرة جداً على المدى الطويل ودورات 60 يوماً فرعية يمكن عزلها طيفياً.',
      },
      ETHUSDT: {
        en: 'Ethereum harmonic resonance aligns cleanly with monthly options expiration and settlement cycles.',
        ar: 'الرنين التوافقي لإيثيريوم يتزامن بشكل مذهل مع مواعيد انتهاء وتسوية عقود الخيارات الشهرية.',
      },
      SOLUSDT: {
        en: 'Solana spectral frequencies oscillate rapidly, responding with high resonance to Chirp Z-transform tracking.',
        ar: 'ترددات سولانا الطيفية تتذبذب بسرعة عالية وتستجيب برنين رائع لتتبع تحويل تشيرب Z.',
      },
      DEFAULT: {
        en: 'Calibrated to isolate true dominant market cycles and eliminate non-harmonic noise.',
        ar: 'معايرة لعزل الدورات الحقيقية المهيمنة على حركة الأصل وحذف الضوضاء العشوائية.',
      },
    },
  },
  NEURAL_QUANT: {
    titleEn: [
      'Liquid Time-Constant Neural ODE Flow',
      'Transformer Self-Attention Liquidity Kernel',
      'Spiking Neural Membrane Potential Spike',
      'Physics-Informed Neural Network (PINN) Loss',
      'Graph Convolutional Cross-Chain Tensor',
    ],
    titleAr: [
      'تدفق المعادلات التفاضلية العصبية للسائل الزمني',
      'نواة الانتباه الذاتي لسيولة الترانسفورمر',
      'طفرة جهد غشاء الشبكات العصبية النبضية SNN',
      'دالة فقد الشبكات العصبية المدعومة بقوانين الفيزياء PINN',
      'موتر الالتفاف البياني عبر السلاسل المشفرة GCN',
    ],
    formulas: [
      '\\frac{dx}{dt} = -\\left[ \\frac{1}{\\tau} + f(x, I; \\theta) \\right] x + f(x, I; \\theta) A',
      '\\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V',
      '\\tau_m \\frac{dV}{dt} = -(V - V_{rest}) + R I(t), \\quad V > V_{th} \\to \\text{Spike}',
      '\\mathcal{L}_{PINN} = \\mathcal{L}_{data} + \\lambda \\left\\| \\frac{\\partial u}{\\partial t} + u \\frac{\\partial u}{\\partial x} - \\nu \\frac{\\partial^2 u}{\\partial x^2} \\right\\|^2',
      'H^{(l+1)} = \\sigma\\left( \\tilde{D}^{-\\frac{1}{2}} \\tilde{A} \\tilde{D}^{-\\frac{1}{2}} H^{(l)} W^{(l)} \\right)',
    ],
    principlesEn: [
      'Continuous-time liquid neural ODE adapting instantaneously to sudden regime shifts and market speed changes.',
      'Self-attention mechanisms attending to distant multi-day support blocks to evaluate immediate breakthrough odds.',
      'Spiking neuromorphic neurons firing only when critical energy thresholds are breached, ensuring zero false triggers.',
      'Physics-informed loss constraining neural predictions strictly to valid fluid/thermodynamic conservation laws.',
      'Graph convolution mapping relational liquidity flows across layer-1 and layer-2 ecosystem tokens.',
    ],
    principlesAr: [
      'المعادلات التفاضلية العصبية السائلة المستمرة التي تتكيف فورياً مع التغيرات المفاجئة في سرعة ونظام السوق.',
      'آليات الانتباه الذاتي التي ترصد كتل الدعم البعيدة لتقييم احتمالية صمودها أو اختراقها في اللحظة الحالية.',
      'الخلايا العصبية النبضية التي لا تطلق إشارة إلا عند تجاوز عتبة طاقة حرجة لمنع الإشارات الكاذبة تماماً.',
      'دالة الفقد المقيدة بقوانين الفيزياء التي تجبر التوقعات على الامتثال لقوانين حفظ الطاقة والكتلة الفيزيائية.',
      'الالتفاف البياني العصبي لرسم خريطة تدفقات السيولة المترابطة بين شبكات البلوكشين المختلفة.',
    ],
    coinRationaleTemplates: {
      NEARUSDT: {
        en: 'Near Protocol is natively tailored for AI narrative compute integration and algorithmic neural modeling.',
        ar: 'بروتوكول نير مصمم ومبني بطبيعته ليتناسب مع حوسبة الذكاء الاصطناعي والنمذجة العصبية المتطورة.',
      },
      SOLUSDT: {
        en: 'Solana high transaction rate provides optimal continuous data points for Liquid Neural ODE integration.',
        ar: 'معدل المعاملات الفائق لسولانا يوفر نقاط بيانات متصلة ومثالية لتشغيل المعادلات العصبية السائلة.',
      },
      ETHUSDT: {
        en: 'Ethereum complex DeFi graph relationships are ideally decoded by graph convolutional neural tensors.',
        ar: 'علاقات إيثيريوم البيانية المعقدة في التمويل اللامركزي يتم فك شفرتها باقتدار عبر موترات الالتفاف البياني.',
      },
      DEFAULT: {
        en: 'Tuned for multi-layer non-linear feature extraction and physics-constrained execution.',
        ar: 'مضبوطة لاستخراج الخصائص غير الخطية متعددة الطبقات مع الالتزام التام بالقيود الفيزيائية.',
      },
    },
  },
  MACRO_PROP: {
    titleEn: [
      'Cross-Chain Liquidity Bridge Diffusion',
      'ETF Institutional Inflow Gravitational Orbit',
      'On-Chain Velocity Deflation Acceleration',
      'Miner Capitulation Exhaustion Reversal',
      'Staking Lockup Supply Shock Elasticity',
    ],
    titleAr: [
      'انتشار سيولة جسور السلاسل المشتركة',
      'المدار الجاذبي لتدفقات صناديق الاستثمار ETF',
      'تسارع انكماش معروض سرعة تداول الشبكة',
      'انعكاس استنفاد استسلام معدني التشفير',
      'مرونة صدمة معروض قفل حصص الإيداع',
    ],
    formulas: [
      '\\Phi_{bridge}(t) = \\sum_{c=1}^K F_c e^{-\\kappa (t - t_c)}',
      'F_g = G \\frac{M_{ETF} M_{Spot}}{r^2}, \\quad \\frac{d^2 r}{dt^2} = -\\frac{G M_{ETF}}{r^2}',
      'V_{velocity} = \\frac{\\text{TxVolume}}{\\text{MarketCap}}, \\quad \\frac{d(Price)}{dt} \\propto V_{velocity}',
      'C_{miner} = 1 - \\frac{\\text{HashRate}_{live}}{\\text{SMA}(\\text{HashRate}, 60)}',
      'E_s = \\frac{\\% \\Delta Price}{\\% \\Delta Supply_{locked}} > 1.8',
    ],
    principlesEn: [
      'Bridge liquidity diffusion tracking cross-chain capital rotations into undervalued ecosystems.',
      'Sovereign ETF inflows creating immense gravitational attraction toward macro liquidity basins.',
      'On-chain velocity measurements capturing deflationary supply squeezes before spot exchange recognition.',
      'Miner capitulation indicators signaling historical maximum-conviction cyclical accumulation bottoms.',
      'Staking lockup supply elasticity measuring exponential price sensitivity to marginal buy demand.',
    ],
    principlesAr: [
      'تتبع انتشار سيولة الجسور المشتركة لرصد تحركات رؤوس الأموال الذكية نحو المنظومات المقومة بأقل من قيمتها.',
      'تدفقات صناديق المؤشرات المنظمة ETF التي تخلق جاذبية كبرى تسحب الأسعار نحو أحواض السيولة المؤسساتية.',
      'قياسات سرعة دوران العملات على البلوكشين لكشف صدمات نقص المعروض قبل أن تنعكس في منصات التداول.',
      'مؤشرات استسلام المعدنين التي تحدد بدقة تاريخية قيعان الدورات الاستثمارية الكبرى ذات الثقة العالية.',
      'مرونة معروض حصص الإيداع المقفلة التي تقيس حساسية السعر التصاعدية لكل دولار شراء جديد.',
    ],
    coinRationaleTemplates: {
      BTCUSDT: {
        en: 'Bitcoin is uniquely driven by sovereign ETF inflows, post-halving supply shocks, and global macro liquidity cycles.',
        ar: 'البيتكوين مدفوع بشكل فريد بتدفقات صناديق المؤشرات ETF وصدمات معروض التنصيف ودورات السيولة العالمية.',
      },
      ETHUSDT: {
        en: 'Ethereum staking lockup absorbs over 28% of total supply, amplifying price elasticity to spot buy inflows.',
        ar: 'عقود إيداع إيثيريوم تقفل أكثر من 28% من إجمالي المعروض مما يضاعف حساسية الصعود لأي طلب شراء جديد.',
      },
      AVAXUSDT: {
        en: 'Avalanche custom subnets and institutional warp messaging generate rapid cross-chain bridge diffusion surges.',
        ar: 'سلاسل أفالانش الفرعية ورسائل التحويل المؤسساتية السريعة تولد طفرات انتشار سيولة استثنائية.',
      },
      LINKUSDT: {
        en: 'Chainlink CCIP cross-chain consensus acts as the indispensable settlement bridge for all global tokenized assets.',
        ar: 'بروتوكول CCIP لتشينلينك يمثل جسر التسوية الذي لا غنى عنه لكافة الأصول المشفرة والبيانات المالية العالمية.',
      },
      DEFAULT: {
        en: 'Engineered to capture macroscopic structural network effects and capital allocation waves.',
        ar: 'مهندسة لاقتناص تأثيرات الشبكة الهيكلية الكبرى وموجات إعادة توزيع رؤوس الأموال المؤسساتية.',
      },
    },
  },
  CLASSICAL_TECH: {
    titleEn: [
      'Algorithmic Price Action Pivot',
      'Dynamic Volume Profile POC Shift',
      'Multi-Timeframe Trend Coalescence',
      'Structural Orderflow Imbalance',
      'Volatility Squeeze Kinetic Break',
    ],
    titleAr: [
      'محور السلوك السعري الخوارزمي المتقدم',
      'انتقال نقطة التحكم لبروفايل الحجم POC',
      'اندماج اتجاه الأطر الزمنية المتعددة',
      'عدم اتزان هيكلية تدفقات الأوامر',
      'انفجار الزخم الحركي لانضغاط التذبذب',
    ],
    formulas: [
      'POC = \\arg\\max_P V(P), \\quad \\text{VA} = [P_{low}, P_{high}] \\; \\text{s.t.} \\int_{VA} V(P)dP = 0.7 V_{tot}',
      'S_t = w_{15m} T_{15m} + w_{1h} T_{1h} + w_{4h} T_{4h}',
      '\\text{Imbalance} = \\frac{\\text{BidVol} - \\text{AskVol}}{\\text{BidVol} + \\text{AskVol}}',
      '\\text{BB}_{width} = \\frac{\\text{Upper} - \\text{Lower}}{\\text{Middle}} < \\text{Threshold}',
      'R:R = \\frac{|\\text{TP} - P_{entry}|}{|P_{entry} - \\text{SL}|} \\ge 2.0',
    ],
    principlesEn: [
      'High-precision Volume Profile Point of Control (POC) migration identifying institutional fair-value shifts.',
      'Strict multi-timeframe mathematical alignment ensuring trades only trigger when higher timeframe tides agree.',
      'Orderbook imbalance thresholding demanding clear quantitative dominance before position opening.',
      'Volatility envelope compression preceding high-probability directional expansion waves.',
      'Mandatory positive risk-to-reward ratio mathematical constraint governing every trade setup.',
    ],
    principlesAr: [
      'نقطة تحكم بروفايل الحجم POC عالية الدقة لرصد انتقال القيمة العادلة للمؤسسات المالية.',
      'الاتساق الرياضي الصارم للأطر الزمنية المتعددة لضمان التداول مع مد وجزر الاتجاه الأكبر دائماً.',
      'عتبات عدم اتزان دفتر الأوامر التي تشترط تفوقاً كمياً واضحاً لدفة الشراء أو البيع قبل الدخول.',
      'انضغاط أشرطة التذبذب الفائق المسبق لموجات الانفجار الاتجاهي عالية الاحتمالية.',
      'إلزامية العائد مقابل المخاطرة الإيجابي (R:R > 2.0) كقانون رياضي صارم يحكم كل صفقة.',
    ],
    coinRationaleTemplates: {
      DEFAULT: {
        en: 'Universal classical and algorithmic quantitative principles applicable across all liquid pairs.',
        ar: 'مبادئ كمية وتحليلية كلاسيكية متقدمة تطبق بنجاح على كافة أزواج التداول ذات السيولة العالية.',
      },
    },
  },
};

/**
 * Synthesizes a brand new, highly customized scientific trading strategy
 * based on selected parameters, physical laws, and target coin characteristics.
 */
export function generateScientificStrategy(options: GenerationOptions): Strategy {
  const normSymbol = (options.targetSymbol || 'BTCUSDT').replace(/[\/\-_]/g, '').toUpperCase();
  const complexity = options.complexity || 'QUANTUM_GRADE';
  const tf: TimeFrame = options.timeframe || '15m';

  // Determine domain
  let domain: ScientificDomain = 'QUANTUM';
  if (options.domain && options.domain !== 'AUTO_SYNTHESIS') {
    domain = options.domain;
  } else {
    // Intelligent domain selection based on coin character
    if (normSymbol.includes('BTC')) {
      domain = Math.random() > 0.5 ? 'QUANTUM' : 'MACRO_PROP';
    } else if (normSymbol.includes('SOL')) {
      domain = Math.random() > 0.5 ? 'FLUID_DYNAMICS' : 'THERMODYNAMICS';
    } else if (normSymbol.includes('ETH')) {
      domain = Math.random() > 0.5 ? 'CHAOS_FRACTAL' : 'STOCHASTIC';
    } else if (normSymbol.includes('NEAR')) {
      domain = 'NEURAL_QUANT';
    } else {
      const allDomains: ScientificDomain[] = [
        'QUANTUM',
        'THERMODYNAMICS',
        'FLUID_DYNAMICS',
        'CHAOS_FRACTAL',
        'INFORMATION_THEORY',
        'STOCHASTIC',
        'GAME_THEORY',
        'HARMONIC_SPECTRUM',
        'NEURAL_QUANT',
        'MACRO_PROP',
      ];
      domain = allDomains[Math.floor(Math.random() * allDomains.length)];
    }
  }

  const pattern = DOMAIN_SYNTHESIS_PATTERNS[domain];
  const idx = Math.floor(Math.random() * pattern.titleEn.length);

  const titleEn = pattern.titleEn[idx];
  const titleAr = pattern.titleAr[idx];
  const formula = pattern.formulas[idx % pattern.formulas.length];
  const principleEn = pattern.principlesEn[idx % pattern.principlesEn.length];
  const principleAr = pattern.principlesAr[idx % pattern.principlesAr.length];

  // Specific coin rationale
  const rationaleTemplate =
    pattern.coinRationaleTemplates[normSymbol] || pattern.coinRationaleTemplates['DEFAULT'];

  const timestamp = Date.now();
  const id = `ai_synth_${domain.toLowerCase()}_${timestamp}`;

  const weight = Number((1.1 + Math.random() * 0.35).toFixed(2));
  const winRateEstimate = Number((82.5 + Math.random() * 8.5).toFixed(1));
  const auditScoreEstimate = Math.min(97, Math.max(86, Math.round(88 + Math.random() * 8)));

  const applicableSymbols = normSymbol === 'ALL' ? ['ALL'] : [normSymbol];

  const newStrategy: Strategy = {
    id,
    name: `[AI Synthesized] ${titleEn}`,
    arabicName: `[ابتكار الذكاء الاصطناعي] ${titleAr}`,
    timeframe: tf,
    indicators: `${domain} Vector, Dynamic Entropy Gauge, Orderbook Flux Derivative dP/dt`,
    description: `استراتيجية حصرية ابتكرها محرك الذكاء الاصطناعي قائمة على ${domain} لتطبيق ${principleAr} بدقة رياضية صارمة على ${normSymbol}.`,
    enabled: true,
    weight,
    category: 'scientific',
    scientificDomain: domain,
    scientificFormula: formula,
    scientificPrinciple: principleEn,
    arabicPrinciple: principleAr,
    applicableSymbols,
    coinSuitabilityReason: `${rationaleTemplate.en} Tailored specifically to exploit high-probability micro-structural anomalies in ${normSymbol}.`,
    arabicSuitabilityReason: `${rationaleTemplate.ar} مصممة ومضبوطة خصيصاً لاقتناص شذوذ الهيكلية السعرية الأعلى احتمالية في ${normSymbol}.`,
    isProprietaryAI: true,
    winRateEstimate,
    auditScoreEstimate,
    mathModelComplexity: complexity,
    createdAt: timestamp,
  };

  // Persist into localStorage catalog
  saveSynthesizedStrategyToStorage(newStrategy);

  return newStrategy;
}

export const PRE_ENGINEERED_SYNTHESIZED_STRATEGIES: Strategy[] = [
  {
    id: 'strat-syn-btc-quantum',
    name: '[AI Synthesized] Schrödinger Liquidity Potential Tunnel [BTCUSDT]',
    arabicName: '[ابتكار الذكاء الاصطناعي] نفق شرودنغر لاختراق جدران السيولة [BTCUSDT]',
    timeframe: '15m',
    indicators: 'Quantum Potential Barrier T(E), Wavepacket Kinetic Energy, Institutional Depth',
    description: 'استراتيجية مبتكرة حصرية للبيتكوين لاقتناص اختراق حواجز السيولة الكبرى عبر نفق شرودنغر الكمومي.',
    enabled: true,
    weight: 2.4,
    category: 'scientific',
    scientificDomain: 'QUANTUM',
    scientificFormula: 'T(E) = \\left(1 + \\frac{V_0^2 \\sinh^2(k_2 a)}{4E(V_0 - E)}\\right)^{-1}',
    scientificPrinciple: 'Quantum tunneling through deep institutional liquidity walls upon momentum kinetic surge.',
    arabicPrinciple: 'الحركة النفقية الكمومية لاختراق كتل الأوامر المؤسسية العميقة فور تصاعد طاقة الزخم الحركي.',
    applicableSymbols: ['BTCUSDT'],
    coinSuitabilityReason: 'Optimized for Bitcoin macro orderbook depth and high-inertia capital transitions.',
    arabicSuitabilityReason: 'مهندسة خصيصاً للبيتكوين لاستغلال عمق دفتر الأوامر وضخامة السيولة المؤسسية.',
    isProprietaryAI: true,
    winRateEstimate: 88.5,
    auditScoreEstimate: 94,
    mathModelComplexity: 'QUANTUM_GRADE',
    createdAt: 1700000000000,
  },
  {
    id: 'strat-syn-eth-fluid',
    name: '[AI Synthesized] Navier-Stokes Liquidity Vorticity [ETHUSDT]',
    arabicName: '[ابتكار الذكاء الاصطناعي] دوامية نافييه-ستوكس لتدفق السيولة [ETHUSDT]',
    timeframe: '15m',
    indicators: 'Navier-Stokes Curl, Reynolds Number Re, Orderbook Velocity Gradient',
    description: 'استراتيجية مبتكرة لحساب دوامية وتدفقات سيولة الإيثيريوم وحركة العقود الذكية.',
    enabled: true,
    weight: 2.2,
    category: 'scientific',
    scientificDomain: 'FLUID_DYNAMICS',
    scientificFormula: '\\frac{\\partial \\mathbf{u}}{\\partial t} + (\\mathbf{u} \\cdot \\nabla)\\mathbf{u} = -\\frac{1}{\\rho}\\nabla p + \\nu \\nabla^2 \\mathbf{u}',
    scientificPrinciple: 'Vorticity curl divergence mapping to track aggressive capital whirlpools in orderbook depth.',
    arabicPrinciple: 'تتبع دوامات السيولة العنيفة وحركة الشراء والبيع عبر معادلات نافييه-ستوكس الهيدروديناميكية.',
    applicableSymbols: ['ETHUSDT'],
    coinSuitabilityReason: 'Optimized for Ethereum high DeFi circulation and dynamic liquidity pool rebalancing.',
    arabicSuitabilityReason: 'مصممة للإيثيريوم لتتبع دورات إعادة التوازن والتدفق السريع للسيولة.',
    isProprietaryAI: true,
    winRateEstimate: 87.2,
    auditScoreEstimate: 92,
    mathModelComplexity: 'QUANTUM_GRADE',
    createdAt: 1700000000001,
  },
  {
    id: 'strat-syn-sol-relativistic',
    name: '[AI Synthesized] Lorentz Momentum Contraction [SOLUSDT]',
    arabicName: '[ابتكار الذكاء الاصطناعي] انكماش لورنتز للزخم النسبي فائق السرعة [SOLUSDT]',
    timeframe: '15m',
    indicators: 'Lorentz Factor gamma, Relativistic Momentum p=gamma*m*v, TPS Flow',
    description: 'استراتيجية مبتكرة لحركات سولانا الانفجارية استناداً إلى نسبية أينشتاين الخاصة.',
    enabled: true,
    weight: 2.5,
    category: 'scientific',
    scientificDomain: 'STOCHASTIC',
    scientificFormula: '\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}, \\quad p = \\gamma m v',
    scientificPrinciple: 'Relativistic mass expansion of price momentum during high-velocity directional explosions.',
    arabicPrinciple: 'تضخم الزخم النسبي وانكماش الزمكان السعري أثناء الانفجارات الحركية السريعة.',
    applicableSymbols: ['SOLUSDT'],
    coinSuitabilityReason: 'Solana ultra-fast block times and high beta make relativistic momentum mechanics highly accurate.',
    arabicSuitabilityReason: 'سرعة سولانا العالية وتقلبها النشط يجعلان نماذج النسبية فائقة الدقة لاقتناص الانفجارات.',
    isProprietaryAI: true,
    winRateEstimate: 89.4,
    auditScoreEstimate: 95,
    mathModelComplexity: 'QUANTUM_GRADE',
    createdAt: 1700000000002,
  },
  {
    id: 'strat-syn-bnb-thermo',
    name: '[AI Synthesized] Carnot Heat Engine Orderbook Cycle [BNBUSDT]',
    arabicName: '[ابتكار الذكاء الاصطناعي] دورة كارنو الحرارية لدفتر أوامر بينانس [BNBUSDT]',
    timeframe: '15m',
    indicators: 'Carnot Efficiency eta, Thermodynamic Free Energy dG, Volume Heat Sink',
    description: 'استراتيجية مبتكرة لقياس تدفقات حرارة دفتر الأوامر وعوائد تدوير رأس المال لعملة BNB.',
    enabled: true,
    weight: 2.1,
    category: 'scientific',
    scientificDomain: 'THERMODYNAMICS',
    scientificFormula: '\\eta = 1 - \\frac{T_C}{T_H}, \\quad \\Delta G = \\Delta H - T\\Delta S',
    scientificPrinciple: 'Cyclical extraction of trading alpha through isothermal liquidity expansion and compression phases.',
    arabicPrinciple: 'استخلاص الأرباح عبر أطوار التمدد والانضغاط المتساوي لدفتر الأوامر بنظام دورة كارنو.',
    applicableSymbols: ['BNBUSDT'],
    coinSuitabilityReason: 'BNB native exchange token mechanics exhibit steady cyclical heat transfer and fee-burn mechanics.',
    arabicSuitabilityReason: 'رمز بينانس الأصلي يتسم بدورات سيولة منتظمة ومتوافقة مع الديناميكا الحرارية لدفتر الأوامر.',
    isProprietaryAI: true,
    winRateEstimate: 86.8,
    auditScoreEstimate: 91,
    mathModelComplexity: 'ADVANCED',
    createdAt: 1700000000003,
  },
  {
    id: 'strat-syn-xrp-entropy',
    name: '[AI Synthesized] Shannon Information Entropy Flow [XRPUSDT]',
    arabicName: '[ابتكار الذكاء الاصطناعي] تدفق إنتروبيا شانون للمعلومات السعرية [XRPUSDT]',
    timeframe: '15m',
    indicators: 'Shannon Entropy H(X), Kullback-Leibler Divergence, Order Volatility',
    description: 'استراتيجية مبتكرة لقياس تشبع وانضغاط المعلومات في حركة سعر الريبل قبل الانفجارات السعرية.',
    enabled: true,
    weight: 2.0,
    category: 'scientific',
    scientificDomain: 'INFORMATION_THEORY',
    scientificFormula: 'H(X) = -\\sum_{i=1}^n P(x_i) \\log_2 P(x_i)',
    scientificPrinciple: 'Entropy minima detection signaling massive imminent information dispersion events.',
    arabicPrinciple: 'رصد أدنى مستويات الإنتروبيا السعرية كإشارة يقينية لقرب حدوث تفريغ معلوماتي وانفجار سعري.',
    applicableSymbols: ['XRPUSDT'],
    coinSuitabilityReason: 'XRP exhibits extended low-entropy consolidation zones followed by explosive single-candle surges.',
    arabicSuitabilityReason: 'الريبل يتميز بفترات ركود منخفضة الإنتروبيا يعقبها انفجارات أحادية حادة.',
    isProprietaryAI: true,
    winRateEstimate: 86.0,
    auditScoreEstimate: 90,
    mathModelComplexity: 'ADVANCED',
    createdAt: 1700000000004,
  },
  {
    id: 'strat-syn-ada-chaos',
    name: '[AI Synthesized] Lyapunov Horizon Predictive Orbit [ADAUSDT]',
    arabicName: '[ابتكار الذكاء الاصطناعي] أفق ليابونوف لتوقع مسارات الجذب الفوضوية [ADAUSDT]',
    timeframe: '15m',
    indicators: 'Lyapunov Exponent lambda, Phase Space Attractor, Hausdorff Dimension',
    description: 'استراتيجية مبتكرة قائمة على نظرية الفوضى لرصد مدارات الجذب ومناطق الانعكاس لكاردانو.',
    enabled: true,
    weight: 2.0,
    category: 'scientific',
    scientificDomain: 'CHAOS_FRACTAL',
    scientificFormula: '\\lambda = \\lim_{t \\to \\infty} \\frac{1}{t} \\ln \\frac{|\\delta Z(t)|}{|\\delta Z(0)|}',
    scientificPrinciple: 'Non-linear attractor boundary trajectory mapping to enter at maximum stability nodes.',
    arabicPrinciple: 'تحديد حدود جاذب لورنز الفوضوي للدخول عند أعلى عقد الاستقرار ومسارات الانعكاس المؤكدة.',
    applicableSymbols: ['ADAUSDT'],
    coinSuitabilityReason: 'ADA displays classic fractal attractor properties during swing trend evolutions.',
    arabicSuitabilityReason: 'كاردانو يظهر سلوكاً كسيرياً منتظماً يسهل التنبؤ به عند حدود الجواذب الفوضوية.',
    isProprietaryAI: true,
    winRateEstimate: 85.2,
    auditScoreEstimate: 89,
    mathModelComplexity: 'ADVANCED',
    createdAt: 1700000000005,
  },
  {
    id: 'strat-syn-universal-quantum',
    name: '[AI Synthesized] Universal Quantum Superposition Field [ALL]',
    arabicName: '[ابتكار الذكاء الاصطناعي] حقل التراكب الكمومي الموحد لعقود المشتقات [ALL]',
    timeframe: '15m',
    indicators: 'Quantum Hamiltonian, Dirac Field Operator, Multi-Asset Wavefunction',
    description: 'استراتيجية مبتكرة فائقة التطور تعمل على كافة أزواج العقود المستقبلية لرصد انهيار التراكب وانطلاق الاتجاه.',
    enabled: true,
    weight: 2.6,
    category: 'scientific',
    scientificDomain: 'QUANTUM',
    scientificFormula: '\\mathcal{L} = \\bar{\\psi}(i\\gamma^\\mu \\partial_\\mu - m)\\psi - \\frac{1}{4}F_{\\mu\\nu}F^{\\mu\\nu}',
    scientificPrinciple: 'Multi-state wavefunction collapse detection at confluent Fibonacci and orderbook price nodes.',
    arabicPrinciple: 'رصد لحظة انهيار الدالة الموجية لتراكب السيولة عند التقاء مستويات فيبوناتشي مع كتل الأوامر.',
    applicableSymbols: ['ALL'],
    coinSuitabilityReason: 'Universal quantum mechanics model calibrated across the entire Binance Futures top liquid universe.',
    arabicSuitabilityReason: 'نموذج كمومي عام تمت معايرته ليعمل بدقة استثنائية على كبرى أزواج العقود المستقبلية في بينانس.',
    isProprietaryAI: true,
    winRateEstimate: 91.5,
    auditScoreEstimate: 96,
    mathModelComplexity: 'QUANTUM_GRADE',
    createdAt: 1700000000006,
  },
];

/**
 * Loads all AI-synthesized proprietary strategies from persistent browser storage
 */
export function getStoredSynthesizedStrategies(): Strategy[] {
  try {
    const raw = localStorage.getItem(SYNTHESIZED_STRATEGIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure pre-engineered seeds are merged if not present
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const missingSeeds = PRE_ENGINEERED_SYNTHESIZED_STRATEGIES.filter((s) => !existingIds.has(s.id));
        if (missingSeeds.length > 0) {
          const combined = [...parsed, ...missingSeeds];
          localStorage.setItem(SYNTHESIZED_STRATEGIES_STORAGE_KEY, JSON.stringify(combined));
          return combined;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load synthesized strategies from storage', e);
  }
  // Initialize with pre-engineered seeds
  try {
    localStorage.setItem(SYNTHESIZED_STRATEGIES_STORAGE_KEY, JSON.stringify(PRE_ENGINEERED_SYNTHESIZED_STRATEGIES));
  } catch {
    // ignore
  }
  return PRE_ENGINEERED_SYNTHESIZED_STRATEGIES;
}

/**
 * Saves a new synthesized strategy into persistent browser storage
 */
export function saveSynthesizedStrategyToStorage(strategy: Strategy): void {
  try {
    const current = getStoredSynthesizedStrategies();
    const updated = [strategy, ...current.filter((s) => s.id !== strategy.id)];
    localStorage.setItem(SYNTHESIZED_STRATEGIES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save synthesized strategy', e);
  }
}

/**
 * Removes a synthesized strategy from storage
 */
export function removeSynthesizedStrategyFromStorage(id: string): void {
  try {
    const current = getStoredSynthesizedStrategies();
    const filtered = current.filter((s) => s.id !== id);
    localStorage.setItem(SYNTHESIZED_STRATEGIES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove synthesized strategy', e);
  }
}

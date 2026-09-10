import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini API Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

// ----------------------------------------------------
// 1. Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    geminiConfigured: hasKey,
    environment: process.env.NODE_ENV || 'development',
    tradingMode: 'PAPER_ONLY',
  });
});

// ----------------------------------------------------
// 2. Gemini AI Decision Engine Endpoint
// ----------------------------------------------------
app.post('/api/gemini/analyze', async (req, res) => {
  const startTime = Date.now();
  try {
    const { snapshot } = req.body;
    if (!snapshot || !snapshot.symbol || !snapshot.currentPrice || snapshot.currentPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing market snapshot. Real market data is strictly required.',
      });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback to strict deterministic mathematical consensus when API key is unconfigured
      const isLongDominant = snapshot.strategyResults.dominantSide === 'LONG';
      const isShortDominant = snapshot.strategyResults.dominantSide === 'SHORT';
      const consensusRatio = snapshot.strategyResults.consensusRatio || 0;
      const mtfAligned = snapshot.multiTimeframe.isAligned;
      const noWallBlock = !snapshot.orderbook.hasOpposingWall;

      const isApproved =
        (isLongDominant || isShortDominant) &&
        consensusRatio >= 0.65 &&
        mtfAligned &&
        noWallBlock;

      const side = isApproved ? (isLongDominant ? 'LONG' : 'SHORT') : 'NEUTRAL';
      const tpPercent = snapshot.riskParameters.takeProfitPercent || 2.5;
      const slPercent = snapshot.riskParameters.stopLossPercent || 1.25;

      const tpPrice =
        side === 'LONG'
          ? snapshot.currentPrice * (1 + tpPercent / 100)
          : snapshot.currentPrice * (1 - tpPercent / 100);
      const slPrice =
        side === 'LONG'
          ? snapshot.currentPrice * (1 - slPercent / 100)
          : snapshot.currentPrice * (1 + slPercent / 100);

      return res.json({
        success: true,
        source: 'CONSENSUS_ENGINE_FALLBACK',
        decision: {
          symbol: snapshot.symbol,
          signal: side,
          confidence: Math.round(consensusRatio * 100),
          reasoningEn: `Deterministic consensus analysis: ${(consensusRatio * 100).toFixed(1)}% strategy agreement with ${mtfAligned ? 'confirmed' : 'unconfirmed'} MTF alignment. Note: GEMINI_API_KEY is not set in environment secrets; running institutional rule-based consensus.`,
          reasoningAr: `تحليل الإجماع الرياضي المعتمد: توافق بنسبة ${(consensusRatio * 100).toFixed(1)}% بين الاستراتيجيات مع ${mtfAligned ? 'توافق مؤكد' : 'عدم توافق'} للأطر الزمنية. (ملاحظة: مفتاح GEMINI_API_KEY غير مضاف في الإعدادات، تم تطبيق محرك الإجماع المؤسسي).`,
          keyRisksEn: [
            snapshot.orderbook.hasOpposingWall ? 'Opposing liquidity barrier nearby' : 'Normal market volatility',
            mtfAligned ? 'High confluence' : 'Timeframe conflict risk',
          ],
          keyRisksAr: [
            snapshot.orderbook.hasOpposingWall ? 'وجود حاجز سيولة معاكس قريب' : 'تذبذب طبيعي في السوق',
            mtfAligned ? 'توافق فني عالي' : 'مخاطرة تعارض الأطر الزمنية',
          ],
          confirmationFactorsEn: [
            `50+ Strategy Consensus: ${(consensusRatio * 100).toFixed(1)}%`,
            `Trend Cascade: ${snapshot.trend}`,
            `RSI: ${snapshot.indicators.rsi.toFixed(1)}`,
          ],
          confirmationFactorsAr: [
            `إجماع الـ 50+ استراتيجية: ${(consensusRatio * 100).toFixed(1)}%`,
            `تسلسل الاتجاه: ${snapshot.trend}`,
            `مؤشر القوة النسبية RSI: ${snapshot.indicators.rsi.toFixed(1)}`,
          ],
          targetProfitUSD: 20,
          recommendedEntry: snapshot.currentPrice,
          stopLoss: Number(slPrice.toFixed(snapshot.currentPrice < 1 ? 4 : 2)),
          takeProfit: Number(tpPrice.toFixed(snapshot.currentPrice < 1 ? 4 : 2)),
          riskRewardRatio: Number((tpPercent / slPercent).toFixed(2)),
          isApproved,
          rejectionReason: isApproved ? undefined : 'Consensus threshold or MTF confluence not fully satisfied',
          timestamp: Date.now(),
          source: 'CONSENSUS_ENGINE_FALLBACK',
        },
      });
    }

    // Call Gemini 2.5 Flash
    const prompt = `You are an elite quantitative analyst and risk officer for a high-frequency Binance Futures USDT-M trading desk.
Analyze the following REAL market data snapshot strictly without inventing or hallucinating data:

${JSON.stringify(snapshot, null, 2)}

Target Profit Constraint: The trading system enforces a strict TARGET PROFIT PER TRADE of exactly $20.00 USD.
Trading Mode: PAPER TRADING ONLY. Real execution is strictly prohibited.

Respond with ONLY a valid, parseable JSON object matching this exact TypeScript structure:
{
  "signal": "LONG" | "SHORT" | "NEUTRAL",
  "confidence": number, // integer 0-100
  "reasoningEn": string, // concise professional explanation of setup and why it qualifies or is rejected
  "reasoningAr": string, // clear explanation in professional Arabic
  "keyRisksEn": string[], // 2-3 specific risks
  "keyRisksAr": string[], // 2-3 specific risks in Arabic
  "confirmationFactorsEn": string[], // 2-3 technical confluence factors
  "confirmationFactorsAr": string[], // 2-3 technical confluence factors in Arabic
  "targetProfitUSD": 20, // MUST BE 20
  "recommendedEntry": number,
  "stopLoss": number,
  "takeProfit": number,
  "riskRewardRatio": number, // e.g. 2.0
  "suggestedStrategyAdjustment": string, // optional insight or weight recommendation
  "isApproved": boolean, // true ONLY if quality is high and R:R >= 1:2
  "rejectionReason": string // if isApproved is false, explain why
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1, // low temperature for precise, deterministic financial reasoning
      },
    });

    const responseText = response.text?.trim() || '{}';
    let parsedDecision: any = {};
    try {
      parsedDecision = JSON.parse(responseText);
    } catch {
      // Regex recovery if wrapped in markdown
      const cleaned = responseText.replace(/```json\n?|```/g, '').trim();
      parsedDecision = JSON.parse(cleaned);
    }

    // Enforce strict constraints on the AI output
    parsedDecision.symbol = snapshot.symbol;
    parsedDecision.targetProfitUSD = 20; // Enforce strict $20 target profit
    parsedDecision.timestamp = Date.now();
    parsedDecision.source = 'GEMINI_AI';

    return res.json({
      success: true,
      source: 'GEMINI_AI',
      latencyMs: Date.now() - startTime,
      decision: parsedDecision,
    });
  } catch (err: any) {
    console.error('Gemini Decision Engine Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Gemini AI analysis failed',
    });
  }
});

// ----------------------------------------------------
// 3. Real Binance Futures Backtesting Engine
// ----------------------------------------------------
app.post('/api/backtest', async (req, res) => {
  try {
    const {
      symbol = 'BTCUSDT',
      timeframe = '15m',
      candleCount = 300,
      targetProfitUSD = 20,
      leverage = 10,
      stopLossPercent = 1.2,
      takeProfitPercent = 2.4,
    } = req.body;

    const cleanSymbol = symbol.replace(/[\/\-_]/g, '').toUpperCase();
    const limit = Math.min(500, Math.max(100, Number(candleCount) || 300));

    // Fetch real historical Klines directly from Binance Futures public API
    const klinesUrl = `https://fapi.binance.com/fapi/v1/klines?symbol=${cleanSymbol}&interval=${timeframe}&limit=${limit}`;
    const klinesRes = await fetch(klinesUrl);

    if (!klinesRes.ok) {
      return res.status(502).json({
        success: false,
        error: `Failed to fetch historical Klines from Binance: HTTP ${klinesRes.status}`,
      });
    }

    const rawKlines: any[] = await klinesRes.json();
    if (!Array.isArray(rawKlines) || rawKlines.length < 50) {
      return res.status(400).json({
        success: false,
        error: `Insufficient historical candles received (${rawKlines?.length || 0})`,
      });
    }

    // Parse candles
    const candles = rawKlines.map((k) => ({
      openTime: Number(k[0]),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
      closeTime: Number(k[6]),
    }));

    // Simple EMA helper
    const calcEMA = (prices: number[], period: number): number[] => {
      const k = 2 / (period + 1);
      const emaArr: number[] = new Array(prices.length);
      let sum = 0;
      for (let i = 0; i < period; i++) sum += prices[i];
      emaArr[period - 1] = sum / period;
      for (let i = period; i < prices.length; i++) {
        emaArr[i] = prices[i] * k + emaArr[i - 1] * (1 - k);
      }
      return emaArr;
    };

    // Simple RSI helper
    const calcRSI = (prices: number[], period = 14): number[] => {
      const rsiArr: number[] = new Array(prices.length).fill(50);
      let gains = 0;
      let losses = 0;
      for (let i = 1; i <= period; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      let avgGain = gains / period;
      let avgLoss = losses / period;

      for (let i = period + 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiArr[i] = 100 - 100 / (1 + rs);
      }
      return rsiArr;
    };

    const closes = candles.map((c) => c.close);
    const ema20 = calcEMA(closes, 20);
    const ema50 = calcEMA(closes, 50);
    const rsi14 = calcRSI(closes, 14);

    const trades: any[] = [];
    let currentBalance = 1000.0;
    const equityCurve: Array<{ time: string; balance: number }> = [
      { time: new Date(candles[50].openTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), balance: 1000 },
    ];

    let inTrade = false;
    let activeTrade: any = null;

    // Simulate bars from index 50 onwards
    for (let i = 50; i < candles.length; i++) {
      const c = candles[i];
      const prevC = candles[i - 1];

      // Check exit if in trade
      if (inTrade && activeTrade) {
        const isLong = activeTrade.side === 'LONG';
        let exited = false;
        let exitPrice = 0;
        let exitReason = '';
        let pnl = 0;

        if (isLong) {
          if (c.high >= activeTrade.takeProfit) {
            exited = true;
            exitPrice = activeTrade.takeProfit;
            exitReason = 'TAKE_PROFIT';
            pnl = targetProfitUSD; // Fixed $20 profit achieved
          } else if (c.low <= activeTrade.stopLoss) {
            exited = true;
            exitPrice = activeTrade.stopLoss;
            exitReason = 'STOP_LOSS';
            pnl = -(targetProfitUSD * (stopLossPercent / takeProfitPercent));
          }
        } else {
          if (c.low <= activeTrade.takeProfit) {
            exited = true;
            exitPrice = activeTrade.takeProfit;
            exitReason = 'TAKE_PROFIT';
            pnl = targetProfitUSD; // Fixed $20 profit achieved
          } else if (c.high >= activeTrade.stopLoss) {
            exited = true;
            exitPrice = activeTrade.stopLoss;
            exitReason = 'STOP_LOSS';
            pnl = -(targetProfitUSD * (stopLossPercent / takeProfitPercent));
          }
        }

        if (exited) {
          currentBalance += pnl;
          trades.push({
            id: `bt-tr-${trades.length + 1}`,
            symbol: cleanSymbol,
            side: activeTrade.side,
            entryTime: activeTrade.entryTime,
            exitTime: c.closeTime,
            entryPrice: activeTrade.entryPrice,
            exitPrice,
            pnl: Number(pnl.toFixed(2)),
            pnlPercent: Number(((pnl / (activeTrade.notional / leverage)) * 100).toFixed(2)),
            exitReason,
            strategyUsed: activeTrade.strategyUsed,
            durationCandles: i - activeTrade.entryIndex,
          });

          equityCurve.push({
            time: new Date(c.closeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            balance: Number(currentBalance.toFixed(2)),
          });

          inTrade = false;
          activeTrade = null;
        }
      }

      // Check entry if not in trade
      if (!inTrade && i < candles.length - 2) {
        const currentEma20 = ema20[i];
        const currentEma50 = ema50[i];
        const prevEma20 = ema20[i - 1];
        const prevEma50 = ema50[i - 1];
        const currentRsi = rsi14[i];

        // Bullish Cross & Momentum (LONG)
        const isBullishCross = prevEma20 <= prevEma50 && currentEma20 > currentEma50;
        const isBullishPullback = currentEma20 > currentEma50 && c.low <= currentEma20 && c.close > currentEma20 && currentRsi >= 42 && currentRsi <= 62;

        // Bearish Cross & Momentum (SHORT)
        const isBearishCross = prevEma20 >= prevEma50 && currentEma20 < currentEma50;
        const isBearishPullback = currentEma20 < currentEma50 && c.high >= currentEma20 && c.close < currentEma20 && currentRsi <= 58 && currentRsi >= 38;

        if (isBullishCross || isBullishPullback) {
          const entryPrice = c.close;
          const tpPrice = entryPrice * (1 + takeProfitPercent / 100);
          const slPrice = entryPrice * (1 - stopLossPercent / 100);
          const notional = targetProfitUSD / (takeProfitPercent / 100);

          inTrade = true;
          activeTrade = {
            side: 'LONG',
            entryIndex: i,
            entryPrice,
            entryTime: c.closeTime,
            takeProfit: tpPrice,
            stopLoss: slPrice,
            notional,
            strategyUsed: isBullishCross ? 'EMA Golden Cross Trend (15m)' : 'EMA Momentum Pullback (15m)',
          };
        } else if (isBearishCross || isBearishPullback) {
          const entryPrice = c.close;
          const tpPrice = entryPrice * (1 - takeProfitPercent / 100);
          const slPrice = entryPrice * (1 + stopLossPercent / 100);
          const notional = targetProfitUSD / (takeProfitPercent / 100);

          inTrade = true;
          activeTrade = {
            side: 'SHORT',
            entryIndex: i,
            entryPrice,
            entryTime: c.closeTime,
            takeProfit: tpPrice,
            stopLoss: slPrice,
            notional,
            strategyUsed: isBearishCross ? 'EMA Death Cross Trend (15m)' : 'EMA Bearish Rejection (15m)',
          };
        }
      }
    }

    const wins = trades.filter((t) => t.pnl > 0).length;
    const losses = trades.filter((t) => t.pnl <= 0).length;
    const winRate = trades.length > 0 ? Number(((wins / trades.length) * 100).toFixed(1)) : 0;
    const totalPnL = Number((currentBalance - 1000).toFixed(2));
    const grossProfit = trades.filter((t) => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99 : 0;

    // Peak drawdown
    let peak = 1000;
    let maxDrawdown = 0;
    equityCurve.forEach((point) => {
      if (point.balance > peak) peak = point.balance;
      const dd = ((peak - point.balance) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    });

    return res.json({
      success: true,
      report: {
        symbol: cleanSymbol,
        timeframe,
        totalCandlesAnalyzed: candles.length,
        dateRange: {
          start: new Date(candles[0].openTime).toISOString().split('T')[0],
          end: new Date(candles[candles.length - 1].closeTime).toISOString().split('T')[0],
        },
        totalTrades: trades.length,
        wins,
        losses,
        winRate,
        totalPnL,
        averageProfitPerTrade: trades.length > 0 ? Number((totalPnL / trades.length).toFixed(2)) : 0,
        profitFactor,
        maxDrawdownPercent: Number(maxDrawdown.toFixed(1)),
        trades,
        equityCurve,
      },
    });
  } catch (err: any) {
    console.error('Backtest Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Backtest processing failed',
    });
  }
});

// ----------------------------------------------------
// 4. Vite Middleware / Static Serving
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI-Trading-Bot Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

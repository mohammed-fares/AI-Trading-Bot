/**
 * Binance Futures Connection & Market Service
 * Supports Testnet and Production endpoints
 */

export interface BinanceTestResult {
  success: boolean;
  latencyMs: number;
  serverTime?: number;
  message: string;
  error?: string;
}

export const BINANCE_ENDPOINTS = {
  TESTNET: 'https://testnet.binancefuture.com',
  PRODUCTION: 'https://fapi.binance.com',
};

/**
 * Tests connection to Binance Futures API
 */
export async function testBinanceConnection(
  network: 'TESTNET' | 'PRODUCTION' = 'PRODUCTION',
  apiKey?: string,
  apiSecret?: string
): Promise<BinanceTestResult> {
  const baseUrl = network === 'TESTNET' ? BINANCE_ENDPOINTS.TESTNET : BINANCE_ENDPOINTS.PRODUCTION;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${baseUrl}/fapi/v1/time`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        latencyMs,
        message: `HTTP Error ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Check API Key format if provided
    if (apiKey && apiKey.trim().length > 0) {
      if (apiKey.trim().length < 16) {
        return {
          success: false,
          latencyMs,
          message: 'Binance API Key is too short (must be valid 64-char hex key)',
        };
      }
    }

    return {
      success: true,
      latencyMs,
      serverTime: data.serverTime,
      message: `Connected successfully (${latencyMs}ms)`,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: err.name === 'AbortError' ? 'Connection timed out (6s)' : 'Network request failed',
      error: err.message || String(err),
    };
  }
}

/**
 * Fetches live market prices from Binance Futures public ticker
 */
export async function fetchLiveBinancePrices(
  symbols: string[]
): Promise<Record<string, number>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://fapi.binance.com/fapi/v1/ticker/price', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return {};

    const items: Array<{ symbol: string; price: string }> = await res.json();
    const priceMap: Record<string, number> = {};

    const symbolSet = new Set(symbols.map((s) => s.replace('/', '')));

    items.forEach((item) => {
      if (symbolSet.has(item.symbol)) {
        priceMap[item.symbol] = parseFloat(item.price);
      }
    });

    return priceMap;
  } catch (e) {
    return {};
  }
}

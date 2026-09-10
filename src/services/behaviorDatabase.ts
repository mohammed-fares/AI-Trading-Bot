import { openDB, IDBPDatabase } from 'idb';
import {
  SwingRecord,
  SwingOutcome,
  PatternStats,
  SymbolBehaviorStats,
} from '../types';

const DB_NAME = 'ai_trading_bot_behavior';
const DB_VERSION = 1;
const MAX_SWINGS_PER_SYMBOL = 5000;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export interface StoredPatternRecord extends PatternStats {
  compositeKey: string; // `${symbol}_${tag}`
}

let dbInstance: IDBPDatabase | null = null;
let isIndexedDBAvailable = true;

// In-Memory Fallback Cache in case IndexedDB is unavailable in restrictive iframe
const memorySwings = new Map<string, SwingRecord>();
const memoryPatterns = new Map<string, StoredPatternRecord>();
const memorySymbols = new Map<string, SymbolBehaviorStats>();

/**
 * Initializes and retrieves the IndexedDB instance with fallback.
 */
export async function getDB(): Promise<IDBPDatabase | null> {
  if (!isIndexedDBAvailable) return null;
  if (dbInstance) return dbInstance;

  try {
    if (typeof indexedDB === 'undefined') {
      isIndexedDBAvailable = false;
      return null;
    }

    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. swings store
        if (!db.objectStoreNames.contains('swings')) {
          const swingStore = db.createObjectStore('swings', { keyPath: 'id' });
          swingStore.createIndex('by-symbol', 'symbol', { unique: false });
          swingStore.createIndex('by-tag', 'patternTag', { unique: false });
          swingStore.createIndex('by-time', 'startTime', { unique: false });
        }

        // 2. patterns store
        if (!db.objectStoreNames.contains('patterns')) {
          const patternStore = db.createObjectStore('patterns', {
            keyPath: 'compositeKey',
          });
          patternStore.createIndex('by-symbol', 'symbol', { unique: false });
          patternStore.createIndex(
            'by-confidence',
            'predictionConfidence',
            { unique: false }
          );
          patternStore.createIndex('by-occurrences', 'occurrences', {
            unique: false,
          });
        }

        // 3. symbols store
        if (!db.objectStoreNames.contains('symbols')) {
          db.createObjectStore('symbols', { keyPath: 'symbol' });
        }
      },
    });

    return dbInstance;
  } catch (err) {
    console.warn('IndexedDB unavailable, falling back to memory store:', err);
    isIndexedDBAvailable = false;
    return null;
  }
}

/**
 * Saves a swing record, cleans up records older than 90 days,
 * and maintains rolling window of max 5000 swings per symbol.
 */
export async function saveSwing(swing: SwingRecord): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      const tx = db.transaction('swings', 'readwrite');
      await tx.store.put(swing);

      // Rolling window and retention cleanup (asynchronously without blocking)
      cleanupOldSwings(db, swing.symbol).catch((e) =>
        console.warn('Swing cleanup warning:', e)
      );
      await tx.done;
    } else {
      memorySwings.set(swing.id, swing);
    }
  } catch (err) {
    console.warn('saveSwing failed on IndexedDB, falling back to memory:', err);
    memorySwings.set(swing.id, swing);
  }
}

async function cleanupOldSwings(
  db: IDBPDatabase,
  symbol: string
): Promise<void> {
  try {
    const tx = db.transaction('swings', 'readwrite');
    const index = tx.store.index('by-symbol');
    const records = await index.getAll(symbol);

    const now = Date.now();
    const toDeleteIds: string[] = [];

    // Check 90 days retention
    for (const r of records) {
      if (now - r.startTime > NINETY_DAYS_MS) {
        toDeleteIds.push(r.id);
      }
    }

    // Check 5000 max limit
    if (records.length - toDeleteIds.length > MAX_SWINGS_PER_SYMBOL) {
      // Sort oldest first
      const remaining = records
        .filter((r) => !toDeleteIds.includes(r.id))
        .sort((a, b) => a.startTime - b.startTime);

      const excess = remaining.length - MAX_SWINGS_PER_SYMBOL;
      for (let i = 0; i < excess; i++) {
        toDeleteIds.push(remaining[i].id);
      }
    }

    for (const id of toDeleteIds) {
      await tx.store.delete(id);
    }
    await tx.done;
  } catch (e) {
    // Non-fatal background cleanup
  }
}

/**
 * Retrieves a single swing by ID.
 */
export async function getSwing(id: string): Promise<SwingRecord | undefined> {
  try {
    const db = await getDB();
    if (db) {
      return await db.get('swings', id);
    }
    return memorySwings.get(id);
  } catch (err) {
    return memorySwings.get(id);
  }
}

/**
 * Retrieves swings by symbol, sorted newest first, with an optional limit.
 */
export async function getSwingsBySymbol(
  symbol: string,
  limit: number = 500
): Promise<SwingRecord[]> {
  try {
    const db = await getDB();
    if (db) {
      const records = await db.getAllFromIndex('swings', 'by-symbol', symbol);
      records.sort((a, b) => b.startTime - a.startTime);
      return records.slice(0, limit);
    }

    const filtered = Array.from(memorySwings.values())
      .filter((s) => s.symbol === symbol)
      .sort((a, b) => b.startTime - a.startTime);
    return filtered.slice(0, limit);
  } catch (err) {
    const filtered = Array.from(memorySwings.values())
      .filter((s) => s.symbol === symbol)
      .sort((a, b) => b.startTime - a.startTime);
    return filtered.slice(0, limit);
  }
}

/**
 * Retrieves swings by tag for a specific symbol.
 */
export async function getSwingsByTag(
  symbol: string,
  tag: string
): Promise<SwingRecord[]> {
  try {
    const db = await getDB();
    if (db) {
      const records = await db.getAllFromIndex('swings', 'by-tag', tag);
      return records.filter((s) => s.symbol === symbol);
    }

    return Array.from(memorySwings.values()).filter(
      (s) => s.symbol === symbol && s.patternTag === tag
    );
  } catch (err) {
    return Array.from(memorySwings.values()).filter(
      (s) => s.symbol === symbol && s.patternTag === tag
    );
  }
}

/**
 * Updates the outcome of a swing record by ID.
 */
export async function updateSwingOutcome(
  id: string,
  outcome: SwingOutcome,
  magnitude: number
): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      const swing = await db.get('swings', id);
      if (swing) {
        swing.outcome = outcome;
        swing.outcomeMagnitude = magnitude;
        await db.put('swings', swing);
      }
    } else {
      const swing = memorySwings.get(id);
      if (swing) {
        swing.outcome = outcome;
        swing.outcomeMagnitude = magnitude;
      }
    }
  } catch (err) {
    const swing = memorySwings.get(id);
    if (swing) {
      swing.outcome = outcome;
      swing.outcomeMagnitude = magnitude;
    }
  }
}

/**
 * Counts total swings, optionally filtered by symbol.
 */
export async function getSwingCount(symbol?: string): Promise<number> {
  try {
    const db = await getDB();
    if (db) {
      if (symbol) {
        return await db.countFromIndex('swings', 'by-symbol', symbol);
      }
      return await db.count('swings');
    }
    if (symbol) {
      return Array.from(memorySwings.values()).filter(
        (s) => s.symbol === symbol
      ).length;
    }
    return memorySwings.size;
  } catch (err) {
    return memorySwings.size;
  }
}

/**
 * Saves or updates PatternStats.
 */
export async function savePatternStats(stats: PatternStats): Promise<void> {
  const compositeKey = `${stats.symbol}_${stats.tag}`;
  const record: StoredPatternRecord = { ...stats, compositeKey };

  try {
    const db = await getDB();
    if (db) {
      await db.put('patterns', record);
    } else {
      memoryPatterns.set(compositeKey, record);
    }
  } catch (err) {
    memoryPatterns.set(compositeKey, record);
  }
}

/**
 * Retrieves PatternStats by symbol and tag.
 */
export async function getPatternStats(
  symbol: string,
  tag: string
): Promise<PatternStats | undefined> {
  const compositeKey = `${symbol}_${tag}`;
  try {
    const db = await getDB();
    if (db) {
      const record = await db.get('patterns', compositeKey);
      if (record) {
        const { compositeKey: _k, ...rest } = record;
        return rest;
      }
    }
    const mem = memoryPatterns.get(compositeKey);
    if (mem) {
      const { compositeKey: _k, ...rest } = mem;
      return rest;
    }
    return undefined;
  } catch (err) {
    const mem = memoryPatterns.get(compositeKey);
    return mem;
  }
}

/**
 * Retrieves the top patterns for a symbol sorted by confidence and occurrences.
 */
export async function getTopPatterns(
  symbol: string,
  limit: number = 10
): Promise<PatternStats[]> {
  try {
    const db = await getDB();
    let records: StoredPatternRecord[] = [];
    if (db) {
      records = await db.getAllFromIndex('patterns', 'by-symbol', symbol);
    } else {
      records = Array.from(memoryPatterns.values()).filter(
        (p) => p.symbol === symbol
      );
    }

    records.sort((a, b) => {
      if (b.predictionConfidence !== a.predictionConfidence) {
        return b.predictionConfidence - a.predictionConfidence;
      }
      return b.occurrences - a.occurrences;
    });

    return records.slice(0, limit).map(({ compositeKey: _k, ...rest }) => rest);
  } catch (err) {
    return [];
  }
}

/**
 * Retrieves all pattern statistics for a symbol.
 */
export async function getAllPatternsForSymbol(
  symbol: string
): Promise<PatternStats[]> {
  return getTopPatterns(symbol, 1000);
}

/**
 * Updates PatternStats given a newly analyzed SwingRecord.
 */
export async function updatePatternStats(
  symbol: string,
  swing: SwingRecord
): Promise<void> {
  if (!swing.patternTag) return;
  const tag = swing.patternTag;

  let existing = await getPatternStats(symbol, tag);
  if (!existing) {
    existing = {
      tag,
      symbol,
      occurrences: 0,
      lastSeen: 0,
      continuedCount: 0,
      reversedCount: 0,
      sidewaysCount: 0,
      avgNextMovement: 0,
      avgNextDuration: 0,
      avgPeakProfitBeforeReversal: 0,
      predictionConfidence: 0,
      stdDev: 0,
      avgRange: 0,
    };
  }

  const occurrences = existing.occurrences + 1;
  const lastSeen = Date.now();

  let continuedCount = existing.continuedCount;
  let reversedCount = existing.reversedCount;
  let sidewaysCount = existing.sidewaysCount;

  if (swing.outcome === 'CONTINUED') continuedCount++;
  else if (swing.outcome === 'REVERSED') reversedCount++;
  else if (swing.outcome === 'SIDEWAYS') sidewaysCount++;

  const maxOutcomeCount = Math.max(
    continuedCount,
    reversedCount,
    sidewaysCount
  );
  const predictionConfidence = Number(
    ((maxOutcomeCount / occurrences) * 100).toFixed(1)
  );

  const nextMovement = swing.outcomeMagnitude ?? swing.amplitudePct;
  const nextDuration = swing.durationMinutes;

  const avgNextMovement = Number(
    (
      (existing.avgNextMovement * (occurrences - 1) + nextMovement) /
      occurrences
    ).toFixed(2)
  );
  const avgNextDuration = Math.round(
    (existing.avgNextDuration * (occurrences - 1) + nextDuration) / occurrences
  );

  const updated: PatternStats = {
    ...existing,
    occurrences,
    lastSeen,
    continuedCount,
    reversedCount,
    sidewaysCount,
    predictionConfidence,
    avgNextMovement,
    avgNextDuration,
    avgRange: avgNextMovement,
  };

  await savePatternStats(updated);
}

/**
 * Saves symbol summary statistics.
 */
export async function saveSymbolStats(
  stats: SymbolBehaviorStats
): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await db.put('symbols', stats);
    } else {
      memorySymbols.set(stats.symbol, stats);
    }
  } catch (err) {
    memorySymbols.set(stats.symbol, stats);
  }
}

/**
 * Retrieves symbol summary statistics.
 */
export async function getSymbolStats(
  symbol: string
): Promise<SymbolBehaviorStats | undefined> {
  try {
    const db = await getDB();
    if (db) {
      return await db.get('symbols', symbol);
    }
    return memorySymbols.get(symbol);
  } catch (err) {
    return memorySymbols.get(symbol);
  }
}

/**
 * Retrieves all unique symbols registered in the behavior database.
 */
export async function getAllSymbols(): Promise<string[]> {
  try {
    const db = await getDB();
    if (db) {
      const keys = await db.getAllKeys('symbols');
      return keys.map(String);
    }
    return Array.from(memorySymbols.keys());
  } catch (err) {
    return Array.from(memorySymbols.keys());
  }
}

/**
 * Clears all data from the behavioral database.
 */
export async function clearAllData(): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      const tx = db.transaction(['swings', 'patterns', 'symbols'], 'readwrite');
      await tx.objectStore('swings').clear();
      await tx.objectStore('patterns').clear();
      await tx.objectStore('symbols').clear();
      await tx.done;
    }
    memorySwings.clear();
    memoryPatterns.clear();
    memorySymbols.clear();
  } catch (err) {
    memorySwings.clear();
    memoryPatterns.clear();
    memorySymbols.clear();
  }
}

/**
 * Calculates estimated database size in Megabytes (MB).
 */
export async function getDBSizeMB(): Promise<number> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage) {
        return Number((estimate.usage / (1024 * 1024)).toFixed(2));
      }
    }
    // Estimate based on record counts
    const count = await getSwingCount();
    const estimatedBytes = count * 280; // ~280 bytes per SwingRecord
    return Number((estimatedBytes / (1024 * 1024)).toFixed(2));
  } catch (err) {
    return 0.05;
  }
}

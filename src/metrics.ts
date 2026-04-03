import { Database } from "bun:sqlite";

export interface RequestMetric {
  timestamp: number;
  model: string;
  inputTokensOriginal: number;
  inputTokensOptimized: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  authType: "api_key" | "oauth";
  optimizations: string[];
}

export interface SessionStats {
  totalRequests: number;
  totalInputOriginal: number;
  totalInputOptimized: number;
  totalOutputTokens: number;
  totalSaved: number;
  savingsPercent: number;
  costSaved: number;
}

const PRICING: Record<string, { input: number; output: number }> = {
  "sonnet": { input: 3, output: 15 },
  "opus": { input: 5, output: 25 },
  "haiku": { input: 1, output: 5 },
};

function getInputPrice(model: string): number {
  for (const [key, val] of Object.entries(PRICING)) {
    if (model.toLowerCase().includes(key)) return val.input;
  }
  return 3; // Default Sonnet
}

export class MetricsStore {
  private db: Database;

  constructor(dbPath: string = "codeprune.db") {
    this.db = new Database(dbPath);
    this.db.run("PRAGMA journal_mode = WAL");
    this.db.run(`
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        model TEXT NOT NULL,
        input_tokens_original INTEGER NOT NULL,
        input_tokens_optimized INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        cache_read_tokens INTEGER DEFAULT 0,
        cache_write_tokens INTEGER DEFAULT 0,
        auth_type TEXT NOT NULL,
        optimizations TEXT NOT NULL
      )
    `);
  }

  record(metric: RequestMetric): void {
    this.db.run(
      `INSERT INTO requests (timestamp, model, input_tokens_original, input_tokens_optimized, output_tokens, cache_read_tokens, cache_write_tokens, auth_type, optimizations)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        metric.timestamp,
        metric.model,
        metric.inputTokensOriginal,
        metric.inputTokensOptimized,
        metric.outputTokens,
        metric.cacheReadTokens,
        metric.cacheWriteTokens,
        metric.authType,
        JSON.stringify(metric.optimizations),
      ]
    );
  }

  getSessionStats(): SessionStats {
    const row = this.db
      .query(
        `SELECT
          COUNT(*) as totalRequests,
          COALESCE(SUM(input_tokens_original), 0) as totalInputOriginal,
          COALESCE(SUM(input_tokens_optimized), 0) as totalInputOptimized,
          COALESCE(SUM(output_tokens), 0) as totalOutputTokens
        FROM requests`
      )
      .get() as any;

    const totalSaved = row.totalInputOriginal - row.totalInputOptimized;
    const savingsPercent =
      row.totalInputOriginal > 0
        ? (totalSaved / row.totalInputOriginal) * 100
        : 0;

    const costSaved = (totalSaved / 1_000_000) * 3;

    return {
      totalRequests: row.totalRequests,
      totalInputOriginal: row.totalInputOriginal,
      totalInputOptimized: row.totalInputOptimized,
      totalOutputTokens: row.totalOutputTokens,
      totalSaved,
      savingsPercent,
      costSaved,
    };
  }

  getRequestLog(limit: number = 50): any[] {
    return this.db
      .query(`SELECT * FROM requests ORDER BY timestamp DESC LIMIT ?`)
      .all(limit) as any[];
  }
}

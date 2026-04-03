import { describe, test, expect, beforeEach } from "bun:test";
import { MetricsStore } from "./metrics";

describe("MetricsStore", () => {
  let store: MetricsStore;

  beforeEach(() => {
    store = new MetricsStore(":memory:");
  });

  test("records a request and retrieves stats", () => {
    store.record({
      timestamp: Date.now(),
      model: "claude-sonnet-4-20250514",
      inputTokensOriginal: 10000,
      inputTokensOptimized: 6000,
      outputTokens: 2000,
      cacheReadTokens: 5000,
      cacheWriteTokens: 1000,
      authType: "api_key",
      optimizations: ["tool_result_truncation", "git_status_pruning"],
    });

    const stats = store.getSessionStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.totalInputOriginal).toBe(10000);
    expect(stats.totalInputOptimized).toBe(6000);
    expect(stats.totalSaved).toBe(4000);
    expect(stats.savingsPercent).toBeCloseTo(40, 0);
  });

  test("accumulates multiple requests", () => {
    store.record({
      timestamp: Date.now(),
      model: "claude-sonnet-4-20250514",
      inputTokensOriginal: 10000,
      inputTokensOptimized: 7000,
      outputTokens: 1000,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      authType: "oauth",
      optimizations: ["tool_result_truncation"],
    });
    store.record({
      timestamp: Date.now(),
      model: "claude-sonnet-4-20250514",
      inputTokensOriginal: 8000,
      inputTokensOptimized: 5000,
      outputTokens: 500,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      authType: "oauth",
      optimizations: ["git_status_pruning"],
    });

    const stats = store.getSessionStats();
    expect(stats.totalRequests).toBe(2);
    expect(stats.totalInputOriginal).toBe(18000);
    expect(stats.totalInputOptimized).toBe(12000);
    expect(stats.totalSaved).toBe(6000);
  });

  test("calculates cost savings", () => {
    store.record({
      timestamp: Date.now(),
      model: "claude-sonnet-4-20250514",
      inputTokensOriginal: 100000,
      inputTokensOptimized: 60000,
      outputTokens: 5000,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      authType: "api_key",
      optimizations: ["tool_result_truncation"],
    });

    const stats = store.getSessionStats();
    expect(stats.costSaved).toBeGreaterThan(0);
  });

  test("returns per-request log", () => {
    store.record({
      timestamp: Date.now(),
      model: "claude-sonnet-4-20250514",
      inputTokensOriginal: 5000,
      inputTokensOptimized: 3000,
      outputTokens: 1000,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      authType: "api_key",
      optimizations: ["tool_result_truncation"],
    });

    const log = store.getRequestLog(10);
    expect(log.length).toBe(1);
    expect(log[0].model).toBe("claude-sonnet-4-20250514");
  });
});

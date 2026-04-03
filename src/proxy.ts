import { Hono } from "hono";
import { cors } from "hono/cors";
import { TokenOptimizer } from "./optimizer";
import { MetricsStore } from "./metrics";
import { getDashboardHTML } from "./dashboard";

const app = new Hono();
const optimizer = new TokenOptimizer();
const metrics = new MetricsStore("codeprune.db");

const UPSTREAM = process.env.CODEPRUNE_UPSTREAM || "https://api.anthropic.com";
const PORT = parseInt(process.env.CODEPRUNE_PORT || "4100");
let MODE: "optimized" | "passthrough" = (process.env.CODEPRUNE_MODE === "passthrough") ? "passthrough" : "optimized";

app.use("*", cors());

// Health check
app.get("/health", (c) => c.json({ status: "ok", upstream: UPSTREAM, version: "0.1.0" }));

// Dashboard
app.get("/dashboard", (c) => c.html(getDashboardHTML()));

// Stats API
app.get("/api/stats", (c) => c.json(metrics.getSessionStats()));
app.get("/api/comparison", (c) => c.json(metrics.getComparisonStats()));
app.get("/api/requests", (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  return c.json(metrics.getRequestLog(limit));
});
app.get("/api/mode", (c) => c.json({ mode: MODE }));
app.post("/api/mode", async (c) => {
  const body = await c.req.json();
  if (body.mode === "optimized" || body.mode === "passthrough") {
    MODE = body.mode;
    console.log(`[CodePrune] Mode switched to: ${MODE}`);
    return c.json({ mode: MODE });
  }
  return c.json({ error: "Invalid mode" }, 400);
});

// Main proxy — forward all /v1/* to upstream
app.all("/v1/*", async (c) => {
  const path = c.req.path;
  const method = c.req.method;
  const url = `${UPSTREAM}${path}`;

  // Detect auth type
  const apiKey = c.req.header("x-api-key");
  const authType: "api_key" | "oauth" = apiKey ? "api_key" : "oauth";

  // Forward headers (skip host and content-length)
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    if (key === "host" || key === "content-length") return;
    headers[key] = value;
  });

  // Non-POST requests: forward directly
  if (method !== "POST") {
    const resp = await fetch(url, { method, headers });
    return new Response(resp.body, {
      status: resp.status,
      headers: Object.fromEntries(resp.headers.entries()),
    });
  }

  // Parse request body
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  // Only process /v1/messages
  let optimizeResult: any = null;
  if (path === "/v1/messages") {
    const messages = body.messages || [];
    const system = body.system || [];

    // Always measure original size
    const result = optimizer.optimize(messages, system);

    if (MODE === "optimized") {
      // Apply optimizations
      body.messages = result.messages;
      if (result.system.length > 0) {
        body.system = result.system;
      }
      if (result.optimizations.length > 0) {
        console.log(
          `[CodePrune] Optimized: ${result.inputTokensOriginal} -> ${result.inputTokensOptimized} tokens (${result.optimizations.join(", ")})`
        );
      }
    } else {
      // Passthrough — log original size but don't modify
      result.inputTokensOptimized = result.inputTokensOriginal;
      result.optimizations = [];
      console.log(`[CodePrune] Passthrough: ${result.inputTokensOriginal} tokens (no optimization)`);
    }
    optimizeResult = result;
  }

  headers["content-type"] = "application/json";

  // Forward to upstream
  const upstreamResp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  // Streaming response: tee the stream, extract usage from one copy
  if (body.stream) {
    const respBody = upstreamResp.body;
    if (!respBody) {
      return new Response(null, { status: upstreamResp.status });
    }

    const [userStream, metricsStream] = respBody.tee();

    // Extract usage in background
    extractStreamUsage(metricsStream, optimizeResult, authType, body.model, MODE);

    // Forward stream to client
    const respHeaders: Record<string, string> = {};
    upstreamResp.headers.forEach((value, key) => {
      // Don't forward content-encoding — we're passing raw bytes
      if (key === "content-encoding") return;
      respHeaders[key] = value;
    });

    return new Response(userStream, {
      status: upstreamResp.status,
      headers: respHeaders,
    });
  }

  // Non-streaming: read full response
  const responseBody = await upstreamResp.json();

  if (optimizeResult && responseBody.usage) {
    metrics.record({
      timestamp: Date.now(),
      model: body.model || "unknown",
      inputTokensOriginal: optimizeResult.inputTokensOriginal,
      inputTokensOptimized: optimizeResult.inputTokensOptimized,
      outputTokens: responseBody.usage.output_tokens || 0,
      cacheReadTokens: responseBody.usage.cache_read_input_tokens || 0,
      cacheWriteTokens: responseBody.usage.cache_creation_input_tokens || 0,
      authType,
      optimizations: optimizeResult.optimizations,
      mode: MODE,
    });
  }

  return c.json(responseBody, upstreamResp.status as any);
});

// Extract usage from SSE stream for metrics recording
async function extractStreamUsage(
  stream: ReadableStream,
  optimizeResult: any,
  authType: "api_key" | "oauth",
  model: string,
  currentMode: "optimized" | "passthrough" = "optimized"
) {
  if (!optimizeResult) return;

  try {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let lastUsage: any = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // Look for usage in SSE events — it appears in message_delta and message_stop events
      const usageMatches = chunk.matchAll(/"usage"\s*:\s*(\{[^}]+\})/g);
      for (const match of usageMatches) {
        try {
          lastUsage = JSON.parse(match[1]);
        } catch {}
      }
    }

    if (lastUsage) {
      metrics.record({
        timestamp: Date.now(),
        model: model || "unknown",
        inputTokensOriginal: optimizeResult.inputTokensOriginal,
        inputTokensOptimized: optimizeResult.inputTokensOptimized,
        outputTokens: lastUsage.output_tokens || 0,
        cacheReadTokens: lastUsage.cache_read_input_tokens || 0,
        cacheWriteTokens: lastUsage.cache_creation_input_tokens || 0,
        authType,
        optimizations: optimizeResult.optimizations,
        mode: currentMode,
      });
    }
  } catch (err) {
    console.error("[CodePrune] Stream usage extraction error:", err);
  }
}

// Startup banner
console.log(`
  ┌──────────────────────────────────────────┐
  │  CodePrune Token Optimizer v0.1.0        │
  │                                          │
  │  Proxy:      http://localhost:${PORT}       │
  │  Dashboard:  http://localhost:${PORT}/dashboard │
  │  Upstream:   ${UPSTREAM.slice(0, 35).padEnd(35)} │
  │                                          │
  │  Usage:                                  │
  │  export ANTHROPIC_BASE_URL=http://localhost:${PORT}  │
  └──────────────────────────────────────────┘
`);

export default {
  port: PORT,
  fetch: app.fetch,
};

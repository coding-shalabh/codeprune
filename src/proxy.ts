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

// FIX P-5: Allowlist of headers to forward (don't leak internal headers)
const FORWARD_HEADERS = new Set([
  "x-api-key", "authorization", "anthropic-version", "anthropic-beta",
  "content-type", "accept", "user-agent",
  "anthropic-dangerous-direct-browser-access",
]);

app.use("*", cors({
  origin: "*", // Dashboard needs this for fetch
  allowMethods: ["GET", "POST", "OPTIONS"],
}));

// Health check
app.get("/health", (c) => c.json({ status: "ok", upstream: UPSTREAM, version: "0.2.0" }));

// Dashboard
app.get("/dashboard", (c) => c.html(getDashboardHTML()));

// Stats API
app.get("/api/stats", (c) => c.json(metrics.getSessionStats()));
app.get("/api/comparison", (c) => c.json(metrics.getComparisonStats()));
app.get("/api/requests", (c) => {
  const raw = parseInt(c.req.query("limit") || "50");
  const limit = Number.isNaN(raw) ? 50 : Math.min(Math.max(raw, 1), 500);
  return c.json(metrics.getRequestLog(limit));
});
app.get("/api/mode", (c) => c.json({ mode: MODE }));
app.post("/api/mode", async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
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

  // FIX P-4: Snapshot mode at request start (prevents mid-request toggle corruption)
  const currentMode = MODE;

  // Detect auth type
  const apiKey = c.req.header("x-api-key");
  const authType: "api_key" | "oauth" = apiKey ? "api_key" : "oauth";

  // FIX P-5: Only forward allowed headers
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    if (FORWARD_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  // Non-POST requests: forward directly
  if (method !== "POST") {
    try {
      const resp = await fetch(url, { method, headers });
      return new Response(resp.body, {
        status: resp.status,
        headers: Object.fromEntries(resp.headers.entries()),
      });
    } catch (err: any) {
      return c.json({ type: "error", error: { type: "proxy_error", message: err.message } }, 502);
    }
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

    const result = optimizer.optimize(messages, system);

    if (currentMode === "optimized") {
      body.messages = result.messages;
      if (result.system.length > 0) {
        body.system = result.system;
      }
      if (result.optimizations.length > 0) {
        const pct = result.inputTokensOriginal > 0
          ? Math.round((1 - result.inputTokensOptimized / result.inputTokensOriginal) * 100)
          : 0;
        console.log(
          `[CodePrune] Optimized: ~${pct}% reduction (${result.optimizations.join(", ")})`
        );
      }
      optimizeResult = result;
    } else {
      // FIX P-15: Don't mutate result object — create new one
      optimizeResult = {
        ...result,
        inputTokensOptimized: result.inputTokensOriginal,
        optimizations: [],
      };
      console.log(`[CodePrune] Passthrough: ${result.inputTokensOriginal} tokens (no optimization)`);
    }
  }

  headers["content-type"] = "application/json";

  // Forward to upstream
  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    console.error("[CodePrune] Upstream fetch failed:", err.message);
    return c.json({
      type: "error",
      error: { type: "proxy_error", message: `Upstream unreachable: ${err.message}` }
    }, 502);
  }

  // FIX P-3: Use TransformStream instead of tee() to avoid doubling memory
  if (body.stream === true) {
    const respBody = upstreamResp.body;
    if (!respBody) {
      return new Response(null, { status: upstreamResp.status });
    }

    // FIX P-1: Buffer partial SSE lines across chunks
    let sseBuffer = "";
    let lastUsage: any = null;
    const decoder = new TextDecoder();

    const transform = new TransformStream({
      transform(chunk, controller) {
        // Pass through to client immediately
        controller.enqueue(chunk);

        // Parse usage from pass-through bytes (no second copy buffered)
        sseBuffer += decoder.decode(chunk, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() || ""; // Keep incomplete tail

        for (const line of lines) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.usage) lastUsage = event.usage;
            if (event.message?.usage) lastUsage = event.message.usage;
          } catch {}
        }
      },
      flush() {
        // Process remaining buffer
        if (sseBuffer.startsWith('data: ') && sseBuffer !== 'data: [DONE]') {
          try {
            const event = JSON.parse(sseBuffer.slice(6));
            if (event.usage) lastUsage = event.usage;
            if (event.message?.usage) lastUsage = event.message.usage;
          } catch {}
        }

        // Record metrics
        if (lastUsage && optimizeResult) {
          const actualInputTokens = lastUsage.input_tokens || 0;
          const projected = projectOriginal(actualInputTokens, optimizeResult, currentMode);
          metrics.record({
            timestamp: Date.now(),
            model: body.model || "unknown",
            inputTokensOriginal: projected,
            inputTokensOptimized: actualInputTokens,
            outputTokens: lastUsage.output_tokens || 0,
            cacheReadTokens: lastUsage.cache_read_input_tokens || 0,
            cacheWriteTokens: lastUsage.cache_creation_input_tokens || 0,
            authType,
            optimizations: optimizeResult.optimizations,
            mode: currentMode,
          });
        }
      }
    });

    const instrumentedStream = respBody.pipeThrough(transform);

    const respHeaders: Record<string, string> = {};
    upstreamResp.headers.forEach((value, key) => {
      if (key === "content-encoding") return;
      respHeaders[key] = value;
    });

    return new Response(instrumentedStream, {
      status: upstreamResp.status,
      headers: respHeaders,
    });
  }

  // FIX P-2: Handle non-JSON upstream responses (5xx error pages)
  const responseText = await upstreamResp.text();
  let responseBody: any;
  try {
    responseBody = JSON.parse(responseText);
  } catch {
    return new Response(responseText, {
      status: upstreamResp.status,
      headers: Object.fromEntries(upstreamResp.headers.entries()),
    });
  }

  if (optimizeResult && responseBody.usage) {
    const actualInputTokens = responseBody.usage.input_tokens || 0;
    const projected = projectOriginal(actualInputTokens, optimizeResult, currentMode);

    metrics.record({
      timestamp: Date.now(),
      model: body.model || "unknown",
      inputTokensOriginal: projected,
      inputTokensOptimized: actualInputTokens,
      outputTokens: responseBody.usage.output_tokens || 0,
      cacheReadTokens: responseBody.usage.cache_read_input_tokens || 0,
      cacheWriteTokens: responseBody.usage.cache_creation_input_tokens || 0,
      authType,
      optimizations: optimizeResult.optimizations,
      mode: currentMode,
    });
  }

  return c.json(responseBody, upstreamResp.status as any);
});

// FIX P-7: Safe ratio calculation — never returns NaN/Infinity
function projectOriginal(
  actualInputTokens: number,
  optimizeResult: any,
  mode: "optimized" | "passthrough"
): number {
  if (mode !== "optimized") return actualInputTokens;

  if (optimizeResult.inputTokensOptimized > 0 && optimizeResult.inputTokensOriginal > 0) {
    const estRatio = optimizeResult.inputTokensOriginal / optimizeResult.inputTokensOptimized;
    const projected = Math.round(actualInputTokens * estRatio);
    if (Number.isFinite(projected) && projected >= 0) return projected;
  }

  // Fallback: use the difference as additive offset
  const diff = Math.max(0, optimizeResult.inputTokensOriginal - optimizeResult.inputTokensOptimized);
  return actualInputTokens + diff;
}

// Startup banner
console.log(`
  ┌──────────────────────────────────────────┐
  │  CodePrune Token Optimizer v0.2.0        │
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

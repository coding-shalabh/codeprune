# CodePrune Prototype Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a token-optimizing proxy that sits between Claude Code and Anthropic's API, reducing token usage by 30-50% while preserving output quality. Benchmark with a REST API build task.

**Architecture:** Bun + Hono proxy on localhost:4100 intercepts all Claude Code API requests. The optimizer modifies request bodies (truncating tool results, pruning git noise, injecting conciseness instructions) before forwarding to upstream. SQLite stores per-request metrics. A dashboard endpoint shows savings in real-time.

**Tech Stack:** Bun runtime, Hono web framework, bun:sqlite, vanilla HTML/JS dashboard

---

## Tasks

### Task 1: Project Scaffolding
- Init git, package.json, tsconfig.json, .gitignore
- `bun install` hono + @types/bun

### Task 2: Metrics Storage (SQLite)
- MetricsStore class with record(), getSessionStats(), getRequestLog()
- Tests for accumulation, cost calculation, per-request log

### Task 3: Token Optimizer Engine
- TokenOptimizer class with 3 layers: tool result truncation, git status pruning, conciseness injection
- Tests for each layer independently

### Task 4: Proxy Server
- Hono server on port 4100, forwards all /v1/* to upstream
- Detects auth type (api_key vs oauth), applies optimizer to /v1/messages
- Handles both streaming and non-streaming responses
- Records metrics from response usage data

### Task 5: Dashboard
- Single HTML page served at /dashboard
- Real-time stats cards, optimization ratio bar, per-request log table
- Auto-refresh every 5 seconds via fetch to /api/stats and /api/requests

### Task 6: Benchmark Test Spec
- Write exact task spec for building a Bookmarks REST API
- Document Run A (raw) vs Run B (through proxy) procedure

### Task 7: README + Final Polish
- Setup instructions, how it works, configuration, license

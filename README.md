# CodePrune

**Cut your Claude Code token bill by 76%.** Open-source proxy that optimizes every API call.

Works with **API keys** and **Claude Pro/Max subscriptions**.

---

## The Problem

Claude Code burns through tokens fast. A single session can consume **2.5M+ tokens** — system prompts, tool results, conversation history, git noise. On subscriptions, you hit rate limits in 20 minutes. On API, that's $5-15/day.

## The Solution

CodePrune is a local proxy that sits between Claude Code and Anthropic's API. It optimizes request bodies in-flight — clearing old tool results, truncating long outputs, pruning noisy git status — before forwarding to the API.

```
Claude Code → CodePrune (localhost:4100) → Anthropic API
```

**Real benchmark results:**
- 2.55M tokens → 611K tokens (**76% reduction**)
- Subscription quota lasts **4x longer**
- **$5.80 saved** per session on API pricing

## Quick Start

```bash
git clone https://github.com/coding-shalabh/codeprune
cd codeprune && bun install
bun run dev
```

In another terminal:
```bash
# Bash/Zsh
export ANTHROPIC_BASE_URL=http://localhost:4100

# PowerShell
$env:ANTHROPIC_BASE_URL = "http://localhost:4100"

# Use Claude Code as normal
claude
```

Dashboard: http://localhost:4100/dashboard

## Works With

| Auth Method | How |
|---|---|
| **API Key** (`x-api-key: sk-ant-...`) | Pass-through, tracks cost in $ |
| **Claude Pro/Max** (`authorization: Bearer ...`) | Pass-through, tracks token savings |
| **Cline, Aider, OpenCode** | Any tool hitting `/v1/messages` |

## Optimization Layers

| Layer | What | Savings |
|---|---|---|
| **Old Result Clearing** | Clears tool results from earlier turns, keeps last 6 | 50-70% |
| **Tool Result Truncation** | Caps file reads/bash to head 50 + tail 20 lines | 50-70% |
| **Git Status Pruning** | Limits untracked files to 5 (dirty repos waste 500+ tokens) | 60-80% |
| **Output Conciseness** | Injects terse-output instruction (output costs 5x input) | 40-60% |

## Dashboard

Real-time metrics at `http://localhost:4100/dashboard`:
- Token savings (absolute + percentage)
- Cost savings (model-aware: Sonnet $3, Opus $5, Haiku $1 per Mtok)
- Side-by-side comparison: Optimized vs Passthrough mode
- Per-request log with optimization breakdown
- Mode toggle (Optimized / Passthrough) for A/B comparison

## Configuration

```bash
CODEPRUNE_PORT=4100                          # Proxy port (default: 4100)
CODEPRUNE_UPSTREAM=https://api.anthropic.com # Upstream API URL
CODEPRUNE_MODE=optimized                     # optimized | passthrough
```

## Tech Stack

- **Bun** runtime
- **Hono** web framework
- **bun:sqlite** for metrics
- Zero external dependencies beyond Hono

---

## Contributing

We'd love your help making CodePrune better! Here's how:

### Known Issues & Improvements Needed

- [ ] **Real tokenizer** — Currently uses `length/4` heuristic for pre-optimization estimates. Need `tiktoken` or Anthropic's tokenizer for accurate counts.
- [ ] **Rolling summary** — Instead of clearing old results entirely, use Haiku to summarize them cheaply. Preserves context while saving tokens.
- [ ] **CLAUDE.md compression** — Large CLAUDE.md files waste 2K+ tokens/session. Context-aware pruning based on current task.
- [ ] **Tool definition stripping** — Defer unused tool definitions (Claude Code's ToolSearch does this partially).
- [ ] **Cache-aware routing** — Prevent MCP instruction changes from busting the system prompt cache.
- [ ] **Hosted version** — Deploy as a hosted proxy so users don't need to run locally.
- [ ] **npm package** — `npx codeprune` for zero-install startup.
- [ ] **VS Code extension** — Toggle CodePrune on/off from the IDE.
- [ ] **Team dashboard** — Multi-user usage tracking, budget alerts, per-developer stats.

### How to Contribute

1. **Bug reports** — Open an issue with steps to reproduce
2. **Feature requests** — Open an issue describing the use case
3. **Pull requests** — Fork, create a branch, submit PR
4. **Feedback** — Star the repo, share on social media, tell us what you think

### Development

```bash
bun install
bun test          # Run tests (14 passing)
bun run dev       # Start with hot reload
```

### Reporting Issues

When reporting bugs, please include:
- Your OS and Node/Bun version
- Claude Code version
- Auth type (API key or subscription)
- Dashboard screenshot if relevant
- Steps to reproduce

---

## Why This Exists

Claude Code is an incredible tool, but token usage is the #1 complaint ([1,429 comments](https://github.com/anthropics/claude-code/issues) on usage limits). No production-ready optimizer existed. So we built one.

Based on analysis of Claude Code's architecture:
- **60% of tokens** go to tool results (file reads, bash output)
- **25%** to system prompt + tool definitions
- **10%** to conversation history
- **5%** to git status + system reminders

CodePrune targets the 60% — the tool results that accumulate every turn and get re-sent to the model on every request.

## License

MIT

---

Built by [@coding-shalabh](https://github.com/coding-shalabh)

# CodePrune

Token-optimizing proxy for Claude Code. Reduce costs by 30-50%.

## Quick Start

```bash
# Install
bun install

# Start proxy
bun run dev

# In your terminal (or .bashrc/.zshrc)
export ANTHROPIC_BASE_URL=http://localhost:4100
# Now use Claude Code as normal — tokens are automatically optimized
```

Dashboard: http://localhost:4100/dashboard

## How It Works

CodePrune sits between Claude Code and Anthropic's API:

```
Claude Code -> CodePrune (localhost:4100) -> Anthropic API
                    |
              Optimizes request body
              Tracks token savings
              Shows dashboard
```

### Optimization Layers

| Layer | What | Savings |
|-------|------|---------|
| Tool Result Truncation | Caps file reads/bash output (head 100 + tail 30 lines) | 50-70% of tool results |
| Git Status Pruning | Limits untracked files to 5 (dirty repos waste 500+ tokens) | 60-80% of git noise |
| Output Conciseness | Injects terse-output instruction | 40-60% output reduction |

### Works With

- Claude Code CLI with API key (`x-api-key: sk-ant-...`)
- Claude Code with subscription (`authorization: Bearer ...`)
- Any tool using Anthropic's `/v1/messages` endpoint

## Configuration

```bash
CODEPRUNE_PORT=4100                          # Proxy port (default: 4100)
CODEPRUNE_UPSTREAM=https://api.anthropic.com # Upstream API URL
```

For subscription users:
```bash
CODEPRUNE_UPSTREAM=https://client.claude.ai
```

## Dashboard

Real-time metrics at http://localhost:4100/dashboard:
- Tokens saved (absolute + percentage)
- Cost savings (for API key users)
- Per-request optimization log
- Optimization breakdown per request

## Benchmarking

See `benchmark/task-spec.md` for instructions to compare raw vs optimized Claude Code runs.

## Tech Stack

- Bun runtime
- Hono web framework
- bun:sqlite for metrics
- Zero external dependencies beyond Hono

## License

MIT

# Benchmark: REST API Build Task

## The Task (identical for both runs)

Build a Node.js REST API for a "Bookmarks" service using Express + TypeScript:

1. Express server on port 3000
2. In-memory storage (array)
3. Endpoints:
   - GET /bookmarks - list all
   - GET /bookmarks/:id - get one
   - POST /bookmarks - create (title, url, tags[])
   - PUT /bookmarks/:id - update
   - DELETE /bookmarks/:id - delete
4. Input validation (title required, url must be valid)
5. Error handling middleware
6. TypeScript types for Bookmark

## Exact Prompt (use for both runs)

"Build a Node.js REST API for a bookmarks service using Express + TypeScript. In-memory storage. CRUD endpoints: GET /bookmarks, GET /bookmarks/:id, POST /bookmarks, PUT /bookmarks/:id, DELETE /bookmarks/:id. Add input validation (title required, url must be valid URL). Add error handling middleware. Add TypeScript types."

## Run A: Raw Claude Code (baseline)

1. Make sure CodePrune proxy is NOT running
2. Unset ANTHROPIC_BASE_URL (or set to default)
3. Create fresh dir: `mkdir benchmark/run-a && cd benchmark/run-a`
4. Run Claude Code with the prompt above
5. After completion, note the token usage from Claude Code's session info

## Run B: Through CodePrune

1. Start CodePrune: `cd codeprune && bun run dev`
2. In another terminal: `export ANTHROPIC_BASE_URL=http://localhost:4100`
3. Create fresh dir: `mkdir benchmark/run-b && cd benchmark/run-b`
4. Run Claude Code with the exact same prompt
5. Check dashboard at http://localhost:4100/dashboard for savings
6. Note token usage from both Claude Code session + CodePrune dashboard

## Metrics to Compare

| Metric | Run A (Raw) | Run B (CodePrune) |
|--------|------------|-------------------|
| Total input tokens | | |
| Total output tokens | | |
| Total cost / quota | | |
| Code quality | | |
| Time to completion | | |
| Token savings % | N/A | |

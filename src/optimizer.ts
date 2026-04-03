const MAX_TOOL_RESULT_CHARS = 3000;  // ~750 tokens
const MAX_TOOL_RESULT_LINES = 80;
const TRUNCATION_HEAD_LINES = 50;
const TRUNCATION_TAIL_LINES = 20;

export interface OptimizeResult {
  messages: any[];
  system: any[];
  optimizations: string[];
  inputTokensOriginal: number;
  inputTokensOptimized: number;
}

export class TokenOptimizer {
  optimize(messages: any[], system: any[]): OptimizeResult {
    const optimizations: string[] = [];

    let optimizedMessages = JSON.parse(JSON.stringify(messages));
    let optimizedSystem = JSON.parse(JSON.stringify(system));

    const originalTokens =
      this.estimateTokens(JSON.stringify(messages)) +
      this.estimateTokens(JSON.stringify(system));

    // Layer 0: Clear old tool results (keep only last N)
    if (this.clearOldToolResults(optimizedMessages)) {
      optimizations.push("old_result_clearing");
    }

    // Layer 1: Truncate remaining tool results that are still too long
    if (this.truncateToolResults(optimizedMessages)) {
      optimizations.push("tool_result_truncation");
    }

    // Layer 2: Prune git status noise
    if (this.pruneGitStatus(optimizedSystem)) {
      optimizations.push("git_status_pruning");
    }

    // Measure BEFORE conciseness injection (it adds tokens but saves on output side)
    const optimizedTokens =
      this.estimateTokens(JSON.stringify(optimizedMessages)) +
      this.estimateTokens(JSON.stringify(optimizedSystem));

    // Layer 3: Inject conciseness instruction (saves output tokens, not input)
    if (this.injectConciseness(optimizedSystem)) {
      optimizations.push("conciseness_injection");
    }

    return {
      messages: optimizedMessages,
      system: optimizedSystem,
      optimizations,
      inputTokensOriginal: originalTokens,
      inputTokensOptimized: optimizedTokens,
    };
  }

  private clearOldToolResults(messages: any[]): boolean {
    // Find all tool_result blocks and keep only the last KEEP_RECENT ones with full content
    const KEEP_RECENT = 6;
    let modified = false;

    const toolResultIndices: { msgIdx: number; blockIdx: number }[] = [];

    for (let m = 0; m < messages.length; m++) {
      const msg = messages[m];
      if (!Array.isArray(msg.content)) continue;
      for (let b = 0; b < msg.content.length; b++) {
        if (msg.content[b].type === "tool_result") {
          toolResultIndices.push({ msgIdx: m, blockIdx: b });
        }
      }
    }

    // Clear all but the last KEEP_RECENT tool results
    const clearCount = toolResultIndices.length - KEEP_RECENT;
    if (clearCount <= 0) return false;

    for (let i = 0; i < clearCount; i++) {
      const { msgIdx, blockIdx } = toolResultIndices[i];
      const block = messages[msgIdx].content[blockIdx];

      // Skip if already cleared
      const content = typeof block.content === "string" ? block.content : JSON.stringify(block.content);
      if (content.includes("[Cleared by CodePrune]") || content.length < 200) continue;

      block.content = "[Cleared by CodePrune — old tool result removed to save tokens]";
      modified = true;
    }

    return modified;
  }

  private truncateToolResults(messages: any[]): boolean {
    let modified = false;

    for (const msg of messages) {
      if (!Array.isArray(msg.content)) continue;

      for (const block of msg.content) {
        if (block.type !== "tool_result") continue;

        // Handle string content
        if (typeof block.content === "string") {
          const truncated = this.truncateText(block.content);
          if (truncated !== null) {
            block.content = truncated;
            modified = true;
          }
          continue;
        }

        // Handle array content (text blocks inside tool_result)
        if (Array.isArray(block.content)) {
          for (const inner of block.content) {
            if (inner.type === "text" && typeof inner.text === "string") {
              const truncated = this.truncateText(inner.text);
              if (truncated !== null) {
                inner.text = truncated;
                modified = true;
              }
            }
          }
        }
      }
    }

    return modified;
  }

  private truncateText(text: string): string | null {
    if (text.length <= MAX_TOOL_RESULT_CHARS) return null;

    const lines = text.split("\n");
    if (lines.length <= MAX_TOOL_RESULT_LINES) return null;

    const head = lines.slice(0, TRUNCATION_HEAD_LINES).join("\n");
    const tail = lines.slice(-TRUNCATION_TAIL_LINES).join("\n");
    const skipped = lines.length - TRUNCATION_HEAD_LINES - TRUNCATION_TAIL_LINES;

    return `${head}\n\n[... ${skipped} lines truncated by CodePrune ...]\n\n${tail}`;
  }

  private pruneGitStatus(system: any[]): boolean {
    let modified = false;

    for (const block of system) {
      if (typeof block.text !== "string") continue;
      if (!block.text.includes("gitStatus:")) continue;

      const lines = block.text.split("\n");
      const statusStart = lines.findIndex((l: string) => l.includes("Status:"));
      if (statusStart === -1) continue;

      let untrackedCount = 0;
      const maxUntracked = 5;
      const filteredLines: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i > statusStart && line.startsWith("??")) {
          untrackedCount++;
          if (untrackedCount <= maxUntracked) {
            filteredLines.push(line);
          } else if (untrackedCount === maxUntracked + 1) {
            filteredLines.push("[... more untracked files hidden by CodePrune]");
            modified = true;
          }
          // Skip remaining untracked
        } else {
          filteredLines.push(line);
        }
      }

      if (modified) {
        block.text = filteredLines.join("\n");
      }
    }

    return modified;
  }

  private injectConciseness(system: any[]): boolean {
    if (system.length === 0) return false;

    const instruction =
      "\n<codeprune-optimization>\nToken optimization active. Be maximally concise: no preamble, no trailing summaries, no restating what was asked. Code-only responses when possible. Skip explanations unless explicitly asked.\n</codeprune-optimization>\n";

    const lastBlock = system[system.length - 1];
    if (typeof lastBlock.text === "string") {
      lastBlock.text += instruction;
      return true;
    }

    return false;
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

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

function safeClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch {
    // Fallback for environments without structuredClone or unsupported types
    return JSON.parse(JSON.stringify(obj));
  }
}

export class TokenOptimizer {
  optimize(messages: any[], system: any[]): OptimizeResult {
    // FIX O-9: Guard against null/undefined inputs
    if (!Array.isArray(messages)) messages = [];
    if (!Array.isArray(system)) system = [];

    const optimizations: string[] = [];

    // FIX O-1: Use structuredClone instead of JSON.parse(JSON.stringify())
    let optimizedMessages = safeClone(messages);
    let optimizedSystem = safeClone(system);

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

    const clearCount = toolResultIndices.length - KEEP_RECENT;
    if (clearCount <= 0) return false;

    for (let i = 0; i < clearCount; i++) {
      const { msgIdx, blockIdx } = toolResultIndices[i];
      const block = messages[msgIdx].content[blockIdx];

      // FIX O-10: Guard against undefined/null content
      if (block.content == null) continue;

      const content = typeof block.content === "string" ? block.content : JSON.stringify(block.content);
      if (content.includes("[Cleared by CodePrune]") || content.length < 200) continue;

      // FIX O-4: Preserve content type (array vs string) when clearing
      if (Array.isArray(block.content)) {
        block.content = [{ type: "text", text: "[Cleared by CodePrune — old tool result removed to save tokens]" }];
      } else {
        block.content = "[Cleared by CodePrune — old tool result removed to save tokens]";
      }
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

  // FIX O-5: Handle both large single-line content AND many-line content
  private truncateText(text: string): string | null {
    if (text.length <= MAX_TOOL_RESULT_CHARS) return null;

    const lines = text.split("\n");

    // Large single-line or few-line content (minified JSON, base64, long logs)
    if (lines.length <= MAX_TOOL_RESULT_LINES) {
      return text.slice(0, MAX_TOOL_RESULT_CHARS) + "\n\n[... truncated by CodePrune (" + (text.length - MAX_TOOL_RESULT_CHARS) + " chars removed) ...]";
    }

    // Many-line content: keep head + tail
    const head = lines.slice(0, TRUNCATION_HEAD_LINES).join("\n");
    const tail = lines.slice(-TRUNCATION_TAIL_LINES).join("\n");
    const skipped = lines.length - TRUNCATION_HEAD_LINES - TRUNCATION_TAIL_LINES;
    if (skipped <= 0) return null;

    return `${head}\n\n[... ${skipped} lines truncated by CodePrune ...]\n\n${tail}`;
  }

  // FIX O-2: Proper git status section boundary + "?? " with space
  private pruneGitStatus(system: any[]): boolean {
    let modified = false;

    for (const block of system) {
      if (typeof block.text !== "string") continue;
      if (!block.text.includes("gitStatus:")) continue;

      const lines = block.text.split("\n");
      const statusStart = lines.findIndex((l: string) => /^Status:/.test(l.trim()) && !l.includes("gitStatus"));
      if (statusStart === -1) continue;

      let untrackedCount = 0;
      const maxUntracked = 5;
      const filteredLines: string[] = [];
      let inStatusSection = false;
      let blockModified = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (i === statusStart) {
          inStatusSection = true;
          filteredLines.push(line);
          continue;
        }

        // Detect end of status section (non-status line after status started)
        if (inStatusSection && line.trim() !== "" &&
            !line.startsWith("??") && !line.startsWith(" M") && !line.startsWith(" D") &&
            !line.startsWith("M ") && !line.startsWith("A ") && !line.startsWith("D ") &&
            !line.startsWith("R ") && !line.startsWith(" A") && !line.startsWith("m ")) {
          // Check if it looks like a git status line (single char + space + path)
          const isStatusLine = /^[MADRCU?! ]{1,2}\s/.test(line);
          if (!isStatusLine) {
            inStatusSection = false;
            filteredLines.push(line);
            continue;
          }
        }

        if (inStatusSection && line.startsWith("?? ")) {
          untrackedCount++;
          if (untrackedCount <= maxUntracked) {
            filteredLines.push(line);
          } else if (untrackedCount === maxUntracked + 1) {
            filteredLines.push("[... more untracked files hidden by CodePrune]");
            blockModified = true;
          }
        } else {
          filteredLines.push(line);
        }
      }

      if (blockModified) {
        block.text = filteredLines.join("\n");
        modified = true;
      }
    }

    return modified;
  }

  private injectConciseness(system: any[]): boolean {
    if (system.length === 0) return false;

    const instruction =
      "\n<codeprune-optimization>\nToken optimization active. Be maximally concise: no preamble, no trailing summaries, no restating what was asked. Code-only responses when possible. Skip explanations unless explicitly asked.\n</codeprune-optimization>\n";

    // Walk backwards to find last text block
    for (let i = system.length - 1; i >= 0; i--) {
      if (typeof system[i].text === "string") {
        system[i].text += instruction;
        return true;
      }
    }

    return false;
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

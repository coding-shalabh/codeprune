import { describe, test, expect } from "bun:test";
import { TokenOptimizer } from "./optimizer";

describe("TokenOptimizer", () => {
  const optimizer = new TokenOptimizer();

  test("truncates long tool results", () => {
    const messages = [
      {
        role: "assistant",
        content: [
          { type: "tool_use", id: "tu_1", name: "Read", input: { file_path: "/big/file.ts" } },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_1",
            content: "line content here\n".repeat(3000),
          },
        ],
      },
    ];

    const result = optimizer.optimize(messages, []);
    const toolResult = result.messages[1].content[0];
    expect(toolResult.content.length).toBeLessThan("line content here\n".repeat(3000).length);
    expect(toolResult.content).toContain("truncated by CodePrune");
    expect(result.optimizations).toContain("tool_result_truncation");
  });

  test("does NOT truncate short tool results", () => {
    const messages = [
      {
        role: "user",
        content: [
          { type: "tool_result", tool_use_id: "tu_1", content: "short output" },
        ],
      },
    ];

    const result = optimizer.optimize(messages, []);
    expect(result.messages[0].content[0].content).toBe("short output");
    expect(result.optimizations).not.toContain("tool_result_truncation");
  });

  test("truncates array-style tool result content", () => {
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_1",
            content: [
              { type: "text", text: "line here\n".repeat(3000) },
            ],
          },
        ],
      },
    ];

    const result = optimizer.optimize(messages, []);
    const inner = result.messages[0].content[0].content[0];
    expect(inner.text.length).toBeLessThan("line here\n".repeat(3000).length);
    expect(result.optimizations).toContain("tool_result_truncation");
  });

  test("prunes git status untracked files", () => {
    const untrackedLines = Array.from({ length: 20 }, (_, i) => `?? file${i}.txt`).join("\n");
    const system = [
      {
        type: "text",
        text: `gitStatus: Current branch: main\n\nStatus:\n M src/index.ts\n M src/app.ts\n${untrackedLines}\n\nRecent commits:`,
      },
    ];

    const result = optimizer.optimize([], system);
    expect(result.system[0].text).toContain("src/index.ts");
    expect(result.system[0].text).toContain("src/app.ts");
    expect(result.system[0].text).toContain("hidden by CodePrune");
    expect(result.system[0].text).not.toContain("file19.txt");
    expect(result.optimizations).toContain("git_status_pruning");
  });

  test("does NOT prune when few untracked files", () => {
    const system = [
      {
        type: "text",
        text: "gitStatus: Status:\n M src/index.ts\n?? file1.txt\n?? file2.txt",
      },
    ];

    const result = optimizer.optimize([], system);
    expect(result.optimizations).not.toContain("git_status_pruning");
  });

  test("injects conciseness instruction", () => {
    const system = [{ type: "text", text: "You are Claude Code..." }];

    const result = optimizer.optimize([], system);
    expect(result.system[0].text).toContain("codeprune-optimization");
    expect(result.system[0].text).toContain("concise");
    expect(result.optimizations).toContain("conciseness_injection");
  });

  test("estimates token count", () => {
    const count = optimizer.estimateTokens("Hello world, this is a test");
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(20);
  });

  test("reports token savings", () => {
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_1",
            content: "x\n".repeat(5000),
          },
        ],
      },
    ];

    const result = optimizer.optimize(messages, []);
    expect(result.inputTokensOptimized).toBeLessThan(result.inputTokensOriginal);
  });

  test("clears old tool results keeping only recent ones", () => {
    // Create 10 tool results — only last 6 should keep content
    const messages: any[] = [];
    for (let i = 0; i < 10; i++) {
      messages.push({
        role: "assistant",
        content: [{ type: "tool_use", id: `tu_${i}`, name: "Read", input: {} }],
      });
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: `tu_${i}`,
            content: `This is a long tool result number ${i} with enough content to not be skipped. `.repeat(10),
          },
        ],
      });
    }

    const result = optimizer.optimize(messages, []);
    expect(result.optimizations).toContain("old_result_clearing");

    // First 4 should be cleared, last 6 should keep content
    const firstResult = result.messages[1].content[0];
    expect(firstResult.content).toContain("Cleared by CodePrune");

    const lastResult = result.messages[19].content[0];
    expect(lastResult.content).toContain("tool result number 9");
  });

  test("conciseness injection does not increase measured input tokens", () => {
    const system = [{ type: "text", text: "You are Claude Code..." }];

    const result = optimizer.optimize([], system);
    // optimizedTokens measured BEFORE injection, so should equal original
    expect(result.inputTokensOptimized).toBe(result.inputTokensOriginal);
    expect(result.optimizations).toContain("conciseness_injection");
  });
});

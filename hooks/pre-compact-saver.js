#!/usr/bin/env node
/**
 * Hook: PreCompact — Save Critical Context Before Compaction
 *
 * Before context window is compressed, save important state:
 * 1. Current modified files list
 * 2. Active plan progress
 * 3. Key decisions made in this session
 */
const fs = require("fs");
const path = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const context = [];

    // ── 1. Summarize modified files ──
    const logFile = path.join(projectDir, ".claude", ".modified-files.log");
    if (fs.existsSync(logFile)) {
      const lines = fs
        .readFileSync(logFile, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean);
      if (lines.length > 0) {
        const files = [
          ...new Set(lines.map((l) => l.split(" ").slice(1).join(" "))),
        ];
        context.push(
          `[Compact] Files modified this session (${files.length}): ${files
            .slice(0, 20)
            .join(", ")}${files.length > 20 ? "..." : ""}`
        );
      }
    }

    // ── 2. Check active checklists ──
    const plansDir = path.join(projectDir, ".claude", "plans");
    if (fs.existsSync(plansDir)) {
      const checklists = fs
        .readdirSync(plansDir)
        .filter((f) => f.includes("checklist"));
      for (const cl of checklists.slice(0, 3)) {
        try {
          const content = fs.readFileSync(path.join(plansDir, cl), "utf8");
          const total = (content.match(/- \[[ x]\]/g) || []).length;
          const done = (content.match(/- \[x\]/g) || []).length;
          if (total > 0) {
            context.push(
              `[Compact] Checklist ${cl}: ${done}/${total} complete`
            );
          }
        } catch (_) {}
      }
    }

    if (context.length > 0) {
      // Inject as additional context that survives compaction summary
      const output = {
        hookSpecificOutput: {
          hookEventName: "PreCompact",
          additionalContext: context.join("\n"),
        },
      };
      console.log(JSON.stringify(output));
    }

    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});

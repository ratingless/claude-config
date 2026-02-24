#!/usr/bin/env node
/**
 * Hook: PostToolUse(Bash) — Analyze Bash Results (v2.0 — All Languages)
 *
 * After bash command execution, analyze the result:
 * 1. Detect test failures (JS/TS, Python, Go, Rust, Java)
 * 2. Detect build/compile errors
 * 3. Detect package manager warnings
 * 4. Detect linter errors
 */
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const cmd = (data.tool_input || {}).command || "";
    const response = data.tool_response || {};
    const output =
      typeof response === "string" ? response : JSON.stringify(response);

    const hints = [];

    // ── Test Failures (all languages) ──
    if (
      /test|vitest|jest|pytest|cargo test|go test|mvn test|gradle test|rspec|phpunit/i.test(
        cmd
      )
    ) {
      if (
        /fail|error|FAIL|FAILED|ERRORS/i.test(output) &&
        !/0 failed|0 errors|passed/i.test(output)
      ) {
        hints.push(
          "[Post-Bash] Test failures detected. Fix failing tests before proceeding."
        );
      }
    }

    // ── TypeScript Errors ──
    if (/tsc|typescript/i.test(cmd)) {
      const errorMatch = output.match(/Found\s+(\d+)\s+error/);
      if (errorMatch && parseInt(errorMatch[1]) > 0) {
        hints.push(
          `[Post-Bash] ${errorMatch[1]} TypeScript errors found. Fix before continuing.`
        );
      }
    }

    // ── Python Errors ──
    if (/python|mypy|pyright|flake8|ruff/i.test(cmd)) {
      if (/error:|Error:|SyntaxError|TypeError|ImportError/i.test(output)) {
        hints.push(
          "[Post-Bash] Python errors detected. Review and fix before continuing."
        );
      }
    }

    // ── Go Errors ──
    if (/go (build|run|vet|test)/i.test(cmd)) {
      if (/cannot|undefined|syntax error/i.test(output)) {
        hints.push(
          "[Post-Bash] Go compilation errors detected. Fix before continuing."
        );
      }
    }

    // ── Rust Errors ──
    if (/cargo (build|check|test|clippy)/i.test(cmd)) {
      if (/error\[E\d+\]/i.test(output)) {
        hints.push(
          "[Post-Bash] Rust compilation errors detected. Fix before continuing."
        );
      }
    }

    // ── Build Failures (generic) ──
    if (/build|compile|make/i.test(cmd) && /error|Error|ERROR/i.test(output)) {
      if (!hints.some((h) => h.includes("compilation errors"))) {
        hints.push(
          "[Post-Bash] Build errors detected. Review output and fix before proceeding."
        );
      }
    }

    // ── Lint Errors ──
    if (/lint|eslint|flake8|ruff|golangci|clippy|checkstyle/i.test(cmd)) {
      if (
        /error|Error|\d+ problems?/i.test(output) &&
        !/0 errors|0 problems/i.test(output)
      ) {
        hints.push(
          "[Post-Bash] Lint errors detected. Fix lint issues before continuing."
        );
      }
    }

    // ── Package Manager Warnings (all ecosystems) ──
    if (
      /npm install|yarn add|pnpm add|pip install|cargo add|go get/i.test(cmd) &&
      /WARN|vulnerability|deprecated|CVE/i.test(output)
    ) {
      hints.push(
        "[Post-Bash] Package warnings detected. Consider reviewing vulnerabilities."
      );
    }

    if (hints.length > 0) {
      const result = {
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: hints.join("\n"),
        },
      };
      console.log(JSON.stringify(result));
    }

    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});

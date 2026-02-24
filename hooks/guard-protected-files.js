#!/usr/bin/env node
/**
 * Hook: PreToolUse(Write|Edit) — Guard Protected Files + Impact Analysis (v2.0)
 *
 * 빅테크 원칙: "Understand blast radius before every change"
 *
 * 1. Block writes to sensitive files (exit code 2)
 * 2. For allowed files, analyze impact: what depends on this file?
 * 3. Warn if many dependents (high blast radius)
 */
const fs = require("fs");
const path = require("path");

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const filePath = (data.tool_input || {}).file_path || "";
    const normalized = filePath.replace(/\\/g, "/").toLowerCase();

    // ── 1. BLOCK PROTECTED FILES ──
    const PROTECTED_PATTERNS = [
      {
        pattern: /\.env($|\.)/,
        msg: "Blocked: .env files contain secrets. Edit manually.",
      },
      {
        pattern: /credentials\.json|secrets\.json|\.secret/,
        msg: "Blocked: credentials file. Edit manually.",
      },
      {
        pattern: /\.(pem|key|cert|p12|pfx)$/,
        msg: "Blocked: certificate/key file. Edit manually.",
      },
      {
        pattern: /id_(rsa|ed25519|ecdsa)/,
        msg: "Blocked: SSH key file.",
      },
      { pattern: /\.ssh\//, msg: "Blocked: SSH directory file." },
      {
        pattern: /package-lock\.json$/,
        msg: "Blocked: package-lock.json is auto-generated. Use `npm install` instead.",
      },
      {
        pattern: /yarn\.lock$/,
        msg: "Blocked: yarn.lock is auto-generated. Use `yarn install` instead.",
      },
      {
        pattern: /pnpm-lock\.yaml$/,
        msg: "Blocked: pnpm-lock.yaml is auto-generated. Use `pnpm install` instead.",
      },
    ];

    for (const rule of PROTECTED_PATTERNS) {
      if (rule.pattern.test(normalized)) {
        process.stderr.write(rule.msg);
        process.exit(2);
        return;
      }
    }

    // ── 2. IMPACT ANALYSIS (non-blocking) ──
    const projectDir = process.env.CLAUDE_PROJECT_DIR || data.cwd || ".";
    const ext = path.extname(filePath).toLowerCase();
    const codeExts = [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];

    if (codeExts.includes(ext)) {
      try {
        const basename = path.basename(filePath, ext);
        const relPath = path.relative(projectDir, filePath).replace(/\\/g, "/");
        const warnings = [];

        // Check if this is an index/barrel file (high impact)
        if (basename === "index") {
          warnings.push(
            "[Impact] Editing barrel/index file — changes may affect all consumers of this module."
          );
        }

        // Check if this is a shared utility/hook/context (high impact)
        const sharedPatterns = [
          /\/(hooks|utils|lib|helpers|contexts|providers|stores)\//i,
          /\/(shared|common|core)\//i,
        ];
        if (sharedPatterns.some((p) => p.test(relPath))) {
          warnings.push(
            "[Impact] Editing shared utility — multiple modules may depend on this. Run full test suite after changes."
          );
        }

        // Check if this is a config file
        const configPatterns = [
          /\.(config|rc)\.(ts|js|json|yaml|yml)$/,
          /tsconfig/,
          /vite\.config/,
          /next\.config/,
          /tailwind\.config/,
          /eslint/,
          /prettier/,
        ];
        if (configPatterns.some((p) => p.test(relPath))) {
          warnings.push(
            "[Impact] Editing config file — this affects the entire project build/behavior."
          );
        }

        // Check if this file has a co-located test
        const testFile = filePath.replace(new RegExp(`${ext}$`), `.test${ext}`);
        const specFile = filePath.replace(new RegExp(`${ext}$`), `.spec${ext}`);
        const hasTest = fs.existsSync(testFile) || fs.existsSync(specFile);

        if (
          !hasTest &&
          !relPath.includes("test") &&
          !relPath.includes("spec") &&
          !relPath.includes("stories")
        ) {
          warnings.push(
            "[Quality] No co-located test file found. Consider adding tests for this file."
          );
        }

        if (warnings.length > 0) {
          const result = {
            hookSpecificOutput: {
              hookEventName: "PreToolUse",
              additionalContext: warnings.join("\n"),
            },
          };
          console.log(JSON.stringify(result));
        }
      } catch (_) {
        /* impact analysis is best-effort */
      }
    }

    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});

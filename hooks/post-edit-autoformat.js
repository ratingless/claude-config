#!/usr/bin/env node
/**
 * Hook: PostToolUse(Write|Edit) — Auto Format + Change Manifest + Test Finder (v2.0)
 *
 * 빅테크 원칙: "Every change is tracked and has corresponding tests"
 *
 * After every file write/edit:
 * 1. Track the modified file in a change manifest
 * 2. Auto-run formatter (prettier, eslint --fix)
 * 3. Find and suggest related test files
 * 4. Detect code quality issues
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const filePath = (data.tool_input || {}).file_path || "";
    if (!filePath) {
      process.exit(0);
      return;
    }

    const projectDir = process.env.CLAUDE_PROJECT_DIR || data.cwd || ".";
    const ext = path.extname(filePath).toLowerCase();
    const relPath = path.relative(projectDir, filePath).replace(/\\/g, "/");
    const basename = path.basename(filePath, ext);

    // ── 1. CHANGE MANIFEST ──
    // Track modified files with metadata for the Stop hook to verify
    const manifestDir = path.join(projectDir, ".claude");
    const manifestPath = path.join(manifestDir, ".change-manifest.json");

    try {
      let manifest = { files: {}, sessionStart: new Date().toISOString() };
      if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      }

      const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath);
      const isStoryFile = /\.stories\.(ts|tsx|js|jsx)$/.test(filePath);
      const isConfigFile =
        /\.(config|rc)\.(ts|js|json|yaml|yml)$/.test(relPath) ||
        /tsconfig|eslint|prettier|vite\.config|next\.config/.test(relPath);

      manifest.files[relPath] = {
        lastModified: new Date().toISOString(),
        type: isTestFile
          ? "test"
          : isStoryFile
          ? "story"
          : isConfigFile
          ? "config"
          : "source",
        tested: isTestFile ? true : manifest.files[relPath]?.tested || false,
        editCount: (manifest.files[relPath]?.editCount || 0) + 1,
      };

      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch (_) {
      /* manifest is best-effort */
    }

    // Also write to simple log for backward compat
    const logFile = path.join(manifestDir, ".modified-files.log");
    try {
      fs.appendFileSync(logFile, `${new Date().toISOString()} ${filePath}\n`);
    } catch (_) {}

    // ── 2. AUTO-FORMAT ──
    const formattable = [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".css",
      ".json",
      ".md",
      ".html",
      ".yaml",
      ".yml",
      ".vue",
      ".svelte",
    ];
    if (formattable.includes(ext)) {
      // Prettier
      try {
        const hasPrettier =
          fs.existsSync(path.join(projectDir, ".prettierrc")) ||
          fs.existsSync(path.join(projectDir, ".prettierrc.json")) ||
          fs.existsSync(path.join(projectDir, "prettier.config.js")) ||
          fs.existsSync(
            path.join(projectDir, "node_modules", ".bin", "prettier")
          );

        if (hasPrettier) {
          execSync(`npx prettier --write "${filePath}"`, {
            cwd: projectDir,
            timeout: 10000,
            stdio: "pipe",
          });
        }
      } catch (_) {}

      // ESLint fix for JS/TS
      if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
        try {
          if (
            fs.existsSync(
              path.join(projectDir, "node_modules", ".bin", "eslint")
            )
          ) {
            execSync(`npx eslint --fix "${filePath}" 2>/dev/null`, {
              cwd: projectDir,
              timeout: 10000,
              stdio: "pipe",
            });
          }
        } catch (_) {}
      }
    }

    // ── 3. FIND RELATED TESTS ──
    const warnings = [];
    const isSourceCode =
      [".ts", ".tsx", ".js", ".jsx"].includes(ext) &&
      !/\.(test|spec|stories)\.(ts|tsx|js|jsx)$/.test(filePath);

    if (isSourceCode) {
      const testVariants = [
        filePath.replace(new RegExp(`${ext}$`), `.test${ext}`),
        filePath.replace(new RegExp(`${ext}$`), `.spec${ext}`),
        filePath
          .replace(/\/src\//, "/test/")
          .replace(new RegExp(`${ext}$`), `.test${ext}`),
        filePath
          .replace(/\/src\//, "/__tests__/")
          .replace(new RegExp(`${ext}$`), `.test${ext}`),
      ];

      const existingTests = testVariants.filter((t) => fs.existsSync(t));

      if (existingTests.length > 0) {
        const testNames = existingTests.map((t) => path.basename(t)).join(", ");
        warnings.push(
          `[Test Hint] Related test found: ${testNames}. Run tests to verify your changes.`
        );

        // Mark as having tests in manifest
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          if (manifest.files[relPath]) {
            manifest.files[relPath].relatedTests = existingTests.map((t) =>
              path.relative(projectDir, t).replace(/\\/g, "/")
            );
          }
          fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        } catch (_) {}
      }
    }

    // ── 4. CODE QUALITY CHECKS ──
    try {
      const content = fs.readFileSync(filePath, "utf8");

      // Debug leftovers
      if (
        /console\.(log|debug)\(/g.test(content) &&
        !filePath.includes("test") &&
        !filePath.includes("spec") &&
        !filePath.includes(".js") // allow in build scripts
      ) {
        const count = (content.match(/console\.(log|debug)\(/g) || []).length;
        if (count > 3)
          warnings.push(
            `[Quality] ${count} console.log/debug statements found. Remove before committing.`
          );
      }

      // Hardcoded secrets
      if (
        /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}/i.test(
          content
        )
      ) {
        warnings.push(
          "WARNING: Possible hardcoded secret detected! Use environment variables instead."
        );
      }

      // any type in TypeScript
      if (
        [".ts", ".tsx"].includes(ext) &&
        /:\s*any\b/.test(content) &&
        !filePath.includes("test")
      ) {
        const count = (content.match(/:\s*any\b/g) || []).length;
        if (count > 0)
          warnings.push(
            `[TypeScript] ${count} \`any\` type(s) found. Use specific types or \`unknown\`.`
          );
      }
    } catch (_) {}

    if (warnings.length > 0) {
      const result = {
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: warnings.join(" | "),
        },
      };
      console.log(JSON.stringify(result));
    }

    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});

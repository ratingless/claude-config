#!/usr/bin/env node
/**
 * Hook: SessionStart — Load Previous Context (v2.0 — All Languages)
 *
 * On session start/resume:
 * 1. Clear previous session's change manifest
 * 2. Check for active plans/checklists
 * 3. Detect project type and stack (JS/TS, Python, Go, Rust, Java, etc.)
 * 4. Inject relevant context
 */
const fs = require("fs");
const path = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";

try {
  const context = [];

  // ── 1. Clear previous session logs ──
  const logFile = path.join(projectDir, ".claude", ".modified-files.log");
  const manifestFile = path.join(
    projectDir,
    ".claude",
    ".change-manifest.json"
  );
  try {
    fs.writeFileSync(logFile, "");
  } catch (_) {}
  try {
    fs.writeFileSync(
      manifestFile,
      JSON.stringify(
        { files: {}, sessionStart: new Date().toISOString() },
        null,
        2
      )
    );
  } catch (_) {}

  // ── 2. Check for active plans ──
  const plansDir = path.join(projectDir, ".claude", "plans");
  if (fs.existsSync(plansDir)) {
    const plans = fs.readdirSync(plansDir).filter((f) => f.endsWith(".md"));
    if (plans.length > 0) {
      const checklists = plans.filter((f) => f.includes("checklist"));
      if (checklists.length > 0) {
        context.push(
          `[Session] Active checklists found: ${checklists.join(
            ", "
          )}. Review them to continue previous work.`
        );
      } else {
        context.push(`[Session] Active plans found: ${plans.join(", ")}.`);
      }
    }
  }

  // ── 3. Detect project stack (all languages) ──
  const stack = [];

  // JavaScript / TypeScript ecosystem
  const packageJson = path.join(projectDir, "package.json");
  if (fs.existsSync(packageJson)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJson, "utf8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps["react"]) stack.push("React");
      if (deps["vue"]) stack.push("Vue");
      if (deps["next"]) stack.push("Next.js");
      if (deps["nuxt"]) stack.push("Nuxt");
      if (deps["svelte"]) stack.push("Svelte");
      if (deps["angular"]) stack.push("Angular");
      if (deps["@nestjs/core"]) stack.push("NestJS");
      if (deps["express"]) stack.push("Express");
      if (deps["fastify"]) stack.push("Fastify");
      if (deps["prisma"] || deps["@prisma/client"]) stack.push("Prisma");
      if (deps["drizzle-orm"]) stack.push("Drizzle");
      if (deps["typescript"]) stack.push("TypeScript");
      if (deps["vitest"]) stack.push("Vitest");
      if (deps["jest"]) stack.push("Jest");
      if (deps["@playwright/test"]) stack.push("Playwright");
      if (deps["cypress"]) stack.push("Cypress");
      if (deps["storybook"] || deps["@storybook/react"])
        stack.push("Storybook");
      if (deps["tailwindcss"]) stack.push("Tailwind");
    } catch (_) {}
  }

  // Python
  const pyproject = path.join(projectDir, "pyproject.toml");
  const requirements = path.join(projectDir, "requirements.txt");
  const pipfile = path.join(projectDir, "Pipfile");
  if (fs.existsSync(pyproject)) {
    stack.push("Python");
    try {
      const content = fs.readFileSync(pyproject, "utf8");
      if (/django/i.test(content)) stack.push("Django");
      if (/fastapi/i.test(content)) stack.push("FastAPI");
      if (/flask/i.test(content)) stack.push("Flask");
      if (/pytest/i.test(content)) stack.push("Pytest");
    } catch (_) {}
  } else if (fs.existsSync(requirements) || fs.existsSync(pipfile)) {
    stack.push("Python");
  }

  // Go
  if (fs.existsSync(path.join(projectDir, "go.mod"))) {
    stack.push("Go");
    try {
      const content = fs.readFileSync(path.join(projectDir, "go.mod"), "utf8");
      if (/gin-gonic/i.test(content)) stack.push("Gin");
      if (/gorilla\/mux/i.test(content)) stack.push("Gorilla");
      if (/fiber/i.test(content)) stack.push("Fiber");
    } catch (_) {}
  }

  // Rust
  if (fs.existsSync(path.join(projectDir, "Cargo.toml"))) {
    stack.push("Rust");
    try {
      const content = fs.readFileSync(
        path.join(projectDir, "Cargo.toml"),
        "utf8"
      );
      if (/actix/i.test(content)) stack.push("Actix");
      if (/axum/i.test(content)) stack.push("Axum");
      if (/tokio/i.test(content)) stack.push("Tokio");
    } catch (_) {}
  }

  // Java / Kotlin
  if (fs.existsSync(path.join(projectDir, "pom.xml"))) {
    stack.push("Java (Maven)");
  } else if (
    fs.existsSync(path.join(projectDir, "build.gradle")) ||
    fs.existsSync(path.join(projectDir, "build.gradle.kts"))
  ) {
    stack.push(
      fs.existsSync(path.join(projectDir, "build.gradle.kts"))
        ? "Kotlin (Gradle)"
        : "Java (Gradle)"
    );
  }

  // Ruby
  if (fs.existsSync(path.join(projectDir, "Gemfile"))) {
    stack.push("Ruby");
    try {
      const content = fs.readFileSync(path.join(projectDir, "Gemfile"), "utf8");
      if (/rails/i.test(content)) stack.push("Rails");
    } catch (_) {}
  }

  // PHP
  if (fs.existsSync(path.join(projectDir, "composer.json"))) {
    stack.push("PHP");
    try {
      const content = fs.readFileSync(
        path.join(projectDir, "composer.json"),
        "utf8"
      );
      if (/laravel/i.test(content)) stack.push("Laravel");
    } catch (_) {}
  }

  // C# / .NET
  if (
    fs
      .readdirSync(projectDir)
      .some((f) => f.endsWith(".csproj") || f.endsWith(".sln"))
  ) {
    stack.push("C# (.NET)");
  }

  // Docker
  if (
    fs.existsSync(path.join(projectDir, "Dockerfile")) ||
    fs.existsSync(path.join(projectDir, "docker-compose.yml"))
  ) {
    stack.push("Docker");
  }

  if (stack.length > 0) {
    context.push(`[Session] Project stack: ${stack.join(", ")}`);
  }

  // ── 4. Load project profile (accumulated across sessions) ──
  const profilePath = path.join(projectDir, ".claude", "project-profile.json");
  if (fs.existsSync(profilePath)) {
    try {
      const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
      const conventions = profile.conventions || {};
      const convList = Object.entries(conventions)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      if (convList) {
        context.push(`[Session] Learned conventions: ${convList}`);
      }
      if (profile.sessionCount > 1) {
        const topLangs = Object.keys(profile.activeLanguages || {}).slice(0, 3);
        if (topLangs.length > 0) {
          context.push(
            `[Session] Most active languages (${
              profile.sessionCount
            } sessions): ${topLangs.join(", ")}`
          );
        }
      }
    } catch (_) {}
  }

  if (context.length > 0) {
    console.log(context.join("\n"));
  }

  process.exit(0);
} catch (e) {
  process.exit(0);
}

#!/usr/bin/env node
/**
 * Hook: UserPromptSubmit — Smart Context Injector (v2.0 — Big-Tech Level)
 *
 * 빅테크 원칙: "Right context at the right time"
 *
 * 5-dimensional analysis:
 * 1. Intent Detection — what does the user want to do?
 * 2. Domain Detection — what area of the codebase?
 * 3. Complexity Assessment — is this a big task needing planning?
 * 4. Risk Assessment — could this break things?
 * 5. Project-Aware Context — what tech stack are we working with?
 *
 * Injects actionable guidance, not generic tips.
 */
const fs = require("fs");
const path = require("path");

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || "").toLowerCase();
    const promptRaw = data.prompt || "";
    const cwd = data.cwd || process.env.CLAUDE_PROJECT_DIR || ".";
    const hints = [];

    // ══════════════════════════════════════════
    // 1. INTENT DETECTION (multi-label)
    // ══════════════════════════════════════════
    const INTENTS = {
      create:
        /\b(create|add|new|build|implement|make|scaffold|generate|생성|추가|만들|구현|작성)\b/,
      fix: /\b(fix|bug|error|broken|crash|debug|patch|hotfix|수정|버그|오류|에러|고치|패치)\b/,
      review:
        /\b(review|check|audit|inspect|analyze|리뷰|검토|검사|확인|분석)\b/,
      refactor:
        /\b(refactor|clean|improve|optimize|simplify|restructure|리팩|개선|최적화|정리|단순화)\b/,
      test: /\b(test|spec|coverage|vitest|jest|playwright|pytest|테스트|검증|커버리지)\b/,
      deploy: /\b(deploy|release|publish|ci|cd|배포|릴리즈|퍼블리시)\b/,
      delete: /\b(delete|remove|drop|clean\s*up|삭제|제거|정리)\b/,
      migrate:
        /\b(migrate|migration|upgrade|update\s+version|마이그레이션|업그레이드)\b/,
      security:
        /\b(security|auth|vulnerability|cve|xss|sql\s*inject|csrf|보안|취약점)\b/,
    };

    const detectedIntents = [];
    for (const [intent, pattern] of Object.entries(INTENTS)) {
      if (pattern.test(prompt)) detectedIntents.push(intent);
    }

    // ══════════════════════════════════════════
    // 2. DOMAIN DETECTION
    // ══════════════════════════════════════════
    const DOMAINS = {
      frontend:
        /\b(react|vue|angular|svelte|component|css|html|jsx|tsx|style|ui|ux|hook|state|render|프론트|컴포넌트|스타일)\b/,
      backend:
        /\b(api|server|endpoint|controller|service|middleware|nest|express|fastify|route|handler|백엔드|서버)\b/,
      database:
        /\b(database|db|sql|prisma|schema|migration|query|table|model|orm|seed|데이터베이스|스키마|테이블)\b/,
      auth: /\b(auth|login|jwt|session|token|password|oauth|permission|role|guard|인증|로그인|권한)\b/,
      infra:
        /\b(docker|k8s|kubernetes|nginx|deploy|ci|cd|pipeline|terraform|aws|gcp|azure|인프라|배포)\b/,
      git: /\b(git|commit|branch|merge|pr|pull\s*request|rebase|cherry|stash|커밋|브랜치|머지)\b/,
    };

    const detectedDomains = [];
    for (const [domain, pattern] of Object.entries(DOMAINS)) {
      if (pattern.test(prompt)) detectedDomains.push(domain);
    }

    // ══════════════════════════════════════════
    // 3. FILE PATH EXTRACTION
    // ══════════════════════════════════════════
    const filePatterns =
      promptRaw.match(
        /[\w\-/.\\]+\.(ts|tsx|js|jsx|css|md|json|py|go|rs|java|sql|yaml|yml|toml|prisma|vue|svelte)\b/g
      ) || [];
    const mentionedFiles = [...new Set(filePatterns)];

    // ══════════════════════════════════════════
    // 4. COMPLEXITY & RISK ASSESSMENT
    // ══════════════════════════════════════════
    const complexitySignals = {
      multiFile:
        mentionedFiles.length > 3 ||
        /\b(all|every|entire|across|multiple|전체|모든|여러)\b/.test(prompt),
      architectural:
        /\b(architect|redesign|restructure|migrate|monorepo|아키텍|설계|구조)\b/.test(
          prompt
        ),
      crossCutting:
        detectedDomains.length >= 2 ||
        /\b(full.?stack|end.?to.?end|풀스택)\b/.test(prompt),
      longPrompt: promptRaw.length > 400,
      multiStep:
        /\b(then|after|next|and\s+also|first.*then|그리고|다음|먼저.*그다음)\b/.test(
          prompt
        ),
    };

    const complexityScore =
      Object.values(complexitySignals).filter(Boolean).length;
    const isComplex = complexityScore >= 2;

    const riskSignals = {
      deletion: detectedIntents.includes("delete"),
      database: detectedDomains.includes("database"),
      auth:
        detectedDomains.includes("auth") ||
        detectedIntents.includes("security"),
      deploy: detectedIntents.includes("deploy"),
      migration: detectedIntents.includes("migrate"),
      global: /\b(global|every|all\s+files|전역|전체\s+파일)\b/.test(prompt),
    };

    const riskScore = Object.values(riskSignals).filter(Boolean).length;
    const isRisky = riskScore >= 2;

    // ══════════════════════════════════════════
    // 5. PROJECT-AWARE CONTEXT
    // ══════════════════════════════════════════
    let projectStack = [];
    try {
      const pkgPath = path.join(cwd, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps["react"]) projectStack.push("React");
        if (deps["vue"]) projectStack.push("Vue");
        if (deps["next"]) projectStack.push("Next.js");
        if (deps["@nestjs/core"]) projectStack.push("NestJS");
        if (deps["express"]) projectStack.push("Express");
        if (deps["prisma"] || deps["@prisma/client"])
          projectStack.push("Prisma");
        if (deps["typescript"]) projectStack.push("TypeScript");
        if (deps["vitest"]) projectStack.push("Vitest");
        if (deps["jest"]) projectStack.push("Jest");
        if (deps["tailwindcss"]) projectStack.push("Tailwind");
      }
    } catch (_) {}

    // ══════════════════════════════════════════
    // 6. GENERATE ACTIONABLE HINTS
    // ══════════════════════════════════════════

    // -- Complexity Gate --
    if (isComplex) {
      hints.push(
        "[Context] Complex task detected (multi-file/cross-domain/multi-step). " +
          "Consider: 1) Use EnterPlanMode to design approach first. " +
          "2) Break into smaller atomic changes. " +
          "3) Verify each step before proceeding."
      );
    }

    // -- Risk Gate --
    if (isRisky) {
      hints.push(
        "[Risk] High-risk operation detected. " +
          "Ensure: 1) Current state is committed/stashed. " +
          "2) Changes are reversible. " +
          "3) Run relevant tests after each change."
      );
    }

    // -- Intent-Specific Guidance --
    if (detectedIntents.includes("refactor")) {
      hints.push(
        "[Refactor Protocol] " +
          "1) Run tests BEFORE refactoring to establish baseline. " +
          "2) Make one structural change at a time. " +
          "3) Run tests AFTER each change. " +
          "4) Keep behavior identical — no feature changes during refactor."
      );
    }

    if (detectedIntents.includes("fix")) {
      hints.push(
        "[Debug Protocol] " +
          "1) Reproduce the bug first. " +
          "2) Read the relevant code (don't guess). " +
          "3) Fix root cause, not symptom. " +
          "4) Add a test that catches this bug."
      );
    }

    if (detectedIntents.includes("delete")) {
      hints.push(
        "[Deletion Safety] " +
          "Before deleting: check all imports/references to the target. " +
          "Use Grep to find dependents. Confirm with user before removing."
      );
    }

    if (detectedIntents.includes("migrate")) {
      hints.push(
        "[Migration Protocol] " +
          "1) Back up current state. " +
          "2) Create migration plan with rollback steps. " +
          "3) Test migration on isolated branch. " +
          "4) Verify data integrity after migration."
      );
    }

    // -- Domain-Specific Guidance --
    if (riskSignals.database) {
      hints.push(
        "[DB Safety] " +
          "Schema changes require migration files. " +
          "Never modify production data directly. " +
          "Test with seed data first."
      );
    }

    if (riskSignals.auth) {
      hints.push(
        "[Security] " +
          "No hardcoded secrets. Use env vars. " +
          "Validate all inputs at boundaries. " +
          "Check OWASP Top 10 compliance."
      );
    }

    // -- Test Reminder for Create/Fix --
    if (
      (detectedIntents.includes("create") || detectedIntents.includes("fix")) &&
      !detectedIntents.includes("test")
    ) {
      hints.push("[Quality] Remember to add/update tests for your changes.");
    }

    // Limit to 3 most important hints to avoid noise
    const output = hints.slice(0, 3);
    if (output.length > 0) {
      console.log(output.join("\n"));
    }

    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});

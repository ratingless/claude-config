#!/usr/bin/env node
/**
 * Hook: Stop — Auto-update Project Profile
 *
 * After each session, analyze what was done and accumulate
 * project-specific patterns into a profile that persists.
 *
 * Tracks:
 * - File types modified (what languages are actively used)
 * - Directories touched (what modules are active)
 * - Common patterns (test framework, build tool, etc.)
 * - Error patterns encountered (what keeps breaking)
 */
const fs = require("fs");
const path = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";
const profilePath = path.join(projectDir, ".claude", "project-profile.json");
const manifestPath = path.join(projectDir, ".claude", ".change-manifest.json");

try {
  // Load existing profile or create new
  let profile = {
    lastUpdated: null,
    sessionCount: 0,
    activeLanguages: {},
    activeDirectories: {},
    filePatterns: {},
    conventions: {},
  };

  if (fs.existsSync(profilePath)) {
    try {
      profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
    } catch (_) {}
  }

  // Load change manifest from this session
  let manifest = { files: {} };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (_) {}
  }

  const changedFiles = Object.keys(manifest.files);
  if (changedFiles.length === 0) {
    process.exit(0);
    return;
  }

  // ── Update session count ──
  profile.sessionCount = (profile.sessionCount || 0) + 1;
  profile.lastUpdated = new Date().toISOString();

  // ── Track active languages by extension ──
  const extMap = {
    ".ts": "TypeScript",
    ".tsx": "TypeScript (React)",
    ".js": "JavaScript",
    ".jsx": "JavaScript (React)",
    ".py": "Python",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".kt": "Kotlin",
    ".rb": "Ruby",
    ".php": "PHP",
    ".cs": "C#",
    ".css": "CSS",
    ".scss": "SCSS",
    ".vue": "Vue",
    ".svelte": "Svelte",
    ".sql": "SQL",
    ".prisma": "Prisma",
  };

  for (const file of changedFiles) {
    const ext = path.extname(file).toLowerCase();
    const lang = extMap[ext];
    if (lang) {
      profile.activeLanguages[lang] = (profile.activeLanguages[lang] || 0) + 1;
    }

    // Track directory activity
    const dir = path.dirname(file).split("/").slice(0, 2).join("/");
    if (dir && dir !== ".") {
      profile.activeDirectories[dir] =
        (profile.activeDirectories[dir] || 0) + 1;
    }

    // Track file naming patterns
    if (/\.test\.(ts|tsx|js|jsx)$/.test(file)) {
      profile.filePatterns["test-colocated"] =
        (profile.filePatterns["test-colocated"] || 0) + 1;
    }
    if (/\.spec\.(ts|tsx|js|jsx)$/.test(file)) {
      profile.filePatterns["spec-colocated"] =
        (profile.filePatterns["spec-colocated"] || 0) + 1;
    }
    if (/\.stories\.(ts|tsx|js|jsx)$/.test(file)) {
      profile.filePatterns["storybook"] =
        (profile.filePatterns["storybook"] || 0) + 1;
    }
    if (/\.module\.css$/.test(file)) {
      profile.filePatterns["css-modules"] =
        (profile.filePatterns["css-modules"] || 0) + 1;
    }
    if (/index\.(ts|js)$/.test(file)) {
      profile.filePatterns["barrel-exports"] =
        (profile.filePatterns["barrel-exports"] || 0) + 1;
    }
  }

  // ── Detect conventions from file patterns ──
  if (profile.filePatterns["test-colocated"] > 3) {
    profile.conventions["testStyle"] = "co-located .test files";
  }
  if (profile.filePatterns["spec-colocated"] > 3) {
    profile.conventions["testStyle"] = "co-located .spec files";
  }
  if (profile.filePatterns["css-modules"] > 3) {
    profile.conventions["styling"] = "CSS Modules";
  }
  if (profile.filePatterns["barrel-exports"] > 3) {
    profile.conventions["exports"] = "barrel index files";
  }
  if (profile.filePatterns["storybook"] > 3) {
    profile.conventions["docs"] = "Storybook stories";
  }

  // ── Sort languages by frequency ──
  const sortedLangs = Object.entries(profile.activeLanguages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  profile.activeLanguages = Object.fromEntries(sortedLangs);

  // ── Sort directories by frequency ──
  const sortedDirs = Object.entries(profile.activeDirectories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  profile.activeDirectories = Object.fromEntries(sortedDirs);

  // Save profile
  fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));

  process.exit(0);
} catch (e) {
  process.exit(0);
}

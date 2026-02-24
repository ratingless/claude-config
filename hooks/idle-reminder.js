#!/usr/bin/env node
/**
 * Hook: Notification(idle_prompt) — Idle Reminder
 *
 * When Claude has been waiting for user input for 60+ seconds,
 * provide a helpful reminder of what was being worked on.
 */
const fs = require("fs");
const path = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || ".";

try {
  const reminders = [];

  // Check modified files in this session
  const logFile = path.join(projectDir, ".claude", ".modified-files.log");
  if (fs.existsSync(logFile)) {
    const lines = fs
      .readFileSync(logFile, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean);
    if (lines.length > 0) {
      const recentFiles = lines
        .slice(-3)
        .map((l) => l.split(" ").slice(1).join(" "));
      reminders.push(`Recently modified: ${recentFiles.join(", ")}`);
    }
  }

  // Check for incomplete checklists
  const plansDir = path.join(projectDir, ".claude", "plans");
  if (fs.existsSync(plansDir)) {
    const checklists = fs
      .readdirSync(plansDir)
      .filter((f) => f.includes("checklist"));
    for (const cl of checklists.slice(0, 2)) {
      try {
        const content = fs.readFileSync(path.join(plansDir, cl), "utf8");
        const total = (content.match(/- \[[ x]\]/g) || []).length;
        const done = (content.match(/- \[x\]/g) || []).length;
        const remaining = total - done;
        if (remaining > 0) {
          reminders.push(`${cl}: ${remaining} items remaining`);
        }
      } catch (_) {}
    }
  }

  if (reminders.length > 0) {
    process.stderr.write(`[Idle] Context: ${reminders.join(" | ")}`);
  }

  process.exit(0);
} catch (e) {
  process.exit(0);
}

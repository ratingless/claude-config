#!/usr/bin/env node
/**
 * Hook: PreToolUse(Bash) — Guard Dangerous Commands
 *
 * Blocks destructive commands that could cause data loss.
 * Exit code 2 = block the command and show error to Claude.
 */
let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const cmd = (data.tool_input || {}).command || '';

    const BLOCKED = [
      { pattern: /rm\s+(-[rfRF]+\s+)?[\/~]/, msg: 'Blocked: recursive delete on root or home directory' },
      { pattern: /rm\s+-[rfRF]*\s+\.\s*$/, msg: 'Blocked: recursive delete on current directory' },
      { pattern: /git\s+push\s+.*--force(?!-with-lease)/, msg: 'Blocked: use --force-with-lease instead of --force' },
      { pattern: /git\s+reset\s+--hard\s+(?!HEAD)/, msg: 'Blocked: hard reset to non-HEAD ref. Confirm with user first.' },
      { pattern: /git\s+clean\s+-[dfxDFX]*f/, msg: 'Blocked: git clean -f removes untracked files permanently' },
      { pattern: /drop\s+(database|table|schema)\s/i, msg: 'Blocked: SQL DROP operation. Confirm with user first.' },
      { pattern: /truncate\s+table\s/i, msg: 'Blocked: SQL TRUNCATE operation. Confirm with user first.' },
      { pattern: />\s*\/dev\/sda/, msg: 'Blocked: writing directly to disk device' },
      { pattern: /format\s+[a-zA-Z]:/i, msg: 'Blocked: disk format command' },
      { pattern: /del\s+\/[sfSF]/i, msg: 'Blocked: Windows recursive delete' },
      { pattern: /npm\s+publish(?!\s+--dry-run)/, msg: 'Blocked: npm publish without --dry-run. Confirm with user.' },
      { pattern: /chmod\s+-R\s+777/, msg: 'Blocked: setting world-writable permissions recursively' },
    ];

    for (const rule of BLOCKED) {
      if (rule.pattern.test(cmd)) {
        process.stderr.write(rule.msg);
        process.exit(2);
        return;
      }
    }

    // Warn on potentially risky (but not blocked)
    const WARNINGS = [
      { pattern: /git\s+push/, msg: 'git push detected' },
      { pattern: /npm\s+install\s+(?!--save-dev).*(?!@)/, msg: 'npm install without --save-dev' },
    ];
    // Warnings are non-blocking, just logged
    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});

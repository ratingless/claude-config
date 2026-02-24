# claude-config

[Claude Code](https://docs.anthropic.com/en/docs/claude-code)용 프로덕션 수준 `.claude/` 설정 템플릿.
훅, 규칙, 스킬, 에이전트를 포함합니다.

## 사용법

```bash
git clone https://github.com/ratingless/claude-config.git
cp -r claude-config/ 내프로젝트/.claude/
```

## 구성 요소

### Hooks (9개) — 개발 라이프사이클 자동화

| 훅                       | 이벤트                  | 설명                                                 |
| ------------------------ | ----------------------- | ---------------------------------------------------- |
| smart-context-injector   | UserPromptSubmit        | 의도/도메인/복잡도/위험도 분석 후 맥락 힌트 주입     |
| guard-dangerous-commands | PreToolUse:Bash         | `rm -rf /`, `git push --force`, `DROP TABLE` 등 차단 |
| guard-protected-files    | PreToolUse:Write\|Edit  | .env, 인증서, lock 파일 보호 + 영향도 분석           |
| post-edit-autoformat     | PostToolUse:Write\|Edit | prettier/eslint 자동 실행, 변경 추적, 품질 검사      |
| post-bash-analyzer       | PostToolUse:Bash        | 테스트 실패/빌드 에러 감지 (JS/Python/Go/Rust/Java)  |
| session-context-loader   | SessionStart            | 프로젝트 스택 감지 (10개+ 언어), 학습된 컨벤션 로드  |
| project-profile-updater  | Stop                    | 세션별 프로젝트 패턴 누적                            |
| pre-compact-saver        | PreCompact              | 컨텍스트 압축 전 세션 상태 저장                      |
| idle-reminder            | Notification:idle       | 유휴 시 진행 상황 리마인더                           |

추가로 **Stop 프롬프트** (Definition of Done 검증)와 **SubagentStop 프롬프트** (서브에이전트 완료 검증) 포함.

### Rules (7개) — 범용 코딩 표준

| 규칙                  | 범위                                                  |
| --------------------- | ----------------------------------------------------- |
| coding-style.md       | 네이밍, 함수 설계, 에러 처리 (TS/Python/Go/Rust/Java) |
| git-workflow.md       | Conventional Commits, 브랜치 네이밍, 검증 규칙        |
| security.md           | 보호 파일, OWASP Top 10, 시크릿 관리                  |
| validation.md         | 완료 전 검증 (타입체크/테스트/린트/빌드)              |
| definition-of-done.md | 작업 유형별 16가지 완료 기준                          |
| task-memory.md        | 복잡 태스크용 3문서 패턴                              |
| adr.md                | Architecture Decision Records                         |

### Skills (3개) — 온디맨드 지식

| 스킬          | 챕터                             |
| ------------- | -------------------------------- |
| code-quality  | clean-code, testing, performance |
| debugging     | error-analysis, common-patterns  |
| project-setup | build-tools, ci-cd               |

### Agents (4개) — 전문 팀원

| 에이전트         | 역할                                                   |
| ---------------- | ------------------------------------------------------ |
| code-reviewer    | 5카테고리 코드 리뷰 (정확성, 보안, TS, 성능, 유지보수) |
| test-runner      | 스택 자동 감지, 테스트 실행, 실패 수정                 |
| planner          | 3문서 기획 시스템 (Plan, Context, Checklist)           |
| security-auditor | OWASP Top 10, 시크릿 감지, 의존성 감사                 |

## 커스터마이즈

### 플러그인 추가 (프로젝트별)

`.claude/settings.json`에 추가:

```json
{
  "enabledPlugins": {
    "context7@claude-plugins-official": true,
    "typescript-lsp@claude-plugins-official": true
  }
}
```

### 로컬 설정 오버라이드

`.claude/settings.local.json` 생성 (gitignore 대상) — 개인 환경설정용.

### 규칙 커스터마이즈

`.claude/rules/` 파일을 팀 컨벤션에 맞게 수정.

### 커스텀 훅 추가

`.claude/hooks/`에 `.js` 파일 추가 후 `settings.json`에 등록.

## 토큰 소비

| 구성 요소   | 토큰      | 시점                              |
| ----------- | --------- | --------------------------------- |
| Rules (7개) | ~2,500    | 항상 로드 (200K 컨텍스트의 1.25%) |
| Hooks (9개) | 0         | 외부 Node.js 프로세스             |
| Skills      | 각 ~1,000 | 호출 시에만                       |
| Agents      | 각 ~450   | 소환 시에만                       |

## 요구 사항

- Node.js >= 18
- Claude Code CLI

## 라이선스

MIT

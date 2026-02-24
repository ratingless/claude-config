# claude-config

[Claude Code](https://docs.anthropic.com/en/docs/claude-code)용 프로덕션 수준 `.claude/` 설정 템플릿.

복사 한 번으로 **9개 훅 + 7개 규칙 + 3개 스킬 + 4개 에이전트**가 적용됩니다.
모든 언어(JS/TS, Python, Go, Rust, Java, Ruby, PHP, C#)를 지원합니다.

---

## 설치

```bash
# 1. 클론
git clone https://github.com/ratingless/claude-config.git

# 2. 프로젝트에 복사
cp -r claude-config/ 내프로젝트/.claude/

# 3. 불필요한 파일 제거
rm -rf 내프로젝트/.claude/.git 내프로젝트/.claude/README.md
```

Claude Code를 실행하면 `.claude/settings.json`을 신뢰할지 한 번 물어봅니다. 승인하면 이후 **모든 훅이 자동으로 동작**합니다.

### 기존 `.claude/`가 있는 경우

`settings.json`의 `hooks` 섹션을 수동으로 병합하세요. 기존 플러그인과 권한 설정은 유지하고, 훅 바인딩만 추가하면 됩니다.

---

## 작동 원리

훅은 Claude의 개발 라이프사이클에 자동으로 개입합니다. **사용자에게는 아무것도 물어보지 않습니다.** Claude가 알아서 더 똑똑하게 행동합니다.

```
사용자 프롬프트 입력
  │
  ▼
┌─────────────────────┐
│ smart-context-       │ ← 의도/복잡도/위험도 분석 후
│ injector             │   Claude에게 맥락 힌트 주입
└─────────┬───────────┘
          ▼
  Claude가 도구 실행 시도
  │
  ├─ Bash 실행 전 ──→ guard-dangerous-commands (위험 명령 차단)
  ├─ 파일 수정 전 ──→ guard-protected-files (.env/키/lock 파일 보호)
  │
  ├─ Bash 실행 후 ──→ post-bash-analyzer (테스트 실패/빌드 에러 감지)
  ├─ 파일 수정 후 ──→ post-edit-autoformat (자동 포맷 + 품질 검사)
  │
  ▼
┌─────────────────────┐
│ Stop 프롬프트        │ ← Definition of Done 6항목 검증
│ project-profile-     │ ← 프로젝트 패턴 자동 누적
│ updater              │
└─────────────────────┘
```

### 자동 학습

`project-profile-updater` 훅이 세션마다 사용 패턴을 누적합니다.
다음 세션 시작 시 `session-context-loader`가 학습된 컨벤션을 Claude에게 주입합니다.

```
세션 1: TypeScript + CSS Modules + co-located tests 사용
세션 2: 동일 패턴 반복
세션 3: 동일 패턴 반복
세션 4~: Claude가 자동으로 "이 프로젝트는 co-located .test 파일을 사용합니다" 인지
```

---

## 폴더 구조

```
.claude/
├── settings.json              ← 훅 바인딩 + 권한 (플러그인은 직접 추가)
├── .gitignore                 ← 세션 데이터 제외
│
├── hooks/                     ← 자동화 엔진 (9개, 외부 프로세스 → 토큰 0)
│   ├── smart-context-injector.js     사용자 의도 분석 → 맥락 주입
│   ├── guard-dangerous-commands.js   위험 명령 차단
│   ├── guard-protected-files.js      보호 파일 + 영향도 분석
│   ├── post-edit-autoformat.js       자동 포맷 + 변경 추적
│   ├── post-bash-analyzer.js         테스트/빌드 에러 감지
│   ├── session-context-loader.js     스택 감지 + 컨벤션 로드
│   ├── project-profile-updater.js    프로젝트 패턴 누적
│   ├── pre-compact-saver.js          컨텍스트 압축 전 상태 저장
│   └── idle-reminder.js              유휴 시 리마인더
│
├── rules/                     ← 코딩 표준 (7개, 항상 로드 ~2,500 토큰)
│   ├── coding-style.md               네이밍, 함수, 에러 처리
│   ├── git-workflow.md               커밋 메시지, 브랜치 규칙
│   ├── security.md                   OWASP Top 10, 시크릿 관리
│   ├── validation.md                 타입체크/테스트/린트/빌드 검증
│   ├── definition-of-done.md         작업 유형별 16가지 완료 기준
│   ├── task-memory.md                복잡 태스크용 3문서 패턴
│   └── adr.md                        Architecture Decision Records
│
├── skills/                    ← 온디맨드 지식 (필요할 때만 로드)
│   ├── code-quality/
│   │   ├── SKILL.md                  핵심 규칙 요약
│   │   └── chapters/
│   │       ├── clean-code.md         클린 코드 패턴
│   │       ├── testing.md            테스트 전략
│   │       └── performance.md        성능 최적화
│   ├── debugging/
│   │   ├── SKILL.md                  5단계 디버깅 워크플로우
│   │   └── chapters/
│   │       ├── error-analysis.md     에러 유형별 분석
│   │       └── common-patterns.md    흔한 버그 패턴
│   └── project-setup/
│       ├── SKILL.md                  프로젝트 초기화 체크리스트
│       └── chapters/
│           ├── build-tools.md        TSconfig, ESLint, Vite 설정
│           └── ci-cd.md              GitHub Actions 파이프라인
│
└── agents/                    ← 전문 팀원 (소환 시에만 로드)
    ├── code-reviewer.md              5카테고리 코드 리뷰
    ├── test-runner.md                스택 자동 감지 + 테스트 실행
    ├── planner.md                    3문서 기획 시스템
    └── security-auditor.md           보안 감사 + 의존성 검사
```

---

## 구성 요소 상세

### Hooks — 개발 라이프사이클 자동화

| 훅                       | 이벤트                  | 설명                                                                           |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------------ |
| smart-context-injector   | UserPromptSubmit        | 의도/도메인/복잡도/위험도 5차원 분석 후 맥락 힌트 주입                         |
| guard-dangerous-commands | PreToolUse:Bash         | `rm -rf /`, `git push --force`, `DROP TABLE` 등 차단                           |
| guard-protected-files    | PreToolUse:Write\|Edit  | .env, 인증서, lock 파일 보호 + barrel 파일 영향도 분석                         |
| post-edit-autoformat     | PostToolUse:Write\|Edit | prettier/eslint 자동 실행, change manifest 기록, console.log/secrets/any 감지  |
| post-bash-analyzer       | PostToolUse:Bash        | 테스트 실패/빌드 에러/린트 경고 감지 (JS/Python/Go/Rust/Java/Ruby/PHP)         |
| session-context-loader   | SessionStart            | 프로젝트 스택 자동 감지 (10개+ 언어), 계획/체크리스트 확인, 학습된 컨벤션 주입 |
| project-profile-updater  | Stop                    | 언어/디렉토리/파일패턴 누적 → 컨벤션 자동 감지                                 |
| pre-compact-saver        | PreCompact              | 수정 파일 목록 + 체크리스트 진행 상태 저장                                     |
| idle-reminder            | Notification:idle       | 최근 수정 파일 + 미완료 체크리스트 리마인더                                    |

추가로 **Stop 프롬프트** (Definition of Done 6항목 검증)와 **SubagentStop 프롬프트** (서브에이전트 5항목 검증) 포함.

### Rules — 범용 코딩 표준

| 규칙                  | 범위                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| coding-style.md       | PascalCase/camelCase/UPPER_SNAKE, 함수 3파라미터 이하, early return, 언어별 세부 규칙   |
| git-workflow.md       | `feat/fix/refactor/test/chore` 타입, `feat/fix/refactor/chore-*` 브랜치, atomic commit  |
| security.md           | 보호 파일 (.env, \*.pem, credentials), OWASP Top 10, 시크릿 관리                        |
| validation.md         | tsc/mypy/cargo check/go build, 테스트 실행, 린트, 보안 점검                             |
| definition-of-done.md | 코드 변경 5 + 기능 개발 5 + 리팩토링 3 + 버그 수정 3 = 16가지 기준                      |
| task-memory.md        | 3문서 패턴: Plan (목표/접근/위험), Context (결정/파일/제약), Checklist (30분 단위 항목) |
| adr.md                | Status / Context / Decision / Consequences 형식                                         |

### Skills — 온디맨드 지식

| 스킬          | 챕터                             | 내용                                                                        |
| ------------- | -------------------------------- | --------------------------------------------------------------------------- |
| code-quality  | clean-code, testing, performance | DRY 원칙, 테스트 피라미드, 번들 최적화, React.memo                          |
| debugging     | error-analysis, common-patterns  | 5단계 워크플로우(Reproduce→Isolate→Understand→Fix→Verify), 흔한 버그 테이블 |
| project-setup | build-tools, ci-cd               | TSconfig strict, ESLint+Prettier, Husky, Vite, GitHub Actions CI/CD         |

스킬은 **챕터 패턴**을 사용합니다. SKILL.md(목차)만 먼저 로드하고, 필요한 챕터만 추가 로드하여 토큰을 40-60% 절약합니다.

### Agents — 전문 팀원

| 에이전트         | 모델    | 역할                                                    |
| ---------------- | ------- | ------------------------------------------------------- |
| code-reviewer    | Sonnet  | 정확성, 보안, TypeScript, 성능, 유지보수 5카테고리 리뷰 |
| test-runner      | Sonnet  | 스택 자동 감지 → 타입 체크 → 테스트 실행 → 실패 수정    |
| planner          | inherit | Plan + Context + Checklist 3문서 생성                   |
| security-auditor | Sonnet  | OWASP Top 10 스캔, 시크릿 감지, 의존성 취약점 감사      |

tmux 팀 모드에서 리더가 팀원을 소환하면 **동일한 훅과 규칙 아래에서** 동작합니다.

---

## 지원 언어

세션 시작 시 프로젝트 파일을 자동 감지합니다:

| 감지 파일                            | 언어/프레임워크                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `package.json`                       | React, Vue, Next.js, Nuxt, Svelte, Angular, NestJS, Express, TypeScript, Vitest, Jest, Playwright, Storybook, Tailwind |
| `pyproject.toml`, `requirements.txt` | Python, Django, FastAPI, Flask, Pytest                                                                                 |
| `go.mod`                             | Go, Gin, Gorilla, Fiber                                                                                                |
| `Cargo.toml`                         | Rust, Actix, Axum, Tokio                                                                                               |
| `pom.xml`, `build.gradle`            | Java, Kotlin (Maven/Gradle)                                                                                            |
| `Gemfile`                            | Ruby, Rails                                                                                                            |
| `composer.json`                      | PHP, Laravel                                                                                                           |
| `*.csproj`, `*.sln`                  | C# (.NET)                                                                                                              |
| `Dockerfile`                         | Docker                                                                                                                 |

---

## 토큰 소비

| 구성 요소     | 토큰       | 시점                                  |
| ------------- | ---------- | ------------------------------------- |
| Rules (7개)   | ~2,500     | 항상 로드 (200K 컨텍스트의 **1.25%**) |
| Hooks (9개)   | **0**      | 외부 Node.js 프로세스로 실행          |
| Skills        | 각 ~1,000  | 호출 시에만 로드                      |
| Agents        | 각 ~450    | 소환 시에만 로드                      |
| **상시 비용** | **~2,500** | **컨텍스트의 1.25%만 사용**           |

---

## 커스터마이즈

### 플러그인 추가

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

### 규칙 수정

`.claude/rules/` 파일을 팀 컨벤션에 맞게 수정하세요.

### 커스텀 훅 추가

`.claude/hooks/`에 `.js` 파일 추가 후 `settings.json`의 해당 이벤트에 등록.

---

## 요구 사항

- Node.js >= 18
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)

## 라이선스

MIT

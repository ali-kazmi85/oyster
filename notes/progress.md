# Software Factory — Progress

## Milestone 1 — Foundation ✅
- [x] Next.js 16 + Tailwind v4 + shadcn/ui scaffold
- [x] Drizzle/SQLite schema (projects, runs, logs, conversations) + migrations
- [x] `instrumentation.ts` — runs migrations + validates `claude` CLI on startup
- [x] `/api/projects` CRUD (GET list, POST create, GET one, PATCH, DELETE)
- [x] Shell layout: sidebar + project switcher
- [x] Screens: All Projects Overview, Add Project, Settings (per-project)
- [x] Placeholder pages: Dashboard, Intake, Issues, Run View
- [x] `WorktreeManager` — `create(issueNumber)` / `cleanup(worktreePath)` via simple-git
- [x] `local_path` auto-managed at `~/.oyster/repos/{owner}__{repo}` (not user-input)
- [x] PAT field info tooltip with fine-grained token creation instructions

## Milestone 2 — Agent Runner + Run View
- [ ] `LogBus` (EventEmitter — emit + subscribe)
- [ ] `AgentRunner` — `spawnPhase()`, `runValidation()`, `stop()`
- [ ] `RunSequencer` — drives 4 phases (plan → implement loop → validate → pr)
- [ ] `/api/runs` — dispatch (POST), stop, GET list
- [ ] `/api/runs/[runId]/logs` — SSE stream (replay from DB + live LogBus)
- [ ] `useSSELogs` hook + `<LogTerminal>` component
- [ ] `<PhaseProgress>` component (plan ✓ → implement ● → validate → pr)
- [ ] Run View page (live terminal, phase progress, stop button)
- [ ] Dashboard page (active runs per project)

## Milestone 3 — GitHub Integration + Grooming + Polling
- [ ] Octokit wrappers: `listIssues`, `createIssue`, `addComment`, `addLabel`, `removeLabel`, `ensureLabelsExist`
- [ ] `groomIssue()` — Vercel AI SDK `generateObject` → `{ sufficient, confidenceScore, clarifyingQuestions }`
- [ ] `PollingService` — `start()`, `stop()`, `pollProject()` with full grooming loop
- [ ] Wire `PollingService` singleton into `instrumentation.ts`
- [ ] Issues screen (label badges, manual dispatch, GitHub link)
- [ ] Grooming comment flow + label management + bot-comment filtering
- [ ] Overview live stat counts (awaiting dispatch, needs grooming)

## Milestone 4 — Intake + Polish
- [ ] `parsePdf()` + `parseDocx()` → markdown
- [ ] `/api/intake` — Vercel AI SDK `streamText` + file attachment handling (10MB limit)
- [ ] `/api/intake/create-issue`
- [ ] Intake screen: `<ChatWindow>`, `<ConfidenceMeter>`, `<FileAttachment>`
- [ ] Conversations table CRUD
- [ ] Error states, loading skeletons, empty states across all screens
- [ ] README (setup: PAT scopes, env vars, `npm run db:migrate`)

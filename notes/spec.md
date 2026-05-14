# Software Factory — Spec

## What It Is

A Level 4 AI-assisted development tool (per [Dan Shapiro's 5-level framework](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)). The developer writes a spec or creates a GitHub Issue; AI agents autonomously implement it in isolated git worktrees; a PR is opened for the developer to review on GitHub. Developer role = product direction, not implementation.

---

## Core Flow

```
Intake (chat UI / GitHub Issue)
  └─▶ Grooming Check (Vercel AI SDK)
        ├── Sufficient ──▶ ready-for-agent label
        └── Insufficient ──▶ comment on GitHub Issue with questions
                                  └─▶ poll for response ──▶ re-evaluate

ready-for-agent ──▶ Agent Dispatch
  └─▶ git worktree add (factory/issue-N branch)
  └─▶ Phase 1: claude CLI — plan
  └─▶ Phase 2: claude CLI — implement (loop, fresh context each iteration)
  └─▶ Phase 3: bash — validate (deterministic gate, exit code)
  └─▶ Phase 4: claude CLI — open PR linked to issue
  └─▶ git worktree cleanup

Developer reviews PR on GitHub
```

---

## Key Decisions

| Concern | Decision |
|---|---|
| Task management | GitHub Issues (source of truth — no local task store) |
| Multi-project | Yes, from day one — project switcher in sidebar |
| Intake | Conversational UI (Vercel AI SDK) + GitHub direct |
| File attachments | PDF (`pdf-parse`) + DOCX (`mammoth`) parsed to markdown |
| Grooming | Post GitHub comment with questions; poll for reply; re-evaluate |
| Agent trigger | `ready-for-agent` label (manual dispatch or auto via polling) |
| Polling | Every 30s via `instrumentation.ts` + singleton — no webhooks for MVP |
| Agent isolation | `git worktree add` per issue → `factory/issue-N` branch |
| Agent runtime | Claude Code CLI subprocess (`claude --dangerously-skip-permissions -p`) |
| Custom models | `ANTHROPIC_BASE_URL` + `ANTHROPIC_API_KEY` env vars passed to CLI per project |
| Factory AI | Vercel AI SDK (intake conversation + grooming `generateObject`) |
| Real-time logs | Server-Sent Events (SSE) — replay from DB + live LogBus |
| Local state | SQLite + Drizzle ORM (projects, runs, logs, conversations only) |
| Auth | Fine-grained GitHub PAT per project |
| Stack | Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, Octokit, simple-git, execa |

**Settled implementation details:**
- `execa` v9 (ESM) with `next.config.mjs`
- Validate `claude` CLI in PATH on startup via `instrumentation.ts`; surface error in UI if missing
- Max concurrent runs per project: configurable, default 1
- Implement loop exit: detect `DONE` in stdout OR max iterations hit
- File attachment size limit: 10MB enforced at API route
- Grooming re-check: skip comments authored by the PAT user (bot's own comments) — cache `botLogin` at project init via `octokit.users.getAuthenticated()`
- Log retention: no cleanup in MVP; document in README
- PAT tokens stored plaintext in SQLite (same threat model as `.env`) — document in README

---

## UI Screens

All within a sidebar-nav layout.

### Sidebar
```
⬡ Software Factory
┌──────────────────────┐
│  [Project: oyster ▼] │  ← project switcher
└──────────────────────┘
  Dashboard
  Intake
  Issues
  Settings
── All Projects ──
  Overview
```

### Screen 1 — All Projects Overview
Cross-project view. The primary "come back to this" screen for Level 4. Active runs across all projects, awaiting dispatch counts, needs grooming counts. Live stat counts updated by polling tick (stored in DB, not queried from GitHub at render time).

### Screen 2 — Dashboard (per-project)
Active runs with phase progress indicators. Issues awaiting dispatch. Issues needing grooming.

### Screen 3 — Run View
- Issue title, number, branch name
- Phase progress: `plan ✓ → implement ● → validate → pr`
- Live SSE log stream (terminal-style, auto-scroll)
- Files changed count, current iteration number
- Stop button

### Screen 4 — Intake
- Chat UI (`useChat` from Vercel AI SDK)
- File attachment (PDF, DOCX, 10MB limit)
- Confidence meter (0–100%, driven by `updateConfidence` tool calls)
- "Create Issue" button (active when confident ≥ threshold, always available as override)

### Screen 5 — Issues
- GitHub issues for selected project merged with local run status
- Badges: `needs-grooming` / `ready-for-agent` / `running` / `done`
- Manual dispatch button per issue
- Link to GitHub

### Screen 6 — Add Project
Form: display name, GitHub owner/repo, local clone path, PAT, agent base URL, model, API key, validation command, max iterations, max concurrent runs.

### Screen 7 — Settings (per-project)
Same fields as Add Project, pre-populated.

---

## Directory Structure

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # redirect → /projects/overview
│   │   ├── (shell)/
│   │   │   ├── layout.tsx                    # sidebar + project switcher
│   │   │   ├── projects/overview/page.tsx    # All Projects Overview
│   │   │   └── p/[projectId]/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx                  # Dashboard
│   │   │       ├── intake/page.tsx
│   │   │       ├── issues/page.tsx
│   │   │       ├── runs/[runId]/page.tsx     # Run View
│   │   │       └── settings/page.tsx
│   │   ├── projects/new/page.tsx
│   │   └── api/
│   │       ├── intake/route.ts               # Vercel AI SDK streamText
│   │       ├── intake/create-issue/route.ts
│   │       ├── projects/route.ts
│   │       ├── projects/[projectId]/route.ts
│   │       ├── runs/route.ts
│   │       ├── runs/[runId]/route.ts
│   │       ├── runs/[runId]/stop/route.ts
│   │       ├── runs/[runId]/logs/route.ts    # SSE
│   │       └── issues/[projectId]/route.ts
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   ├── index.ts                      # better-sqlite3 + Drizzle singleton
│   │   │   └── migrations/
│   │   ├── github/
│   │   │   ├── client.ts                     # getOctokit(pat) with client cache
│   │   │   ├── issues.ts                     # listIssues, createIssue, addComment, addLabel, removeLabel, ensureLabelsExist
│   │   │   └── prs.ts
│   │   ├── grooming/
│   │   │   ├── evaluator.ts                  # groomIssue() → { sufficient, confidenceScore, clarifyingQuestions }
│   │   │   └── prompts.ts
│   │   ├── polling/
│   │   │   ├── service.ts                    # PollingService: start(), stop(), pollProject()
│   │   │   └── singleton.ts
│   │   ├── agent/
│   │   │   ├── worktree.ts                   # WorktreeManager: create(), cleanup()
│   │   │   ├── runner.ts                     # AgentRunner: spawnPhase(), runValidation(), stop()
│   │   │   ├── sequencer.ts                  # RunSequencer: execute() — drives 4 phases
│   │   │   └── log-bus.ts                    # LogBus EventEmitter
│   │   ├── intake/
│   │   │   ├── parser.ts                     # parsePdf(), parseDocx() → markdown
│   │   │   └── prompts.ts
│   │   └── ai/
│   │       └── provider.ts                   # getFactoryAIProvider() — Vercel AI SDK
│   │
│   ├── components/
│   │   ├── ui/                               # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── project-switcher.tsx
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   └── project-form.tsx
│   │   ├── runs/
│   │   │   ├── run-card.tsx
│   │   │   ├── phase-progress.tsx
│   │   │   └── log-terminal.tsx
│   │   ├── issues/
│   │   │   ├── issue-row.tsx
│   │   │   └── issue-badge.tsx
│   │   └── intake/
│   │       ├── chat-window.tsx
│   │       ├── confidence-meter.tsx
│   │       └── file-attachment.tsx
│   │
│   ├── hooks/
│   │   ├── use-sse-logs.ts
│   │   ├── use-projects.ts
│   │   └── use-runs.ts
│   └── types/index.ts
│
├── instrumentation.ts                        # run migrations + start PollingService
├── drizzle.config.ts
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## Database Schema

```typescript
projects: id, name, github_owner, github_repo, local_path,
          pat_token, agent_base_url, agent_model, agent_api_key,
          validation_command, max_iterations, max_concurrent_runs,
          poll_interval_seconds, bot_login, last_polled_at,
          awaiting_dispatch_count, needs_grooming_count,
          created_at

runs: id, project_id, github_issue_number, issue_title,
      status (pending|planning|implementing|validating|opening_pr|completed|failed|stopped),
      current_phase (plan|implement|validate|pr),
      worktree_path, branch_name, iteration, max_iterations,
      started_at, completed_at, updated_at

logs: id (autoincrement), run_id, timestamp, content,
      stream (stdout|stderr|system)

conversations: id, project_id, messages (JSON),
               status (active|completed|cancelled),
               github_issue_number, confidence_score, created_at
```

---

## Agent Workflow Detail

### Phase 1 — Plan
```
claude --dangerously-skip-permissions -p
"You are implementing GitHub issue #N: '<title>'.
Explore the codebase and write a detailed implementation plan to plan.md.
The plan must be a checklist of concrete tasks. Do not implement anything yet."
```

### Phase 2 — Implement Loop (fresh subprocess each iteration)
```
claude --dangerously-skip-permissions -p
"Read plan.md. Find the first unchecked task. Implement it. Mark it done in plan.md.
If all tasks are checked, output exactly: DONE"
```
Loop exits when: stdout contains `DONE`, OR validation passes, OR `max_iterations` hit.

### Phase 3 — Validate (deterministic bash gate)
```
execa(project.validationCommand, { cwd: worktreePath, shell: true })
```
Exit 0 → proceed to PR. Non-zero → back to Phase 2.

### Phase 4 — PR
```
claude --dangerously-skip-permissions -p
"Create a PR for branch factory/issue-N. Link it to issue #N. Summarize the changes."
```

### Agent env vars
```typescript
{
  ANTHROPIC_API_KEY: project.agentApiKey ?? process.env.ANTHROPIC_API_KEY,
  ...(project.agentBaseUrl && { ANTHROPIC_BASE_URL: project.agentBaseUrl }),
}
```

---

## Polling Logic

```
pollProject():
  1. Issues labeled ready-for-agent with no active run → dispatch
  2. Issues labeled needs-grooming with updated_at > last_polled_at
     AND new comment NOT from botLogin → re-run groomIssue()
       → sufficient: swap labels → dispatch
       → insufficient: post follow-up comment
  3. Issues with no factory label, never groomed → initial groomIssue()
  4. Update last_polled_at and stat counts in DB
```

---

## Key Dependencies

```json
{
  "next": "^15.3.0",
  "react": "^19.0.0",
  "drizzle-orm": "^0.44.0",
  "better-sqlite3": "^11.0.0",
  "ai": "^4.3.0",
  "@ai-sdk/anthropic": "^1.0.0",
  "@ai-sdk/openai": "^1.0.0",
  "@octokit/rest": "^21.0.0",
  "simple-git": "^3.27.0",
  "execa": "^9.5.0",
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.8.0",
  "zod": "^3.24.0",
  "swr": "^2.3.0",
  "lucide-react": "^0.468.0"
}
```

---

## Build Milestones

### Milestone 1 — Foundation
scaffold + Drizzle schema + project CRUD + WorktreeManager + shell layout + Add Project / Settings / Overview screens

**Demo:** Add a project → verify worktree creates/cleans up via `git worktree list`

### Milestone 2 — Agent Runner + Run View
LogBus + AgentRunner + RunSequencer + SSE logs endpoint + Run View UI + Dashboard

**Demo:** Manually dispatch a run → watch 4 phases execute live → PR opens on GitHub

### Milestone 3 — GitHub Integration + Grooming + Polling
Octokit wrappers + `groomIssue()` + PollingService + Issues screen + grooming label flow

**Demo:** Vague issue → factory comments questions → answer on GitHub → factory dispatches → PR

### Milestone 4 — Intake + Polish
`parsePdf()` + `parseDocx()` + `/api/intake` + Intake screen + conversations + error states + README

**Demo:** Full Level 4 loop — chat with PDF → Issue created → groomed → agent implements → PR opened

---

## End-to-End Verification

1. Add a project pointing at a real GitHub repo with a local clone
2. `next dev` — confirm polling starts, `claude` CLI found, migrations ran
3. Intake → attach a PDF spec → chat until confidence ≥ 80% → create issue
4. Issues screen — confirm issue appears with correct label
5. If grooming needed: answer on GitHub → wait for poll → label flips to `ready-for-agent`
6. Dispatch run → Run View → watch live logs
7. Confirm `factory/issue-N` branch: `git worktree list` in local repo
8. After completion: confirm PR open on GitHub, linked to original issue
9. Switch to second project — confirm independent context and independent runs

# Plan: Issue #1 — Test run - hello world

## Context

This is the first test run of the Software Factory pipeline. The goal is a minimal "hello world" implementation that proves the full worktree → code → PR cycle works correctly. The app is a Next.js 16 (App Router) full-stack application with React 19, TypeScript, Tailwind v4, and shadcn/ui.

## Implementation Plan

### 1. Understand the entry point
- [x] Read `src/app/layout.tsx` to understand the root layout and font/metadata setup
- [x] Read `src/app/page.tsx` to confirm the root redirect behaviour
- [x] Read `src/app/(shell)/layout.tsx` to understand the sidebar shell structure

### 2. Create a `/hello` page
- [x] Create `src/app/(shell)/hello/page.tsx` — a simple server component that renders a "Hello, World!" message styled with Tailwind and the existing shadcn/ui Card components
- [x] The page should display:
  - A heading: "Hello, World!"
  - A short description confirming this is Issue #1 completing successfully
  - The current timestamp (rendered server-side via `new Date()`)

### 3. Wire up navigation
- [x] Read `src/components/layout/sidebar.tsx` to understand the nav link structure
- [x] Add a "Hello" nav link to the sidebar (below existing links, above the bottom section if any)

### 4. Add a `/api/hello` route (optional smoke test endpoint)
- [x] Create `src/app/api/hello/route.ts` that returns `{ message: "Hello, World!", timestamp: <ISO string> }` with a 200 status — useful for confirming the API layer also works

### 5. Verify correctness
- [x] Confirm TypeScript compiles cleanly (`npx tsc --noEmit`)
- [x] Confirm the dev server starts without errors (`npm run dev`)
- [x] Manually verify `/hello` renders in the browser and `/api/hello` returns JSON
- [x] Confirm no ESLint errors (`npm run lint`)

### 6. Wrap up
- [x] Confirm all changed files are staged
- [x] Open a pull request from `factory/issue-1` → `main` referencing Issue #1

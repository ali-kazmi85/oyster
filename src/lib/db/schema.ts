import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  github_owner: text('github_owner').notNull(),
  github_repo: text('github_repo').notNull(),
  local_path: text('local_path'),
  pat_token: text('pat_token').notNull(),
  agent_base_url: text('agent_base_url'),
  agent_model: text('agent_model'),
  agent_api_key: text('agent_api_key'),
  validation_command: text('validation_command').default('npm test'),
  max_iterations: integer('max_iterations').default(10),
  max_concurrent_runs: integer('max_concurrent_runs').default(1),
  poll_interval_seconds: integer('poll_interval_seconds').default(30),
  bot_login: text('bot_login'),
  last_polled_at: integer('last_polled_at'),
  awaiting_dispatch_count: integer('awaiting_dispatch_count').default(0),
  needs_grooming_count: integer('needs_grooming_count').default(0),
  created_at: integer('created_at').default(sql`(unixepoch())`),
})

export const runs = sqliteTable('runs', {
  id: text('id').primaryKey(),
  project_id: text('project_id')
    .notNull()
    .references(() => projects.id),
  github_issue_number: integer('github_issue_number').notNull(),
  issue_title: text('issue_title').notNull(),
  status: text('status', {
    enum: ['pending', 'planning', 'implementing', 'validating', 'opening_pr', 'completed', 'failed', 'stopped'],
  }).default('pending'),
  current_phase: text('current_phase', { enum: ['plan', 'implement', 'validate', 'pr'] }),
  worktree_path: text('worktree_path'),
  branch_name: text('branch_name'),
  iteration: integer('iteration').default(0),
  max_iterations: integer('max_iterations'),
  started_at: integer('started_at'),
  completed_at: integer('completed_at'),
  updated_at: integer('updated_at').default(sql`(unixepoch())`),
})

export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  run_id: text('run_id')
    .notNull()
    .references(() => runs.id),
  timestamp: integer('timestamp').default(sql`(unixepoch())`),
  content: text('content').notNull(),
  stream: text('stream', { enum: ['stdout', 'stderr', 'system'] }).default('system'),
})

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  project_id: text('project_id')
    .notNull()
    .references(() => projects.id),
  messages: text('messages'),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).default('active'),
  github_issue_number: integer('github_issue_number'),
  confidence_score: integer('confidence_score'),
  created_at: integer('created_at').default(sql`(unixepoch())`),
})

PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`github_owner` text NOT NULL,
	`github_repo` text NOT NULL,
	`local_path` text,
	`pat_token` text NOT NULL,
	`agent_base_url` text,
	`agent_model` text,
	`agent_api_key` text,
	`validation_command` text DEFAULT 'npm test',
	`max_iterations` integer DEFAULT 10,
	`max_concurrent_runs` integer DEFAULT 1,
	`poll_interval_seconds` integer DEFAULT 30,
	`bot_login` text,
	`last_polled_at` integer,
	`awaiting_dispatch_count` integer DEFAULT 0,
	`needs_grooming_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "name", "github_owner", "github_repo", "local_path", "pat_token", "agent_base_url", "agent_model", "agent_api_key", "validation_command", "max_iterations", "max_concurrent_runs", "poll_interval_seconds", "bot_login", "last_polled_at", "awaiting_dispatch_count", "needs_grooming_count", "created_at") SELECT "id", "name", "github_owner", "github_repo", "local_path", "pat_token", "agent_base_url", "agent_model", "agent_api_key", "validation_command", "max_iterations", "max_concurrent_runs", "poll_interval_seconds", "bot_login", "last_polled_at", "awaiting_dispatch_count", "needs_grooming_count", "created_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
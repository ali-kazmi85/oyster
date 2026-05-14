CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`messages` text,
	`status` text DEFAULT 'active',
	`github_issue_number` integer,
	`confidence_score` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`run_id` text NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()),
	`content` text NOT NULL,
	`stream` text DEFAULT 'system',
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`github_owner` text NOT NULL,
	`github_repo` text NOT NULL,
	`local_path` text NOT NULL,
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
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`github_issue_number` integer NOT NULL,
	`issue_title` text NOT NULL,
	`status` text DEFAULT 'pending',
	`current_phase` text,
	`worktree_path` text,
	`branch_name` text,
	`iteration` integer DEFAULT 0,
	`max_iterations` integer,
	`started_at` integer,
	`completed_at` integer,
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);

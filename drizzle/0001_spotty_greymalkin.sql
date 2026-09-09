CREATE TABLE `email_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` integer DEFAULT 0 NOT NULL,
	`first_attempt_at` integer,
	`lease_until` integer,
	`lock_token` text,
	`provider_id` text,
	`last_error` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`sent_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_email_delivery` ON `email_outbox` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE INDEX `idx_email_user` ON `email_outbox` (`user_id`);--> statement-breakpoint
CREATE TABLE `email_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`employer_id` text NOT NULL,
	`candidate_id` text NOT NULL,
	`title` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`mode` text NOT NULL,
	`location` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`candidate_response` text DEFAULT 'pending' NOT NULL,
	`response_note` text DEFAULT '' NOT NULL,
	`cancel_reason` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`employer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_interviews_employer` ON `interviews` (`employer_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `idx_interviews_candidate` ON `interviews` (`candidate_id`,`starts_at`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`client_id` text NOT NULL,
	`body` text NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_message_client` ON `messages` (`sender_id`,`client_id`);--> statement-breakpoint
CREATE INDEX `idx_messages_thread` ON `messages` (`application_id`,`id`);--> statement-breakpoint
CREATE TRIGGER notification_email_outbox AFTER INSERT ON notifications
WHEN EXISTS(SELECT 1 FROM users WHERE id=NEW.user_id AND status='active')
AND COALESCE((SELECT enabled FROM email_preferences WHERE user_id=NEW.user_id),1)=1
BEGIN
  INSERT INTO email_outbox(id,user_id,subject,body,status,created_at)
  VALUES(NEW.id,NEW.user_id,'TalentHub - Cập nhật tuyển dụng',NEW.content,'pending',NEW.created_at);
END;

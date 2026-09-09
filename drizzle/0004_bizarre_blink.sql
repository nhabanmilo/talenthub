CREATE TABLE `company_follows` (
	`candidate_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_company_follow` ON `company_follows` (`candidate_id`,`company_id`);--> statement-breakpoint
CREATE INDEX `idx_company_follow_company` ON `company_follows` (`company_id`);
--> statement-breakpoint
CREATE TRIGGER company_new_job_insert AFTER INSERT ON jobs
WHEN NEW.status='active'
BEGIN
 INSERT OR IGNORE INTO notifications(id,user_id,content,is_read,created_at)
 SELECT 'company-job:' || NEW.id || ':' || f.candidate_id, f.candidate_id,
 'Công ty bạn theo dõi có tin mới: ' || c.name || ' — ' || NEW.title || '. Mở mục Công ty để xem việc làm.', 0, strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM company_follows f JOIN users u ON u.id=f.candidate_id JOIN companies c ON c.id=f.company_id
 WHERE f.company_id=NEW.company_id AND u.status='active' AND u.role='candidate' AND c.status='verified'
 AND NEW.deadline>=date('now','+7 hours');
END;

--> statement-breakpoint
CREATE TRIGGER company_new_job_publish AFTER UPDATE OF status ON jobs
WHEN NEW.status='active' AND OLD.status!='active'
BEGIN
 INSERT OR IGNORE INTO notifications(id,user_id,content,is_read,created_at)
 SELECT 'company-job:' || NEW.id || ':' || f.candidate_id, f.candidate_id,
 'Công ty bạn theo dõi có tin mới: ' || c.name || ' — ' || NEW.title || '. Mở mục Công ty để xem việc làm.', 0, strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM company_follows f JOIN users u ON u.id=f.candidate_id JOIN companies c ON c.id=f.company_id
 WHERE f.company_id=NEW.company_id AND u.status='active' AND u.role='candidate' AND c.status='verified'
 AND NEW.deadline>=date('now','+7 hours');
END;

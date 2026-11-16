-- Fresh empty database only. No demo users, companies or jobs.

-- 0000_open_edwin_jarvis.sql
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`candidate_id` text NOT NULL,
	`resume_id` text NOT NULL,
	`cover_letter` text DEFAULT '',
	`status` text DEFAULT 'submitted' NOT NULL,
	`note` text DEFAULT '',
	`applied_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `uq_application_candidate_job` ON `applications` (`candidate_id`,`job_id`);
CREATE INDEX `idx_application_job_status` ON `applications` (`job_id`,`status`);
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`reference_id` text NOT NULL,
	`reason` text DEFAULT '',
	`created_at` text NOT NULL
);

CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL
);

CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`tax_code` text DEFAULT '',
	`address` text DEFAULT '',
	`website` text DEFAULT '',
	`description` text DEFAULT '',
	`status` text DEFAULT 'pending' NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `companies_owner_id_unique` ON `companies` (`owner_id`);
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`created_by` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`requirements` text NOT NULL,
	`benefits` text NOT NULL,
	`location` text NOT NULL,
	`salary_min` real NOT NULL,
	`salary_max` real NOT NULL,
	`deadline` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reason` text DEFAULT '',
	`experience` text DEFAULT '',
	`type` text DEFAULT 'Toàn thời gian',
	`tags` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `idx_jobs_status_deadline` ON `jobs` (`status`,`deadline`);
CREATE INDEX `idx_jobs_owner` ON `jobs` (`created_by`);
CREATE INDEX `idx_jobs_category` ON `jobs` (`category`);
CREATE TABLE `auth_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`reset_at` integer NOT NULL
);

CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`is_read` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `idx_notifications_user` ON `notifications` (`user_id`);
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`phone` text DEFAULT '',
	`location` text DEFAULT '',
	`headline` text DEFAULT '',
	`skills` text DEFAULT '',
	`experience_summary` text DEFAULT '',
	`date_of_birth` text DEFAULT '',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `resumes` (
	`id` text PRIMARY KEY NOT NULL,
	`candidate_id` text NOT NULL,
	`title` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`is_default` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `saved_jobs` (
	`candidate_id` text NOT NULL,
	`job_id` text NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `uq_saved_candidate_job` ON `saved_jobs` (`candidate_id`,`job_id`);
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `setup` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

-- 0001_spotty_greymalkin.sql
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

CREATE INDEX `idx_email_delivery` ON `email_outbox` (`status`,`next_attempt_at`);
CREATE INDEX `idx_email_user` ON `email_outbox` (`user_id`);
CREATE TABLE `email_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

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

CREATE INDEX `idx_interviews_employer` ON `interviews` (`employer_id`,`starts_at`);
CREATE INDEX `idx_interviews_candidate` ON `interviews` (`candidate_id`,`starts_at`);
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

CREATE UNIQUE INDEX `uq_message_client` ON `messages` (`sender_id`,`client_id`);
CREATE INDEX `idx_messages_thread` ON `messages` (`application_id`,`id`);
CREATE TRIGGER notification_email_outbox AFTER INSERT ON notifications
WHEN EXISTS(SELECT 1 FROM users WHERE id=NEW.user_id AND status='active')
AND COALESCE((SELECT enabled FROM email_preferences WHERE user_id=NEW.user_id),1)=1
BEGIN
  INSERT INTO email_outbox(id,user_id,subject,body,status,created_at)
  VALUES(NEW.id,NEW.user_id,'TalentHub - Cập nhật tuyển dụng',NEW.content,'pending',NEW.created_at);
END;


-- 0002_multi_industry_catalog.sql
-- Add 40 explicitly fictional demo jobs across 20 industries; preserve all existing records.
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-1','Công nghệ thông tin',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-2','Thiết kế & Sáng tạo',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-3','Marketing',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-4','Kinh doanh',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-5','Tài chính & Kế toán',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-6','Nhân sự',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-7','Giáo dục & Đào tạo',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-8','Y tế & Chăm sóc sức khỏe',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-9','Dược phẩm & Công nghệ sinh học',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-10','Logistics & Chuỗi cung ứng',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-11','Sản xuất & Quản lý chất lượng',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-12','Cơ khí & Điện tự động hóa',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-13','Xây dựng & Kiến trúc',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-14','Du lịch & Khách sạn',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-15','Nhà hàng & Thực phẩm',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-16','Bán lẻ & Thương mại điện tử',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-17','Pháp lý & Tuân thủ',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-18','Nông nghiệp & Môi trường',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-19','Chăm sóc khách hàng',1);


INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-20','Hành chính & Văn phòng',1);


-- 0003_chilly_bishop.sql
ALTER TABLE `jobs` ADD `specialty` text DEFAULT '' NOT NULL;

UPDATE jobs SET specialty='it/software/frontend' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%frontend%' OR title LIKE '%Frontend%');


UPDATE jobs SET specialty='it/software/backend' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%backend%' OR title LIKE '%Backend%');


UPDATE jobs SET specialty='it/software/mobile' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%mobile%' OR title LIKE '%Mobile%' OR title LIKE '%android%' OR title LIKE '%Android%' OR title LIKE '%ios%' OR title LIKE '%Ios%');


UPDATE jobs SET specialty='it/software/fullstack' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%fullstack%' OR title LIKE '%Fullstack%' OR title LIKE '%full stack%' OR title LIKE '%Full stack%');


UPDATE jobs SET specialty='it/data/engineer' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%kỹ sư dữ liệu%' OR title LIKE '%Kỹ sư dữ liệu%' OR title LIKE '%data engineer%' OR title LIKE '%Data engineer%');


UPDATE jobs SET specialty='it/data/analyst' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%data analyst%' OR title LIKE '%Data analyst%' OR title LIKE '%phân tích dữ liệu%' OR title LIKE '%Phân tích dữ liệu%');


UPDATE jobs SET specialty='it/data/ai' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%machine learning%' OR title LIKE '%Machine learning%' OR title LIKE '%kỹ sư ai%' OR title LIKE '%Kỹ sư ai%');


UPDATE jobs SET specialty='it/qa/manual' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%kiểm thử%' OR title LIKE '%Kiểm thử%' OR title LIKE '%tester%' OR title LIKE '%Tester%' OR title LIKE '%manual qa%' OR title LIKE '%Manual qa%');


UPDATE jobs SET specialty='it/qa/automation' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%automation test%' OR title LIKE '%Automation test%');


UPDATE jobs SET specialty='it/systems/devops' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%devops%' OR title LIKE '%Devops%' OR title LIKE '%cloud engineer%' OR title LIKE '%Cloud engineer%');


UPDATE jobs SET specialty='it/systems/security' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%bảo mật%' OR title LIKE '%Bảo mật%' OR title LIKE '%an toàn thông tin%' OR title LIKE '%An toàn thông tin%');


UPDATE jobs SET specialty='design/product/uxui' WHERE specialty='' AND category='Thiết kế & Sáng tạo' AND (title LIKE '%ui/ux%' OR title LIKE '%Ui/ux%' OR title LIKE '%ux designer%' OR title LIKE '%Ux designer%' OR title LIKE '%ui designer%' OR title LIKE '%Ui designer%' OR title LIKE '%thiết kế sản phẩm%' OR title LIKE '%Thiết kế sản phẩm%');


UPDATE jobs SET specialty='design/visual/graphic' WHERE specialty='' AND category='Thiết kế & Sáng tạo' AND (title LIKE '%đồ họa%' OR title LIKE '%Đồ họa%' OR title LIKE '%đồ hoạ%' OR title LIKE '%Đồ hoạ%' OR title LIKE '%thương hiệu%' OR title LIKE '%Thương hiệu%' OR title LIKE '%graphic%' OR title LIKE '%Graphic%');


UPDATE jobs SET specialty='design/visual/video' WHERE specialty='' AND category='Thiết kế & Sáng tạo' AND (title LIKE '%video%' OR title LIKE '%Video%' OR title LIKE '%dựng phim%' OR title LIKE '%Dựng phim%');


UPDATE jobs SET specialty='sales/b2b/solutions' WHERE specialty='' AND category='Kinh doanh' AND (title LIKE '%giải pháp%' OR title LIKE '%Giải pháp%' OR title LIKE '%b2b%' OR title LIKE '%B2b%');


UPDATE jobs SET specialty='sales/b2b/development' WHERE specialty='' AND category='Kinh doanh' AND (title LIKE '%phát triển kinh doanh%' OR title LIKE '%Phát triển kinh doanh%');


UPDATE jobs SET specialty='sales/b2c/store' WHERE specialty='' AND category='Kinh doanh' AND (title LIKE '%cửa hàng%' OR title LIKE '%Cửa hàng%' OR title LIKE '%tư vấn khách hàng%' OR title LIKE '%Tư vấn khách hàng%');


UPDATE jobs SET specialty='sales/b2c/telesales' WHERE specialty='' AND category='Kinh doanh' AND (title LIKE '%telesales%' OR title LIKE '%Telesales%' OR title LIKE '%bán hàng qua điện thoại%' OR title LIKE '%Bán hàng qua điện thoại%');


UPDATE jobs SET specialty='marketing/digital/ads' WHERE specialty='' AND category='Marketing' AND (title LIKE '%quảng cáo%' OR title LIKE '%Quảng cáo%' OR title LIKE '%performance%' OR title LIKE '%Performance%');


UPDATE jobs SET specialty='marketing/digital/seo' WHERE specialty='' AND category='Marketing' AND (title LIKE '%seo%' OR title LIKE '%Seo%' OR title LIKE '%sem%' OR title LIKE '%Sem%');


UPDATE jobs SET specialty='marketing/digital/digital' WHERE specialty='' AND category='Marketing' AND (title LIKE '%digital marketing%' OR title LIKE '%Digital marketing%');


UPDATE jobs SET specialty='marketing/content/content' WHERE specialty='' AND category='Marketing' AND (title LIKE '%content%' OR title LIKE '%Content%' OR title LIKE '%nội dung%' OR title LIKE '%Nội dung%');


UPDATE jobs SET specialty='marketing/content/social' WHERE specialty='' AND category='Marketing' AND (title LIKE '%social%' OR title LIKE '%Social%' OR title LIKE '%mạng xã hội%' OR title LIKE '%Mạng xã hội%');


UPDATE jobs SET specialty='finance/accounting/general' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%kế toán tổng hợp%' OR title LIKE '%Kế toán tổng hợp%');


UPDATE jobs SET specialty='finance/accounting/tax' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%kế toán thuế%' OR title LIKE '%Kế toán thuế%');


UPDATE jobs SET specialty='finance/accounting/payable' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%công nợ%' OR title LIKE '%Công nợ%');


UPDATE jobs SET specialty='finance/analysis/fpa' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%phân tích tài chính%' OR title LIKE '%Phân tích tài chính%' OR title LIKE '%fp&a%' OR title LIKE '%Fp&a%');


UPDATE jobs SET specialty='finance/analysis/audit' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%kiểm toán%' OR title LIKE '%Kiểm toán%');


UPDATE jobs SET specialty='hr/recruitment/recruiter' WHERE specialty='' AND category='Nhân sự' AND (title LIKE '%chuyên viên tuyển dụng%' OR title LIKE '%Chuyên viên tuyển dụng%');


UPDATE jobs SET specialty='hr/recruitment/intern' WHERE specialty='' AND category='Nhân sự' AND (title LIKE '%thực tập sinh tuyển dụng%' OR title LIKE '%Thực tập sinh tuyển dụng%');


UPDATE jobs SET specialty='hr/operations/payroll' WHERE specialty='' AND category='Nhân sự' AND (title LIKE '%tiền lương%' OR title LIKE '%Tiền lương%' OR title LIKE '%phúc lợi%' OR title LIKE '%Phúc lợi%' OR title LIKE '%c&b%' OR title LIKE '%C&b%');


UPDATE jobs SET specialty='hr/operations/training' WHERE specialty='' AND category='Nhân sự' AND (title LIKE '%đào tạo nội bộ%' OR title LIKE '%Đào tạo nội bộ%');


UPDATE jobs SET specialty='education/teaching/english' WHERE specialty='' AND category='Giáo dục & Đào tạo' AND (title LIKE '%giáo viên tiếng anh%' OR title LIKE '%Giáo viên tiếng anh%');


UPDATE jobs SET specialty='education/teaching/teacher' WHERE specialty='' AND category='Giáo dục & Đào tạo' AND (title LIKE '%giảng viên%' OR title LIKE '%Giảng viên%');


UPDATE jobs SET specialty='education/support/assistant' WHERE specialty='' AND category='Giáo dục & Đào tạo' AND (title LIKE '%trợ giảng%' OR title LIKE '%Trợ giảng%');


UPDATE jobs SET specialty='education/support/academic' WHERE specialty='' AND category='Giáo dục & Đào tạo' AND (title LIKE '%giáo vụ%' OR title LIKE '%Giáo vụ%' OR title LIKE '%học viên%' OR title LIKE '%Học viên%');


UPDATE jobs SET specialty='health/clinical/nurse' WHERE specialty='' AND category='Y tế & Chăm sóc sức khỏe' AND (title LIKE '%điều dưỡng%' OR title LIKE '%Điều dưỡng%');


UPDATE jobs SET specialty='health/clinical/doctor' WHERE specialty='' AND category='Y tế & Chăm sóc sức khỏe' AND (title LIKE '%bác sĩ%' OR title LIKE '%Bác sĩ%');


UPDATE jobs SET specialty='health/operations/coordinator' WHERE specialty='' AND category='Y tế & Chăm sóc sức khỏe' AND (title LIKE '%điều phối lịch khám%' OR title LIKE '%Điều phối lịch khám%');


UPDATE jobs SET specialty='health/operations/reception' WHERE specialty='' AND category='Y tế & Chăm sóc sức khỏe' AND (title LIKE '%lễ tân y tế%' OR title LIKE '%Lễ tân y tế%');


UPDATE jobs SET specialty='pharma/quality/lab' WHERE specialty='' AND category='Dược phẩm & Công nghệ sinh học' AND (title LIKE '%kiểm nghiệm%' OR title LIKE '%Kiểm nghiệm%');


UPDATE jobs SET specialty='pharma/quality/qa' WHERE specialty='' AND category='Dược phẩm & Công nghệ sinh học' AND (title LIKE '%đảm bảo chất lượng%' OR title LIKE '%Đảm bảo chất lượng%');


UPDATE jobs SET specialty='pharma/regulatory/registration' WHERE specialty='' AND category='Dược phẩm & Công nghệ sinh học' AND (title LIKE '%hồ sơ sản phẩm%' OR title LIKE '%Hồ sơ sản phẩm%');


UPDATE jobs SET specialty='logistics/trade/documents' WHERE specialty='' AND category='Logistics & Chuỗi cung ứng' AND (title LIKE '%chứng từ%' OR title LIKE '%Chứng từ%');


UPDATE jobs SET specialty='logistics/trade/customs' WHERE specialty='' AND category='Logistics & Chuỗi cung ứng' AND (title LIKE '%hải quan%' OR title LIKE '%Hải quan%');


UPDATE jobs SET specialty='logistics/transport/dispatch' WHERE specialty='' AND category='Logistics & Chuỗi cung ứng' AND (title LIKE '%điều phối vận tải%' OR title LIKE '%Điều phối vận tải%');


UPDATE jobs SET specialty='logistics/transport/warehouse' WHERE specialty='' AND category='Logistics & Chuỗi cung ứng' AND (title LIKE '%kho%' OR title LIKE '%Kho%');


UPDATE jobs SET specialty='production/quality/qc' WHERE specialty='' AND category='Sản xuất & Quản lý chất lượng' AND (title LIKE '%chất lượng%' OR title LIKE '%Chất lượng%' OR title LIKE '%qa%' OR title LIKE '%Qa%' OR title LIKE '%qc%' OR title LIKE '%Qc%');


UPDATE jobs SET specialty='production/planning/planner' WHERE specialty='' AND category='Sản xuất & Quản lý chất lượng' AND (title LIKE '%kế hoạch%' OR title LIKE '%Kế hoạch%');


UPDATE jobs SET specialty='production/planning/operator' WHERE specialty='' AND category='Sản xuất & Quản lý chất lượng' AND (title LIKE '%vận hành%' OR title LIKE '%Vận hành%');


UPDATE jobs SET specialty='engineering/automation/plc' WHERE specialty='' AND category='Cơ khí & Điện tự động hóa' AND (title LIKE '%plc%' OR title LIKE '%Plc%' OR title LIKE '%hmi%' OR title LIKE '%Hmi%');


UPDATE jobs SET specialty='engineering/automation/electrical' WHERE specialty='' AND category='Cơ khí & Điện tự động hóa' AND (title LIKE '%kỹ thuật điện%' OR title LIKE '%Kỹ thuật điện%');


UPDATE jobs SET specialty='engineering/mechanical/maintenance' WHERE specialty='' AND category='Cơ khí & Điện tự động hóa' AND (title LIKE '%bảo trì%' OR title LIKE '%Bảo trì%');


UPDATE jobs SET specialty='engineering/mechanical/design' WHERE specialty='' AND category='Cơ khí & Điện tự động hóa' AND (title LIKE '%thiết kế cơ khí%' OR title LIKE '%Thiết kế cơ khí%');


UPDATE jobs SET specialty='construction/architecture/architect' WHERE specialty='' AND category='Xây dựng & Kiến trúc' AND (title LIKE '%kiến trúc sư%' OR title LIKE '%Kiến trúc sư%');


UPDATE jobs SET specialty='construction/architecture/interior' WHERE specialty='' AND category='Xây dựng & Kiến trúc' AND (title LIKE '%nội thất%' OR title LIKE '%Nội thất%');


UPDATE jobs SET specialty='construction/civil/qs' WHERE specialty='' AND category='Xây dựng & Kiến trúc' AND (title LIKE '%dự toán%' OR title LIKE '%Dự toán%' OR title LIKE '%qs%' OR title LIKE '%Qs%');


UPDATE jobs SET specialty='construction/civil/site' WHERE specialty='' AND category='Xây dựng & Kiến trúc' AND (title LIKE '%hiện trường%' OR title LIKE '%Hiện trường%' OR title LIKE '%giám sát%' OR title LIKE '%Giám sát%');


UPDATE jobs SET specialty='tourism/hotel/reception' WHERE specialty='' AND category='Du lịch & Khách sạn' AND (title LIKE '%lễ tân%' OR title LIKE '%Lễ tân%');


UPDATE jobs SET specialty='tourism/hotel/housekeeping' WHERE specialty='' AND category='Du lịch & Khách sạn' AND (title LIKE '%buồng phòng%' OR title LIKE '%Buồng phòng%');


UPDATE jobs SET specialty='tourism/travel/operations' WHERE specialty='' AND category='Du lịch & Khách sạn' AND (title LIKE '%điều hành tour%' OR title LIKE '%Điều hành tour%');


UPDATE jobs SET specialty='tourism/travel/guide' WHERE specialty='' AND category='Du lịch & Khách sạn' AND (title LIKE '%hướng dẫn viên%' OR title LIKE '%Hướng dẫn viên%');


UPDATE jobs SET specialty='food/kitchen/assistant' WHERE specialty='' AND category='Nhà hàng & Thực phẩm' AND (title LIKE '%phụ bếp%' OR title LIKE '%Phụ bếp%');


UPDATE jobs SET specialty='food/kitchen/chef' WHERE specialty='' AND category='Nhà hàng & Thực phẩm' AND (title LIKE '%đầu bếp%' OR title LIKE '%Đầu bếp%');


UPDATE jobs SET specialty='food/service/supervisor' WHERE specialty='' AND category='Nhà hàng & Thực phẩm' AND (title LIKE '%giám sát ca%' OR title LIKE '%Giám sát ca%');


UPDATE jobs SET specialty='food/service/waiter' WHERE specialty='' AND category='Nhà hàng & Thực phẩm' AND (title LIKE '%phục vụ%' OR title LIKE '%Phục vụ%');


UPDATE jobs SET specialty='retail/ecommerce/operations' WHERE specialty='' AND category='Bán lẻ & Thương mại điện tử' AND (title LIKE '%vận hành sàn%' OR title LIKE '%Vận hành sàn%');


UPDATE jobs SET specialty='retail/ecommerce/livestream' WHERE specialty='' AND category='Bán lẻ & Thương mại điện tử' AND (title LIKE '%livestream%' OR title LIKE '%Livestream%');


UPDATE jobs SET specialty='retail/store/merchandising' WHERE specialty='' AND category='Bán lẻ & Thương mại điện tử' AND (title LIKE '%trưng bày%' OR title LIKE '%Trưng bày%');


UPDATE jobs SET specialty='retail/store/manager' WHERE specialty='' AND category='Bán lẻ & Thương mại điện tử' AND (title LIKE '%quản lý cửa hàng%' OR title LIKE '%Quản lý cửa hàng%');


UPDATE jobs SET specialty='legal/legal/contract' WHERE specialty='' AND category='Pháp lý & Tuân thủ' AND (title LIKE '%hợp đồng%' OR title LIKE '%Hợp đồng%');


UPDATE jobs SET specialty='legal/legal/corporate' WHERE specialty='' AND category='Pháp lý & Tuân thủ' AND (title LIKE '%pháp chế doanh nghiệp%' OR title LIKE '%Pháp chế doanh nghiệp%');


UPDATE jobs SET specialty='legal/compliance/compliance' WHERE specialty='' AND category='Pháp lý & Tuân thủ' AND (title LIKE '%tuân thủ%' OR title LIKE '%Tuân thủ%');


UPDATE jobs SET specialty='agri/agriculture/crops' WHERE specialty='' AND category='Nông nghiệp & Môi trường' AND (title LIKE '%trồng trọt%' OR title LIKE '%Trồng trọt%');


UPDATE jobs SET specialty='agri/agriculture/livestock' WHERE specialty='' AND category='Nông nghiệp & Môi trường' AND (title LIKE '%chăn nuôi%' OR title LIKE '%Chăn nuôi%');


UPDATE jobs SET specialty='agri/environment/monitoring' WHERE specialty='' AND category='Nông nghiệp & Môi trường' AND (title LIKE '%quan trắc%' OR title LIKE '%Quan trắc%');


UPDATE jobs SET specialty='agri/environment/treatment' WHERE specialty='' AND category='Nông nghiệp & Môi trường' AND (title LIKE '%xử lý môi trường%' OR title LIKE '%Xử lý môi trường%');


UPDATE jobs SET specialty='service/support/chat' WHERE specialty='' AND category='Chăm sóc khách hàng' AND (title LIKE '%qua chat%' OR title LIKE '%Qua chat%');


UPDATE jobs SET specialty='service/support/call' WHERE specialty='' AND category='Chăm sóc khách hàng' AND (title LIKE '%tổng đài%' OR title LIKE '%Tổng đài%');


UPDATE jobs SET specialty='service/experience/cx' WHERE specialty='' AND category='Chăm sóc khách hàng' AND (title LIKE '%trải nghiệm khách hàng%' OR title LIKE '%Trải nghiệm khách hàng%');


UPDATE jobs SET specialty='admin/office/administrator' WHERE specialty='' AND category='Hành chính & Văn phòng' AND (title LIKE '%hành chính%' OR title LIKE '%Hành chính%');


UPDATE jobs SET specialty='admin/office/reception' WHERE specialty='' AND category='Hành chính & Văn phòng' AND (title LIKE '%lễ tân%' OR title LIKE '%Lễ tân%');


UPDATE jobs SET specialty='admin/assistant/project' WHERE specialty='' AND category='Hành chính & Văn phòng' AND (title LIKE '%trợ lý dự án%' OR title LIKE '%Trợ lý dự án%');


UPDATE jobs SET specialty='admin/assistant/executive' WHERE specialty='' AND category='Hành chính & Văn phòng' AND (title LIKE '%trợ lý điều hành%' OR title LIKE '%Trợ lý điều hành%');


-- 0004_bizarre_blink.sql
CREATE TABLE `company_follows` (
	`candidate_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `uq_company_follow` ON `company_follows` (`candidate_id`,`company_id`);
CREATE INDEX `idx_company_follow_company` ON `company_follows` (`company_id`);

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


-- 0005_silky_spencer_smythe.sql
CREATE TABLE `career_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `idx_career_documents_user` ON `career_documents` (`user_id`);
CREATE TABLE `career_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`salary_min` real DEFAULT 0 NOT NULL,
	`experience` text DEFAULT '' NOT NULL,
	`skills` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `google_identities` (
	`subject` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`picture` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `google_identities_user_id_unique` ON `google_identities` (`user_id`);
CREATE TABLE `oauth_states` (
	`state_hash` text PRIMARY KEY NOT NULL,
	`verifier` text NOT NULL,
	`user_id` text,
	`role` text NOT NULL,
	`expires_at` integer NOT NULL
);


-- 0006_password_resets.sql
CREATE TABLE password_resets (
 token_hash TEXT PRIMARY KEY NOT NULL,
 user_id TEXT NOT NULL REFERENCES users(id),
 expires_at INTEGER NOT NULL,
 used_at TEXT,
 created_at TEXT NOT NULL
);
CREATE INDEX idx_password_reset_user ON password_resets(user_id, expires_at);


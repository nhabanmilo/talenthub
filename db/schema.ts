import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';
export const users = sqliteTable('users', {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  password_hash: text().notNull(),
  role: text().notNull(),
  status: text().notNull().default('active'),
  name: text().notNull(),
  created_at: text().notNull(),
});
export const sessions = sqliteTable('sessions', {
  token: text().primaryKey(),
  user_id: text()
    .notNull()
    .references(() => users.id),
  expires_at: integer().notNull(),
});
export const profiles = sqliteTable('profiles', {
  user_id: text()
    .primaryKey()
    .references(() => users.id),
  phone: text().default(''),
  location: text().default(''),
  headline: text().default(''),
  skills: text().default(''),
  experience_summary: text().default(''),
  date_of_birth: text().default(''),
});
export const companies = sqliteTable('companies', {
  id: text().primaryKey(),
  owner_id: text()
    .notNull()
    .unique()
    .references(() => users.id),
  name: text().notNull(),
  tax_code: text().default(''),
  address: text().default(''),
  website: text().default(''),
  description: text().default(''),
  status: text().notNull().default('pending'),
  is_demo: integer().notNull().default(0),
});
export const categories = sqliteTable('categories', {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  is_active: integer().notNull().default(1),
});
export const jobs = sqliteTable(
  'jobs',
  {
    id: text().primaryKey(),
    company_id: text()
      .notNull()
      .references(() => companies.id),
    created_by: text()
      .notNull()
      .references(() => users.id),
    category: text().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    requirements: text().notNull(),
    benefits: text().notNull(),
    location: text().notNull(),
    salary_min: real().notNull(),
    salary_max: real().notNull(),
    deadline: text().notNull(),
    status: text().notNull().default('pending'),
    reason: text().default(''),
    experience: text().default(''),
    type: text().default('Toàn thời gian'),
    tags: text().default('[]'),
    created_at: text().notNull(),
    updated_at: text().notNull(),
    is_demo: integer().notNull().default(0),
  },
  (t) => [
    index('idx_jobs_status_deadline').on(t.status, t.deadline),
    index('idx_jobs_owner').on(t.created_by),
    index('idx_jobs_category').on(t.category),
  ],
);
export const resumes = sqliteTable('resumes', {
  id: text().primaryKey(),
  candidate_id: text()
    .notNull()
    .references(() => users.id),
  title: text().notNull(),
  object_key: text().notNull(),
  content_type: text().notNull(),
  size: integer().notNull(),
  is_default: integer().notNull().default(0),
  deleted: integer().notNull().default(0),
  created_at: text().notNull(),
});
export const applications = sqliteTable(
  'applications',
  {
    id: text().primaryKey(),
    job_id: text()
      .notNull()
      .references(() => jobs.id),
    candidate_id: text()
      .notNull()
      .references(() => users.id),
    resume_id: text()
      .notNull()
      .references(() => resumes.id),
    cover_letter: text().default(''),
    status: text().notNull().default('submitted'),
    note: text().default(''),
    applied_at: text().notNull(),
    updated_at: text().notNull(),
  },
  (t) => [
    uniqueIndex('uq_application_candidate_job').on(t.candidate_id, t.job_id),
    index('idx_application_job_status').on(t.job_id, t.status),
  ],
);
export const saved = sqliteTable(
  'saved_jobs',
  {
    candidate_id: text()
      .notNull()
      .references(() => users.id),
    job_id: text()
      .notNull()
      .references(() => jobs.id),
  },
  (t) => [uniqueIndex('uq_saved_candidate_job').on(t.candidate_id, t.job_id)],
);
export const notifications = sqliteTable(
  'notifications',
  {
    id: text().primaryKey(),
    user_id: text()
      .notNull()
      .references(() => users.id),
    content: text().notNull(),
    is_read: integer().notNull().default(0),
    created_at: text().notNull(),
  },
  (t) => [index('idx_notifications_user').on(t.user_id)],
);
export const audit = sqliteTable('audit_log', {
  id: text().primaryKey(),
  actor_id: text().notNull(),
  action: text().notNull(),
  reference_id: text().notNull(),
  reason: text().default(''),
  created_at: text().notNull(),
});
export const limits = sqliteTable('auth_limits', {
  key: text().primaryKey(),
  attempts: integer().notNull().default(0),
  reset_at: integer().notNull(),
});
export const setup = sqliteTable('setup', {
  id: text().primaryKey(),
  value: text().notNull(),
});

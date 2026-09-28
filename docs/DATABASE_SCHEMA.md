# Relational Database Schema & Data Architecture

The **ByteCorp Job Board Platform** utilizes a relational database architecture designed in **PostgreSQL** (Phase 1 Traineeship Task) enforcing strict referential integrity, domain enums, composite keys, and targeted performance indexes.

---

## 📊 Entity Relationship Diagram (ERD)

![Entity Relationship Diagram](assets/erd.png)

---

## 🗄 Core Tables & Relational Model

### 1. `users`
Stores user authentication profiles, roles, and experience profiles.
- **Primary Key**: `user_id serial`
- **Unique**: `email varchar(100)`
- **Enum Role**: `user_role_enum` (`job_seeker`, `company_rep`)
- **Check Constraints**: `years_of_experience >= 0`
- **Audit Columns**: `created_at`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` (Soft Delete support)

### 2. `companies`
Stores employer and enterprise profiles.
- **Primary Key**: `company_id serial`
- **Fields**: `name varchar(120)`, `description text`, `website varchar(120)`, `location varchar(100)`
- **Verification Flag**: `is_verified boolean default false` (Admin moderation required)
- **Audit Columns**: `created_at`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`

### 3. `company_members` (Junction)
Links company representatives with company entities.
- **Composite Primary Key**: `(user_id, company_id)`
- **Foreign Keys**: `user_id -> users(user_id)` ON DELETE CASCADE, `company_id -> companies(company_id)` ON DELETE CASCADE

### 4. `jobs`
Stores job postings published by verified companies.
- **Primary Key**: `job_id serial`
- **Foreign Key**: `company_id -> companies(company_id)` ON DELETE CASCADE
- **Enums**:
  - `employment_type`: `full-time`, `part-time`, `contract`
  - `status`: `open`, `closed`, `draft`
- **Check Constraints**: `salary_min >= 0`, `salary_max >= salary_min`

### 5. `skills`
Master catalog of searchable technical skills and tags.
- **Primary Key**: `skill_id serial`
- **Unique**: `name varchar(50)`

### 6. `job_skills` & `user_skills` (Many-to-Many Junctions)
- **`job_skills`**: Composite PK `(job_id, skill_id)` mapping required skills to job openings.
- **`user_skills`**: Composite PK `(user_id, skill_id)` mapping verified skills to job seekers.

### 7. `applications`
Records candidate applications for open roles.
- **Primary Key**: `application_id serial`
- **Foreign Keys**: `user_id -> users(user_id)`, `job_id -> jobs(job_id)`
- **Unique Constraint**: `UNIQUE (user_id, job_id)` (prevents duplicate submissions)
- **Enum Status**: `application_status_enum` (`pending`, `reviewed`, `shortlisted`, `rejected`)
- **Fields**: `cover_letter text`, `resume_file`, `created_at`, `updated_at`

---

## ⚡ Indexing Strategy

Targeted B-tree and composite indexes defined in `Task 1/Indexes.sql`:
1. **`idx_jobs_company_status`**: Optimizes company dashboard queries filtering by `(company_id, status)`.
2. **`idx_jobs_active_search`**: Multi-column index on `(status, employment_type, location)` for the public job search portal.
3. **`idx_applications_user`**: Speeds up candidate application history retrieval.
4. **`idx_applications_job_status`**: Accelerates recruiter applicant screening and status filtering.
5. **`idx_job_skills_composite`**: Composite index for rapid skill-match lookups.

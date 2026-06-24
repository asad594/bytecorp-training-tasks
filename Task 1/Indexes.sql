-- When a user searches "jobs in Karachi", this index jumps directly to Karachi jobs
-- without scanning every single row in the Jobs table
create index idx_jobs_location on jobs(location);

-- When a user filters "show me only full-time jobs", this index finds them instantly
-- instead of checking every job one by one
create index idx_jobs_employment_type on jobs(employment_type);

-- Every job search shows only open jobs. Without this index, the database reads
-- every job including closed and draft ones just to filter them out
create index idx_jobs_status on jobs(status);

-- When a user filters "salary between 50,000 and 100,000", this composite index
-- covers both columns together so the database does not scan the entire jobs table
create index idx_jobs_salary on jobs(salary_min, salary_max);

-- Every login attempt searches by email. If Ali logs in with ali@gmail.com,
-- this index finds his account instantly instead of scanning all users
create index idx_users_email on users(email);

-- When Google's dashboard loads "all jobs we posted", this index fetches
-- only Google's jobs directly instead of scanning every job in the table
create index idx_jobs_company_id on jobs(company_id);

-- When Ali opens his profile to see "all jobs I applied to", this index
-- fetches only Ali's applications without reading the entire applications table
create index idx_applications_user_id on applications(user_id);

-- When a recruiter opens "Backend Developer at Google" to see all applicants,
-- this index fetches only that job's applications instantly
create index idx_applications_job_id on applications(job_id);

-- When a user searches "jobs that require Python", this index finds all
-- job_skills rows where skill is Python without scanning the entire junction table
create index idx_job_skills_skill_id on job_skills(skill_id);

-- When a recruiter searches "all users who know React", this index finds them
-- directly from user_skills without reading every user's skill one by one
create index idx_user_skills_skill_id on user_skills(skill_id);
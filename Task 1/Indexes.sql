-- When a user searches "jobs in Karachi", this index jumps directly to Karachi jobs
create index idx_jobs_location on jobs(location);

-- When a user filters "show me only full-time jobs", this index finds them instantly
create index idx_jobs_employment_type on jobs(employment_type);

-- Every job search shows only open jobs
create index idx_jobs_status on jobs(status);

-- Separate indexes for salary min and max for better range query performance
create index idx_jobs_salary_min on jobs(salary_min);
create index idx_jobs_salary_max on jobs(salary_max);

-- Every login attempt searches by email
create index idx_users_email on users(email);

-- Fetch all jobs posted by a specific company
create index idx_jobs_company_id on jobs(company_id);

-- Fetch all applications submitted by a specific user
create index idx_applications_user_id on applications(user_id);

-- Fetch all applications received for a specific job
create index idx_applications_job_id on applications(job_id);

-- Find all jobs that require a specific skill
create index idx_job_skills_skill_id on job_skills(skill_id);

-- Find all users who have a specific skill
create index idx_user_skills_skill_id on user_skills(skill_id);

-- Recruiter filters applications by status
create index idx_applications_status on applications(status);

-- Newest jobs first in search results
create index idx_jobs_created_at on jobs(created_at desc);

-- Most common filter combo: status + location together
create index idx_jobs_status_location on jobs(status, location);
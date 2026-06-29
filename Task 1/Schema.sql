create type employment_type_enum as enum('full-time','part-time','contract');
create type job_status_enum as enum('open','closed','draft');
create type application_status_enum as enum('pending','reviewed','shortlisted','rejected');

-- users table
create table users(
    user_id serial not null primary key,
    name varchar(100) not null,
    email varchar(100) not null unique,
    password_hash varchar(255) not null,
    bio text,
    years_of_experience int not null default 0 check(years_of_experience >= 0),
    created_at timestamp not null default now(),
    updated_at timestamp,
    updated_by int,
    deleted_at timestamp,
    deleted_by int,
    foreign key (updated_by) references users(user_id) on delete set null,
    foreign key (deleted_by) references users(user_id) on delete set null
);

-- companies table
create table companies(
    company_id serial not null primary key,
    name varchar(120) not null,
    description text,
    website varchar(120),
    location varchar(100),
    is_verified boolean not null default false,
    created_at timestamp not null default now(),
    updated_at timestamp,
    updated_by int,
    deleted_at timestamp,
    deleted_by int,
    foreign key (updated_by) references users(user_id) on delete set null,
    foreign key (deleted_by) references users(user_id) on delete set null
);

-- jobs table
create table jobs(
    job_id serial not null primary key,
    company_id int not null,
    title varchar(100) not null,
    description text,
    location varchar(100),
    salary_min int not null check(salary_min >= 0),
    salary_max int not null check(salary_max >= salary_min),
    employment_type employment_type_enum not null,
    status job_status_enum not null default 'draft',
    created_at timestamp not null default now(),
    updated_at timestamp,
    updated_by int,
    deleted_at timestamp,
    deleted_by int,
    foreign key (company_id) references companies(company_id) on delete cascade,
    foreign key (updated_by) references users(user_id) on delete set null,
    foreign key (deleted_by) references users(user_id) on delete set null
);

-- applications table
create table applications(
    application_id serial not null primary key,
    user_id int not null,
    job_id int not null,
    cover_letter text,
    status application_status_enum not null default 'pending',
    created_at timestamp not null default now(),
    updated_at timestamp,
    updated_by int,
    deleted_at timestamp,
    deleted_by int,
    unique(user_id, job_id),
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (job_id) references jobs(job_id) on delete cascade,
    foreign key (updated_by) references users(user_id) on delete set null,
    foreign key (deleted_by) references users(user_id) on delete set null
);

-- skills table
create table skills(
    skill_id serial not null primary key,
    name varchar(50) not null unique,
    updated_at timestamp,
    updated_by int,
    deleted_at timestamp,
    deleted_by int,
    foreign key (updated_by) references users(user_id) on delete set null,
    foreign key (deleted_by) references users(user_id) on delete set null
);

-- user_skills junction table
create table user_skills(
    user_id int not null,
    skill_id int not null,
    primary key(user_id, skill_id),
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (skill_id) references skills(skill_id) on delete cascade
);

-- job_skills junction table
create table job_skills(
    job_id int not null,
    skill_id int not null,
    primary key(job_id, skill_id),
    foreign key (job_id) references jobs(job_id) on delete cascade,
    foreign key (skill_id) references skills(skill_id) on delete cascade
);

-- updated_at trigger function
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_users_updated_at
before update on users
for each row execute function set_updated_at();

create trigger trigger_companies_updated_at
before update on companies
for each row execute function set_updated_at();

create trigger trigger_jobs_updated_at
before update on jobs
for each row execute function set_updated_at();

create trigger trigger_applications_updated_at
before update on applications
for each row execute function set_updated_at();

create trigger trigger_skills_updated_at
before update on skills
for each row execute function set_updated_at();
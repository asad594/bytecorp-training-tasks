create type employment_type_enum as ENUM('full-time','part-time','contract');
create type job_status_enum as ENUM('open','closed','draft');
create type application_status_enum as ENUM('pending','reviewed','shortlisted','rejected');

---USER TABLE----
create table Users(
	user_id serial not null primary key,
	name varchar(100) not null,
	email varchar(100) not null unique,
	password varchar(100) not null,
	bio text,
	years_of_experience INT not null default 0 check(years_of_experience >= 0),
	created_at timestamp not null default NOW(),
	updated_at TIMESTAMP
);

----COMPANY TABLE-------
create table Companies(
	company_id serial not null primary key,
	name varchar(120) not null,
	description text,
	website varchar(120),
	location varchar(100),
	is_verified boolean not null default False,
	created_at timestamp not null default Now(),
	updated_at timestamp,
    updated_by int,
	foreign key (updated_by) references Users(user_id) On delete Set null
);

---JOB TABLE---
create table Jobs(
    job_id serial not null primary key,
    company_id int not null,
    title varchar(100) not null,
    description text,
    location varchar(100),
    salary_min int not null check(salary_min >= 0),
    salary_max int not null check(salary_max >= salary_min),
    employment_type employment_type_enum not null,
    status job_status_enum not null default 'draft',
    created_at timestamp not null default NOW(),
    updated_at timestamp,
    updated_by int,
    deleted_at timestamp,
    deleted_by int,
   	foreign key (company_id) references Companies(company_id) on delete cascade,
    foreign key (updated_by) references Users(user_id) on delete set null,
    foreign key (deleted_by) references Users(user_id) on delete set null
);

----APPLICATION TABLE--------
create table applications(
    application_id serial not null primary key,
    user_id int not null,
    job_id int not null,
    cover_letter text not null,
    status application_status_enum not null default 'pending',
    created_at timestamp not null default now(),
    updated_at timestamp,
    updated_by int,
    unique(user_id, job_id),
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (job_id) references jobs(job_id) on delete cascade,
    foreign key (updated_by) references users(user_id) on delete set null
);

----SKILLS TABLE---
create table skills(
    skill_id serial not null primary key,
    name varchar(50) not null unique,
    updated_at timestamp
);

--USER Skills Junction table---
create table user_skills(
    user_id int not null,
    skill_id int not null,
    primary key(user_id, skill_id),
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (skill_id) references skills(skill_id) on delete cascade
);

---JOB skills table----
create table job_skills(
    job_id int not null,
    skill_id int not null,
    primary key(job_id, skill_id),
    foreign key (job_id) references jobs(job_id) on delete cascade,
    foreign key (skill_id) references skills(skill_id) on delete cascade
);
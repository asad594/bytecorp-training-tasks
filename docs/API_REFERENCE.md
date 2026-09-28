# REST API Reference & Endpoint Catalog

The **ByteCorp Job Board Backend** provides RESTful APIs structured under `/api/v1/`. All route path fragments are centrally registered in `config/endpoints.py` to prevent route discrepancies across the application.

---

## 🔐 Authentication & Accounts (`/api/v1/accounts/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `register/job_seeker/` | Public | Register a new candidate profile |
| `POST` | `register/company_rep/` | Public | Register a new employer/company representative |
| `POST` | `login/job_seeker/` | Public | Authenticate candidate & obtain JWT tokens |
| `POST` | `login/company_rep/` | Public | Authenticate recruiter & obtain JWT tokens |
| `POST` | `login/admin/` | Public | Authenticate platform superuser / admin |
| `POST` | `auth/google/` | Public | Google OAuth 2.0 social login callback |
| `POST` | `password/forgot/` | Public | Trigger password reset email with secure token |
| `POST` | `password/reset/` | Public | Complete password reset with new credential |
| `POST` | `token/refresh/` | Public | Exchange refresh token for fresh access token |
| `GET` / `PUT` | `profile/` | Authenticated | View or update currently logged in user profile |
| `POST` | `logout/` | Authenticated | Invalidate JWT refresh token / session |
| `GET` | `admin/stats/` | Admin | Aggregate platform metrics (users, jobs, applications) |
| `GET` | `admin/users/` | Admin | Query users with optional `?role=` filter |
| `GET` / `PUT` / `DELETE` | `admin/users/<id>/` | Admin | Manage specific user record |
| `POST` | `admin/users/<id>/ban/` | Admin | Toggle user active / ban status |

---

## 🏢 Companies (`/api/v1/companies/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | List verified companies with pagination |
| `POST` | `/` | Company Rep | Register a new company entity |
| `GET` | `me/` | Company Rep | Retrieve company profile of the authenticated representative |
| `POST` | `join/` | Company Rep | Request association with an existing company |
| `GET` | `pending/` | Admin | List companies pending verification |
| `POST` | `<id>/verify/` | Admin | Approve and verify company registration |
| `POST` | `<id>/ban/` | Admin | Ban or suspend company operations |
| `GET` / `PUT` | `<id>/` | Authenticated | Retrieve or edit company details |

---

## 💼 Jobs (`/api/v1/jobs/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Search jobs (query params: `salary_min`, `employment_type`, `location`, `skills`) |
| `POST` | `/` | Company Rep | Publish a new job opening |
| `GET` | `<id>/` | Public | Retrieve detailed job posting |
| `PUT` / `PATCH` | `<id>/` | Company Rep | Update job details, requirements, or status |
| `DELETE` | `<id>/` | Company Rep / Admin | Soft-delete or archive job listing |

---

## 📑 Job Applications (`/api/v1/job-applications/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Job Seeker | List submitted applications with current statuses |
| `POST` | `/` | Job Seeker | Submit application with cover letter and resume upload |
| `GET` | `company/` | Company Rep | View all applications received across company jobs |
| `GET` | `<id>/` | Rep / Seeker | Retrieve full application details & resume link |
| `PATCH` | `<id>/` | Company Rep | Update status (`reviewed`, `shortlisted`, `rejected`) |

---

## 🏷 Technical Skills (`/api/v1/skills/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | List available skill tags for autocomplete & filtering |
| `POST` | `/` | Authenticated | Suggest / add a new skill to the platform catalog |
| `GET` / `PUT` | `<id>/` | Admin | Manage specific skill taxonomy entry |

---

## 📬 Postman Collection Integration

A ready-to-import Postman workspace is provided in the repository:
- **Collection**: [`backend/postman/JobBoard_Postman_Collection.json`](../backend/postman/JobBoard_Postman_Collection.json)
- **Environment**: [`backend/postman/JobBoard_Postman_Environment.json`](../backend/postman/JobBoard_Postman_Environment.json)

Set the `base_url` variable to `http://127.0.0.1:8000` to execute automated test requests.

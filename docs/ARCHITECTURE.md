# System Architecture & Technical Specifications

The **ByteCorp Job Board Platform** is engineered as a decoupled, multi-tier fullstack ecosystem consisting of a high-performance **Django 6 REST API**, a reactive **React 19 Frontend**, an extensible **Payload CMS 3** headless content engine, and an isolated **dual-database PostgreSQL architecture**.

---

## 🏛 High-Level Architecture Diagram

![System Architecture](assets/architecture.svg)

---

## 🧩 Architectural Layers

### 1. Presentation Tier (Frontend & CMS)
- **Job Board Web Portal (`frontend/`)**:
  - **Framework**: React 19 SPA bundled with Vite 8.
  - **Styling**: Tailwind CSS v4 for modern responsive UI.
  - **State & Server Cache**: TanStack React Query 5 for caching, invalidation, and background synchronization.
  - **Routing**: React Router 7.
  - **Form Validation**: Formik + Yup for candidate and recruiter form workflows.
  - **HTTP Client**: Axios with interceptors for JWT token injection and automatic token refresh (`/api/v1/accounts/token/refresh/`).
- **Headless CMS (`cms/`)**:
  - **Framework**: Payload CMS 3 built on Next.js 16 with TypeScript.
  - **Rich Text**: Lexical RichText editor.
  - **Database Adapter**: Direct PostgreSQL integration for managing editorial content, articles, and announcements.

### 2. Application & API Tier (`backend/`)
- **Web Framework**: Django 6.0 with Django REST Framework (DRF 3.17).
- **Authentication & Authorization**:
  - JWT Authentication via `djangorestframework-simplejwt`.
  - Google OAuth integration (`google-auth`).
  - Strict Role-Based Access Control (RBAC): `job_seeker`, `company_rep`, and `admin`.
- **Centralized Routing**:
  - All endpoint paths are centralized in `config/endpoints.py` to prevent route drift across test suites, frontends, and documentation.
- **Middleware Pipeline**:
  - CORS header handling (`django-cors-headers`).
  - Correlation ID injection (attaching a unique UUID per HTTP cycle).
  - Request logging middleware outputting structured JSON logs.

### 3. Data & Persistence Tier
- **Dual-Database Segregation**:
  1. **Primary Database (`default`)**:
     - Manages domain entities: Users, Companies, Jobs, Job Applications, and Skills.
     - Enforces strict foreign keys, cascade rules, and check constraints.
  2. **Observability Database (`logs_db`)**:
     - Controlled by `LoggingRouter` (`observability/routers.py`).
     - Routes all `RequestLog` entries exclusively to a dedicated Postgres database.
     - Guarantees zero write-lock contention or performance degradation on business transactions.
- **Media & Static Storage**:
  - Resume uploads (PDF/DOCX) stored in `media/resumes/`.
  - Company branding & logos in `media/logos/`.
  - WhiteNoise static asset serving for production deployment.

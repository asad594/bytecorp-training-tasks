<div align="center">

  <img src="docs/assets/banner-header.svg" alt="ByteCorp Job Board Platform Header" width="100%" />

  <br/><br/>

  <a href="#-interactive-quick-start">
    <img src="https://img.shields.io/badge/Quick_Start-Live_Demo-0284c7?style=for-the-badge&logo=rocket&logoColor=white" alt="Quick Start" />
  </a>
  <a href="docs/API_REFERENCE.md">
    <img src="https://img.shields.io/badge/API_Reference-v1.0-6366f1?style=for-the-badge&logo=fastapi&logoColor=white" alt="API Reference" />
  </a>
  <a href="docs/DATABASE_SCHEMA.md">
    <img src="https://img.shields.io/badge/Database_Schema-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="Database" />
  </a>
  <a href="https://github.com/asad594/bytecorp-training-tasks/releases/download/srs-v1.0/SRS_Job_board.1.pdf">
    <img src="https://img.shields.io/badge/SRS_Specification-v1.0_PDF-e11d48?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="SRS Document" />
  </a>

  <br/><br/>

  [![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
  [![Django](https://img.shields.io/badge/Django-6.0-092E20?style=flat-square&logo=django&logoColor=white)](https://djangoproject.com)
  [![DRF](https://img.shields.io/badge/DRF-3.17-a30000?style=flat-square&logo=django&logoColor=white)](https://www.django-rest-framework.org)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
  [![Payload CMS](https://img.shields.io/badge/Payload_CMS-v3-black?style=flat-square&logo=payloadcms&logoColor=white)](https://payloadcms.com)
  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

  <br/><br/>

  <p align="center">
    <b>A modern, decoupled, multi-tier recruitment and career management platform built during the ByteCorp Traineeship Program.</b><br/>
    Featuring role-based authentication, structured observability with isolated database routing, dynamic job search and filtering, headless CMS editorial controls, and interactive application pipelines.
  </p>

  <img src="docs/assets/hero-banner.jpg" alt="ByteCorp Job Board Platform Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />

</div>

---

## 🧭 Interactive Table of Contents

- [🌟 Platform Overview](#-platform-overview)
- [⚡ Interactive Quick Start](#-interactive-quick-start)
- [🏛 System Architecture](#-system-architecture)
- [🔄 Operational Workflows](#-operational-workflows)
- [📊 Relational Data Model & ERD](#-relational-data-model--erd)
- [📡 API Catalog & Endpoints](#-api-catalog--endpoints)
- [🔍 Observability & Production Logging](#-observability--production-logging)
- [🧪 Postman Testing Suite](#-postman-testing-suite)
- [📄 Software Requirements Specification (SRS)](#-software-requirements-specification-srs)

---

## 🌟 Platform Overview

The **ByteCorp Job Board Platform** is a fullstack recruitment system designed with enterprise architectural patterns:

- 👨‍💻 **Candidate Experience**: Filter jobs by tags, skills, location, and salary; submit applications with resumes; track status in real-time.
- 🏢 **Employer Experience**: Register companies, post verified openings, screen applicants, download resumes, and manage hiring stages.
- 🛡 **Admin Moderation**: Superuser analytics, company verification gates, user ban controls, and system health monitoring.
- 📑 **Headless CMS Engine**: Powered by Payload CMS 3 and Next.js 16 for marketing pages, announcements, and content authoring.
- 📈 **Isolated Observability**: Dual-database routing sends structured JSON request logs to a dedicated PostgreSQL database without burdening transactional queries.

---

## ⚡ Interactive Quick Start

<details open>
<summary><b>🚀 Run All Services Concurrently (Recommended)</b></summary>

The project includes root orchestration via `concurrently` to boot the Django API, React frontend, and Payload CMS together:

```bash
# 1. Clone repository
git clone https://github.com/asad594/bytecorp-training-tasks.git
cd bytecorp-training-tasks

# 2. Install orchestration dependencies
npm install

# 3. Boot all services simultaneously
npm run dev
```

| Service | Address | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **Backend API** | `http://localhost:8000/api/v1/` | `8000` | Django 6 REST Framework API |
| **Frontend Portal** | `http://localhost:5173/` | `5173` | React 19 + Tailwind CSS UI |
| **Payload CMS** | `http://localhost:3000/admin/` | `3000` | Next.js 16 + Payload CMS Admin |

</details>

<details>
<summary><b>🐍 Individual Backend Setup (Django 6 & DRF)</b></summary>

```bash
cd backend

# Create and activate virtualenv
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run migrations (Primary DB + Logs DB)
python manage.py migrate
python manage.py migrate --database=logs_db

# Create admin user & start server
python manage.py createsuperuser
python manage.py runserver
```

</details>

<details>
<summary><b>⚛️ Individual Frontend Setup (React 19 & Vite 8)</b></summary>

```bash
cd frontend
npm install
npm run dev
```

The React portal will be live at `http://localhost:5173`.

</details>

<details>
<summary><b>📝 Individual CMS Setup (Payload CMS 3 & Next.js 16)</b></summary>

```bash
cd cms
pnpm install
pnpm dev
```

The CMS panel will be live at `http://localhost:3000/admin`.

</details>

---

## 🏛 System Architecture

The platform follows a clean 3-tier decoupled architecture:

<div align="center">
  <img src="docs/assets/architecture.svg" alt="System Architecture Diagram" width="100%" />
</div>

<details>
<summary><b>🔍 View Architecture Deep Dive</b></summary>

- **Presentation Layer**: Built with React 19, TanStack Query 5, and Tailwind CSS v4 for reactive, optimistic UI updates.
- **Application Layer**: Django 6 with Django REST Framework, SimpleJWT for token rotation, and centralized URL endpoints registry (`config/endpoints.py`).
- **Data & Observability Layer**:
  - `default` PostgreSQL database for ACID domain transactions.
  - `logs_db` PostgreSQL database for zero-overhead JSON request log ingestion routed via `LoggingRouter`.
  - Media storage for candidate resumes and employer branding.

For complete architectural specifications, see **[System Architecture Guide](docs/ARCHITECTURE.md)**.

</details>

# Local Development & Environment Setup Guide

This guide walks you through setting up and running all three tiers of the **ByteCorp Job Board Platform** locally: **Backend (Django)**, **Frontend (React)**, and **CMS (Payload / Next.js)**.

---

## ⚡ Quick Start (All Services Concurrently)

The root repository includes a preconfigured `concurrently` runner that launches all three services with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/asad594/bytecorp-training-tasks.git
cd bytecorp-training-tasks

# 2. Install root orchestration dependencies
npm install

# 3. Launch all services simultaneously
npm run dev
```

| Service | Port | Description |
| :--- | :--- | :--- |
| **Backend API** | `http://localhost:8000` | Django 6 REST Framework API |
| **Frontend Web** | `http://localhost:5173` | React 19 + Tailwind CSS candidate/recruiter portal |
| **Payload CMS** | `http://localhost:3000` | Next.js 16 + Payload CMS admin |

---

## 🛠 Manual Service Setup

### 1. Backend Service (`backend/`)

#### Prerequisites
- Python 3.12+
- PostgreSQL (or SQLite for local fallback)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate
python manage.py migrate --database=logs_db

# Create an administrator account
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```

#### Environment Variables (`backend/.env`)
```ini
DEBUG=True
SECRET_KEY=your-django-secret-key-here
DATABASE_URL=postgres://postgres:password@localhost:5432/jobboard_db
LOGS_DATABASE_URL=postgres://postgres:password@localhost:5432/jobboard_logs_db
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

---

### 2. Frontend Service (`frontend/`)

#### Prerequisites
- Node.js 20+
- npm or pnpm

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

#### Environment Variables (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

### 3. CMS Service (`cms/`)

#### Prerequisites
- Node.js >= 24.15.0
- pnpm (required by Payload 3 engine)

```bash
cd cms

# Install dependencies
pnpm install

# Start Next.js + Payload dev server
pnpm dev
```

---

## 🩺 Health Check & Verification

Once all services are running:
1. Open `http://localhost:8000/admin/` to verify the Django administration portal.
2. Open `http://localhost:5173/` to view the Job Board candidate and employer portal.
3. Open `http://localhost:3000/admin` to access the Payload CMS dashboard.

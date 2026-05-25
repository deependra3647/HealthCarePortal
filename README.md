# HealthCare Portal

A web-based hospital management system with patient, doctor, and appointment management, plus DevOps automation using Docker and CI/CD.

## Features

- Patient registration and management
- Doctor information management
- Appointment booking
- JWT authentication and admin dashboard
- MongoDB data storage
- Multi-container deployment (React + Nginx, Node API, MongoDB)
- GitHub Actions and Jenkins CI/CD pipelines

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React.js, HTML, CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| DevOps | Docker, Docker Compose, GitHub Actions, Jenkins, Nginx |

## Quick Start (Docker)

```bash
docker compose up -d --build
docker compose exec backend node src/seed.js
```

Open **http://localhost** and sign in:

- Name: **Deependra Kansana**
- Email: `deependrakansana2004@gmail.com`
- Password: `Deep@3647` (created when you run the seed script)

## Local Development

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run dev
node src/seed.js
```

**Frontend** (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000 — API: http://localhost:5000

## CI/CD Workflow

| Stage | Process |
|-------|---------|
| 1 | Developer pushes code |
| 2 | CI/CD pipeline triggers (push/PR to main) |
| 3 | Install dependencies and build |
| 4 | Run automated tests |
| 5 | Create Docker images |
| 6 | Validate / deploy with Docker Compose |

- **GitHub Actions:** `.github/workflows/ci-cd.yml`
- **Jenkins:** `Jenkinsfile`

## Project Structure

```
HealthCare/
├── frontend/          # React SPA (Nginx in production)
├── backend/           # Express REST API
├── docker-compose.yml
├── .github/workflows/
├── Jenkinsfile
└── README.md
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/stats` | Dashboard counts |
| CRUD | `/api/patients` | Patients (`?name=` to search by name) |
| CRUD | `/api/doctors` | Doctors (`?specialization=` to search by specialization) |
| CRUD | `/api/appointments` | Appointments |
| PATCH | `/api/appointments/:id/status` | Update status (admin only: scheduled, completed, cancelled) |

Protected routes require header: `Authorization: Bearer <token>`

## License

Educational / academic project use.

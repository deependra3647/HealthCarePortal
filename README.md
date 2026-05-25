# HealthCare Portal

A web-based hospital management system with patient, doctor, and appointment management, plus DevOps automation using **Docker** and **Jenkins CI/CD** (AWS EC2 ready).

## Features

- Patient registration and management (search by name)
- Doctor information management (search by specialization)
- Appointment booking with admin status updates (scheduled / completed / cancelled)
- JWT authentication and admin dashboard
- MongoDB data storage
- Multi-container deployment (React + Nginx, Node API, MongoDB)
- **Jenkins** declarative pipeline for build, test, and deploy

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React.js, HTML, CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| DevOps | Docker, Docker Compose, Jenkins, Nginx |
| Cloud | AWS EC2 (Ubuntu) |

## Project Structure

```
HealthCare/
├── frontend/           # React SPA (Nginx in production)
├── backend/            # Express REST API
├── docker-compose.yml
├── Jenkinsfile         # Jenkins declarative pipeline
└── README.md
```

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

---

## Jenkins CI/CD Setup

This project uses **Jenkins only** (no GitHub Actions). The pipeline is defined in `Jenkinsfile` at the repository root.

### Pipeline stages

| Stage | Description |
|-------|-------------|
| 1. Checkout | Pull source from Git |
| 2. Verify Prerequisites | Node.js 22+, Docker, Docker Compose |
| 3. Install Backend Dependencies | `npm ci` in `backend/` |
| 4. Install Frontend Dependencies | `npm ci` in `frontend/` |
| 5. Run Backend Tests | Runs `npm test` if defined; skips safely otherwise |
| 6. Build Frontend | `npm run build` + optional frontend tests |
| 7. Build Docker Images | `docker compose build` |
| 8. Validate Docker Compose | `docker compose config` |
| 9. Deploy | `docker compose up -d --build` ( **main** / **master** branch only ) |

### AWS EC2 prerequisites (Ubuntu)

On your EC2 instance, install:

```bash
# Node.js 22 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker jenkins   # allow Jenkins to run Docker
sudo systemctl restart jenkins
```

Verify:

```bash
node -v    # v22.x
docker -v
docker compose version
```

### Jenkins server setup (beginner-friendly)

1. **Install Jenkins** on Ubuntu EC2:

   ```bash
   sudo apt update
   sudo apt install -y openjdk-17-jdk jenkins
   sudo systemctl enable jenkins
   sudo systemctl start jenkins
   ```

2. Open Jenkins: `http://<EC2-PUBLIC-IP>:8080` and complete setup wizard.

3. **Install plugins** (Manage Jenkins → Plugins):
   - Git
   - Pipeline
   - Docker Pipeline (optional)

4. **Create a Pipeline job**
   - New Item → name: `healthcare-portal` → **Pipeline**
   - **Pipeline** → Definition: *Pipeline script from SCM*
   - SCM: Git → Repository URL: your repo URL
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
   - Save

5. **Build triggers** (optional)
   - Poll SCM: `H/5 * * * *` (every 5 minutes), or
   - Webhook from Git host to Jenkins

6. Click **Build Now**. On success, the app is deployed at `http://<EC2-IP>/` (port 80).

### Manual deploy on EC2 (without Jenkins)

```bash
git clone <your-repo-url>
cd HealthCare
docker compose up -d --build
docker compose exec backend node src/seed.js
```

### Environment variables (production)

Create a `.env` file next to `docker-compose.yml` on the server:

```env
JWT_SECRET=your-long-random-secret-here
```

Docker Compose reads `JWT_SECRET` for the backend container.

### Tests in CI

- `npm test` runs `test:run` only if present (`--if-present`).
- If you remove `test:run`, the pipeline **does not fail** — tests are skipped with a log message.
- Jenkins also checks whether a `test` script exists before running it.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/stats` | Dashboard counts |
| CRUD | `/api/patients` | Patients (`?name=` to search by name) |
| CRUD | `/api/doctors` | Doctors (`?specialization=` to search by specialization) |
| CRUD | `/api/appointments` | Appointments |
| PATCH | `/api/appointments/:id/status` | Update status (admin only) |

Protected routes require header: `Authorization: Bearer <token>`

## License

Educational / academic project use.

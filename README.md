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

Run these on your EC2 instance **in order**. Docker is already installed on your server; you still need **Node.js 22** and **Jenkins**.

```bash
# 1) Update packages
sudo apt update

# 2) Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # must show v22.x
npm -v

# 3) Install Jenkins (APT — use .asc key file, NOT gpg --dearmor)
sudo apt install -y openjdk-17-jre-headless
sudo rm -f /etc/apt/sources.list.d/jenkins.list /etc/apt/keyrings/jenkins.gpg
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | \
  sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins

# If APT still fails (NO_PUBKEY), use Jenkins in Docker instead — see
# "Install Jenkins with Docker (fallback)" section below.

# 4) Allow Jenkins to use Docker (only AFTER Jenkins is installed)
sudo usermod -aG docker jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins

# 5) Verify tools
node -v
docker -v
docker compose version
```

**If you see `jenkins does not exist`** — Jenkins is not installed yet; complete step 3 first.

**If you see `jenkins.service not found`** — same fix: install Jenkins (step 3).

Open Jenkins UI: `http://<EC2-PUBLIC-IP>:8080`

Initial admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**EC2 security group:** allow inbound **8080** (Jenkins) and **80** (web app after deploy).

### Install Jenkins with WAR file (best fallback if APT fails)

Use this if you see `NO_PUBKEY` — avoids apt/GPG completely. Uses host Node.js and Docker (ideal for this project).

```bash
df -h /   # need ~500MB+ free
sudo apt install -y openjdk-17-jre-headless
mkdir -p ~/jenkins && cd ~/jenkins
curl -fsSL -o jenkins.war https://get.jenkins.io/war-stable/latest/jenkins.war
nohup java -jar jenkins.war --httpPort=8080 > jenkins.log 2>&1 &
sleep 30
cat ~/jenkins/jenkins.log | tail -5
```

Password (first run):

```bash
cat ~/.jenkins/secrets/initialAdminPassword 2>/dev/null || \
  sudo find / -name initialAdminPassword 2>/dev/null | head -1 | xargs sudo cat
```

Add `ubuntu` to docker group (for pipeline deploy):

```bash
sudo usermod -aG docker ubuntu
```

Open `http://<EC2-PUBLIC-IP>:8080` → install **Git** + **Pipeline** plugins → create job from SCM.

### Jenkins server setup (beginner-friendly)

1. **Install Jenkins** (APT steps in prerequisites above, or Docker fallback).

2. Open Jenkins: `http://<EC2-PUBLIC-IP>:8080` and complete setup wizard.

3. **Install plugins** (Manage Jenkins → Plugins):
   - Git
   - Pipeline
   - Docker Pipeline (optional)

4. **Create a Pipeline job** (match these settings)

   | Section | Setting |
   |---------|---------|
   | Job name | `healthcare-portal` (or any name) |
   | Type | **Pipeline** |
   | Discard old builds | Max builds to keep: **10** |
   | Do not allow concurrent builds | **Checked** |
   | Definition | **Pipeline script from SCM** |
   | SCM | **Git** |
   | Repository URL | `https://github.com/deependra3647/HealthCarePortal.git` |
   | Credentials | Add if repo is private (see below) |
   | Branches to build | `*/main` |
   | Script Path | `Jenkinsfile` |
   | Lightweight checkout | Leave default (checked is fine) |

   Optional **GitHub project** URL: `https://github.com/deependra3647/HealthCarePortal/`

   Save → **Build Now**

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
Check
hook

# ⚡ AI Code Review Assistant

A state-of-the-art, full-stack platform designed to accelerate code reviews, detect bugs, calculate complexity, enforce style standards, and provide AI-powered refactoring recommendations across multi-language codebases.

---

## ✨ Core Features & Highlights

- 🌐 **Multi-Language Static Analysis**:
  - **JavaScript & TypeScript**: Powered by ESLint.
  - **Python**: Powered by Pylint.
  - **Java**: Powered by Checkstyle.
  - **C & C++**: Powered by Cppcheck.
  - **AI Analysis**: Context-aware evaluations across all major programming languages.
- 🔑 **GitHub OAuth 2.0 & Email Authentication**:
  - One-click sign-in via GitHub OAuth or password-based email registration.
  - Automatic profile picture (`avatarUrl`) and GitHub account syncing.
- 🔀 **Pull Request Review Integration**:
  - Direct URL ingestion for public GitHub Pull Requests (e.g. `https://github.com/owner/repo/pull/42`).
  - Automated diff parsing, per-file linter evaluation, and aggregate PR quality score reports.
- 👥 **Team Workspaces & Collaborator Invitations**:
  - Create dedicated team workspaces to organize project reviews and share repository insights.
  - Member role management (`owner`, `member`) and email invitation workflows.
- ⚡ **Real-Time Collaboration**:
  - Powered by Socket.io for live session rooms.
  - Broadcast real-time comments, inline code highlights, and active collaborator badges.
- 🤖 **AI-Powered Refactoring Recommendations**:
  - Integrates Google Gemini & Groq LLMs (`llama-3.3-70b-versatile`) to generate line-annotated bug explanations and ready-to-use refactored code fixes (`suggestedFix`).
- 📊 **Code Quality Scoring System (0–100)**:
  - Automated scoring algorithm evaluating static linter error penalties, warning density, and AI severity metrics.
- 📈 **Interactive Charts & Analytics**:
  - Built with Recharts: interactive area charts for score trends, pie charts for severity distributions, and language breakdown analytics.
- 🌓 **Dark & Light Mode Themes**:
  - Dynamic CSS variables supporting seamless theme switching with persistence in local storage.
- 📧 **Email Notifications**:
  - Automatic HTML review summary emails sent via Nodemailer/SMTP upon completion of long-running reviews.
- 🏆 **Code Quality Leaderboard**:
  - Public developer rankings based on average review quality scores, tracking rank badges (🥇, 🥈, 🥉) and score improvement trends.
- 🛡️ **Admin Dashboard**:
  - Protected admin console (`/admin`) to inspect system-wide review stats, audit platform users, and adjust user access roles.
- 🐳 **Full Docker & Docker Compose Support**:
  - Pre-configured `Dockerfile.client`, `Dockerfile.server`, and `docker-compose.yml` for instant production containerized deployment.
- 🚀 **Automated CI/CD Pipelines**:
  - GitHub Actions workflows for continuous integration (`ci.yml`) and continuous deployment (`deploy.yml`) to GitHub Container Registry (GHCR) and Render.

---

## 🛠️ Technology Stack

| Category | Technologies Used |
|---|---|
| **Frontend** | React 19 (Vite), Tailwind CSS v4, React Router v7, TanStack React Query v5, React Hook Form, Recharts, Socket.io-client, React Icons |
| **Backend** | Node.js, Express.js, Socket.io, Passport.js (GitHub OAuth 2.0), JWT (Access + Refresh cookies), Nodemailer, Bcryptjs, Express Rate Limit |
| **Database** | PostgreSQL / Supabase, Prisma ORM |
| **Linters & AI** | ESLint v8, Pylint, Checkstyle, Cppcheck, Google Gemini API, Groq Cloud API |
| **DevOps & Infra** | Docker, Docker Compose, GitHub Actions, Nginx |

---

## 📂 Project Architecture

```
Ai-Code-Review-Assistant/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD pipelines
│       ├── ci.yml              # Linting, Prisma validation, & client build checks
│       └── deploy.yml          # Container build & deployment pipeline
├── client/                     # Frontend SPA (React + Vite)
│   ├── src/
│   │   ├── api/                # Axios API request clients
│   │   ├── components/         # Layouts, Navbar, Sidebar, ScoreBadges, CollaboratorsBar
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── hooks/              # Reusable hooks (useAuth, useCollaboration, useTheme)
│   │   ├── pages/              # Dashboard, PRReview, Workspace, Leaderboard, Admin, Profile
│   │   └── index.css           # Global CSS variables & design tokens
│   └── vite.config.js
├── server/                     # Backend REST API & WebSocket Server (Express)
│   ├── prisma/                 # Prisma database schema & migrations
│   ├── src/
│   │   ├── config/             # DB, Passport OAuth, & Environment configs
│   │   ├── controllers/        # Express controllers (auth, review, pr, workspace, admin)
│   │   ├── middleware/         # Auth JWT, rate limiters, & input validators
│   │   ├── routes/             # API endpoints (/api/auth, /api/review, /api/pr, etc.)
│   │   ├── services/           # Linters, AI Orchestrator, Email, Leaderboard services
│   │   └── utils/              # Score calculator & response formatters
│   └── app.js                  # Express & Socket.io server entry point
├── Dockerfile.client           # Nginx container definition for frontend
├── Dockerfile.server           # Node.js container definition for backend API
├── docker-compose.yml          # Multi-container orchestration (PostgreSQL + API + Client)
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your development machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (or a running [Supabase](https://supabase.com/) database)
- [Python 3](https://www.python.org/) (optional, required if running Pylint locally)
- [Java JDK](https://www.oracle.com/java/) & [Cppcheck](http://cppcheck.sourceforge.net/) (optional, for Checkstyle / Cppcheck local execution)

---

### 2. Backend Setup (`server/`)

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Copy the environment configuration template:
   ```bash
   copy .env.example .env
   ```

3. Update the `.env` file with your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   SERVER_URL=http://localhost:5000

   # Database Connection
   DATABASE_URL="postgresql://postgres:password@localhost:5432/code_review_db?schema=public"

   # JWT Secrets
   JWT_SECRET=your_super_secret_access_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key

   # AI Provider API Keys
   GEMINI_API_KEY=your_google_gemini_api_key
   GROQ_API_KEY=your_groq_cloud_api_key

   # GitHub OAuth Credentials (Optional)
   GITHUB_CLIENT_ID=your_github_oauth_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

   # SMTP Email Credentials (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM="AI Code Review" <noreply@aicra.dev>
   ```

4. Install dependencies and run database migrations:
   ```bash
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### 3. Frontend Setup (`client/`)

1. Open a new terminal window and navigate to `client/`:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite frontend dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser.

---

## 🐳 Docker Deployment

You can launch the entire stack (PostgreSQL database, Node.js backend server, and Nginx frontend client) using Docker Compose:

1. Ensure Docker Desktop is installed and running.
2. Run the following command from the root project directory:
   ```bash
   docker compose up -d --build
   ```
3. Access the services:
   - **Web Application**: `http://localhost`
   - **Backend API**: `http://localhost:5000`

To stop the containers:
```bash
docker compose down
```

---

## 🚀 CI/CD Pipeline

The project includes pre-configured **GitHub Actions** workflows in `.github/workflows/`:

- **CI (`ci.yml`)**: Triggered on pull requests and pushes to `main`. Runs ESLint validation on server code, verifies Prisma DB schema consistency, and runs Vite client build checks (`npm run build`).
- **CD (`deploy.yml`)**: Triggered on push to `main`. Automatically builds Docker container images, publishes them to GitHub Container Registry (GHCR), and triggers automatic deployment webhooks.

---

## 🔒 Security Best Practices

- **Token Hardening**: Access tokens are kept in short-lived memory; refresh tokens are stored in `httpOnly`, `sameSite`, and `secure` HTTP cookies.
- **No Unsafe Execution**: Submitted source code is analyzed strictly as static text strings through linters and LLMs. Code is never evaluated (`eval`) or compiled directly on the host OS.
- **Parameterized Queries**: All database queries utilize Prisma ORM parameterized SQL bindings, preventing SQL injection vulnerabilities.
- **Rate Limiting**: Public auth and analysis endpoints are protected using `express-rate-limit` against brute-force attacks.

---

## 📄 License

This project is licensed under the MIT License.

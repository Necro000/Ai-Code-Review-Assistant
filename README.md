# AI Code Review Assistant

A modern full-stack web application designed to help developers identify bugs, analyze complexity, fix security vulnerabilities, and level up their code quality using Artificial Intelligence (Groq API) and static analysis tools (ESLint, Pylint).

---

## 🚀 Key Features

* **Two-Stage Analysis Pipeline**:
  * **Stage 1 (Static Analysis)**: Runs language-specific linters (ESLint for JavaScript/TypeScript, Pylint for Python) to check syntax correctness, variable declarations, and style patterns.
  * **Stage 2 (AI Analysis)**: Leverages Groq LLMs (e.g. `llama-3.3-70b-versatile`) to generate deep context-aware feedback, suggest optimal refactoring paths, find hidden bugs, and suggest naming improvements.
* **Automated Complexity Indexing**: Calculates LOC, functions, class scopes, and computes Cyclomatic Complexity on-the-fly.
* **Stateless Cookie Authentication**: Secure user session tracking using JWT access tokens (15m expiry) and httpOnly refresh cookies (7d expiry) with rate-limiting constraints.
* **Project Organization**: Manage reviews under contextual project categories.
* **Searchable Review History**: Quickly query, filter by severity, and paginate past code reviews.
* **Interactive Code Viewer**: Click on issues/findings to auto-scroll and highlight lines in the code view.
* **Design System UI**: Vibrant glassmorphic layouts, dark mode variables, and micro-animations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS v4, React Router v7, TanStack Query v5, React Hook Form, React Icons |
| **Backend** | Node.js, Express, Multer (file uploading), JWT, bcryptjs, express-rate-limit |
| **Database** | PostgreSQL / Supabase, Prisma ORM |
| **Analysis / AI** | Groq Cloud SDK, ESLint, Pylint |

---

## 📂 Project Structure

```
ai-code-review-assistant/
├── client/                     # Frontend SPA (React + Vite)
│   ├── src/
│   │   ├── api/                # API Request hooks (Axios instance)
│   │   ├── components/         # Layouts, editor sheets, and panels
│   │   ├── context/            # AuthContext provider
│   │   ├── hooks/              # Reusable custom hooks
│   │   ├── pages/              # View pages (Login, Register, Dashboard, History, Report details)
│   │   └── index.css           # Design token styling sheet
│   └── package.json
│
├── server/                     # Backend API (Express)
│   ├── prisma/                 # Prisma migrations & schema
│   ├── src/
│   │   ├── config/             # DB, environment, and Groq connections
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # JWT, validator, error, and rate-limit rules
│   │   ├── routes/             # API routes
│   │   ├── services/           # Pipelines: Static linting, AI review, and complexity calculator
│   │   └── utils/              # AppError wrappers
│   ├── server.js               # Entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (version 18 or higher)
* [PostgreSQL](https://www.postgresql.org/) (or a running [Supabase](https://supabase.com/) project)
* Python (required if Pylint Python checks are desired locally)

### 2. Configure Environment Variables
Navigate to the `server/` directory, copy the template `.env.example` file to `.env`, and populate the variables:

```bash
cd server
copy .env.example .env
```

Set these variables in your `.env`:
* `DATABASE_URL`: Your PostgreSQL connection string.
* `GROQ_API_KEY`: Your Groq Cloud API developer key.
* `JWT_SECRET` and `JWT_REFRESH_SECRET`: Random 32-character hashes.

### 3. Install Server Dependencies & Deploy DB
From the `server/` directory, run:

```bash
# Install dependencies
npm install

# Deploy database migrations and generate client
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Install Client Dependencies
Open a separate terminal window, navigate to the `client/` directory, and run:

```bash
cd client
npm install
```

### 5. Start Servers

* **Start Backend API (Server)** (runs on `http://localhost:5000`):
  ```bash
  cd server
  npm run dev
  ```
  
* **Start Frontend Dev Server** (runs on `http://localhost:5173`):
  ```bash
  cd client
  npm run dev
  ```

Visit `http://localhost:5173` in your browser.

---

## 🐳 Containerized Deployment (Docker)

You can launch the entire stack (PostgreSQL database, backend REST API, and Nginx client frontend) inside Docker containers.

### Run with Docker Compose
1. Ensure your environment configurations are populated in `server/.env` (database connection credentials will be automatically overridden by Docker service links).
2. Launch the services from the project root directory:
   ```bash
   docker compose up -d --build
   ```
3. The services are mapped as follows:
   - **Frontend App**: `http://localhost` (Port 80)
   - **Backend API**: `http://localhost:5000` (Port 5000)

---

## 🛠️ CI/CD Deployment Pipelines

We use GitHub Actions to automate code validation and Docker deployments.

- **CI Workflows (`ci.yml`)**: Lint the server code, perform schema validation on the Prisma DB definition, and ensure the React application compiles without errors. This runs on every push and pull request targeting the `main` branch.
- **CD Workflows (`deploy.yml`)**: Auto-builds both client and server images on push to the `main` branch, tags and pushes them to **GitHub Container Registry (GHCR)**, and triggers a redeployment webhook to **Render**.

---

## 🔒 Security Best Practices Implemented

* **No Plaintext Code Storage**: Files uploaded to the server are parsed temporarily in memory or `/tmp` directories and permanently unlinked right after evaluation.
* **Token Hardening**: Access tokens are kept in short-lived memory; refresh tokens are secured in HttpOnly cookies with CSRF SameSite controls.
* **Sandbox Environment Execution**: Code snippets are strictly analyzed as strings via lint CLI outputs and LLMs. The server never compiles or executes (`eval`) submitted files.
* **SQL Injection Mitigation**: All DB calls utilize Prisma Parameterized Query bindings.

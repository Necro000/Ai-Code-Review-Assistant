# AI Code Review Assistant — Architecture Document

> **Version:** 1.0  
> **Last Updated:** 2026-07-06  
> **Status:** Planning Phase

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Architecture](#database-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [Code Analysis Pipeline](#code-analysis-pipeline)
8. [AI Integration Layer](#ai-integration-layer)
9. [API Design](#api-design)
10. [Data Flow Diagrams](#data-flow-diagrams)
11. [File Storage Strategy](#file-storage-strategy)
12. [Error Handling Strategy](#error-handling-strategy)
13. [Security Considerations](#security-considerations)
14. [Deployment Architecture](#deployment-architecture)
15. [Scalability & Performance](#scalability--performance)
16. [Directory Structure](#directory-structure)

---

## 1. System Overview

The AI Code Review Assistant follows a **three-tier client-server architecture**:

| Tier | Role | Technology |
|---|---|---|
| **Presentation** | User interface, client-side routing, state management | React.js / Next.js + Tailwind CSS |
| **Application** | Business logic, API gateway, analysis orchestration | Node.js + Express.js |
| **Data** | Persistent storage, user data, review history | PostgreSQL / Supabase |

The system also integrates two **external services**:
- **Groq API** — LLM-based AI code review
- **Static Analysis Engines** — ESLint (JS/TS), Pylint (Python), and similar linters

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│  ┌───────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐ │
│  │   Auth     │  │ Code Editor  │  │ Dashboard  │  │  History     │ │
│  │   Pages    │  │ / Upload     │  │  & Reports │  │  & Search   │ │
│  └─────┬─────┘  └──────┬───────┘  └─────┬──────┘  └──────┬──────┘ │
│        └───────────┬────┴────────────────┴─────────────────┘       │
│                    │  HTTP / REST API calls                         │
└────────────────────┼───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Express.js)                       │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐ │
│  │  Auth     │  │  Code        │  │  Review    │  │  Analysis   │ │
│  │  Router   │  │  Router      │  │  Router    │  │  Router     │ │
│  └─────┬────┘  └──────┬───────┘  └─────┬──────┘  └──────┬──────┘ │
│        └───────────┬───┴────────────────┴────────────────┘        │
│                    │                                               │
│  ┌─────────────────▼──────────────────────────────────────────┐   │
│  │                 SERVICE LAYER                               │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐ │   │
│  │  │  Auth    │  │  Analysis    │  │  Review              │ │   │
│  │  │  Service │  │  Orchestrator│  │  Service             │ │   │
│  │  └─────────┘  └──────┬───────┘  └──────────────────────┘ │   │
│  └───────────────────────┼────────────────────────────────────┘   │
└──────────────────────────┼────────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌──────────────┐ ┌────────┐ ┌──────────────┐
     │ Static       │ │ Groq   │ │ PostgreSQL / │
     │ Analysis     │ │ API    │ │ Supabase     │
     │ (ESLint,     │ │ (LLM)  │ │ (Database)   │
     │  Pylint)     │ │        │ │              │
     └──────────────┘ └────────┘ └──────────────┘
```

---

## 3. Frontend Architecture

### Technology: React.js (or Next.js) + Tailwind CSS

### Component Hierarchy

```
<App>
├── <AuthProvider>              ← Global auth context
│   ├── <Layout>
│   │   ├── <Navbar />          ← Navigation, user menu, theme toggle
│   │   ├── <Sidebar />         ← Dashboard sidebar navigation
│   │   └── <MainContent>
│   │       ├── <Routes>
│   │       │   ├── /login          → <LoginPage />
│   │       │   ├── /register       → <RegisterPage />
│   │       │   ├── /forgot-password→ <ForgotPasswordPage />
│   │       │   ├── /dashboard      → <DashboardPage />
│   │       │   ├── /review/new     → <NewReviewPage />
│   │       │   ├── /review/:id     → <ReviewDetailPage />
│   │       │   ├── /history        → <ReviewHistoryPage />
│   │       │   └── /profile        → <ProfilePage />
│   │       └── </Routes>
│   └── </MainContent>
└── </AuthProvider>
```

### State Management

| Concern | Approach |
|---|---|
| **Auth State** | React Context + JWT stored in `httpOnly` cookies |
| **Server Data** | React Query (TanStack Query) for caching & sync |
| **Form State** | React Hook Form for code submission forms |
| **UI State** | Local component state (`useState`) |

### Key Frontend Modules

| Module | Responsibility |
|---|---|
| `api/` | Axios instance, interceptors, API call functions |
| `components/` | Reusable UI components (buttons, cards, modals) |
| `pages/` | Route-level page components |
| `hooks/` | Custom hooks (`useAuth`, `useReview`, `useAnalysis`) |
| `context/` | React Context providers (Auth, Theme) |
| `utils/` | Formatting, validation, helper functions |

---

## 4. Backend Architecture

### Technology: Node.js + Express.js

The backend follows a **layered architecture** to separate concerns cleanly:

```
┌──────────────────────────────────────────┐
│              Routes / Controllers         │  ← HTTP handling, validation
├──────────────────────────────────────────┤
│              Middleware                    │  ← Auth, rate-limit, error handling
├──────────────────────────────────────────┤
│              Services                     │  ← Business logic, orchestration
├──────────────────────────────────────────┤
│              Data Access (Repositories)   │  ← Database queries, ORM calls
├──────────────────────────────────────────┤
│              External Integrations        │  ← Groq API, ESLint, Pylint
└──────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Files | Purpose |
|---|---|---|
| **Routes** | `routes/*.js` | Define endpoints, attach middleware, call controllers |
| **Controllers** | `controllers/*.js` | Parse requests, validate input, return responses |
| **Middleware** | `middleware/*.js` | Auth verification, rate limiting, error handling, logging |
| **Services** | `services/*.js` | Core business logic — analysis orchestration, AI integration |
| **Repositories** | `repositories/*.js` | Database queries abstracted behind clean interfaces |
| **Utils** | `utils/*.js` | Helpers — token generation, file parsing, response formatting |
| **Config** | `config/*.js` | Environment variables, DB connection, API keys |

### Key Backend Services

| Service | Responsibility |
|---|---|
| `AuthService` | User registration, login, token refresh, password reset |
| `CodeService` | Receive code input (paste / file upload), store temporarily |
| `StaticAnalysisService` | Run ESLint / Pylint, parse output, normalize findings |
| `AIReviewService` | Build prompts, call Groq API, parse AI response |
| `AnalysisOrchestrator` | Coordinate Stage 1 → Stage 2, merge results |
| `ReviewService` | Save reviews, query history, search, filter, delete |
| `ComplexityService` | Calculate cyclomatic complexity, LOC, function counts |

---

## 5. Database Architecture

### Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    USERS     │       │   PROJECTS   │       │     REVIEWS      │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id (PK)      │──1:N──│ id (PK)      │──1:N──│ id (PK)          │
│ name         │       │ user_id (FK) │       │ project_id (FK)  │
│ email (UQ)   │       │ project_name │       │ review_type      │
│ password     │       │ github_url   │       │ overall_score    │
│ created_at   │       │ created_at   │       │ summary          │
└──────────────┘       └──────────────┘       │ created_at       │
                                               └────────┬─────────┘
                                                        │
                                                       1:N
                                                        │
                                               ┌────────▼─────────┐
                                               │ REVIEW_FINDINGS  │
                                               ├──────────────────┤
                                               │ id (PK)          │
                                               │ review_id (FK)   │
                                               │ severity         │
                                               │ issue            │
                                               │ explanation      │
                                               │ suggested_fix    │
                                               │ file_name        │
                                               │ line_number      │
                                               └──────────────────┘
```

### Relationships

| Relationship | Type | Description |
|---|---|---|
| Users → Projects | One-to-Many | A user can have many projects |
| Projects → Reviews | One-to-Many | A project can have many reviews |
| Reviews → Review Findings | One-to-Many | A review can have many findings |

### Indexes (Recommended)

| Table | Column(s) | Type | Rationale |
|---|---|---|---|
| `users` | `email` | UNIQUE | Fast login lookup, enforce uniqueness |
| `projects` | `user_id` | INDEX | Fast project listing per user |
| `reviews` | `project_id` | INDEX | Fast review listing per project |
| `reviews` | `created_at` | INDEX | Sort/filter by date |
| `review_findings` | `review_id` | INDEX | Fast findings retrieval per review |
| `review_findings` | `severity` | INDEX | Filter findings by severity |

---

## 6. Authentication & Authorization

### Auth Flow

```
  Client                        Server                       Database
    │                             │                              │
    │  POST /api/auth/register    │                              │
    │────────────────────────────►│  Hash password (bcrypt)      │
    │                             │─────────────────────────────►│
    │                             │  Store user                  │
    │  ◄─ 201 { message }        │◄─────────────────────────────│
    │                             │                              │
    │  POST /api/auth/login       │                              │
    │────────────────────────────►│  Verify credentials          │
    │                             │─────────────────────────────►│
    │                             │  Generate JWT                │
    │  ◄─ 200 { token, user }    │◄─────────────────────────────│
    │                             │                              │
    │  GET /api/reviews           │                              │
    │  Authorization: Bearer JWT  │                              │
    │────────────────────────────►│  Verify JWT → extract userId │
    │                             │  Query user's reviews        │
    │                             │─────────────────────────────►│
    │  ◄─ 200 { reviews[] }      │◄─────────────────────────────│
```

### Token Strategy

| Aspect | Decision |
|---|---|
| **Access Token** | JWT, 15-minute expiry, sent in `Authorization` header |
| **Refresh Token** | Opaque token, 7-day expiry, stored in `httpOnly` cookie |
| **Password Hashing** | bcrypt with 12 salt rounds |
| **Token Storage (Client)** | Access token in memory; refresh token in `httpOnly` cookie |

### Authorization Rules

| Resource | Rule |
|---|---|
| Own projects & reviews | Full CRUD — owner only |
| Other users' data | No access (401/403) |
| Public endpoints | `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password` |
| Protected endpoints | Everything else — requires valid JWT |

---

## 7. Code Analysis Pipeline

This is the **core processing engine** of the application. It orchestrates the two-stage review.

### Pipeline Flow

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  User Input  │     │  Language         │     │  Stage 1:        │
│  (paste or   │────►│  Detection        │────►│  Static Analysis │
│   file)      │     │  (file ext /      │     │  (ESLint/Pylint) │
└──────────────┘     │   content sniff)  │     └────────┬─────────┘
                     └──────────────────┘              │
                                                        ▼
                                              ┌──────────────────┐
                                              │  Normalize       │
                                              │  Findings        │
                                              │  (unified format)│
                                              └────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │  Stage 2:        │
                                              │  AI Review       │
                                              │  (Groq LLM)      │
                                              └────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │  Merge & Score   │
                                              │  Results         │
                                              └────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │  Store Review    │
                                              │  + Findings      │
                                              │  in Database     │
                                              └──────────────────┘
```

### Stage 1: Static Analysis — Detail

| Language | Tool | Execution Method |
|---|---|---|
| JavaScript / TypeScript | ESLint | `child_process.exec()` with `--format json` |
| Python | Pylint | `child_process.exec()` with `--output-format=json` |
| Other languages | Fallback | Skip static analysis, proceed to AI-only review |

**Normalized Finding Format:**

```json
{
  "source": "eslint",
  "severity": "warning",
  "rule": "no-unused-vars",
  "message": "Variable 'x' is defined but never used",
  "file": "input.js",
  "line": 12,
  "column": 5
}
```

### Stage 2: AI Review — Detail

The AI prompt is engineered to return structured JSON:

```
System Prompt:
  You are an expert code reviewer. Analyze the following code and return
  a JSON object with: bugs, code_smells, optimizations, security_issues,
  naming_suggestions, documentation, complexity_analysis, and refactoring_tips.

User Prompt:
  Language: {detected_language}
  Static Analysis Findings: {stage_1_results}
  Code:
  ```{language}
  {user_code}
  ```
```

---

## 8. AI Integration Layer

### Groq API Integration

| Config | Value |
|---|---|
| **Provider** | Groq Cloud |
| **Model** | `llama-3.1-70b-versatile` (or latest available) |
| **Endpoint** | `https://api.groq.com/openai/v1/chat/completions` |
| **Auth** | API key via `Authorization: Bearer <GROQ_API_KEY>` |
| **Max Tokens** | ~4096 (response) |
| **Temperature** | 0.2 (deterministic, precise output) |

### Prompt Engineering Strategy

| Technique | Purpose |
|---|---|
| **System role framing** | Establish the AI as an expert code reviewer |
| **Structured output (JSON)** | Enforce parseable, consistent response format |
| **Few-shot examples** | Include 1–2 example reviews in the system prompt |
| **Context injection** | Pass static analysis findings to avoid duplicate reporting |
| **Language-aware prompting** | Tailor review guidance per detected language |

### Error Handling for AI Calls

| Scenario | Strategy |
|---|---|
| Rate limit (429) | Exponential backoff with 3 retries |
| Timeout | 30-second timeout, retry once |
| Malformed response | Attempt JSON repair, fallback to raw text display |
| API down | Return static analysis results only, notify user |

---

## 9. API Design

### RESTful Endpoints

#### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login, receive JWT | Public |
| `POST` | `/api/auth/logout` | Invalidate refresh token | Protected |
| `POST` | `/api/auth/refresh` | Refresh access token | Cookie |
| `POST` | `/api/auth/forgot-password` | Send password reset email | Public |
| `POST` | `/api/auth/reset-password` | Reset password with token | Public |

#### User Profile

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/users/me` | Get current user profile | Protected |
| `PUT` | `/api/users/me` | Update profile (name, email) | Protected |
| `PUT` | `/api/users/me/password` | Change password | Protected |

#### Projects

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/projects` | Create a new project | Protected |
| `GET` | `/api/projects` | List user's projects | Protected |
| `GET` | `/api/projects/:id` | Get project details | Protected |
| `PUT` | `/api/projects/:id` | Update project | Protected |
| `DELETE` | `/api/projects/:id` | Delete project + reviews | Protected |

#### Code Submission & Analysis

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/analysis/snippet` | Submit code snippet for review | Protected |
| `POST` | `/api/analysis/upload` | Upload file(s) for review | Protected |
| `GET` | `/api/analysis/:id/status` | Check analysis progress | Protected |

#### Reviews

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/reviews` | List all user's reviews (paginated) | Protected |
| `GET` | `/api/reviews/:id` | Get detailed review + findings | Protected |
| `DELETE` | `/api/reviews/:id` | Delete a review | Protected |
| `GET` | `/api/reviews/search` | Search reviews by query | Protected |

### Response Format (Standard)

```json
{
  "success": true,
  "data": { ... },
  "message": "Review completed successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Code snippet cannot be empty",
    "details": [
      { "field": "code", "message": "Required field" }
    ]
  }
}
```

---

## 10. Data Flow Diagrams

### DFD — Code Review Submission

```
 ┌──────┐    Code + Language     ┌────────────┐   Validated Input    ┌──────────────┐
 │ User │ ─────────────────────► │ Controller │ ──────────────────► │  Analysis    │
 └──────┘                        │ (Validate) │                     │ Orchestrator │
                                 └────────────┘                     └──────┬───────┘
                                                                           │
                                                          ┌────────────────┼────────────────┐
                                                          ▼                ▼                ▼
                                                  ┌──────────────┐ ┌──────────┐  ┌───────────────┐
                                                  │ Language      │ │ Static   │  │ AI Review     │
                                                  │ Detector      │ │ Analyzer │  │ (Groq API)    │
                                                  └──────────────┘ └────┬─────┘  └───────┬───────┘
                                                                        │                │
                                                                        ▼                ▼
                                                                  ┌──────────────────────────┐
                                                                  │   Result Merger &        │
                                                                  │   Score Calculator       │
                                                                  └────────────┬─────────────┘
                                                                               │
                                                                               ▼
                                                                  ┌──────────────────────────┐
                                                                  │   Database (Reviews +    │
                                                                  │   Review Findings)       │
                                                                  └────────────┬─────────────┘
                                                                               │
                                                                               ▼
                                                                        Response to User
```

---

## 11. File Storage Strategy

### Uploaded Files

| Aspect | Strategy |
|---|---|
| **Temporary Storage** | Uploaded files stored in `/tmp/uploads/{userId}/{timestamp}/` |
| **Processing** | Files read, analyzed, then deleted after review completes |
| **Persistence** | Only the **code text content** is stored in the DB (not the file) |
| **File Size Limit** | Max 500 KB per file, max 5 files per submission |
| **Allowed Extensions** | `.js`, `.ts`, `.py`, `.jsx`, `.tsx`, `.java`, `.cpp`, `.c`, `.go`, `.rb` |

### Why Not Persist Files?

- Reduces storage costs
- Avoids security risks of storing executable code
- The review results contain all necessary context

---

## 12. Error Handling Strategy

### Layered Error Handling

```
┌─────────────────────────────────────────────┐
│  Global Error Handler (middleware)           │  ← Catches all unhandled errors
├─────────────────────────────────────────────┤
│  Controller-Level try/catch                  │  ← Catches service-thrown errors
├─────────────────────────────────────────────┤
│  Service-Level Errors                        │  ← Throws custom AppError classes
├─────────────────────────────────────────────┤
│  External API Errors                         │  ← Groq timeout, linter crash
└─────────────────────────────────────────────┘
```

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// Usage examples:
// throw new AppError('User not found', 404, 'USER_NOT_FOUND');
// throw new AppError('Invalid code input', 400, 'VALIDATION_ERROR');
// throw new AppError('AI service unavailable', 503, 'AI_SERVICE_DOWN');
```

### Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request body / params |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Accessing another user's resource |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_SERVICE_DOWN` | 503 | Groq API unreachable |
| `ANALYSIS_FAILED` | 500 | Static analysis tool crashed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 13. Security Considerations

| Concern | Mitigation |
|---|---|
| **SQL Injection** | Parameterized queries / ORM (Prisma or Knex) |
| **XSS** | React auto-escapes output; CSP headers |
| **CSRF** | SameSite cookies + CSRF token for state-changing requests |
| **Code Execution** | Code is analyzed via CLI tools in a sandboxed subprocess — never `eval()`'d |
| **File Upload Abuse** | Strict file-type validation, size limits, temp directory isolation |
| **API Key Exposure** | Groq API key stored server-side only (`.env`), never sent to client |
| **Brute Force** | Rate limiting on auth endpoints (e.g., 5 attempts / minute) |
| **Password Storage** | bcrypt with 12 salt rounds — never stored in plaintext |
| **HTTPS** | Enforced in production via deployment platform |
| **CORS** | Whitelist only the frontend domain |

---

## 14. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION                                │
│                                                                  │
│  ┌──────────────────────┐          ┌──────────────────────────┐ │
│  │      Vercel           │          │  Render / Railway         │ │
│  │  (Frontend - React)   │  HTTPS   │  (Backend - Express)     │ │
│  │                       │─────────►│                          │ │
│  │  • Static hosting     │          │  • Node.js runtime       │ │
│  │  • CDN distribution   │          │  • Environment variables │ │
│  │  • Auto SSL           │          │  • Auto-scaling          │ │
│  └──────────────────────┘          └────────────┬─────────────┘ │
│                                                  │               │
│                                    ┌─────────────▼─────────────┐ │
│                                    │   Supabase / PostgreSQL    │ │
│                                    │   (Managed Database)       │ │
│                                    │                            │ │
│                                    │  • Connection pooling      │ │
│                                    │  • Automated backups       │ │
│                                    │  • SSL connections         │ │
│                                    └────────────────────────────┘ │
│                                                                   │
│  External:  Groq API (api.groq.com)                              │
└──────────────────────────────────────────────────────────────────┘
```

### Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `GROQ_API_KEY` | Backend | Groq LLM authentication |
| `JWT_SECRET` | Backend | JWT signing secret |
| `JWT_REFRESH_SECRET` | Backend | Refresh token signing secret |
| `CLIENT_URL` | Backend | Frontend URL for CORS whitelist |
| `VITE_API_URL` | Frontend | Backend API base URL |
| `NODE_ENV` | Both | `development` / `production` |

---

## 15. Scalability & Performance

### Current Design (MVP)

| Aspect | Approach |
|---|---|
| **Caching** | React Query client-side caching (stale-while-revalidate) |
| **DB Queries** | Indexed columns, paginated responses |
| **Static Analysis** | Spawned as child processes (non-blocking) |
| **AI Calls** | Async with timeout — UI shows loading state |
| **Rate Limiting** | Express middleware (e.g., `express-rate-limit`) |

### Future Scaling Considerations

| Bottleneck | Solution |
|---|---|
| AI response latency | Queue-based processing (BullMQ + Redis) |
| Concurrent analyses | Worker pool for static analysis subprocesses |
| Database load | Connection pooling (PgBouncer) |
| Large file processing | Stream-based file reading |
| Repeated analyses | Cache identical code hashes to skip re-analysis |

---

## 16. Directory Structure

### Monorepo Layout

```
ai-code-review-assistant/
├── client/                        # Frontend (React / Next.js)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                   # API client functions
│   │   │   ├── axios.js           # Axios instance + interceptors
│   │   │   ├── auth.js            # Auth API calls
│   │   │   ├── reviews.js         # Review API calls
│   │   │   └── analysis.js        # Analysis API calls
│   │   ├── components/            # Reusable UI components
│   │   │   ├── common/            # Buttons, inputs, cards, modals
│   │   │   ├── layout/            # Navbar, Sidebar, Footer
│   │   │   ├── code/              # Code editor, file uploader
│   │   │   ├── review/            # Review cards, findings list
│   │   │   └── dashboard/         # Charts, stats, score display
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── NewReviewPage.jsx
│   │   │   ├── ReviewDetailPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── context/               # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   └── useReview.js
│   │   ├── utils/                 # Helper functions
│   │   ├── App.jsx                # Root component + routing
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                        # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/                # Configuration
│   │   │   ├── db.js              # Database connection
│   │   │   ├── groq.js            # Groq API client setup
│   │   │   └── env.js             # Environment variable validation
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── projectController.js
│   │   │   ├── analysisController.js
│   │   │   └── reviewController.js
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── errorHandler.js    # Global error handler
│   │   │   ├── rateLimiter.js     # Rate limiting
│   │   │   └── validator.js       # Request validation
│   │   ├── models/                # Database models / schemas
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Review.js
│   │   │   └── ReviewFinding.js
│   │   ├── routes/                # Express route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── analysisRoutes.js
│   │   │   └── reviewRoutes.js
│   │   ├── services/              # Business logic
│   │   │   ├── authService.js
│   │   │   ├── codeService.js
│   │   │   ├── staticAnalysisService.js
│   │   │   ├── aiReviewService.js
│   │   │   ├── analysisOrchestrator.js
│   │   │   ├── reviewService.js
│   │   │   └── complexityService.js
│   │   ├── utils/                 # Utility functions
│   │   │   ├── AppError.js        # Custom error class
│   │   │   ├── languageDetector.js
│   │   │   └── responseFormatter.js
│   │   └── app.js                 # Express app setup
│   ├── server.js                  # Entry point
│   ├── .env.example               # Environment variable template
│   └── package.json
│
├── Docs/                          # Project documentation
│   ├── context.md
│   ├── architecture.md            # ← This document
│   ├── context.txt
│   ├── Core-features.txt
│   ├── Suggested-Tech-Stack.txt
│   ├── Use-cases.txt
│   └── Two-Week-Development.txt
│
├── .gitignore
└── README.md
```

---

## Appendix: Technology Decision Rationale

| Decision | Why |
|---|---|
| **Express over Fastify** | Larger ecosystem, more middleware, easier for internship-level developers |
| **PostgreSQL over MongoDB** | Relational data (Users → Projects → Reviews → Findings) is a natural fit |
| **JWT over Sessions** | Stateless auth scales better; works well with React SPA |
| **Groq over OpenAI** | Fast inference (LPU), generous free tier, OpenAI-compatible API |
| **Tailwind CSS** | Rapid UI development, consistent design system, small bundle size |
| **React Query** | Eliminates boilerplate for data fetching, caching, and sync |
| **Monorepo** | Simpler project setup for a 2-week internship project |

---

*This architecture document is derived from [context.md](file:///d:/Ai CRA/Ai-Code-Review-Assistant/Docs/context.md) and is intended to guide implementation throughout the two-week development cycle.*

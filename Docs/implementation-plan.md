# AI Code Review Assistant — Phase-Wise Implementation Plan

> **Derived from:** [architecture.md](file:///d:/Ai CRA/Ai-Code-Review-Assistant/Docs/architecture.md)  
> **Timeline:** 14 Days (2 Weeks)  
> **Last Updated:** 2026-07-06

---

## Overview

The implementation is divided into **6 phases**, each building on the previous one. This ensures that every phase ends with a **working, testable state** — nothing is built in isolation.

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
Foundation   Auth &      Code        Analysis    Dashboard   Polish &
& Setup      Users       Submission  Pipeline    & History   Deploy
(Day 1-2)   (Day 2-3)   (Day 3-4)   (Day 5-9)   (Day 10-11) (Day 12-14)
```

---

## Phase 1 — Foundation & Project Setup

> **Days:** 1–2  
> **Goal:** Fully scaffolded monorepo with both client and server running locally, database connected, and base UI layout in place.

---

### 1.1 Project Initialization

| Task | Details | Output |
|---|---|---|
| Initialize Git repo | `git init`, create `.gitignore` (Node, env, build artifacts) | Clean repo |
| Create monorepo structure | `client/` and `server/` top-level directories | Directory skeleton |
| Scaffold frontend | `npx create-vite@latest ./client -- --template react` | Running React app |
| Scaffold backend | `npm init -y` in `server/`, install Express | Running Express server |
| Install core dependencies | See dependency lists below | `package.json` files |

**Frontend Dependencies:**

```bash
# client/
npm install react-router-dom axios @tanstack/react-query react-hook-form
npm install -D tailwindcss @tailwindcss/vite
```

**Backend Dependencies:**

```bash
# server/
npm install express cors dotenv bcryptjs jsonwebtoken pg prisma
npm install -D nodemon
```

### 1.2 Configuration Files

| File | Purpose |
|---|---|
| `server/.env` | `DATABASE_URL`, `GROQ_API_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `PORT` |
| `server/.env.example` | Template with placeholder values (committed to Git) |
| `client/vite.config.js` | Proxy `/api` to backend in dev mode |
| `tailwind.config.js` | Custom color palette, font family (Inter/Outfit) |
| `server/src/config/env.js` | Validate required env vars on startup |
| `server/src/config/db.js` | PostgreSQL / Supabase connection via Prisma |

### 1.3 Database Setup

| Task | Details |
|---|---|
| Initialize Prisma | `npx prisma init` inside `server/` |
| Define schema | Create all 4 models in `prisma/schema.prisma` |
| Run migration | `npx prisma migrate dev --name init` |
| Generate client | `npx prisma generate` |

**Prisma Schema (all 4 tables):**

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  projects  Project[]

  @@map("users")
}

model Project {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  projectName String   @map("project_name")
  githubUrl   String?  @map("github_url")
  createdAt   DateTime @default(now()) @map("created_at")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviews     Review[]

  @@index([userId])
  @@map("projects")
}

model Review {
  id           String          @id @default(uuid())
  projectId    String          @map("project_id")
  reviewType   String          @map("review_type")
  overallScore Float?          @map("overall_score")
  summary      String?
  createdAt    DateTime        @default(now()) @map("created_at")
  project      Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  findings     ReviewFinding[]

  @@index([projectId])
  @@index([createdAt])
  @@map("reviews")
}

model ReviewFinding {
  id           String  @id @default(uuid())
  reviewId     String  @map("review_id")
  severity     String
  issue        String
  explanation  String?
  suggestedFix String? @map("suggested_fix")
  fileName     String? @map("file_name")
  lineNumber   Int?    @map("line_number")
  review       Review  @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@index([reviewId])
  @@index([severity])
  @@map("review_findings")
}
```

### 1.4 Backend Foundation

| File to Create | Purpose |
|---|---|
| `server/src/app.js` | Express app setup — CORS, JSON parsing, route mounting, error handler |
| `server/server.js` | Entry point — connect DB, start listening |
| `server/src/utils/AppError.js` | Custom error class with `statusCode` and `errorCode` |
| `server/src/utils/responseFormatter.js` | Standard `{ success, data, message, meta }` wrapper |
| `server/src/middleware/errorHandler.js` | Global error-handling middleware |

**`app.js` skeleton:**

```javascript
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Routes (mounted in later phases)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/analysis', analysisRoutes);
// app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
```

### 1.5 Frontend Foundation

| File to Create | Purpose |
|---|---|
| `client/src/index.css` | Global styles — CSS reset, Tailwind directives, custom properties |
| `client/src/App.jsx` | Root component with React Router, QueryClientProvider |
| `client/src/api/axios.js` | Axios instance with base URL + interceptors |
| `client/src/components/layout/Navbar.jsx` | Top navigation bar |
| `client/src/components/layout/Sidebar.jsx` | Dashboard sidebar |
| `client/src/components/layout/Layout.jsx` | Page wrapper (Navbar + Sidebar + content area) |
| `client/src/pages/DashboardPage.jsx` | Placeholder dashboard |

### 1.6 Dev Environment Verification

| Check | Command | Expected |
|---|---|---|
| Backend starts | `npm run dev` (nodemon) | Server on `http://localhost:5000` |
| Frontend starts | `npm run dev` (vite) | App on `http://localhost:5173` |
| DB connected | Server startup log | `✅ Database connected` |
| Health check works | `GET /api/health` | `{ success: true }` |
| Frontend renders | Visit `localhost:5173` | Layout with navbar + sidebar |

### ✅ Phase 1 Deliverables

- [x] Monorepo structure (`client/` + `server/`)
- [x] React app running with Tailwind CSS + routing
- [x] Express server running with health endpoint
- [x] PostgreSQL database with all 4 tables migrated
- [x] Base layout UI (Navbar, Sidebar, Dashboard placeholder)
- [x] Error handling middleware
- [x] Environment configuration

---

## Phase 2 — Authentication & User Management

> **Days:** 2–3  
> **Goal:** Complete auth flow — register, login, logout, forgot password, profile management. Protected routes on both frontend and backend.

---

### 2.1 Backend Auth

| File | Purpose |
|---|---|
| `server/src/services/authService.js` | Registration, login, token generation, password reset |
| `server/src/controllers/authController.js` | Handle auth HTTP requests |
| `server/src/routes/authRoutes.js` | Mount auth endpoints |
| `server/src/middleware/auth.js` | JWT verification middleware |
| `server/src/middleware/rateLimiter.js` | Rate limit on auth endpoints (5 req/min) |

**Endpoints to implement:**

| Method | Endpoint | Handler |
|---|---|---|
| `POST` | `/api/auth/register` | `authController.register` |
| `POST` | `/api/auth/login` | `authController.login` |
| `POST` | `/api/auth/logout` | `authController.logout` |
| `POST` | `/api/auth/refresh` | `authController.refreshToken` |
| `POST` | `/api/auth/forgot-password` | `authController.forgotPassword` |
| `POST` | `/api/auth/reset-password` | `authController.resetPassword` |

**Auth Service Logic:**

```
register(name, email, password):
  1. Check if email already exists → 409 CONFLICT
  2. Hash password with bcrypt (12 rounds)
  3. Create user in DB
  4. Return success message (no auto-login)

login(email, password):
  1. Find user by email → 401 if not found
  2. Compare password with bcrypt → 401 if mismatch
  3. Generate access token (JWT, 15min)
  4. Generate refresh token (JWT, 7 days)
  5. Set refresh token in httpOnly cookie
  6. Return { accessToken, user: { id, name, email } }

refreshToken(refreshToken):
  1. Verify refresh token → 401 if invalid/expired
  2. Generate new access token
  3. Return { accessToken }
```

### 2.2 Backend User Profile

| File | Purpose |
|---|---|
| `server/src/controllers/userController.js` | Get/update profile, change password |
| `server/src/routes/userRoutes.js` | Mount user endpoints |

**Endpoints:**

| Method | Endpoint | Handler |
|---|---|---|
| `GET` | `/api/users/me` | `userController.getProfile` |
| `PUT` | `/api/users/me` | `userController.updateProfile` |
| `PUT` | `/api/users/me/password` | `userController.changePassword` |

### 2.3 Input Validation

| File | Purpose |
|---|---|
| `server/src/middleware/validator.js` | Reusable validation middleware using `express-validator` or Joi |

**Validation Rules:**

| Field | Rules |
|---|---|
| `email` | Required, valid email format, trimmed, lowercase |
| `password` | Required, min 8 chars, at least 1 uppercase + 1 number |
| `name` | Required, 2–50 characters, trimmed |

### 2.4 Frontend Auth

| File | Purpose |
|---|---|
| `client/src/context/AuthContext.jsx` | Auth state provider — user, token, login/logout functions |
| `client/src/hooks/useAuth.js` | Custom hook to consume auth context |
| `client/src/api/auth.js` | API functions — `loginAPI()`, `registerAPI()`, etc. |
| `client/src/pages/LoginPage.jsx` | Login form with validation |
| `client/src/pages/RegisterPage.jsx` | Registration form with validation |
| `client/src/pages/ForgotPasswordPage.jsx` | Email input for password reset |
| `client/src/pages/ProfilePage.jsx` | View/edit profile, change password |
| `client/src/components/common/ProtectedRoute.jsx` | Redirect to login if not authenticated |

**Auth Context Logic:**

```
AuthProvider:
  state: { user, accessToken, isAuthenticated, isLoading }

  login(email, password):
    1. Call loginAPI()
    2. Store accessToken in state (memory)
    3. Set user in state
    4. Redirect to /dashboard

  logout():
    1. Call logoutAPI()
    2. Clear state
    3. Redirect to /login

  checkAuth() — on app mount:
    1. Call refreshTokenAPI()
    2. If success → set user + token
    3. If fail → remain logged out
```

**Route Protection:**

```jsx
<Routes>
  {/* Public */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

  {/* Protected */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/review/new" element={<NewReviewPage />} />
    <Route path="/review/:id" element={<ReviewDetailPage />} />
    <Route path="/history" element={<HistoryPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
</Routes>
```

### 2.5 Testing Checklist

| Test | Expected |
|---|---|
| Register with valid data | User created, 201 response |
| Register with duplicate email | 409 Conflict |
| Login with correct credentials | 200 + JWT + user data |
| Login with wrong password | 401 Unauthorized |
| Access protected route without JWT | 401 redirect to login |
| Access protected route with valid JWT | 200 + data |
| Refresh expired access token | New token returned |
| Update profile | Name/email updated |
| Change password | Old password required, new password saved |

### ✅ Phase 2 Deliverables

- [x] Full auth flow (register, login, logout, refresh, forgot/reset password)
- [x] JWT-based auth with httpOnly refresh cookies
- [x] Rate limiting on auth endpoints
- [x] Input validation with meaningful error messages
- [x] Auth context + protected routes on frontend
- [x] Login, Register, Forgot Password, and Profile pages
- [x] Axios interceptor for auto token refresh

---

## Phase 3 — Code Submission & Project Management

> **Days:** 3–4  
> **Goal:** Users can create projects, paste code snippets, and upload files. Submitted code is stored and ready for analysis.

---

### 3.1 Backend — Project CRUD

| File | Purpose |
|---|---|
| `server/src/controllers/projectController.js` | Project CRUD handlers |
| `server/src/routes/projectRoutes.js` | Mount project endpoints |
| `server/src/services/projectService.js` | Project business logic |

**Endpoints:**

| Method | Endpoint | Handler |
|---|---|---|
| `POST` | `/api/projects` | `projectController.create` |
| `GET` | `/api/projects` | `projectController.list` |
| `GET` | `/api/projects/:id` | `projectController.getById` |
| `PUT` | `/api/projects/:id` | `projectController.update` |
| `DELETE` | `/api/projects/:id` | `projectController.delete` |

**Authorization:** Every project query is scoped to `userId` from the JWT. Users can only access their own projects.

### 3.2 Backend — Code Submission

| File | Purpose |
|---|---|
| `server/src/controllers/analysisController.js` | Handle snippet paste + file upload |
| `server/src/routes/analysisRoutes.js` | Mount analysis endpoints |
| `server/src/services/codeService.js` | Store code temporarily, detect language |
| `server/src/utils/languageDetector.js` | Detect language from file extension or content |

**Endpoints:**

| Method | Endpoint | Body | Handler |
|---|---|---|---|
| `POST` | `/api/analysis/snippet` | `{ code, language, projectId }` | `analysisController.submitSnippet` |
| `POST` | `/api/analysis/upload` | `multipart/form-data` (files) | `analysisController.uploadFiles` |

**File Upload Configuration (Multer):**

```javascript
const multer = require('multer');

const upload = multer({
  dest: 'tmp/uploads/',
  limits: { fileSize: 500 * 1024 },  // 500 KB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rb'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new AppError('File type not supported', 400, 'INVALID_FILE_TYPE'));
  }
});
// Max 5 files per upload
router.post('/upload', auth, upload.array('files', 5), analysisController.uploadFiles);
```

**Language Detection Logic:**

```
detectLanguage(filename, codeContent):
  1. If filename exists → map extension to language
     .js/.jsx → javascript
     .ts/.tsx → typescript
     .py → python
     .java → java
     .cpp/.c → c/cpp
     .go → go
     .rb → ruby
  2. If no filename → heuristic content sniffing
     - "def " / "import " / "print(" → python
     - "function " / "const " / "=>" → javascript
     - "public class " → java
  3. Fallback → "unknown"
```

### 3.3 Frontend — Code Submission UI

| File | Purpose |
|---|---|
| `client/src/pages/NewReviewPage.jsx` | Main code submission page |
| `client/src/components/code/CodeEditor.jsx` | Textarea / Monaco-style editor for pasting code |
| `client/src/components/code/FileUploader.jsx` | Drag-and-drop file upload zone |
| `client/src/components/code/LanguageSelector.jsx` | Dropdown to select or auto-detect language |
| `client/src/api/analysis.js` | API calls for snippet + upload |

**NewReviewPage Layout:**

```
┌──────────────────────────────────────────────────┐
│  New Code Review                                  │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌─── Tab: Paste Code ───┬── Tab: Upload File ─┐ │
│  │                        │                      │ │
│  │  ┌──────────────────┐  │  ┌────────────────┐ │ │
│  │  │  Code Editor     │  │  │  Drop Zone     │ │ │
│  │  │  (syntax-        │  │  │  (drag & drop  │ │ │
│  │  │   highlighted    │  │  │   or browse)   │ │ │
│  │  │   textarea)      │  │  │                │ │ │
│  │  └──────────────────┘  │  │  File list:    │ │ │
│  │                        │  │  • app.js  ✕   │ │ │
│  │  Language: [Auto ▼]    │  │  • util.py ✕   │ │ │
│  │                        │  └────────────────┘ │ │
│  └────────────────────────┴──────────────────────┘ │
│                                                     │
│  Project: [Select or Create ▼]                      │
│                                                     │
│  [ 🔍 Start Review ]                                │
└─────────────────────────────────────────────────────┘
```

### 3.4 Testing Checklist

| Test | Expected |
|---|---|
| Create project | 201 + project object |
| List user projects | Only current user's projects |
| Submit code snippet | 200 + analysis initiated |
| Upload valid file (.js) | 200 + file accepted |
| Upload invalid file (.exe) | 400 + INVALID_FILE_TYPE |
| Upload >500 KB file | 400 + file size error |
| Upload >5 files | 400 + too many files |
| Language auto-detection | Correct language returned |

### ✅ Phase 3 Deliverables

- [x] Project CRUD (create, list, get, update, delete)
- [x] Code snippet submission endpoint
- [x] File upload with Multer (validation, size limit, type filter)
- [x] Language detection utility
- [x] New Review page with code editor + file uploader
- [x] Project selector / creator

---

## Phase 4 — Analysis Pipeline (Core Engine)

> **Days:** 5–9  
> **Goal:** The heart of the application. Implement static analysis, AI review, complexity analysis, and the orchestrator that ties them together.

This is the **largest and most critical phase**. It is broken into 5 sub-phases.

---

### 4.1 Static Analysis Service (Days 5–6)

| File | Purpose |
|---|---|
| `server/src/services/staticAnalysisService.js` | Run ESLint/Pylint, parse output, normalize findings |

**Implementation Steps:**

1. **Write temporary file** — Save submitted code to a temp file with correct extension
2. **Spawn linter process** — Use `child_process.execFile()` with JSON output format
3. **Parse JSON output** — Extract errors, warnings, and info from linter results
4. **Normalize to unified format** — Map linter-specific formats to standard schema
5. **Clean up** — Delete temporary file

**ESLint Integration:**

```javascript
async function runESLint(code, filename) {
  // Write code to temp file
  const tempFile = path.join('tmp', `${uuid()}.js`);
  await fs.writeFile(tempFile, code);

  try {
    const { stdout } = await execAsync(
      `npx eslint "${tempFile}" --format json --no-eslintrc --config '{"rules":{"no-unused-vars":"warn","no-undef":"error","eqeqeq":"warn"}}'`
    );
    const results = JSON.parse(stdout);
    return normalizeESLintResults(results);
  } finally {
    await fs.unlink(tempFile);  // Always clean up
  }
}
```

**Pylint Integration:**

```javascript
async function runPylint(code, filename) {
  const tempFile = path.join('tmp', `${uuid()}.py`);
  await fs.writeFile(tempFile, code);

  try {
    const { stdout } = await execAsync(
      `pylint "${tempFile}" --output-format=json --disable=C0114,C0115,C0116`
    );
    const results = JSON.parse(stdout);
    return normalizePylintResults(results);
  } finally {
    await fs.unlink(tempFile);
  }
}
```

**Normalized Finding Format:**

```json
{
  "source": "eslint | pylint",
  "severity": "error | warning | info",
  "rule": "no-unused-vars",
  "message": "Variable 'x' is defined but never used",
  "file": "input.js",
  "line": 12,
  "column": 5
}
```

**Severity Mapping:**

| ESLint Level | Pylint Level | Normalized |
|---|---|---|
| `2` (error) | `E` (error), `F` (fatal) | `error` |
| `1` (warning) | `W` (warning), `R` (refactor) | `warning` |
| — | `C` (convention), `I` (info) | `info` |

### 4.2 AI Review Service (Days 7–8)

| File | Purpose |
|---|---|
| `server/src/services/aiReviewService.js` | Build prompts, call Groq API, parse response |
| `server/src/config/groq.js` | Groq API client setup |

**Groq Client Setup:**

```javascript
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = groq;
```

**Prompt Construction:**

```javascript
function buildReviewPrompt(code, language, staticFindings) {
  const systemPrompt = `You are an expert senior code reviewer. Analyze the provided code and return a JSON object with the following structure:
{
  "bugs": [{ "line": number, "severity": "critical|warning|info", "description": string, "fix": string }],
  "code_smells": [{ "line": number, "description": string, "suggestion": string }],
  "optimizations": [{ "description": string, "suggestion": string }],
  "security_issues": [{ "severity": "critical|warning", "description": string, "fix": string }],
  "naming_suggestions": [{ "current": string, "suggested": string, "reason": string }],
  "documentation": string,
  "complexity_notes": string,
  "refactoring_tips": [string],
  "overall_score": number (0-100),
  "summary": string
}
Return ONLY the JSON object, no markdown or extra text.`;

  const userPrompt = `Language: ${language}
${staticFindings.length > 0 ? `Static Analysis Findings (already reported, focus on NEW insights):\n${JSON.stringify(staticFindings, null, 2)}` : ''}

Code to review:
\`\`\`${language}
${code}
\`\`\``;

  return { systemPrompt, userPrompt };
}
```

**API Call with Error Handling:**

```javascript
async function getAIReview(code, language, staticFindings) {
  const { systemPrompt, userPrompt } = buildReviewPrompt(code, language, staticFindings);

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      if (error.status === 429 && attempt < MAX_RETRIES) {
        await sleep(1000 * Math.pow(2, attempt));  // Exponential backoff
        continue;
      }
      throw new AppError('AI review service unavailable', 503, 'AI_SERVICE_DOWN');
    }
  }
}
```

### 4.3 Complexity Analysis Service (Day 8)

| File | Purpose |
|---|---|
| `server/src/services/complexityService.js` | Calculate code metrics |

**Metrics to Calculate:**

| Metric | Method |
|---|---|
| Lines of Code (LOC) | Count non-empty, non-comment lines |
| Number of Functions | Regex-based detection (`function`, `def`, `=>`) |
| Number of Classes | Regex-based detection (`class`) |
| Cyclomatic Complexity | Count decision points (`if`, `else`, `for`, `while`, `case`, `&&`, `\|\|`) + 1 |
| Function Complexity | Per-function cyclomatic complexity |

**Implementation:**

```javascript
function analyzeComplexity(code, language) {
  const lines = code.split('\n');
  const loc = lines.filter(l => l.trim() && !isComment(l, language)).length;
  const functionCount = countFunctions(code, language);
  const classCount = countClasses(code, language);
  const cyclomaticComplexity = calculateCyclomaticComplexity(code, language);

  return {
    linesOfCode: loc,
    totalLines: lines.length,
    functionCount,
    classCount,
    cyclomaticComplexity,
    averageComplexityPerFunction: functionCount > 0
      ? (cyclomaticComplexity / functionCount).toFixed(2)
      : cyclomaticComplexity,
    complexityRating: getComplexityRating(cyclomaticComplexity)
  };
}

function getComplexityRating(cc) {
  if (cc <= 5) return 'Low — Simple, easy to understand';
  if (cc <= 10) return 'Moderate — Slightly complex';
  if (cc <= 20) return 'High — Complex, consider refactoring';
  return 'Very High — Extremely complex, must refactor';
}
```

### 4.4 Analysis Orchestrator (Day 9)

| File | Purpose |
|---|---|
| `server/src/services/analysisOrchestrator.js` | Coordinate Stage 1 → Stage 2, merge results, save to DB |

**Orchestration Flow:**

```javascript
async function runFullAnalysis(code, language, projectId) {
  // Stage 0: Complexity Analysis (fast, runs first)
  const complexity = analyzeComplexity(code, language);

  // Stage 1: Static Analysis
  let staticFindings = [];
  try {
    staticFindings = await runStaticAnalysis(code, language);
  } catch (error) {
    // Non-fatal: continue with AI-only review
    console.warn('Static analysis failed, proceeding with AI review only');
  }

  // Stage 2: AI Review (receives static findings as context)
  const aiReview = await getAIReview(code, language, staticFindings);

  // Merge & Score
  const overallScore = aiReview.overall_score || calculateScore(staticFindings, aiReview);
  const summary = aiReview.summary || generateSummary(staticFindings, aiReview, complexity);

  // Persist to database
  const review = await prisma.review.create({
    data: {
      projectId,
      reviewType: staticFindings.length > 0 ? 'combined' : 'ai_only',
      overallScore,
      summary,
      findings: {
        create: [
          ...mapStaticFindingsToDb(staticFindings),
          ...mapAIFindingsToDb(aiReview)
        ]
      }
    },
    include: { findings: true }
  });

  return { review, complexity };
}
```

### 4.5 Testing Checklist

| Test | Expected |
|---|---|
| Static analysis on JS code with errors | Normalized findings returned |
| Static analysis on Python code | Pylint findings returned |
| Static analysis on unsupported language | Empty findings, no crash |
| AI review returns valid JSON | Parsed successfully, all fields present |
| AI review with rate limit | Retries with backoff, succeeds |
| Groq API fully down | 503 returned, static results still available |
| Complexity on simple function | Low rating |
| Complexity on nested loops + conditions | High rating |
| Full orchestration (paste snippet) | Review + findings saved to DB |
| Full orchestration (uploaded file) | Same as above |

### ✅ Phase 4 Deliverables

- [x] Static analysis for JavaScript (ESLint) and Python (Pylint)
- [x] Normalized finding format across all tools
- [x] Groq API integration with structured JSON prompts
- [x] Retry logic with exponential backoff
- [x] Complexity analysis (LOC, functions, classes, cyclomatic)
- [x] Analysis orchestrator (Stage 1 → Stage 2 → merge → save)
- [x] Results persisted to Reviews + ReviewFindings tables

---

## Phase 5 — Dashboard, Review Details & History

> **Days:** 10–11  
> **Goal:** Display review results in a beautiful, interactive dashboard. Implement review history with search, filter, and delete.

---

### 5.1 Backend — Review Endpoints

| File | Purpose |
|---|---|
| `server/src/controllers/reviewController.js` | Review CRUD + search handlers |
| `server/src/routes/reviewRoutes.js` | Mount review endpoints |
| `server/src/services/reviewService.js` | Query, search, filter, delete reviews |

**Endpoints:**

| Method | Endpoint | Query Params | Handler |
|---|---|---|---|
| `GET` | `/api/reviews` | `?page=1&limit=10&sort=createdAt&order=desc` | `reviewController.list` |
| `GET` | `/api/reviews/:id` | — | `reviewController.getById` |
| `DELETE` | `/api/reviews/:id` | — | `reviewController.delete` |
| `GET` | `/api/reviews/search` | `?q=keyword&severity=error&type=combined` | `reviewController.search` |

**Pagination Logic:**

```javascript
async function listReviews(userId, { page = 1, limit = 10, sort = 'createdAt', order = 'desc' }) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { project: { userId } },
      include: { findings: true, project: { select: { projectName: true } } },
      orderBy: { [sort]: order },
      skip,
      take: limit
    }),
    prisma.review.count({ where: { project: { userId } } })
  ]);

  return {
    reviews,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}
```

### 5.2 Frontend — Dashboard Page

| File | Purpose |
|---|---|
| `client/src/pages/DashboardPage.jsx` | Overview stats + recent reviews |
| `client/src/components/dashboard/StatsCards.jsx` | Total reviews, avg score, top issues |
| `client/src/components/dashboard/ScoreChart.jsx` | Score trend chart (last 10 reviews) |
| `client/src/components/dashboard/RecentReviews.jsx` | List of latest 5 reviews |

**Dashboard Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard                                                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│  │ Total      │  │ Average    │  │ Issues     │  │ Latest │ │
│  │ Reviews    │  │ Score      │  │ Found      │  │ Score  │ │
│  │   24       │  │   78/100   │  │   142      │  │ 85/100 │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────┘ │
│                                                               │
│  ┌────────────────────────────┐  ┌────────────────────────┐  │
│  │  Score Trend (Line Chart)  │  │  Severity Breakdown    │  │
│  │  ───/\──/\───/\──          │  │  🔴 Critical: 12      │  │
│  │                            │  │  🟡 Warning:  89      │  │
│  │                            │  │  🔵 Info:     41      │  │
│  └────────────────────────────┘  └────────────────────────┘  │
│                                                               │
│  Recent Reviews                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🟢 85  │  app.js  │  Combined  │  3 issues  │  2h ago  │ │
│  │ 🟡 62  │  util.py │  AI Only   │  7 issues  │  1d ago  │ │
│  │ 🔴 41  │  main.go │  Combined  │  12 issues │  2d ago  │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Frontend — Review Detail Page

| File | Purpose |
|---|---|
| `client/src/pages/ReviewDetailPage.jsx` | Full review display |
| `client/src/components/review/ReviewHeader.jsx` | Score, summary, metadata |
| `client/src/components/review/FindingsList.jsx` | Sortable/filterable findings |
| `client/src/components/review/FindingCard.jsx` | Individual finding with severity badge |
| `client/src/components/review/ComplexityPanel.jsx` | Complexity metrics display |
| `client/src/components/review/CodeDisplay.jsx` | Syntax-highlighted original code |

**Review Detail Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Review Detail                                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Score: ██████████░░ 78/100     Type: Combined                │
│  File: app.js | Language: JavaScript | Date: Jul 6, 2026      │
│                                                               │
│  Summary:                                                     │
│  "Overall solid code with minor issues around error handling  │
│   and unused variables. Consider refactoring the main loop."  │
│                                                               │
│  ┌─── Findings (12) ─────────────────────────────────────┐   │
│  │ Filter: [All ▼]  [Error ▼]  [Warning ▼]  [Info ▼]    │   │
│  │                                                        │   │
│  │ 🔴 ERROR  Line 12  Possible null dereference           │   │
│  │    ► obj.value accessed without null check              │   │
│  │    💡 Fix: Add `if (obj != null)` guard                 │   │
│  │                                                        │   │
│  │ 🟡 WARNING  Line 24  Unused variable 'temp'            │   │
│  │    ► Variable declared but never used                   │   │
│  │    💡 Fix: Remove the declaration or use the variable   │   │
│  │                                                        │   │
│  │ 🔵 INFO  Line 3  Consider using const instead of let   │   │
│  │    ► Variable is never reassigned                       │   │
│  │    💡 Fix: Replace `let` with `const`                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─── Complexity Metrics ─────────────────────────────────┐   │
│  │ LOC: 145 │ Functions: 8 │ Classes: 2 │ CC: 14 (High)  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─── AI Documentation ──────────────────────────────────┐   │
│  │ Auto-generated documentation for functions...          │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Frontend — Review History Page

| File | Purpose |
|---|---|
| `client/src/pages/HistoryPage.jsx` | Paginated list of all reviews |
| `client/src/components/review/ReviewCard.jsx` | Summary card for list view |
| `client/src/components/common/SearchBar.jsx` | Search input with debounce |
| `client/src/components/common/FilterDropdown.jsx` | Severity/type/date filters |
| `client/src/components/common/Pagination.jsx` | Page navigation |

**History Page Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Review History                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  🔍 [Search reviews...          ]  [Type ▼] [Severity ▼]     │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🟢 85  │ app.js      │ Combined │ 3 issues │ Jul 6     🗑│ │
│  │ 🟡 62  │ utils.py    │ AI Only  │ 7 issues │ Jul 5     🗑│ │
│  │ 🔴 41  │ main.go     │ Combined │ 12 issues│ Jul 4     🗑│ │
│  │ 🟢 91  │ handler.ts  │ Combined │ 1 issue  │ Jul 3     🗑│ │
│  │ 🟡 70  │ models.py   │ AI Only  │ 5 issues │ Jul 2     🗑│ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ◄ 1  2  3  4  5 ►                                           │
└──────────────────────────────────────────────────────────────┘
```

### 5.5 Testing Checklist

| Test | Expected |
|---|---|
| Dashboard loads with stats | Correct counts, avg score |
| Review detail loads all findings | Findings sorted by severity |
| Filter findings by severity | Only matching findings shown |
| History page paginates | Correct page navigation |
| Search reviews | Matching results returned |
| Delete review | Review + findings removed |
| Delete confirmation modal | Prevents accidental deletion |
| Empty state (no reviews) | Friendly "no reviews yet" UI |

### ✅ Phase 5 Deliverables

- [x] Dashboard with stat cards, charts, and recent reviews
- [x] Review detail page with findings list, severity badges, suggested fixes
- [x] Complexity metrics panel
- [x] AI-generated documentation display
- [x] Review history with pagination, search, and filters
- [x] Delete reviews with confirmation
- [x] Empty states and loading skeletons

---

## Phase 6 — Polish, Testing & Deployment

> **Days:** 12–14  
> **Goal:** Harden the application — comprehensive error handling, UI/UX polish, performance optimization, and production deployment.

---

### 6.1 Error Handling Hardening (Day 12)

| Task | Details |
|---|---|
| Global frontend error boundary | `<ErrorBoundary>` component wrapping the app |
| Toast notifications | Success/error toasts for all user actions |
| Form validation errors | Inline field-level error messages |
| Network error handling | Retry prompts, offline detection |
| 404 page | Styled "not found" page |
| Loading states | Skeleton loaders on all data-fetching pages |
| Empty states | Friendly messages when no data exists |

### 6.2 UI/UX Polish (Day 12–13)

| Task | Details |
|---|---|
| Responsive design | Mobile-friendly layouts (breakpoints: 640, 768, 1024, 1280) |
| Dark mode | Theme toggle via Tailwind `dark:` classes |
| Animations | Smooth page transitions, fade-in for findings, hover effects |
| Typography | Google Fonts (Inter or Outfit) |
| Accessibility | Aria labels, keyboard navigation, focus indicators |
| Favicon & meta tags | Proper SEO tags, Open Graph, description |
| Color-coded severity | 🔴 Critical, 🟡 Warning, 🔵 Info — consistent across all views |

### 6.3 Performance Optimization (Day 13)

| Area | Optimization |
|---|---|
| Frontend bundle | Code splitting with `React.lazy()` for route-level pages |
| API calls | React Query caching with 5-minute `staleTime` |
| DB queries | Verify all queries use indexes; add `select` to limit fields |
| Static analysis | Set 30-second timeout for linter processes |
| AI calls | Set 45-second timeout; show progress indicator |
| Images | Compress and lazy-load any images |

### 6.4 Testing (Day 12–13)

**Backend Tests (Manual or Automated):**

| Category | Tests |
|---|---|
| Auth | Register → Login → Access protected route → Logout |
| Projects | CRUD operations, ownership validation |
| Analysis | Snippet + file upload, language detection |
| Static Analysis | JS + Python analysis, error cases |
| AI Review | Mocked Groq response, timeout handling |
| Reviews | List, detail, search, filter, delete, pagination |

**Frontend Tests (Manual):**

| Flow | Steps |
|---|---|
| Full user journey | Register → Login → Create project → Paste code → View review → Check history → Logout |
| Error states | Invalid login → Error toast; Upload bad file → Error message |
| Responsive | Test on mobile viewport (375px), tablet (768px), desktop (1280px) |
| Edge cases | Empty code submission, very large code (5000+ lines), special characters |

### 6.5 Deployment (Day 14)

**Frontend Deployment (Vercel):**

| Step | Command / Action |
|---|---|
| Connect GitHub repo | Vercel dashboard → Import project |
| Set root directory | `client/` |
| Set build command | `npm run build` |
| Set output directory | `dist` |
| Add env variable | `VITE_API_URL=https://your-backend.railway.app` |
| Deploy | Automatic on `git push` |

**Backend Deployment (Render or Railway):**

| Step | Command / Action |
|---|---|
| Connect GitHub repo | Render dashboard → New Web Service |
| Set root directory | `server/` |
| Set build command | `npm install` |
| Set start command | `node server.js` |
| Add env variables | `DATABASE_URL`, `GROQ_API_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `NODE_ENV=production` |
| Deploy | Automatic on `git push` |

**Database Deployment (Supabase):**

| Step | Action |
|---|---|
| Create Supabase project | supabase.com → New project |
| Get connection string | Settings → Database → Connection string |
| Run migration | `DATABASE_URL=<supabase_url> npx prisma migrate deploy` |
| Verify tables | Supabase dashboard → Table editor |

**Post-Deployment Checklist:**

| Check | Verify |
|---|---|
| Frontend loads | Visit Vercel URL |
| API health check | `GET https://backend-url/api/health` |
| Registration works | Create a new account |
| Login + JWT flow | Login, verify token in cookies |
| Code review works | Submit code, receive results |
| CORS configured | No cross-origin errors |
| HTTPS enforced | No mixed content warnings |
| Environment variables | All set, none exposed in client bundle |

### 6.6 Documentation (Day 14)

| Document | Content |
|---|---|
| `README.md` | Project overview, setup instructions, screenshots, tech stack |
| `server/.env.example` | All required env variables with descriptions |
| API documentation | Brief endpoint reference (can be in README or separate file) |
| Presentation slides | Project demo, architecture overview, lessons learned |

### ✅ Phase 6 Deliverables

- [x] Comprehensive error handling (backend + frontend)
- [x] Polished UI with dark mode, animations, responsive design
- [x] Performance optimizations (code splitting, caching, timeouts)
- [x] Manual testing of all critical flows
- [x] Frontend deployed to Vercel
- [x] Backend deployed to Render / Railway
- [x] Database deployed to Supabase
- [x] README and project documentation complete

---

## Summary — Phase Dependency Map

```
Phase 1: Foundation ────────────────────────────────────────────────┐
  │                                                                  │
  ▼                                                                  │
Phase 2: Auth ──────────────────────────────────────────┐           │
  │                                                      │           │
  ▼                                                      │           │
Phase 3: Code Submission ──────────────────┐            │           │
  │                                         │            │           │
  ▼                                         │            │           │
Phase 4: Analysis Pipeline ◄────────────────┘            │           │
  │ (Uses code from Phase 3)                             │           │
  │ (Protected by auth from Phase 2)                     │           │
  ▼                                                      │           │
Phase 5: Dashboard & History ◄───────────────────────────┘           │
  │ (Displays results from Phase 4)                                  │
  │ (Requires auth from Phase 2)                                     │
  ▼                                                                  │
Phase 6: Polish & Deploy ◄──────────────────────────────────────────┘
  (Builds on everything)
```

---

## Quick Reference — Files by Phase

| Phase | New Files | Count |
|---|---|---|
| **Phase 1** | app.js, server.js, db.js, env.js, AppError.js, errorHandler.js, responseFormatter.js, Layout.jsx, Navbar.jsx, Sidebar.jsx, App.jsx, axios.js, index.css, prisma/schema.prisma | ~14 |
| **Phase 2** | authService.js, authController.js, authRoutes.js, auth.js (middleware), rateLimiter.js, validator.js, userController.js, userRoutes.js, AuthContext.jsx, useAuth.js, auth.js (api), LoginPage, RegisterPage, ForgotPasswordPage, ProfilePage, ProtectedRoute | ~16 |
| **Phase 3** | projectController.js, projectRoutes.js, projectService.js, analysisController.js, analysisRoutes.js, codeService.js, languageDetector.js, NewReviewPage.jsx, CodeEditor.jsx, FileUploader.jsx, LanguageSelector.jsx, analysis.js (api) | ~12 |
| **Phase 4** | staticAnalysisService.js, aiReviewService.js, groq.js, complexityService.js, analysisOrchestrator.js | ~5 |
| **Phase 5** | reviewController.js, reviewRoutes.js, reviewService.js, DashboardPage.jsx, StatsCards.jsx, ScoreChart.jsx, RecentReviews.jsx, ReviewDetailPage.jsx, ReviewHeader.jsx, FindingsList.jsx, FindingCard.jsx, ComplexityPanel.jsx, CodeDisplay.jsx, HistoryPage.jsx, ReviewCard.jsx, SearchBar.jsx, FilterDropdown.jsx, Pagination.jsx | ~18 |
| **Phase 6** | ErrorBoundary.jsx, NotFoundPage.jsx, toast utility, README.md | ~4 |
| **Total** | | **~69 files** |

---

*This implementation plan is derived from [architecture.md](file:///d:/Ai CRA/Ai-Code-Review-Assistant/Docs/architecture.md) and should be followed sequentially to ensure each phase builds on a stable foundation.*

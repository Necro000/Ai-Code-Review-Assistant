# AI Code Review Assistant — Phase-Wise Implementation Plan (Part 2)
# 13 Bonus Feature Integration

> **Derived from:** [architecture.md](file:///d:/Ai%20CRA/Ai-Code-Review-Assistant/Docs/architecture.md)
> **Prerequisite:** [implementation-plan.md](file:///d:/Ai%20CRA/Ai-Code-Review-Assistant/Docs/implementation-plan.md) — Phases 1–6 must be complete.
> **Strategy:** Additive integration — zero breaking changes to existing code.
> **Last Updated:** 2026-07-14

---

## Overview

This plan extends the working application with **13 bonus features** across 5 focused phases. Every phase ends with a testable, deployable state. Features are ordered by dependency and risk.

```
Phase 7 ──► Phase 8 ──► Phase 9 ──► Phase 10 ──► Phase 11
Quick        Auth &       Code        UI &          DevOps
Wins         Teams        Engine      UX            & Alerts
(Day 15)    (Day 16-17)  (Day 18-19) (Day 20-21)  (Day 22)
```

**Features per phase:**

| Phase | Features |
|---|---|
| **Phase 7** | AI Refactoring Display, Enhanced 0-100 Scoring, Dark/Light Theme |
| **Phase 8** | GitHub OAuth, Team Workspaces, Admin Dashboard |
| **Phase 9** | PR Review Integration, Java/C++ Linting, Multi-language enhancements |
| **Phase 10** | Interactive Analytics Charts, Real-time Collaboration, Quality Leaderboard |
| **Phase 11** | Docker Support, GitHub Actions CI/CD, Email Notifications |

---

## DB Migration Sequence

Run these migrations **before** starting Phase 8. They are cumulative — later migrations depend on earlier ones.

```
Migration 1: add_github_oauth      → User: +githubId, +avatarUrl
Migration 2: add_user_roles        → User: +role
Migration 3: add_team_workspaces   → NEW: Workspace, WorkspaceMember; Project: +workspaceId (nullable)
```

All three can be batched as a single migration:

```bash
cd server
npx prisma migrate dev --name feature_batch_auth_teams
```

**Combined Prisma additions to `server/prisma/schema.prisma`:**

```prisma
// ── Additions to existing User model ──────────────────────────
model User {
  // ... existing fields ...
  githubId  String?  @unique @map("github_id")        // Feature: GitHub OAuth
  avatarUrl String?  @map("avatar_url")               // Feature: GitHub OAuth
  role      String   @db.VarChar(20) @default("user") // Feature: Admin ("user"|"admin")

  // New relations
  ownedWorkspaces      Workspace[]       @relation("WorkspaceOwner")
  workspaceMemberships WorkspaceMember[]
}

// ── Additions to existing Project model ──────────────────────
model Project {
  // ... existing fields ...
  workspaceId String?    @map("workspace_id") // nullable — solo use unchanged
  workspace   Workspace? @relation(fields: [workspaceId], references: [id])
}

// ── New models ────────────────────────────────────────────────
model Workspace {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(100)
  ownerId   String   @map("owner_id")
  createdAt DateTime @default(now()) @map("created_at")

  owner    User              @relation("WorkspaceOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members  WorkspaceMember[]
  projects Project[]

  @@map("workspaces")
}

model WorkspaceMember {
  id          String   @id @default(uuid())
  workspaceId String   @map("workspace_id")
  userId      String   @map("user_id")
  role        String   @db.VarChar(20) @default("member") // "owner" | "member"
  joinedAt    DateTime @default(now()) @map("joined_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@map("workspace_members")
}
```

---

## Phase 7 — Quick Wins (Day 15)

> **Days:** 15
> **Goal:** Ship the three lowest-risk, highest-impact improvements. All data already exists in the DB. These are display and UX fixes.

---

### 7.1 AI Refactoring Display (Frontend Only)

> **Context:** `aiReviewService.js` already requests `refactoring_tips[]` from Groq. The orchestrator stores them inside the `summary` field. They are **never rendered** in `ReviewDetailPage.jsx`.

**Implementation approach:** Extract `refactoring_tips` from `aiReport` in the orchestrator and store them as structured findings (source: `'ai'`, rule: `'refactoring-tip'`). Add a dedicated `RefactoringPanel` component.

| File | Action | Change |
|---|---|---|
| `server/src/services/analysisOrchestrator.js` | **MODIFY** | In `mapAIFindings()`, add block after `naming_suggestions` to map `aiReport.refactoring_tips[]` → DB findings |
| `client/src/components/review/RefactoringPanel.jsx` | **NEW** | Numbered card list of refactoring suggestions |
| `client/src/pages/ReviewDetailPage.jsx` | **MODIFY** | Import `RefactoringPanel`; filter findings where `rule === 'refactoring-tip'`; render below `<FindingsList />` |

**`mapAIFindings` addition (insert after naming_suggestions block):**

```javascript
// 6. Refactoring Tips
if (Array.isArray(aiReport.refactoring_tips)) {
  aiReport.refactoring_tips.forEach((tip, index) => {
    dbFindings.push({
      source: 'ai',
      severity: 'info',
      rule: 'refactoring-tip',
      issue: `Refactoring Suggestion ${index + 1}: ${tip}`,
      explanation: tip,
      suggestedFix: null,
      fileName,
      lineNumber: null,
      column: null,
    });
  });
}
```

**`RefactoringPanel.jsx` structure:**

```jsx
import { HiOutlineSparkles } from 'react-icons/hi2';

export default function RefactoringPanel({ tips = [] }) {
  if (tips.length === 0) return null;
  return (
    <div className="rounded-xl border p-5 space-y-3 bg-[var(--color-surface)] border-[var(--color-border)]">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <HiOutlineSparkles className="text-[var(--color-accent)]" />
        AI Refactoring Suggestions ({tips.length})
      </h3>
      {tips.map((tip, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
          <span className="text-[var(--color-accent)] font-bold text-sm">{i + 1}.</span>
          <p className="text-sm text-[var(--color-text-secondary)]">{tip.explanation}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### 7.2 Enhanced 0-100 Quality Scoring

> **Context:** Groq returns `overall_score` (0-100) stored raw. There is no penalty system, letter grade, or visual badge.

#### New Files

| File | Purpose |
|---|---|
| `server/src/services/scoringService.js` | Penalty-adjusted score computation + letter grade |
| `client/src/components/review/ScoreBadge.jsx` | Circular progress ring with letter grade |

#### Files to Modify

| File | What to Change |
|---|---|
| `server/src/services/analysisOrchestrator.js` | Replace raw `aiReport.overall_score` assignment (line ~159) with `scoringService.computeScore()` call |
| `client/src/components/review/ReviewHeader.jsx` | Replace plain score number with `<ScoreBadge score={review.overallScore} />` |
| `client/src/components/dashboard/StatsCards.jsx` | Wrap average score display in `<ScoreBadge />` |

**`scoringService.js`:**

```javascript
/**
 * Computes a penalty-adjusted quality score.
 * AI score is the baseline; severity findings apply deductions.
 */
const computeScore = (aiScore, staticFindings = [], allFindings = []) => {
  let score = Math.max(0, Math.min(100, parseFloat(aiScore) || 70));

  const errorCount   = allFindings.filter(f => f.severity === 'error').length;
  const warningCount = allFindings.filter(f => f.severity === 'warning').length;

  score -= errorCount   * 3; // -3 pts per error
  score -= warningCount * 1; // -1 pt per warning
  score = Math.max(0, Math.min(100, Math.round(score)));

  let grade;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score, grade };
};

module.exports = { computeScore };
```

**Updated orchestrator call (replaces single line):**

```javascript
// Before (line ~159):
// const overallScore = aiReport.overall_score !== undefined ? aiReport.overall_score : 80;

// After:
const scoringService = require('./scoringService');
const { score: overallScore, grade } = scoringService.computeScore(
  aiReport.overall_score,
  staticFindings,
  allFindings
);
```

---

### 7.3 Dark / Light Theme Toggle

> **Context:** Dark theme CSS variables exist in `:root`. No light theme block and no toggle mechanism exist. All components use `var(--color-*)` tokens so they will respond automatically once the light block is added.

#### New Files

| File | Purpose |
|---|---|
| `client/src/context/ThemeContext.jsx` | State holder, `localStorage` persistence, `data-theme` toggling |
| `client/src/hooks/useTheme.js` | Consumer hook — `const { theme, toggleTheme } = useTheme()` |

#### Files to Modify

| File | What to Change |
|---|---|
| `client/src/index.css` | Add `[data-theme="light"] { ... }` block with light palette tokens |
| `client/src/main.jsx` | Wrap `<App />` inside `<ThemeProvider>` |
| `client/src/components/layout/Navbar.jsx` | Add sun/moon icon button calling `useTheme().toggleTheme()` |

**`ThemeContext.jsx`:**

```jsx
import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**`index.css` light theme block (add after `:root {}` block):**

```css
[data-theme="light"] {
  --color-bg-primary:      #f1f5f9;
  --color-bg-secondary:    #ffffff;
  --color-bg-tertiary:     #e2e8f0;
  --color-surface:         #ffffff;
  --color-surface-hover:   #f8fafc;
  --color-surface-active:  #e2e8f0;

  --color-text:            #0f172a;
  --color-text-secondary:  #334155;
  --color-text-muted:      #64748b;
  --color-text-inverse:    #f1f5f9;

  --color-border:          #cbd5e1;
  --color-border-hover:    #94a3b8;

  --color-accent:          #4f46e5;
  --color-accent-hover:    #6366f1;
  --color-accent-muted:    rgba(79, 70, 229, 0.10);
  --color-accent-glow:     rgba(79, 70, 229, 0.20);

  --shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.06);
}
```

### 7.4 Phase 7 Testing Checklist

| Test | Expected |
|---|---|
| Submit review with JS code | `refactoring_tips` appear as numbered cards below findings |
| Score displayed in ReviewHeader | Letter grade (A–F) shown alongside numeric score |
| Click theme toggle in Navbar | Page instantly switches color palette, persists on reload |
| No refactoring tips from AI | `RefactoringPanel` renders nothing (null return guard) |

### ✅ Phase 7 Deliverables

- [ ] Refactoring tips rendered in `ReviewDetailPage` as a dedicated panel
- [ ] Penalty-adjusted scoring with letter grade (A–F) in `ReviewHeader` and `StatsCards`
- [ ] Light/dark theme toggle persisted in `localStorage`, functional across all pages

---

## Phase 8 — Auth & Teams (Days 16–17)

> **Days:** 16–17
> **Goal:** GitHub OAuth alongside existing email auth, Team Workspaces for collaborative projects, and a role-gated Admin Dashboard.

**Prerequisites:** Run DB migration `feature_batch_auth_teams` before starting this phase.

---

### 8.1 GitHub OAuth

> **Strategy:** Passport.js OAuth 2.0 strategy runs parallel to existing JWT email flow. No existing auth controller is modified.

**New dependencies:**

```bash
cd server
npm install passport passport-github2 express-session
```

#### New Files

| File | Purpose |
|---|---|
| `server/src/config/passport.js` | GitHub strategy: find-or-create user, serialize/deserialize |
| `server/src/routes/oauthRoutes.js` | `/api/auth/github` + `/api/auth/github/callback` |

#### Files to Modify

| File | Line(s) | What to Change |
|---|---|---|
| `server/src/app.js` | After cookie-parser line (~33) | Add `session()`, `passport.initialize()`, `passport.session()` middleware |
| `server/src/app.js` | Route block (~54) | Add `app.use('/api/auth', require('./routes/oauthRoutes'))` |
| `server/src/config/env.js` | `requiredVars` + exports | Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SESSION_SECRET` |
| `client/src/pages/LoginPage.jsx` | Below submit button | Add "Continue with GitHub" `<a>` button pointing to `/api/auth/github` |
| `client/src/context/AuthContext.jsx` | `initAuth` useEffect | Handle `?token=` query param on mount |

**`passport.js`:**

```javascript
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { prisma } = require('./db');
const env = require('./env');
const jwt = require('jsonwebtoken');

passport.use(new GitHubStrategy(
  {
    clientID:     env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    callbackURL:  `${env.SERVER_URL || 'http://localhost:5000'}/api/auth/github/callback`,
    scope: ['user:email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email    = profile.emails?.[0]?.value;
      const githubId = profile.id.toString();

      let user = await prisma.user.findFirst({
        where: { OR: [{ githubId }, { email }] },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name:      profile.displayName || profile.username,
            email:     email || `${githubId}@github.noemail`,
            password:  '',
            githubId,
            avatarUrl: profile.photos?.[0]?.value || null,
          },
        });
      } else if (!user.githubId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data:  { githubId, avatarUrl: profile.photos?.[0]?.value },
        });
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

module.exports = passport;
```

**`oauthRoutes.js`:**

```javascript
const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${env.CLIENT_URL}/login?error=oauth` }),
  (req, res) => {
    const accessToken = jwt.sign({ userId: req.user.id }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });
    res.redirect(`${env.CLIENT_URL}/login?token=${accessToken}`);
  }
);

module.exports = router;
```

---

### 8.2 Team Workspaces

> **Strategy:** New routes and services scoped to workspace membership. Solo project flow unchanged — `workspaceId` on `Project` is nullable.

#### New Files

| File | Purpose |
|---|---|
| `server/src/services/workspaceService.js` | Workspace CRUD, membership assertions |
| `server/src/controllers/workspaceController.js` | HTTP handlers |
| `server/src/routes/workspaceRoutes.js` | `/api/workspaces` endpoints |
| `client/src/api/workspaces.js` | Axios API calls |
| `client/src/pages/WorkspacePage.jsx` | Workspace list + create |
| `client/src/pages/WorkspaceDetailPage.jsx` | Members and projects under workspace |
| `client/src/components/workspace/WorkspaceCard.jsx` | Card component |
| `client/src/components/workspace/MemberList.jsx` | Invite + remove members |

#### Files to Modify

| File | What to Change |
|---|---|
| `server/src/app.js` | Mount `app.use('/api/workspaces', verifyToken, require('./routes/workspaceRoutes'))` |
| `client/src/App.jsx` | Add `/workspace` and `/workspace/:id` routes inside `<ProtectedRoute>` |
| `client/src/components/layout/Sidebar.jsx` | Add "Workspaces" nav item |

**Workspace endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workspaces` | Create workspace |
| `GET` | `/api/workspaces` | List user's workspaces (owned + member-of) |
| `GET` | `/api/workspaces/:id` | Workspace detail + members |
| `POST` | `/api/workspaces/:id/invite` | Invite member by email |
| `DELETE` | `/api/workspaces/:id/members/:userId` | Remove member (owner only) |
| `DELETE` | `/api/workspaces/:id` | Delete workspace (owner only) |

**`workspaceService.js` key logic:**

```javascript
const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');

const assertOwner = async (workspaceId, userId) => {
  const ws = await prisma.workspace.findFirst({ where: { id: workspaceId, ownerId: userId } });
  if (!ws) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return ws;
};

const listWorkspaces = async (userId) => {
  return prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
};

const inviteMember = async (workspaceId, inviterUserId, inviteeEmail) => {
  await assertOwner(workspaceId, inviterUserId);
  const invitee = await prisma.user.findUnique({ where: { email: inviteeEmail } });
  if (!invitee) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return prisma.workspaceMember.create({ data: { workspaceId, userId: invitee.id } });
};

module.exports = { assertOwner, listWorkspaces, inviteMember };
```

---

### 8.3 Admin Dashboard

> **Strategy:** A separate admin-only route family guarded by `verifyToken` + `requireAdmin`. The single-line addition to `auth.js` exposes `req.userRole`.

#### New Files

| File | Purpose |
|---|---|
| `server/src/middleware/requireAdmin.js` | Checks `req.userRole === 'admin'`, throws 403 |
| `server/src/services/adminService.js` | Cross-user Prisma aggregation queries |
| `server/src/controllers/adminController.js` | HTTP handlers |
| `server/src/routes/adminRoutes.js` | `/api/admin/*` endpoints |
| `client/src/pages/AdminPage.jsx` | Platform-wide stats + user management table |
| `client/src/components/admin/UserTable.jsx` | User rows with role badges and action buttons |

#### Files to Modify

| File | Line | What to Change |
|---|---|---|
| `server/src/middleware/auth.js` | Line 36 | Add `req.userRole = user.role;` after `req.userId = user.id;` — also add `role: true` to the Prisma `select` on line 27 |
| `server/src/app.js` | Route block | Mount `app.use('/api/admin', verifyToken, requireAdmin, require('./routes/adminRoutes'))` |
| `client/src/components/layout/Sidebar.jsx` | Nav list | Conditionally render Admin link when `user.role === 'admin'` |
| `client/src/App.jsx` | Routes | Add `/admin` route with role-guard |

**`requireAdmin.js`:**

```javascript
const AppError = require('../utils/AppError');

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return next(new AppError('Admin access required.', 403, 'FORBIDDEN'));
  }
  next();
};

module.exports = requireAdmin;
```

**Admin endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Total users, total reviews, avg global score |
| `GET` | `/api/admin/users` | Paginated all-user list with role field |
| `PUT` | `/api/admin/users/:id/role` | Promote or demote user role |
| `DELETE` | `/api/admin/users/:id` | Delete user and cascade projects/reviews |
| `GET` | `/api/admin/reviews` | All reviews platform-wide (paginated) |

### 8.4 Phase 8 Testing Checklist

| Test | Expected |
|---|---|
| Visit `/api/auth/github` | Browser redirected to GitHub OAuth consent screen |
| Complete GitHub OAuth | Redirected to `/login?token=...`, auto-logged in |
| Create workspace | 201 response, workspace appears in list |
| Invite member by email | Member added to workspace |
| Access `/api/admin` as normal user | 403 Forbidden |
| Access `/api/admin` as admin | 200, platform stats returned |
| Delete user as admin | User and all associated data removed |

### ✅ Phase 8 Deliverables

- [ ] GitHub OAuth login functional; callback issues JWT and redirects to dashboard
- [ ] Existing email/password users unaffected
- [ ] Workspace CRUD and member invite/remove working
- [ ] Projects assignable to workspace (optional — solo flow unchanged)
- [ ] `requireAdmin` middleware gates all `/api/admin` routes
- [ ] Admin dashboard shows platform-wide stats and user table

---

## Phase 9 — Code Engine Expansion (Days 18–19)

> **Days:** 18–19
> **Goal:** Expand static analysis to Java and C++. Integrate GitHub PR review as a new code submission source.

---

### 9.1 Multi-language Linting — Java & C++

> **Context:** `staticAnalysisService.js` has a clean `analyzeCode()` dispatcher with `if/else` branches. `LanguageSelector.jsx` already lists Java and C/C++. Only the server-side runners are missing.

**System prerequisites (must be installed on server/CI machine):**
- Java: `checkstyle` JAR (`java -jar checkstyle.jar`)
- C++: `cppcheck` (available via `apt`, `brew`, `choco`)

#### Files to Modify

| File | What to Change |
|---|---|
| `server/src/services/staticAnalysisService.js` | Add `runCheckstyle()` and `runCppcheck()` functions. In `analyzeCode()` dispatcher, add `else if` branches for `'java'` and `'c/cpp'` — existing branches are untouched. |
| `server/src/services/complexityService.js` | Add function/class regex patterns for Java and C++ to the detection map |
| `server/src/config/env.js` | Add optional `CHECKSTYLE_JAR` export (no required check — graceful fallback) |

**`runCheckstyle()` addition to `staticAnalysisService.js`:**

```javascript
const runCheckstyle = async (code) => {
  const filename = `${uuidv4()}.java`;
  const filepath = path.join(tempDir, filename);
  await fs.writeFile(filepath, code, 'utf8');

  try {
    const jarPath = process.env.CHECKSTYLE_JAR || 'checkstyle.jar';
    const cmd = `java -jar "${jarPath}" -c /google_checks.xml -f xml "${filepath}"`;
    let stdout = '';
    try {
      ({ stdout } = await execAsync(cmd, { timeout: 30000, shell: true }));
    } catch (e) {
      stdout = e.stdout || '';
    }
    return normalizeCheckstyleResults(stdout);
  } catch (error) {
    console.warn('⚠️ Checkstyle execution issue:', error.message);
    return [];
  } finally {
    try { await fs.unlink(filepath); } catch (_) {}
  }
};
```

**`runCppcheck()` addition:**

```javascript
const runCppcheck = async (code) => {
  const filename = `${uuidv4()}.cpp`;
  const filepath = path.join(tempDir, filename);
  await fs.writeFile(filepath, code, 'utf8');

  try {
    const cmd = `cppcheck --enable=all --xml "${filepath}"`;
    let stderr = '';
    try {
      ({ stderr } = await execAsync(cmd, { timeout: 30000, shell: true }));
    } catch (e) {
      stderr = e.stderr || '';
    }
    return normalizeCppcheckResults(stderr);
  } catch (error) {
    console.warn('⚠️ Cppcheck execution issue:', error.message);
    return [];
  } finally {
    try { await fs.unlink(filepath); } catch (_) {}
  }
};
```

**Updated `analyzeCode()` dispatcher (additive only):**

```javascript
const analyzeCode = async (code, language) => {
  if (!code || !language) return [];
  const lang = language.toLowerCase();

  if (lang === 'javascript' || lang === 'typescript') return await runESLint(code);
  else if (lang === 'python')                          return await runPylint(code);
  else if (lang === 'java')                            return await runCheckstyle(code); // NEW
  else if (lang === 'c/cpp' || lang === 'cpp' || lang === 'c') return await runCppcheck(code); // NEW

  return []; // No linter — AI-only review
};
```

---

### 9.2 Pull Request Review Integration

> **Strategy:** Fetch PR diff via GitHub REST API, parse each changed file into a code string, pass through existing `runCodeAnalysis()` orchestrator unchanged.

**New dependency:**

```bash
cd server
npm install @octokit/rest
```

#### New Files

| File | Purpose |
|---|---|
| `server/src/services/githubPRService.js` | Fetch PR files via Octokit, detect language per file |
| `server/src/controllers/prController.js` | `POST /api/pr/review` handler |
| `server/src/routes/prRoutes.js` | Route definition |
| `client/src/pages/PRReviewPage.jsx` | Form: repo owner, repo name, PR number, project |
| `client/src/api/pr.js` | Axios call |

#### Files to Modify

| File | What to Change |
|---|---|
| `server/src/app.js` | Mount `app.use('/api/pr', verifyToken, require('./routes/prRoutes'))` |
| `server/src/config/env.js` | Add optional `GITHUB_ACCESS_TOKEN` export |
| `client/src/App.jsx` | Add `/pr/review` route inside `<ProtectedRoute>` |
| `client/src/components/layout/Sidebar.jsx` | Add "PR Review" nav item |

**`githubPRService.js`:**

```javascript
const { Octokit } = require('@octokit/rest');
const { detectLanguage } = require('../utils/languageDetector');

const getOctokit = () => new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN || undefined });

const fetchPRFiles = async (owner, repo, pullNumber) => {
  const octokit = getOctokit();

  const { data: files } = await octokit.pulls.listFiles({
    owner, repo, pull_number: parseInt(pullNumber, 10),
  });

  const results = [];
  for (const file of files) {
    if (file.status === 'removed' || !file.patch) continue;

    let code = '';
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: file.filename });
      code = Buffer.from(data.content, 'base64').toString('utf8');
    } catch {
      code = file.patch; // Fallback to diff
    }

    const language = detectLanguage(file.filename, code);
    results.push({ fileName: file.filename, code, language });
  }

  return results;
};

module.exports = { fetchPRFiles };
```

**`prController.js`:**

```javascript
const { fetchPRFiles } = require('../services/githubPRService');
const { runCodeAnalysis } = require('../services/analysisOrchestrator');
const { sendSuccess } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');
const { prisma } = require('../config/db');

const reviewPR = async (req, res, next) => {
  try {
    const { owner, repo, pullNumber, projectId } = req.body;
    if (!owner || !repo || !pullNumber || !projectId)
      throw new AppError('owner, repo, pullNumber, and projectId are required', 400, 'VALIDATION_ERROR');

    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
    if (!project) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');

    const files = await fetchPRFiles(owner, repo, pullNumber);
    if (files.length === 0) throw new AppError('No reviewable files found in this PR', 400, 'NO_FILES');

    const results = [];
    for (const file of files) {
      const { review, complexity } = await runCodeAnalysis(file.code, file.language, projectId, file.fileName);
      results.push({ review, complexity, fileName: file.fileName });
    }

    return sendSuccess(res, {
      data: { reviews: results, filesReviewed: files.length },
      message: `PR #${pullNumber} — ${files.length} file(s) reviewed`,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { reviewPR };
```

### 9.3 Phase 9 Testing Checklist

| Test | Expected |
|---|---|
| Submit Java code | Checkstyle findings returned (or graceful empty if JAR missing) |
| Submit C++ code | Cppcheck findings returned (or graceful empty if not installed) |
| Submit JS code (regression) | ESLint still works correctly |
| PR review: valid public repo | Files fetched, each analyzed via pipeline |
| PR review: invalid repo name | 404 error from GitHub propagated cleanly |
| PR review: no `GITHUB_ACCESS_TOKEN` | Falls back to unauthenticated 60 req/hr limit |

### ✅ Phase 9 Deliverables

- [ ] Java (Checkstyle) and C++ (Cppcheck) static analysis with graceful fallback
- [ ] `analyzeCode()` dispatches correctly for all 5 languages
- [ ] PR Review page accepts owner/repo/PR number, runs per-file analysis
- [ ] PR results stored as individual reviews under the selected project

---

## Phase 10 — UI & UX Expansion (Days 20–21)

> **Days:** 20–21
> **Goal:** Upgrade dashboard with a real chart library, add a leaderboard, and introduce real-time presence collaboration.

---

### 10.1 Interactive Analytics Charts

> **Context:** `ScoreChart.jsx` is hand-rolled SVG. `getDashboardStats()` already returns `scoreTrend` and `severityBreakdown`. A chart library and two new components are all that is needed.

**New dependency (client):**

```bash
cd client
npm install recharts
```

#### New Files

| File | Purpose |
|---|---|
| `client/src/components/dashboard/ScoreTrendLine.jsx` | Recharts `LineChart` replacing SVG ScoreChart |
| `client/src/components/dashboard/SeverityDonut.jsx` | Recharts `PieChart` for error/warning/info breakdown |
| `client/src/components/dashboard/LanguageBarChart.jsx` | Recharts `BarChart` for reviews-by-language |

#### Files to Modify

| File | What to Change |
|---|---|
| `client/src/pages/DashboardPage.jsx` | Replace `<ScoreChart />` with `<ScoreTrendLine />`, add `<SeverityDonut />` and `<LanguageBarChart />` |
| `server/src/services/reviewService.js` | Extend `getDashboardStats()` to also `groupBy language` (5-line Prisma addition) |

**Language distribution query addition to `getDashboardStats()`:**

```javascript
// Add after existing scoreTrend query:
const languageGroups = await prisma.review.groupBy({
  by: ['language'],
  where: { project: { userId } },
  _count: { id: true },
  orderBy: { _count: { id: 'desc' } },
  take: 8,
});

const languageBreakdown = languageGroups.map(g => ({
  language: g.language || 'unknown',
  count: g._count.id,
}));

// Add to return object:
return { totalReviews, averageScore, totalIssues, cleanPasses, severityBreakdown, scoreTrend, languageBreakdown };
```

**`ScoreTrendLine.jsx`:**

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ScoreTrendLine({ trend = [] }) {
  const data = trend
    .filter(d => d.overallScore !== null)
    .map(d => ({ date: new Date(d.createdAt).toLocaleDateString(), score: d.overallScore }));

  if (data.length === 0) return (
    <div className="flex items-center justify-center h-[180px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <p className="text-sm text-[var(--color-text-muted)]">No trend data yet.</p>
    </div>
  );

  return (
    <div className="rounded-xl border p-5 bg-[var(--color-surface)] border-[var(--color-border)]">
      <h3 className="text-sm font-semibold text-white mb-4">Score Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
            }}
          />
          <Line type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 10.2 Quality Improvement Leaderboard

> **Strategy:** Cross-user aggregation using existing `Review` and `User` tables via Prisma raw query. No new DB model needed.

#### New Files

| File | Purpose |
|---|---|
| `server/src/services/leaderboardService.js` | `$queryRaw` cross-user aggregation |
| `server/src/controllers/leaderboardController.js` | HTTP handler |
| `server/src/routes/leaderboardRoutes.js` | `GET /api/leaderboard` |
| `client/src/pages/LeaderboardPage.jsx` | Ranked list with medals, scores, improvement delta |
| `client/src/api/leaderboard.js` | Axios GET call |

#### Files to Modify

| File | What to Change |
|---|---|
| `server/src/app.js` | Mount `app.use('/api/leaderboard', verifyToken, require('./routes/leaderboardRoutes'))` |
| `client/src/App.jsx` | Add `/leaderboard` route inside `<ProtectedRoute>` |
| `client/src/components/layout/Sidebar.jsx` | Add "Leaderboard" nav item with trophy icon |

**`leaderboardService.js`:**

```javascript
const { prisma } = require('../config/db');

/**
 * Returns top users ranked by average review score.
 * Minimum 3 reviews required for statistical meaningfulness.
 */
const getLeaderboard = async (limit = 10) => {
  const rows = await prisma.$queryRaw`
    SELECT
      u.id,
      u.name,
      u."avatar_url"                              AS "avatarUrl",
      COUNT(r.id)::int                            AS "reviewCount",
      ROUND(AVG(r.overall_score)::numeric, 1)     AS "averageScore",
      ROUND((MAX(r.overall_score) - MIN(r.overall_score))::numeric, 1) AS "improvement"
    FROM users u
    JOIN projects p ON p.user_id = u.id
    JOIN reviews  r ON r.project_id = p.id
    WHERE r.overall_score IS NOT NULL
    GROUP BY u.id, u.name, u."avatar_url"
    HAVING COUNT(r.id) >= 3
    ORDER BY AVG(r.overall_score) DESC
    LIMIT ${limit}
  `;

  return rows.map((row, index) => ({ rank: index + 1, ...row }));
};

module.exports = { getLeaderboard };
```

**Leaderboard page layout:**

```
┌─────────────────────────────────────────────────────┐
│  🏆 Code Quality Leaderboard                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🥇  Alice Chen         95.2 avg   ▲ +34   32 reviews│
│  🥈  Bob Kumar          91.8 avg   ▲ +27   18 reviews│
│  🥉  Carol Mende        88.4 avg   ▲ +19   41 reviews│
│   4  Dan Obi            84.1 avg   ▲ +12    7 reviews│
│   5  Eva Storm          81.6 avg   ▲ +8    12 reviews│
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### 10.3 Real-time Collaboration

> **Strategy:** Socket.io adds presence events (who is viewing a review) without touching the REST API or DB schema. The only structural change is wrapping `app.listen()` with `http.createServer()`.

**New dependencies:**

```bash
cd server && npm install socket.io
cd client && npm install socket.io-client
```

#### New Files

| File | Purpose |
|---|---|
| `server/src/config/socket.js` | Socket.io init, JWT socket auth middleware, join/leave room events |
| `client/src/hooks/useCollaboration.js` | Socket client, emits join/leave, returns collaborators list |
| `client/src/components/review/CollaboratorsBar.jsx` | Avatar row of users viewing the same review |

#### Files to Modify

| File | Line | What to Change |
|---|---|---|
| `server/server.js` | `app.listen(...)` call | Wrap: `const http = require('http').createServer(app); require('./src/config/socket').init(http); http.listen(port, ...)` |
| `client/src/pages/ReviewDetailPage.jsx` | After data fetch | Call `useCollaboration(reviewId)` and render `<CollaboratorsBar users={collaborators} />` |

**`socket.js`:**

```javascript
const { Server } = require('socket.io');
const jwt       = require('jsonwebtoken');
const env       = require('./env');

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  // Auth middleware — verify JWT on every socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-review', ({ reviewId, userName, avatarUrl }) => {
      socket.join(`review:${reviewId}`);
      socket.to(`review:${reviewId}`).emit('collaborator-joined', {
        userId: socket.userId, userName, avatarUrl,
      });
    });

    socket.on('leave-review', ({ reviewId }) => {
      socket.leave(`review:${reviewId}`);
      socket.to(`review:${reviewId}`).emit('collaborator-left', { userId: socket.userId });
    });
  });

  return io;
};

module.exports = { init };
```

### 10.4 Phase 10 Testing Checklist

| Test | Expected |
|---|---|
| Dashboard loads | ScoreTrendLine, SeverityDonut, LanguageBarChart all render with data |
| Leaderboard with 0 users having ≥ 3 reviews | Empty state shown |
| Leaderboard with qualifying users | Ranked entries with correct avg scores |
| Two browser tabs open same review | Second user's avatar appears in CollaboratorsBar |
| Tab closes | Avatar disappears from collaborators bar in other tab |

### ✅ Phase 10 Deliverables

- [ ] Dashboard replaced with Recharts `LineChart`, `PieChart`, and `BarChart`
- [ ] Language breakdown returned from `getDashboardStats()` API
- [ ] Leaderboard page with cross-user rankings (min 3 reviews threshold)
- [ ] Socket.io server initialized; join/leave events broadcast presence
- [ ] `CollaboratorsBar` shows live avatars of concurrent reviewers

---

## Phase 11 — DevOps & Alerts (Day 22)

> **Days:** 22
> **Goal:** Containerise the application, automate CI/CD, and fire post-review email notifications.

---

### 11.1 Email Notifications Post-Review

> **Strategy:** Fire-and-forget email after `runCodeAnalysis()` resolves. Does NOT await — does NOT block the HTTP response.

**New dependency:**

```bash
cd server
npm install nodemailer
```

#### New Files

| File | Purpose |
|---|---|
| `server/src/services/emailService.js` | Nodemailer transporter + `sendReviewCompleteEmail()` |
| `server/src/templates/reviewComplete.html` | HTML email template with score and findings summary |

#### Files to Modify

| File | Line | What to Change |
|---|---|---|
| `server/src/middleware/auth.js` | Line 27 `select:` block | Add `email: true` to the Prisma user select |
| `server/src/middleware/auth.js` | Line 36 | Add `req.userEmail = user.email;` alongside `req.userId` |
| `server/src/controllers/analysisController.js` | After `sendSuccess()` for snippet (~line 37) | Add fire-and-forget: `emailService.sendReviewCompleteEmail(req.userEmail, review).catch(console.error)` |
| `server/src/controllers/analysisController.js` | After `sendSuccess()` for upload (~line 81) | Same fire-and-forget for each file result |
| `server/src/config/env.js` | Exports | Add optional SMTP vars (no required check — gracefully skip if missing) |

**`emailService.js`:**

```javascript
const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null; // Email disabled — skip silently

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const sendReviewCompleteEmail = async (toEmail, review) => {
  const transport = getTransporter();
  if (!transport || !toEmail) return; // Not configured — skip silently

  const errorCount   = review.findings?.filter(f => f.severity === 'error').length   || 0;
  const warningCount = review.findings?.filter(f => f.severity === 'warning').length || 0;
  const score        = review.overallScore ?? 'N/A';

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
      <h2 style="color:#6366f1;">✅ Code Review Complete</h2>
      <p>Your code has been analyzed. Here is the summary:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;background:#f1f5f9;"><strong>Quality Score</strong></td><td style="padding:8px;">${score} / 100</td></tr>
        <tr><td style="padding:8px;background:#f1f5f9;"><strong>Errors</strong></td><td style="padding:8px;color:#ef4444;">${errorCount}</td></tr>
        <tr><td style="padding:8px;background:#f1f5f9;"><strong>Warnings</strong></td><td style="padding:8px;color:#f59e0b;">${warningCount}</td></tr>
        <tr><td style="padding:8px;background:#f1f5f9;"><strong>Language</strong></td><td style="padding:8px;">${review.language || 'Unknown'}</td></tr>
      </table>
      <p style="color:#64748b;font-size:13px;">Log in to view the full findings and refactoring suggestions.</p>
    </div>
  `;

  await transport.sendMail({
    from:    process.env.SMTP_FROM || '"AI Code Review" <noreply@aicra.dev>',
    to:      toEmail,
    subject: `Your Code Review is Ready — Score: ${score}/100`,
    html,
  });
};

module.exports = { sendReviewCompleteEmail };
```

---

### 11.2 Docker Support

**No code changes.** Pure infrastructure additions at the project root.

#### New Files

```
ai-code-review-assistant/
├── Dockerfile.server
├── Dockerfile.client
├── docker-compose.yml
└── client/nginx.conf
```

**`Dockerfile.server`:**

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "server.js"]
```

**`Dockerfile.client`:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**`client/nginx.conf`:**

```nginx
server {
  listen 80;
  root  /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://server:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

**`docker-compose.yml`:**

```yaml
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB:       aicra
      POSTGRES_USER:     aicra_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aicra_user"]
      interval: 10s
      retries: 5

  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    restart: unless-stopped
    env_file: ./server/.env
    environment:
      DATABASE_URL: postgresql://aicra_user:${DB_PASSWORD:-changeme}@db:5432/aicra
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
    command: sh -c "npx prisma migrate deploy && node server.js"

  client:
    build:
      context: .
      dockerfile: Dockerfile.client
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  postgres_data:
```

---

### 11.3 GitHub Actions CI/CD

**No code changes.** Pure infrastructure.

#### New Files

```
.github/
└── workflows/
    ├── ci.yml
    └── deploy.yml
```

**`.github/workflows/ci.yml`:**

```yaml
name: CI — Lint, Type Check & Validate

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-server:
    name: ESLint (Server)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: server/package-lock.json }
      - run: cd server && npm ci
      - run: cd server && npx eslint src/ --max-warnings 0

  build-client:
    name: Build (Client)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: client/package-lock.json }
      - run: cd client && npm ci
      - run: cd client && npm run build

  prisma-validate:
    name: Prisma Schema Validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: server/package-lock.json }
      - run: cd server && npm ci
      - run: cd server && npx prisma validate
```

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy — Build & Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    name: Build Docker Images
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push server image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.server
          push: true
          tags: ghcr.io/${{ github.repository }}/server:latest

      - name: Build and push client image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.client
          push: true
          tags: ghcr.io/${{ github.repository }}/client:latest

  deploy-render:
    name: Trigger Render Deploy
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via Render Hook
        run: curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
```

### 11.4 Phase 11 Testing Checklist

| Test | Expected |
|---|---|
| `docker compose up` | All 3 services start; DB healthy; API reachable at `:5000` |
| `docker compose up` — client | Nginx serves React at `:80`; API proxy works |
| Submit code review (SMTP configured) | Email received at user address within 5 seconds |
| Submit code review (SMTP not configured) | Review completes normally; no error logged |
| Open PR to main branch | `ci.yml` runs ESLint, client build, Prisma validate |
| Push to main | `deploy.yml` builds + pushes images to GHCR, triggers Render deploy |

### ✅ Phase 11 Deliverables

- [ ] `docker compose up` brings up client, server, and PostgreSQL
- [ ] Prisma migrations run automatically on container start
- [ ] Post-review email fires and forgets; graceful no-op when SMTP not configured
- [ ] `ci.yml` runs on every PR — fails fast on lint or build errors
- [ ] `deploy.yml` builds + pushes Docker images on every push to `main`

---

## Summary — New Files by Phase

| Phase | New Server Files | New Client Files | Infrastructure Files |
|---|---|---|---|
| **Phase 7** | `scoringService.js` | `ThemeContext.jsx`, `useTheme.js`, `RefactoringPanel.jsx`, `ScoreBadge.jsx` | — |
| **Phase 8** | `passport.js`, `oauthRoutes.js`, `requireAdmin.js`, `adminService.js`, `adminController.js`, `adminRoutes.js`, `workspaceService.js`, `workspaceController.js`, `workspaceRoutes.js` | `WorkspacePage.jsx`, `WorkspaceDetailPage.jsx`, `WorkspaceCard.jsx`, `MemberList.jsx`, `AdminPage.jsx`, `UserTable.jsx`, `workspaces.js` | — |
| **Phase 9** | `githubPRService.js`, `prController.js`, `prRoutes.js` | `PRReviewPage.jsx`, `pr.js` | — |
| **Phase 10** | `leaderboardService.js`, `leaderboardController.js`, `leaderboardRoutes.js`, `socket.js` | `ScoreTrendLine.jsx`, `SeverityDonut.jsx`, `LanguageBarChart.jsx`, `LeaderboardPage.jsx`, `leaderboard.js`, `useCollaboration.js`, `CollaboratorsBar.jsx` | — |
| **Phase 11** | `emailService.js`, `reviewComplete.html` | `nginx.conf` | `Dockerfile.server`, `Dockerfile.client`, `docker-compose.yml`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` |
| **Total** | **~21 server files** | **~20 client files** | **5 infrastructure files** |

---

## New Environment Variables

Add to `server/.env` and `server/.env.example`:

| Variable | Phase | Required | Purpose |
|---|---|---|---|
| `GITHUB_CLIENT_ID` | 8 | Yes (OAuth) | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | 8 | Yes (OAuth) | GitHub OAuth App secret |
| `SESSION_SECRET` | 8 | Yes (OAuth) | Express session signing key (min 32 chars) |
| `GITHUB_ACCESS_TOKEN` | 9 | No | GitHub PAT — raises PR API limit to 5000/hr |
| `SMTP_HOST` | 11 | No | SMTP server hostname |
| `SMTP_PORT` | 11 | No | SMTP port (587 TLS or 465 SSL) |
| `SMTP_USER` | 11 | No | SMTP authentication username |
| `SMTP_PASS` | 11 | No | SMTP authentication password |
| `SMTP_FROM` | 11 | No | Sender name and address |

---

## New Dependencies

| Package | Side | Phase | Feature |
|---|---|---|---|
| `passport` | server | 8 | GitHub OAuth strategy runner |
| `passport-github2` | server | 8 | GitHub OAuth 2.0 strategy |
| `express-session` | server | 8 | Session store for Passport |
| `@octokit/rest` | server | 9 | GitHub REST API (PR file fetch) |
| `socket.io` | server | 10 | Real-time WebSocket server |
| `nodemailer` | server | 11 | Email transport (SMTP) |
| `socket.io-client` | client | 10 | Real-time WebSocket client |
| `recharts` | client | 10 | Interactive chart library |

---

## Recommended Implementation Order

| Priority | Phase | Feature | Risk | Est. Time |
|---|---|---|---|---|
| 1 | 7 | Dark/Light Theme | 🟢 Zero | 2 hrs |
| 2 | 7 | AI Refactoring Display | 🟢 Zero | 1 hr |
| 3 | 7 | Enhanced 0-100 Scoring | 🟢 Low | 3 hrs |
| 4 | 11 | Docker Support | 🟢 Low | 3 hrs |
| 5 | 9 | Java/C++ Linting | 🟡 Medium | 4 hrs |
| 6 | 10 | Interactive Charts | 🟡 Medium | 3 hrs |
| 7 | 11 | Email Notifications | 🟡 Medium | 2 hrs |
| 8 | 8 | GitHub OAuth | 🟡 Medium | 5 hrs |
| 9 | 8 | Admin Dashboard | 🟡 Medium | 4 hrs |
| 10 | 8 | Team Workspaces | 🔴 High | 8 hrs |
| 11 | 10 | Leaderboard | 🟡 Medium | 4 hrs |
| 12 | 9 | PR Review Integration | 🟡 Medium | 5 hrs |
| 13 | 10 | Real-time Collaboration | 🔴 High | 6 hrs |
| 14 | 11 | GitHub Actions CI/CD | 🟢 Low | 2 hrs |

---

## Phase Dependency Map

```
Phase 7: Quick Wins ────────────────────────────────────────────────────┐
  (No dependencies — safe to start immediately)                         │
  │                                                                      │
  ▼                                                                      │
Phase 8: Auth & Teams ──────────────────────────────┐                   │
  (Requires: DB migration feature_batch_auth_teams)  │                   │
  │                                                  │                   │
  ▼                                                  │                   │
Phase 9: Code Engine ◄──────────────────────────────┘                   │
  (Requires: DB migration complete; GitHub token optional)              │
  │                                                                      │
  ▼                                                                      │
Phase 10: UI & UX ◄─────────────────────────────────────────────────────┘
  (Requires: Phases 7-9 stable; Socket.io server change)
  │
  ▼
Phase 11: DevOps & Alerts
  (Can be done in parallel with Phase 10; Docker/CI independent)
```

---

*This implementation plan extends [implementation-plan.md](file:///d:/Ai%20CRA/Ai-Code-Review-Assistant/Docs/implementation-plan.md). All changes are additive — no existing functionality is broken or modified beyond targeted single-line injections.*

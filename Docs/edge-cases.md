# AI Code Review Assistant — Edge Cases & Corner Cases

> **Derived from:** [architecture.md](file:///d:/Ai CRA/Ai-Code-Review-Assistant/Docs/architecture.md) · [implementation-plan.md](file:///d:/Ai CRA/Ai-Code-Review-Assistant/Docs/implementation-plan.md)  
> **Last Updated:** 2026-07-06  
> **Purpose:** Catalog every known corner case so that no scenario is left unhandled during development.

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Code Submission — Paste](#2-code-submission--paste)
3. [Code Submission — File Upload](#3-code-submission--file-upload)
4. [Language Detection](#4-language-detection)
5. [Static Analysis (ESLint / Pylint)](#5-static-analysis-eslint--pylint)
6. [AI Review (Groq API)](#6-ai-review-groq-api)
7. [Complexity Analysis](#7-complexity-analysis)
8. [Analysis Orchestrator](#8-analysis-orchestrator)
9. [Review Dashboard & History](#9-review-dashboard--history)
10. [Database & Data Integrity](#10-database--data-integrity)
11. [Frontend UI/UX](#11-frontend-uiux)
12. [API & Network](#12-api--network)
13. [Security](#13-security)
14. [Deployment & Environment](#14-deployment--environment)

---

## 1. Authentication & Authorization

### 1.1 Registration

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| A-01 | User registers with an email that already exists | Return `409 Conflict` with message "Email already registered" | 🔴 Critical |
| A-02 | User registers with an email using mixed casing (`User@Gmail.COM`) | Normalize email to lowercase before saving; treat as same account | 🟡 Warning |
| A-03 | User submits empty name or name with only whitespace | Return `400 Bad Request` — name is required and must be trimmed | 🔴 Critical |
| A-04 | User submits extremely long name (>500 chars) | Reject with `400` — enforce 2–50 char limit | 🟡 Warning |
| A-05 | User submits password with only spaces | Reject — password must have at least 1 letter, 1 number, 1 uppercase | 🔴 Critical |
| A-06 | User submits password shorter than 8 characters | Return `400` with clear validation message | 🔴 Critical |
| A-07 | User submits password with unicode/emoji characters | Accept — bcrypt handles arbitrary byte strings; don't restrict charset | 🔵 Info |
| A-08 | User registers with an invalid email format (`not-an-email`) | Return `400` — validate with regex or `express-validator` | 🔴 Critical |
| A-09 | Two concurrent registration requests with the same email | DB unique constraint catches the second one — return `409` | 🟡 Warning |
| A-10 | SQL injection in email/name/password fields | Parameterized queries (Prisma) prevent injection | 🔴 Critical |

### 1.2 Login

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| A-11 | User logs in with correct email but wrong password | Return `401 Unauthorized` — generic "Invalid credentials" message (don't reveal which field is wrong) | 🔴 Critical |
| A-12 | User logs in with non-existent email | Same `401` message as wrong password — prevent user enumeration | 🔴 Critical |
| A-13 | User sends 20+ login attempts in 1 minute | Rate limiter blocks after 5 attempts — return `429 Too Many Requests` with retry-after header | 🔴 Critical |
| A-14 | User logs in from two different browsers simultaneously | Both sessions should work — JWT is stateless | 🔵 Info |
| A-15 | Login request with missing `email` or `password` field | Return `400` with field-level validation errors | 🟡 Warning |

### 1.3 JWT & Token Management

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| A-16 | Access token expires mid-session (after 15 min) | Frontend interceptor catches `401`, calls `/api/auth/refresh`, retries original request transparently | 🔴 Critical |
| A-17 | Both access token AND refresh token are expired | Redirect user to login page; clear all auth state | 🔴 Critical |
| A-18 | User sends a malformed/tampered JWT | Return `401` — `jwt.verify()` throws `JsonWebTokenError` | 🔴 Critical |
| A-19 | User sends a request with `Authorization: Bearer null` or `Bearer undefined` | Return `401` — treat as missing token | 🟡 Warning |
| A-20 | User sends JWT signed with a different secret | Return `401` — signature verification fails | 🔴 Critical |
| A-21 | JWT payload is modified after signing (e.g., changed `userId`) | Return `401` — signature won't match | 🔴 Critical |
| A-22 | Clock skew between server and client causes premature expiry | Use 30-second leeway in `jwt.verify()` options | 🟡 Warning |

### 1.4 Forgot / Reset Password

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| A-23 | User requests password reset for non-existent email | Return `200 OK` with generic message — never reveal whether email exists | 🔴 Critical |
| A-24 | User uses the same reset token twice | Invalidate token after first use — return `400 "Token already used"` | 🔴 Critical |
| A-25 | Reset token expires (e.g., after 1 hour) | Return `400 "Token expired, request a new one"` | 🟡 Warning |
| A-26 | User sets new password identical to old password | Allow it (don't force uniqueness for MVP) | 🔵 Info |

### 1.5 Authorization

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| A-27 | User A tries to access User B's project by guessing the project UUID | Return `403 Forbidden` or `404 Not Found` — query always scoped to `userId` from JWT | 🔴 Critical |
| A-28 | User A tries to delete User B's review | Same — scoped query returns nothing; return `404` | 🔴 Critical |
| A-29 | User sends valid JWT but the user was deleted from the DB | Return `401` — user lookup fails; force re-login | 🟡 Warning |

---

## 2. Code Submission — Paste

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| C-01 | User submits an empty string as code | Return `400 "Code snippet cannot be empty"` | 🔴 Critical |
| C-02 | User submits code that is only whitespace/newlines | Return `400` — trim and check length > 0 | 🔴 Critical |
| C-03 | User submits a single character (`a`) | Accept — valid code (some languages allow single-expression files) | 🔵 Info |
| C-04 | User submits extremely large code snippet (>1 MB) | Reject with `413 Payload Too Large` — Express `json({ limit: '1mb' })` handles this | 🔴 Critical |
| C-05 | User submits code with 10,000+ lines | Accept but warn that analysis may take longer; set timeout on analysis | 🟡 Warning |
| C-06 | User submits code containing null bytes (`\x00`) | Strip null bytes before processing — they can crash linters | 🟡 Warning |
| C-07 | User submits code with mixed line endings (`\r\n`, `\n`, `\r`) | Normalize to `\n` before analysis | 🔵 Info |
| C-08 | User submits code containing only comments | Accept — static analysis will pass cleanly; AI can still review commenting style | 🔵 Info |
| C-09 | User submits binary content disguised as text (e.g., base64 blob) | Detect and reject — check for high ratio of non-printable characters | 🟡 Warning |
| C-10 | User submits code with unicode characters (Chinese variable names, emoji strings) | Accept — modern linters handle unicode; pass through to AI | 🔵 Info |
| C-11 | User submits code without selecting a language | Auto-detect language; if detection fails, default to "text" and skip static analysis | 🟡 Warning |
| C-12 | User submits the same code snippet twice | Allow — create a new review each time (no deduplication for MVP) | 🔵 Info |
| C-13 | User submits code with `<script>` tags (XSS attempt in review display) | React auto-escapes; never use `dangerouslySetInnerHTML` on user code | 🔴 Critical |

---

## 3. Code Submission — File Upload

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| F-01 | User uploads a file with disallowed extension (`.exe`, `.bin`, `.pdf`) | Return `400 "File type not supported"` — whitelist extensions only | 🔴 Critical |
| F-02 | User uploads a `.js` file that is actually a renamed binary | Read first 1 KB — if high ratio of non-printable chars, reject | 🟡 Warning |
| F-03 | User uploads a file larger than 500 KB | Return `400` with file size limit message — Multer rejects before writing | 🔴 Critical |
| F-04 | User uploads more than 5 files at once | Return `400 "Maximum 5 files per submission"` | 🟡 Warning |
| F-05 | User uploads 0 files (empty form submission) | Return `400 "No files provided"` | 🟡 Warning |
| F-06 | User uploads a file with no extension | Reject — cannot determine language without extension | 🟡 Warning |
| F-07 | User uploads a file with double extension (`script.js.py`) | Use the last extension (`.py`) for language detection | 🔵 Info |
| F-08 | User uploads a file with spaces in the filename (`my script.js`) | Sanitize filename — replace spaces with underscores in temp storage | 🔵 Info |
| F-09 | User uploads a file with path traversal in filename (`../../etc/passwd`) | Multer uses random temp filenames — original name only used for display/extension | 🔴 Critical |
| F-10 | File upload interrupted mid-transfer (network drops) | Multer handles incomplete uploads — temp file is cleaned up; return `400` | 🟡 Warning |
| F-11 | User uploads an empty file (0 bytes) | Return `400 "Uploaded file is empty"` | 🟡 Warning |
| F-12 | User uploads a file encoded in UTF-16 or ISO-8859-1 | Detect encoding and convert to UTF-8 before analysis, or reject non-UTF-8 | 🟡 Warning |
| F-13 | Temp file cleanup fails (disk permission error) | Log the error; continue with response — implement periodic cleanup job | 🟡 Warning |
| F-14 | Two users upload files simultaneously | Multer uses unique temp filenames per request — no collision | 🔵 Info |

---

## 4. Language Detection

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| L-01 | File extension is `.jsx` or `.tsx` | Map to `javascript` / `typescript` respectively — use ESLint with JSX parser | 🟡 Warning |
| L-02 | File extension is `.mjs` or `.cjs` | Map to `javascript` | 🔵 Info |
| L-03 | Code content matches multiple languages (ambiguous) | Prefer the user's explicit selection if provided; else use first-match heuristic | 🟡 Warning |
| L-04 | File has `.txt` extension | Skip static analysis — cannot determine language; AI-only review | 🔵 Info |
| L-05 | File has no extension and content is ambiguous | Return `unknown` language — AI review still runs, static analysis skipped | 🟡 Warning |
| L-06 | User manually selects wrong language (e.g., selects "Python" for JS code) | Use user's selection — linter will report syntax errors, AI will adapt | 🔵 Info |
| L-07 | Code contains a shebang (`#!/usr/bin/env python3`) | Use shebang for detection if no file extension available | 🔵 Info |
| L-08 | Code is a mix of HTML + embedded `<script>` + `<style>` | Detect as HTML — skip ESLint/Pylint; AI-only review | 🟡 Warning |

---

## 5. Static Analysis (ESLint / Pylint)

### 5.1 ESLint

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| S-01 | ESLint is not installed on the server | Gracefully skip static analysis — log warning, proceed with AI-only review | 🔴 Critical |
| S-02 | ESLint process times out (>30 seconds) | Kill the process, return partial or no static results, proceed with AI review | 🔴 Critical |
| S-03 | ESLint crashes on malformed code (e.g., unclosed string) | Catch the error — ESLint still outputs JSON with parse error info; normalize it | 🟡 Warning |
| S-04 | Code uses ES2024+ syntax that ESLint doesn't understand | Configure parser for latest ECMAScript version; if still fails, skip | 🟡 Warning |
| S-05 | Code uses JSX but ESLint config doesn't enable JSX parsing | Enable `parserOptions: { ecmaFeatures: { jsx: true } }` | 🟡 Warning |
| S-06 | Code uses TypeScript syntax | Use `@typescript-eslint/parser` if available; else skip static analysis | 🟡 Warning |
| S-07 | ESLint reports 500+ findings on terrible code | Cap at 50 findings in the UI — show "and N more" link; store all in DB | 🟡 Warning |
| S-08 | ESLint JSON output is unexpectedly empty | Treat as "no issues found" — not an error | 🔵 Info |
| S-09 | ESLint returns exit code 1 (lint errors found) | This is normal — ESLint exits with 1 when it finds errors; don't treat as crash | 🔴 Critical |
| S-10 | ESLint config file exists in temp directory from previous run | Use `--no-eslintrc` flag + inline config to isolate from env | 🟡 Warning |

### 5.2 Pylint

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| S-11 | Pylint is not installed on the server (`command not found`) | Skip static analysis — log warning, proceed with AI-only | 🔴 Critical |
| S-12 | Python code has syntax errors that crash Pylint | Pylint still outputs JSON with fatal errors — catch and normalize | 🟡 Warning |
| S-13 | Code uses Python 2 syntax (`print "hello"`) | Pylint reports syntax error — include in findings as-is | 🔵 Info |
| S-14 | Code imports third-party modules not installed on server | Pylint will report `import-error` — include finding but don't crash | 🟡 Warning |
| S-15 | Pylint process hangs (infinite loop in analyzed code) | 30-second timeout kills the process; proceed with AI-only | 🔴 Critical |
| S-16 | Pylint exits with non-zero code | Pylint uses bitmask exit codes (1=fatal, 2=error, 4=warning, etc.) — all are valid output | 🔴 Critical |

### 5.3 General Static Analysis

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| S-17 | Language has no supported linter (e.g., Go, Ruby, Java) | Skip static analysis entirely — proceed to AI-only review | 🟡 Warning |
| S-18 | Two linters produce conflicting findings | Include both — let the user decide; AI may reconcile in its review | 🔵 Info |
| S-19 | Linter temp file path contains spaces or special characters | Quote file paths in shell commands | 🟡 Warning |
| S-20 | Linter output exceeds 10 MB (absurdly large file) | Truncate output parsing at 1000 findings; log a warning | 🟡 Warning |

---

## 6. AI Review (Groq API)

### 6.1 API Availability

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| G-01 | Groq API is completely down (500/502/503) | Return static analysis results only; show banner: "AI review unavailable, showing static analysis only" | 🔴 Critical |
| G-02 | Groq API rate-limits the request (429) | Exponential backoff — retry at 2s, 4s, 8s; max 3 retries | 🔴 Critical |
| G-03 | Groq API key is invalid or expired | Return `503` — log the error; show "AI service configuration error" | 🔴 Critical |
| G-04 | Groq API key is missing from environment | Fail at server startup with clear error message — don't start the server | 🔴 Critical |
| G-05 | Groq API responds but takes >45 seconds | Abort the request with timeout; return static results + timeout notice | 🟡 Warning |
| G-06 | Network timeout between server and Groq | Same as G-05 — timeout and fallback | 🟡 Warning |

### 6.2 Response Parsing

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| G-07 | AI returns valid JSON but with unexpected field names | Use optional chaining and defaults — `response.bugs ?? []` | 🟡 Warning |
| G-08 | AI returns JSON wrapped in markdown code fences (` ```json ... ``` `) | Strip markdown fences before `JSON.parse()` | 🔴 Critical |
| G-09 | AI returns partial JSON (response cut off by `max_tokens`) | Attempt JSON repair (close open brackets/braces); if fails, return raw text | 🟡 Warning |
| G-10 | AI returns completely invalid JSON (plain text response) | Wrap in `{ "raw_response": "..." }` and display as unstructured feedback | 🟡 Warning |
| G-11 | AI returns empty response | Return `503 "AI returned empty response"` — retry once | 🟡 Warning |
| G-12 | AI `overall_score` is outside 0–100 range | Clamp to 0–100: `Math.max(0, Math.min(100, score))` | 🔵 Info |
| G-13 | AI `overall_score` is a string instead of number | Parse with `parseInt()` / `parseFloat()`; default to `null` if NaN | 🔵 Info |
| G-14 | AI returns `line` numbers that don't exist in the submitted code | Accept but flag — display finding without line highlight | 🔵 Info |
| G-15 | AI hallucinates issues that don't exist | No automated mitigation — user must verify; consider adding a "disagree" button in future | 🔵 Info |

### 6.3 Prompt Engineering

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| G-16 | Submitted code is so large it exceeds model context window | Truncate code to last N characters that fit within token limit (~6000 tokens for code); warn user | 🔴 Critical |
| G-17 | Submitted code contains prompt injection attempts (`ignore previous instructions...`) | The system prompt should anchor the AI's role firmly; sanitize code in the prompt (wrap in code fences) | 🔴 Critical |
| G-18 | Code contains sensitive data (API keys, passwords hardcoded) | AI should flag this as a security issue; server should NOT log the code content | 🟡 Warning |
| G-19 | Code is in a language the AI model isn't strong at (e.g., COBOL) | AI will still attempt review — quality may vary; warn user | 🔵 Info |
| G-20 | Static analysis found 0 issues — empty context sent to AI | AI prompt still works — omit the "static analysis findings" section from the prompt | 🔵 Info |

---

## 7. Complexity Analysis

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| X-01 | Code is empty or only comments | Return LOC=0, functions=0, classes=0, CC=1 (base complexity) | 🟡 Warning |
| X-02 | Code has deeply nested conditionals (10+ levels) | Cyclomatic complexity will be very high — display warning rating | 🔵 Info |
| X-03 | Code uses ternary operators (`a ? b : c`) | Count as decision point for cyclomatic complexity | 🔵 Info |
| X-04 | Code uses short-circuit evaluation (`a && b()`) | Count `&&` and `||` as decision points | 🔵 Info |
| X-05 | Code uses arrow functions without `function` keyword | Regex should detect `=>` as function boundary | 🟡 Warning |
| X-06 | Code uses Python decorators — mistaken as function definitions | Regex should match `def ` keyword, not `@decorator` lines | 🟡 Warning |
| X-07 | Code contains string literals with keywords (`"if this then that"`) | Naive regex may over-count; accept inaccuracy for MVP — improve later | 🔵 Info |
| X-08 | Code is in a language where regex function detection doesn't work (e.g., Haskell) | Return `null` for function count — display "Complexity analysis unavailable for this language" | 🟡 Warning |
| X-09 | Code has 0 functions but complex top-level logic | Report file-level complexity; `averageComplexityPerFunction` should gracefully handle division by zero | 🔴 Critical |
| X-10 | Minified/obfuscated code (single very long line) | LOC = 1 but complexity may be enormous — report honestly | 🔵 Info |

---

## 8. Analysis Orchestrator

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| O-01 | Static analysis succeeds but AI review fails | Save review with `reviewType: "static_only"` — partial results are better than nothing | 🔴 Critical |
| O-02 | Static analysis fails but AI review succeeds | Save review with `reviewType: "ai_only"` — include AI findings only | 🔴 Critical |
| O-03 | Both static analysis and AI review fail | Return `500 "Analysis failed completely"` — do NOT save an empty review | 🔴 Critical |
| O-04 | User submits multiple files — one fails analysis, others succeed | Analyze each file independently; return partial results with per-file status | 🟡 Warning |
| O-05 | Database save fails after analysis completes | Return `500 "Failed to save review"` — analysis results are lost; user must retry | 🔴 Critical |
| O-06 | User navigates away / closes browser during analysis | Backend continues processing; save results; user sees them in history when they return | 🟡 Warning |
| O-07 | Analysis takes >60 seconds total | Frontend shows progress indicator; backend has overall timeout of 90 seconds | 🟡 Warning |
| O-08 | Concurrent analysis requests from same user | Allow — each runs independently; no shared state between analyses | 🔵 Info |
| O-09 | AI and static analysis report the same issue (duplicate finding) | Accept duplicates for MVP; future: deduplicate by matching line + issue description | 🔵 Info |
| O-10 | Score calculation results in NaN or Infinity | Default to `null` — display "Score unavailable" in UI | 🟡 Warning |

---

## 9. Review Dashboard & History

### 9.1 Dashboard

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| D-01 | User has 0 reviews (brand new account) | Show empty state: "No reviews yet — start your first code review!" with CTA button | 🟡 Warning |
| D-02 | User has 1,000+ reviews | Dashboard stats queries must be efficient — aggregate with DB, not in-memory | 🟡 Warning |
| D-03 | Average score is NaN (all reviews have `null` scores) | Display "N/A" instead of NaN | 🟡 Warning |
| D-04 | Dashboard data loads slowly (>3 seconds) | Show skeleton loaders, not a blank page | 🔵 Info |

### 9.2 Review Detail

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| D-05 | Review has 0 findings | Show message: "No issues found! Your code looks clean." with a success indicator | 🟡 Warning |
| D-06 | Review has 200+ findings | Paginate findings (20 per page) or virtual scroll; don't render all at once | 🟡 Warning |
| D-07 | Finding has `null` for `suggestedFix` | Show "No fix suggested" or hide the fix section | 🔵 Info |
| D-08 | Finding has `null` for `lineNumber` | Hide line number badge; don't show "Line: null" | 🔵 Info |
| D-09 | Review's `summary` is `null` or empty | Show "No summary available" | 🔵 Info |
| D-10 | User navigates to a review ID that doesn't exist | Return `404` — show styled "Review not found" page | 🟡 Warning |
| D-11 | User navigates to a review that belongs to another user | Return `404` (not `403`) — don't reveal that the review exists | 🔴 Critical |
| D-12 | Original code contains HTML/script tags | Render in `<pre><code>` block — React escapes by default; verify no `dangerouslySetInnerHTML` | 🔴 Critical |

### 9.3 Review History

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| D-13 | Search query returns 0 results | Show "No reviews match your search" with option to clear filters | 🟡 Warning |
| D-14 | Search query is empty string | Return all reviews (unfiltered) | 🔵 Info |
| D-15 | User applies filter that matches 0 reviews | Show empty state with active filter badges | 🟡 Warning |
| D-16 | Pagination — user navigates to page that doesn't exist (`?page=999`) | Redirect to last valid page, or show empty state | 🟡 Warning |
| D-17 | User deletes a review while on the detail page | Redirect to history page with success toast | 🔵 Info |
| D-18 | User deletes last review on current page | Redirect to previous page, or show empty state if no reviews remain | 🔵 Info |
| D-19 | Delete request fails (network error) | Show error toast; don't remove the review from UI | 🟡 Warning |
| D-20 | User double-clicks "Delete" button rapidly | Disable button on first click; prevent duplicate API calls | 🟡 Warning |
| D-21 | Search query contains SQL injection (`'; DROP TABLE reviews; --`) | Prisma parameterized queries prevent injection | 🔴 Critical |
| D-22 | Search query contains special regex characters (`[.*+?^${}()|\\]`) | Escape special characters before using in `LIKE` / `ILIKE` queries | 🟡 Warning |

---

## 10. Database & Data Integrity

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| DB-01 | Database connection drops during a request | Return `503 Service Unavailable`; Prisma auto-reconnects on next request | 🔴 Critical |
| DB-02 | Database connection pool exhausted (all connections in use) | Queue requests; return `503` if wait exceeds 10 seconds | 🔴 Critical |
| DB-03 | User deleted but their projects/reviews remain (orphaned data) | Cascade delete: `onDelete: Cascade` in Prisma schema handles this | 🔴 Critical |
| DB-04 | Project deleted but reviews remain (orphaned data) | Same — cascading deletes clean up reviews and findings | 🔴 Critical |
| DB-05 | UUID collision (astronomically unlikely) | Prisma `@default(uuid())` — collision probability is negligible; DB constraint catches it | 🔵 Info |
| DB-06 | `overallScore` stored as float — precision issues (`78.999999`) | Round to 1 decimal place before saving | 🔵 Info |
| DB-07 | `summary` or `explanation` field exceeds column size | Use `TEXT` type (unlimited length) in PostgreSQL — no truncation | 🔵 Info |
| DB-08 | Concurrent writes to the same review (race condition) | Unlikely in single-user-per-review model; for MVP, no locking needed | 🔵 Info |
| DB-09 | Migration fails on production database | Test migrations in staging first; use `prisma migrate deploy` (not `dev`) in production | 🔴 Critical |
| DB-10 | Database backup/restore loses recent data | Supabase handles automated backups; verify backup frequency | 🟡 Warning |

---

## 11. Frontend UI/UX

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| U-01 | User is on mobile (viewport < 640px) | Sidebar collapses to hamburger menu; code editor goes full-width | 🟡 Warning |
| U-02 | User has JavaScript disabled | Show `<noscript>` message: "This app requires JavaScript" | 🔵 Info |
| U-03 | User pastes 50,000+ chars into code editor | Editor may lag — consider virtual scrolling or warning above 10,000 lines | 🟡 Warning |
| U-04 | User resizes browser window during analysis loading | Loading overlay should remain centered and responsive | 🔵 Info |
| U-05 | User navigates back/forward during analysis | If analysis is pending, show the loading state; don't lose progress | 🟡 Warning |
| U-06 | User's browser doesn't support modern CSS (e.g., IE11) | Not supported — show upgrade browser message | 🔵 Info |
| U-07 | Copy-paste from Word/PDF introduces hidden characters | Strip non-printable characters on paste (except newlines/tabs) | 🟡 Warning |
| U-08 | User switches between dark/light mode mid-session | All components must respect the theme context instantly — no hard-coded colors | 🔵 Info |
| U-09 | Toast notifications stack up (5+ errors at once) | Limit to 3 visible toasts; queue the rest | 🔵 Info |
| U-10 | User submits the form and immediately clicks "Submit" again | Disable submit button during API call; re-enable on completion | 🟡 Warning |
| U-11 | Code display doesn't wrap long lines | Use `overflow-x: auto` and horizontal scrollbar on code blocks | 🔵 Info |
| U-12 | Severity filter badges are not keyboard-accessible | Add `tabIndex`, `role="button"`, and `onKeyDown` handlers | 🔵 Info |

---

## 12. API & Network

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| N-01 | Frontend makes API call but backend is down | Axios interceptor catches network error — show "Server unreachable" toast | 🔴 Critical |
| N-02 | API response takes >10 seconds (slow but not timed out) | Show loading spinner; don't auto-retry | 🟡 Warning |
| N-03 | User loses internet connection mid-session | Detect `navigator.onLine` — show offline banner | 🟡 Warning |
| N-04 | CORS error (frontend domain not whitelisted) | Backend returns CORS error — check `CLIENT_URL` env variable | 🔴 Critical |
| N-05 | API returns `500` with no body | Frontend should handle missing response body gracefully | 🟡 Warning |
| N-06 | API returns HTML error page instead of JSON (proxy error, nginx 502) | Frontend detects non-JSON response — show "Unexpected server error" | 🟡 Warning |
| N-07 | Request payload exceeds Express body limit (>1 MB) | Express returns `413` — frontend shows "Code snippet too large" | 🟡 Warning |
| N-08 | User rapidly navigates between pages, triggering many API calls | Cancel previous requests using `AbortController` / React Query `queryKey` invalidation | 🔵 Info |

---

## 13. Security

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| SEC-01 | Submitted code contains `require('child_process').exec('rm -rf /')` | Code is NEVER executed — only analyzed as text by linters and AI | 🔴 Critical |
| SEC-02 | User submits code designed to exploit ESLint (e.g., malicious `.eslintrc` in code) | Use `--no-eslintrc` flag; isolate temp files in dedicated directory | 🔴 Critical |
| SEC-03 | Groq API key accidentally logged in server output | Never log env variables; use `***` masking in error logs | 🔴 Critical |
| SEC-04 | User tries to access `/.env` or `/api/config` | No such endpoint exists; static file serving is disabled for server | 🔴 Critical |
| SEC-05 | JWT secret is weak (e.g., `"secret123"`) | Enforce minimum 32-character secret in `env.js` validation | 🔴 Critical |
| SEC-06 | HTTPS not enforced in production | Deploy on Vercel/Render which auto-enforce HTTPS | 🔴 Critical |
| SEC-07 | Response headers leak server info (`X-Powered-By: Express`) | Disable with `app.disable('x-powered-by')` | 🟡 Warning |
| SEC-08 | User floods the analysis endpoint (DDoS) | Rate limit: 10 analysis requests per minute per user | 🔴 Critical |
| SEC-09 | Mass assignment — user sends extra fields in request body (`{ "role": "admin" }`) | Only destructure expected fields in controller — ignore unknown fields | 🟡 Warning |
| SEC-10 | Clickjacking — app embedded in malicious iframe | Set `X-Frame-Options: DENY` header | 🟡 Warning |

---

## 14. Deployment & Environment

| # | Edge Case | Expected Behavior | Severity |
|---|---|---|---|
| DEP-01 | `DATABASE_URL` is missing in production | Server should fail to start with clear error: "DATABASE_URL is required" | 🔴 Critical |
| DEP-02 | `GROQ_API_KEY` is missing in production | Server should fail to start with clear error | 🔴 Critical |
| DEP-03 | Production database URL points to development database | Use separate Supabase projects for dev/staging/prod | 🔴 Critical |
| DEP-04 | Frontend `VITE_API_URL` points to `localhost` in production build | Verify env variable at build time; Vite embeds env vars at build time, not runtime | 🔴 Critical |
| DEP-05 | ESLint/Pylint not installed on production server | Include in `package.json` dependencies or Docker image; fail gracefully if missing | 🔴 Critical |
| DEP-06 | Production server runs out of disk space (temp files accumulating) | Implement cleanup cron job or use temp directory with auto-purge | 🟡 Warning |
| DEP-07 | Node.js version mismatch between dev and production | Specify `engines` in `package.json`: `{ "node": ">=18.0.0" }` | 🟡 Warning |
| DEP-08 | Render/Railway free tier spins down after inactivity | First request after spin-down takes ~30 seconds — show "Warming up" message or use paid tier | 🟡 Warning |
| DEP-09 | Supabase free tier connection limit reached | Connection pooling via PgBouncer (Supabase provides this); monitor connections | 🟡 Warning |
| DEP-10 | Build fails on Vercel due to TypeScript/lint errors | Fix errors locally before pushing; set `CI=false` if needed for build (not recommended) | 🟡 Warning |

---

## Summary — Edge Cases by Severity

| Severity | Count | Description |
|---|---|---|
| 🔴 **Critical** | 48 | Must be handled — causes crashes, security holes, or data loss if ignored |
| 🟡 **Warning** | 57 | Should be handled — causes poor UX or degraded functionality |
| 🔵 **Info** | 33 | Nice to handle — improves polish but not essential for MVP |
| **Total** | **138** | |

---

## Priority Matrix — What to Handle First

### Phase 2 (Auth) — Handle These First
`A-01` `A-08` `A-11` `A-12` `A-13` `A-16` `A-17` `A-18` `A-20` `A-27` `A-28`

### Phase 3 (Code Submission) — Handle These Next
`C-01` `C-02` `C-04` `C-13` `F-01` `F-03` `F-09` `F-11`

### Phase 4 (Analysis) — Handle These During Pipeline Development
`S-01` `S-02` `S-09` `S-11` `S-15` `S-16` `G-01` `G-02` `G-03` `G-04` `G-08` `G-16` `G-17` `O-01` `O-02` `O-03` `O-05`

### Phase 5 (Dashboard) — Handle These During UI Development
`D-01` `D-11` `D-12` `D-21` `X-09`

### Phase 6 (Polish) — Handle Remaining Warnings & Info Items
All remaining `🟡 Warning` and `🔵 Info` items

---

*This document should be reviewed alongside the [implementation-plan.md](file:///d:/Ai CRA/Ai-Code-Review-Assistant/Docs/implementation-plan.md) to ensure each edge case is addressed in the correct phase.*

# AI Code Review Assistant

> **Project Type:** Internship Project — Full-Stack Web Application  
> **Status:** Planning & Early Development

---

## Introduction

The **AI Code Review Assistant** is a modern full-stack web application that helps developers improve the quality of their code using **Artificial Intelligence** and **static code analysis tools**.

Instead of waiting for a senior developer to review their code, users can paste individual code snippets into the application. The system automatically analyzes the code and provides detailed feedback on potential bugs, code quality, complexity, best practices, and documentation.

This project exposes students to real-world software engineering concepts such as API integration, authentication, AI-powered applications, code analysis, GitHub integration, and database design. It is an excellent internship-level project because it combines modern web development with practical software engineering workflows.

---

## How It Works

The AI Code Review Assistant acts as an **automated code reviewer**. A user signs in and can either:

- **Paste** one or more code lines *(in scope)*
- **Upload** source code files directly *(in scope)*

The backend retrieves the source code and performs a **two-stage review process**:

### Stage 1 — Static Code Analysis

The system uses programming language-specific tools (such as ESLint, Pylint, or similar) to detect:

| Category | Examples |
|---|---|
| Syntax errors | Missing brackets, invalid tokens |
| Unused variables | Declared but never referenced identifiers |
| Coding standard violations | Style-guide deviations |
| Formatting issues | Indentation, spacing, line length |
| Possible runtime errors | Null dereferences, type mismatches |
| Security warnings | Injection risks, unsafe patterns |

### Stage 2 — AI-Based Review

The analyzed code is then processed by an AI model to provide:

- Bug detection
- Code smell identification
- Suggestions for improvement
- Complexity analysis
- Better variable / function naming
- Performance optimization suggestions
- Code explanation
- Auto-generated documentation
- Refactoring recommendations

The results are displayed in a **clean dashboard** where users can explore each issue along with its severity and suggested solution. Every review is stored in the user's history for future reference.

---

## Project Objectives

| # | Objective |
|---|---|
| 1 | Build a production-like full-stack application |
| 2 | Work with AI APIs (Groq LLM) |
| 3 | Understand static code analysis |
| 4 | Practice authentication and authorization |
| 5 | Design scalable database schemas |
| 6 | Improve frontend UI/UX development |
| 7 | Learn API integration |
| 8 | Practice deployment of full-stack applications |

---

## Core Features

### 1. User Authentication
- Sign Up / Login / Logout
- Forgot Password
- Profile Management

### 2. Code Submission
- Paste source code directly
- Upload source code files
- ~~Submit a public GitHub repository URL~~ *(out of scope)*

### 3. Static Code Analysis
Automatically detect:
- Syntax errors
- Unused variables
- Missing imports
- Duplicate code
- Poor formatting
- Code style violations

### 4. AI Code Review
AI-generated feedback including:
- Bug reports
- Optimization suggestions
- Code smell analysis
- Performance improvements
- Security recommendations
- Best practice recommendations

### 5. Complexity Analysis
Metrics generated:
- Cyclomatic Complexity
- Function Complexity
- File Complexity
- Number of Functions / Classes
- Lines of Code

### 6. Review Dashboard
- View previous reviews
- Search & filter reviews
- Delete reviews
- View detailed reports

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js or Next.js |
| **Styling** | Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL or Supabase |
| **Authentication** | JWT / Clerk / Supabase Auth |
| **AI Integration** | Groq API (LLM) |
| **Static Analysis** | ESLint, Pylint, Sonar-style tools |
| **File Storage** | Local Storage / Supabase Storage |
| **Deployment** | Vercel (frontend) + Render / Railway (backend) |

---

## Database Schema

### Users
| Column | Description |
|---|---|
| `id` | Primary key |
| `name` | User's display name |
| `email` | User's email address |
| `password` | Hashed password |
| `created_at` | Account creation timestamp |

### Projects
| Column | Description |
|---|---|
| `id` | Primary key |
| `user_id` | FK → Users |
| `project_name` | Name of the project |
| `github_url` | Associated GitHub URL |
| `created_at` | Creation timestamp |

### Reviews
| Column | Description |
|---|---|
| `id` | Primary key |
| `project_id` | FK → Projects |
| `review_type` | Static / AI / Combined |
| `overall_score` | Numeric quality score |
| `summary` | Review summary text |
| `created_at` | Review timestamp |

### Review Findings
| Column | Description |
|---|---|
| `id` | Primary key |
| `review_id` | FK → Reviews |
| `severity` | Critical / Warning / Info |
| `issue` | Issue description |
| `explanation` | Detailed explanation |
| `suggested_fix` | Recommended fix |
| `file_name` | Source file name |
| `line_number` | Affected line number |

---

## Use Cases

| Persona | Scenario |
|---|---|
| **Student** | Uploads their assignment before submission to identify bugs and improve code quality |
| **Internship Prep** | Reviews personal projects before adding them to their resume |
| **Software Developer** | Analyzes pull requests before sending them for peer review |
| **Coding Bootcamp** | Instructors ask students to review code via the app before submitting assignments |
| **Freelancer** | Improves client project quality using automated reviews |
| **Small Dev Team** | Quickly performs code reviews without requiring a senior developer for every change |

---

## Two-Week Development Schedule

| Day | Tasks |
|---|---|
| **Day 1** | Project planning, requirement analysis, UI wireframes, Git repo setup |
| **Day 2** | Design database schema and implement user authentication |
| **Day 3** | Build dashboard layout, navigation, and routing |
| **Day 4** | Implement code snippet upload and storage |
| **Day 5** | ~~Integrate GitHub Repository API~~ *(out of scope)* |
| **Day 6** | Integrate static code analysis tools (ESLint / Pylint) |
| **Day 7** | Display static analysis results in a structured dashboard |
| **Day 8** | Integrate AI model for code review and explanation |
| **Day 9** | Add complexity analysis and code smell reporting |
| **Day 10** | Generate documentation for functions, classes, and APIs |
| **Day 11** | Implement review history, search, and filtering |
| **Day 12** | Testing, debugging, validation, and error handling |
| **Day 13** | Improve UI/UX, optimize performance, and refactor code |
| **Day 14** | Deploy the application, prepare documentation, and present the project |

---

## Scope Notes

- **In Scope:** Paste code snippets, upload source files, static analysis, AI review, dashboard, auth, review history.
- **Out of Scope:** GitHub repository URL integration (marked for future consideration).

---

*Generated from project documentation on 2026-07-06.*

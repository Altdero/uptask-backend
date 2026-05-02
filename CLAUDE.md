# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with nodemon + ts-node (port 4000)
npm run build     # Compile TypeScript to dist/
npm run start     # Run compiled output (production)
npm run lint      # Run ESLint
npm run lint:fix  # Auto-fix ESLint issues
npm run format    # Format with Prettier
```

There are no test commands configured.

## Environment

Copy `.env.example` to `.env` and set:
- `DATABASE_URL` — MongoDB Atlas connection string
- `FRONTEND_URL` — frontend origin for CORS (e.g. `http://localhost:3000`)
- `JWT_SECRET` — secret for signing JWTs
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Nodemailer SMTP credentials for email sending

## Architecture

Express 5 + TypeScript + MongoDB (Mongoose). Entry point: `src/index.ts` → `src/server.ts`.

**Request flow:** Route → Middleware (auth/validation/project/task) → Controller → Model

**API surface:**
- `POST/GET /api/auth/*` — register, login, confirm email, password reset, profile
- `GET/POST/PUT/DELETE /api/projects` — project CRUD
- `/api/projects/:projectId/tasks/*` — task CRUD nested under projects
- `/api/projects/:projectId/team/*` — team member management
- `/api/projects/:projectId/tasks/:taskId/notes/*` — notes on tasks

**Middleware chain for protected project/task routes:**
1. `middleware/auth.ts` — verifies JWT, attaches `req.user`
2. `middleware/project.ts` — loads project by param, attaches `req.project`; checks manager role where needed
3. `middleware/task.ts` — loads task, validates it belongs to the project, checks ownership for notes

**Data relationships:**
- `Project` embeds arrays of `Task` ObjectIds and `team` (User) ObjectIds; `manager` is a User ref
- `Task` embeds `notes` (Note ObjectIds) and `completedBy` history
- `Token` model is used solely for password-reset flows (short-lived, deleted after use)
- Deleting a project cascades to delete its tasks and their notes (handled in `ProjectController`)

**Path aliases** (configured in `tsconfig.json`):
- `@/config`, `@/controllers`, `@/middleware`, `@/models`, `@/routes`, `@/utils`, `@/emails`
- Resolved at runtime via `tsconfig-paths` — registered through the `ts-node.require` field in `tsconfig.json`

**Formatting:** Prettier with 180-char line width, 2-space indent, trailing commas everywhere.

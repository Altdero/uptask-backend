# UpTask — Backend

REST API for UpTask, a project management app inspired by tools like Jira. Users can create projects, manage tasks with a defined workflow, collaborate with team members, and leave notes on tasks.

## Stack

- **Node.js** + **Express 5** + **TypeScript**
- **MongoDB** via Mongoose
- **JWT** for authentication
- **Nodemailer** for transactional emails (account confirmation, password reset)
- **Zod** for request validation
- **Swagger UI** (`swagger-jsdoc` + `swagger-ui-express`) for API docs

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Start dev server (port 4000)
npm run dev
```

### Environment Variables

| Variable       | Description                                                |
| -------------- | ---------------------------------------------------------- |
| `NODE_ENV`     | Runtime environment (`development` or `production`)        |
| `DATABASE_URL` | MongoDB Atlas connection string                            |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:3000`)    |
| `BACKEND_URL`  | Server's own origin — used for CORS and Swagger server URL |
| `JWT_SECRET`   | Secret for signing JWTs                                    |
| `SMTP_HOST`    | Nodemailer SMTP host                                       |
| `SMTP_PORT`    | Nodemailer SMTP port                                       |
| `SMTP_USER`    | Nodemailer SMTP username                                   |
| `SMTP_PASS`    | Nodemailer SMTP password                                   |

## API Overview

| Resource | Endpoints                                                                        |
| -------- | -------------------------------------------------------------------------------- |
| Auth     | `POST/GET /api/auth/*` — register, login, confirm email, password reset, profile |
| Projects | `GET/POST/PUT/DELETE /api/projects`                                              |
| Tasks    | `/api/projects/:projectId/tasks/*`                                               |
| Team     | `/api/projects/:projectId/team/*`                                                |
| Notes    | `/api/projects/:projectId/tasks/:taskId/notes/*`                                 |

All project/task routes require a valid JWT (`Authorization: Bearer <token>`).

Interactive API docs are available at `GET /api/docs`.

## Task Statuses

`pending` → `onHold` → `inProgress` → `underReview` → `completed`

## Project Roles

- **Manager** — the user who created the project; can edit/delete the project and manage the team
- **Team member** — can create and update tasks, add notes

## Scripts

```bash
npm run dev        # Dev server with nodemon + ts-node (port 4000)
npm run build      # Compile TypeScript to dist/
npm run start      # Run compiled output (production)
npm run typecheck  # tsc --noEmit
npm run validate   # lint + typecheck
npm run lint       # ESLint
npm run lint:fix   # Auto-fix lint issues
npm run format     # Prettier
```

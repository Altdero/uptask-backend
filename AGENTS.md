# AGENTS.md — UpTask Backend

Project documentation for AI agents working on this codebase.

## Project

UpTask is a Jira-like project management REST API. Users create projects, manage tasks through a defined workflow, collaborate with team members, and leave notes on tasks. This is a back-end-only service built as a reference for a separate front-end.

**Stack:** Express 5 · TypeScript · MongoDB (Mongoose) · JWT · Nodemailer  
**Port:** 4000 (dev) · Entry: `src/index.ts` → `src/server.ts`

---

## Commands

```bash
npm run dev        # Dev server with nodemon + ts-node
npm run dev:api    # Same + --api flag (enables CORS for REST clients like Postman)
npm run build      # Compile TypeScript to dist/
npm run start      # Run compiled output
npm run typecheck  # tsc --noEmit
npm run validate   # lint + typecheck
npm run lint       # ESLint
npm run lint:fix   # ESLint auto-fix
npm run format     # Prettier
```

---

## Environment Variables

Copy `.env.example` to `.env`:

| Variable       | Description                                        |
| -------------- | -------------------------------------------------- |
| `DATABASE_URL` | MongoDB Atlas connection string                    |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `http://localhost:3000`) |
| `JWT_SECRET`   | Secret for signing JWTs                            |
| `SMTP_HOST`    | Nodemailer SMTP host                               |
| `SMTP_PORT`    | Nodemailer SMTP port                               |
| `SMTP_USER`    | Nodemailer SMTP user                               |
| `SMTP_PASS`    | Nodemailer SMTP password                           |

Default SMTP in `.env.example` points to Mailtrap sandbox.

---

## Architecture

**Request flow:** Route → Middleware (auth → project → task → validation) → Controller → Model

### Folder structure

```
src/
├── config/         # db.ts, cors.ts, nodemailer.ts
├── controllers/    # Named export functions, one file per resource
├── emails/         # AuthEmail.ts — email template logic
├── middleware/     # auth.ts, project.ts, task.ts, validation.ts
├── models/         # Mongoose schemas — User, Project, Task, Note, Token
├── routes/         # authRoutes.ts, projectRoutes.ts, index.ts
├── validations/    # express-validator rule arrays, one file per resource
└── utils/          # jwt.ts, auth.ts (hashing), token.ts (OTP)
```

> `src/config/dbConnection.ts` is a duplicate of `db.ts` — it exists but is unused.

---

## Path Aliases

All `@/` imports resolve to `src/`:

| Alias             | Resolves to         |
| ----------------- | ------------------- |
| `@/config/*`      | `src/config/*`      |
| `@/controllers/*` | `src/controllers/*` |
| `@/emails/*`      | `src/emails/*`      |
| `@/middleware/*`  | `src/middleware/*`  |
| `@/models/*`      | `src/models/*`      |
| `@/routes/*`      | `src/routes/*`      |
| `@/utils/*`       | `src/utils/*`       |
| `@/validations/*` | `src/validations/*` |

Always use `@/` aliases for imports within `src/`. Never use relative paths that cross folder boundaries.

---

## Code Conventions

### TypeScript

- `strict: false` — no implicit any enforcement; type where it matters
- Always use `import type` for type-only imports
- Custom request fields are globally augmented on `Express.Request` (see middleware)

### Naming

- **Files:** PascalCase for models and controllers (`User.ts`, `AuthController.ts`); camelCase for utils and config (`jwt.ts`, `cors.ts`)
- **Functions:** camelCase (`createProject`, `findMemberByEmail`)
- **Routes:** kebab-case paths (`/create-account`, `/forgot-password`)
- **Controllers:** one file per resource, all named exports (no classes)
- **Validations:** one file per resource in `src/validations/`, named `<action>Schema` (e.g. `createProjectSchema`). Each schema is a `{ body?, params? }` object containing Zod schemas. Shared sub-schemas (password, mongoId) are defined once and composed. Route files use `validate(schema)` from `@/middleware/validation` — never inline validation logic in route definitions.

### Imports order (enforced by ESLint)

1. Node built-ins
2. External packages
3. Internal `@/` aliases
4. Relative paths

Blank line between each group.

### Formatting

- Prettier: 180-char line width, 2-space indent, single quotes, trailing commas (es5), semicolons
- Run `npm run format` before committing

### Error handling

- **Controller errors:** `res.status(code).json({ error: string })`
- **Validation errors:** `res.status(400).json({ errors: { path, message }[] })` — handled by the `validate` middleware factory
- **Success text responses:** `res.send(string)` for mutations, `res.json(data)` for queries
- Wrap async controller bodies in try/catch; catch block should always return a response

### Git hooks (Husky)

- **pre-commit:** lint-staged runs Prettier then ESLint on staged files
- **pre-push:** `npm run validate` (lint + typecheck)

---

## Middleware

### `authenticate` (`middleware/auth.ts`)

Verifies JWT from `Authorization: Bearer <token>` header. Attaches `req.user` (fields: `_id`, `name`, `email`). Returns 401 if no token.

### `projectExists` (`middleware/project.ts`)

Loads project from DB using `:projectId` param. Attaches `req.project`. Returns 404 if not found.

### `hasAuthorization` (`middleware/task.ts`)

Checks `req.user._id === req.project.manager._id`. Returns 400 if not the manager.

### `taskExists` (`middleware/task.ts`)

Loads task from DB using `:taskId` param. Attaches `req.task`. Returns 404 if not found.

### `taskBelongsToProject` (`middleware/task.ts`)

Validates `req.task.project === req.project._id`. Returns 400 if mismatch.

### `handleInputErrors` (`middleware/validation.ts`)

Runs after `express-validator` chains. Returns 400 with `{ errors }` array if any validation failed.

---

## Models

### User

```
email       String  required, lowercase, unique
password    String  required (bcrypt hash)
name        String  required
confirmed   Boolean default: false
```

### Project

```
projectName String  required, trim
clientName  String  required, trim
description String  required, trim
tasks       [Task]  ObjectId refs
team        [User]  ObjectId refs
manager     User    ObjectId ref
timestamps  true
```

Cascade deletes all Notes then Tasks on project deletion (pre-hook).

### Task

```
name         String    required, trim
description  String    required, trim
project      Project   ObjectId ref
status       TaskStatus  enum, default: 'pending'
completedBy  [{ user: User, status: TaskStatus }]
notes        [Note]    ObjectId refs
timestamps   true
```

Cascade deletes all Notes on task deletion (pre-hook).

**`TaskStatus` enum values:** `pending` · `onHold` · `inProgress` · `underReview` · `completed`

### Note

```
content    String  required
createdBy  User    ObjectId ref, required
task       Task    ObjectId ref, required
timestamps true
```

### Token

```
token      String  required (6-digit numeric OTP)
user       User    ObjectId ref
expiresAt  Date    TTL: 10 minutes (auto-deleted by MongoDB)
```

Used only for email confirmation and password reset flows. Deleted after use.

---

## Data Relationships

- `Project` → embeds array of `Task` ObjectIds and `team` (User) ObjectIds; `manager` is a User ref
- `Task` → embeds `notes` (Note ObjectIds) and `completedBy` history
- `Note` → belongs to a Task, authored by a User
- `Token` → belongs to a User; short-lived, consumed on use

---

## API Surface

### Auth — `/api/auth`

| Method | Path                      | Auth | Description                        |
| ------ | ------------------------- | ---- | ---------------------------------- |
| POST   | `/create-account`         | —    | Register a new user                |
| POST   | `/confirm-account`        | —    | Confirm email with OTP             |
| POST   | `/login`                  | —    | Login, returns JWT                 |
| POST   | `/request-code`           | —    | Re-send confirmation OTP           |
| POST   | `/forgot-password`        | —    | Send password reset OTP            |
| POST   | `/validate-token`         | —    | Validate reset OTP                 |
| POST   | `/update-password/:token` | —    | Set new password with OTP          |
| GET    | `/user`                   | JWT  | Get current user profile           |
| PUT    | `/profile`                | JWT  | Update name and email              |
| POST   | `/update-password`        | JWT  | Change password (requires current) |
| POST   | `/check-password`         | JWT  | Verify current password            |

### Projects — `/api/projects` (all require JWT)

| Method | Path          | Manager only | Description                         |
| ------ | ------------- | ------------ | ----------------------------------- |
| POST   | `/`           | —            | Create project                      |
| GET    | `/`           | —            | List own projects (manager or team) |
| GET    | `/:id`        | —            | Get project with tasks              |
| PUT    | `/:projectId` | YES          | Update project                      |
| DELETE | `/:projectId` | YES          | Delete project (cascades)           |

### Tasks — `/api/projects/:projectId/tasks`

| Method | Path              | Manager only | Description                     |
| ------ | ----------------- | ------------ | ------------------------------- |
| POST   | `/`               | YES          | Create task                     |
| GET    | `/`               | —            | List project tasks              |
| GET    | `/:taskId`        | —            | Get task with notes and history |
| PUT    | `/:taskId`        | YES          | Update task name/description    |
| DELETE | `/:taskId`        | YES          | Delete task                     |
| POST   | `/:taskId/status` | —            | Update task status              |

### Team — `/api/projects/:projectId/team`

| Method | Path       | Description           |
| ------ | ---------- | --------------------- |
| POST   | `/find`    | Find user by email    |
| GET    | `/`        | List team members     |
| POST   | `/`        | Add member by user ID |
| DELETE | `/:userId` | Remove member         |

### Notes — `/api/projects/:projectId/tasks/:taskId/notes`

| Method | Path       | Description     |
| ------ | ---------- | --------------- |
| POST   | `/`        | Create note     |
| GET    | `/`        | List notes      |
| DELETE | `/:noteId` | Delete own note |

---

## Auth Flow

**Registration:** `createAccount` → hash password → create 6-digit OTP Token → send confirmation email → save user + token

**Email confirmation:** `confirmAccount` → find token → mark user as confirmed → delete token

**Login:** `login` → verify email + password → if unconfirmed resend token → return JWT (expires in 180 days)

**Password reset:** `forgotPassword` → create OTP token → send email → `validateToken` → `updatePasswordWithToken` → hash new password → delete token

---

## Validation

Validation uses **Zod**. Each schema file exports `{ body?, params? }` objects. The `validate` factory in `middleware/validation.ts` consumes them:

```ts
// definition
export const createProjectSchema = { body: projectBody };

// route
router.post('/', validate(createProjectSchema), createProject);
```

Shared primitives (`mongoId`, `passwordField`, `emailField`, `passwordWithConfirmation`) are defined once per file and composed into the exported schemas. Transforms (e.g. `.transform(v => v.toLowerCase())`) run on `req.body` assignment — the controller receives the transformed value.

**Error response format:**

```json
{ "errors": [{ "path": ["fieldName"], "message": "Validation message" }] }
```

---

## Reference: express-validator pattern

> This project previously used express-validator. Pattern kept for reference in case it's useful in other projects.

Validation rules lived in `src/validations/` as named arrays (`<action>Rules`), imported into routes alongside `handleInputErrors`:

```ts
// definition
export const createProjectRules = [body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio')];

// route
router.post('/', createProjectRules, handleInputErrors, createProject);
```

Shared sub-rules (password, mongoId params) were extracted as constants and spread into exported arrays. `handleInputErrors` middleware called `validationResult(req)` and returned 400 if any errors were found.

---

## Known Issues

These exist in the original codebase — fix only when in scope:

- `auth` middleware returns 500 (instead of 401) for invalid/expired tokens
- `ProjectController` catch blocks log to console but don't always return a response
- `dbConnection.ts` is dead code (duplicate of `db.ts`, never imported)
- `IToken` interface declares `createdAt` but schema uses `expiresAt`
- Validation messages are in Spanish; success/error messages are in English
- `hasAuthorization` returns 400 (instead of 403) for non-manager access

# LLM Implementation Prompt — PGCIT Final Project (Personal Blogging System)

You are an autonomous coding agent. Implement the full project described below in this workspace. **Do not ask questions**; make reasonable defaults, document them in a short **Assumptions** section in `README.md`, and proceed.

## Objective

Build a **personal blogging system** with:

- **Website**: Svelte frontend with responsive UI and good usability
- **Backend**: Node.js + Express REST API
- **Database**: SQL database with `db-init.sql` for schema + seed data
- **Admin app**: Java Swing desktop client that manages users via the backend API (HTTP)

This must cover requirements equivalent to:

- User accounts (register/login/logout/profile/edit/delete, avatar options)
- Articles (CRUD, WYSIWYG editor, images + optional header image)
- Comments (nested replies to any depth; delete permissions)
- Search + sort
- Admin REST API endpoints and Swing requirements
- One **custom feature** beyond the list (choose a safe, shippable one)

## Hard constraints

- **Keep dependencies minimal** and aligned with what is commonly taught for Node/Express/Svelte/SQL. Use **`bcrypt`** (password hashing) and **`multer`** (uploads). Do not introduce heavy frameworks.
- Enforce **server-side authorization** (never rely on frontend-only checks).
- Prefer a setup that runs easily on a grader machine (simple commands, sane defaults).

## Deliverables (must exist in repo when done)

- `db/db-init.sql` (or `db-init.sql` at repo root): creates schema + seeds demo data
- `README.md` with:
  - project/team name (placeholder OK)
  - setup steps (backend + frontend + DB + Swing)
  - at least **two demo users + passwords**
  - API documentation (routes, auth rules, status codes)
  - description of all pages/features
  - how to run and use the Swing admin app
- Working website + API + Swing app

## Target repo layout (create if missing)

Use this structure unless the workspace already has an established one:

```
/
  backend/
    package.json
    src/
      app.js
      db/
      middleware/
      routes/
      services/
      util/
    uploads/
      avatars/
      article-images/
      header-images/
  frontend/
    package.json
    src/
  swing-admin/
    (Maven or Gradle project)
  db/
    db-init.sql
```

If a different structure already exists, **integrate into it** instead of duplicating.

## Technology decisions (use these defaults)

### Backend auth (deterministic, no extra auth libs required)

- Implement **session auth** using an **HTTP-only cookie** `sid` that stores a **random session token**.
- Store sessions in SQL in a `sessions` table with `token_hash`, `user_id`, `expires_at`, `created_at`.
- Hash session tokens in DB (e.g., SHA-256) so leaked DB doesn’t expose raw tokens.
- Implement middleware:
  - `requireAuth`
  - `requireAdmin`
  - `requireArticleAuthorOrAdmin` (if needed)

### SQL database

- Use an embedded SQL DB if possible (simple setup). If you implement SQLite, include a Node driver and store the DB file under `backend/data/`.
- If the workspace already uses a server DB (e.g., MySQL), keep it.

### Frontend

- Use Svelte with a standard router approach (SvelteKit or Vite+Svelte). If the workspace already uses one, keep it.
- Use fetch-based API client wrapper that:
  - sends credentials (`credentials: "include"`) for cookie sessions
  - normalizes error handling

### WYSIWYG

- Use **TinyMCE** (CDN or package). Keep toolbar minimal but sufficient for rich text.
- Support image embedding via a backend upload endpoint returning a public URL.

### Uploads

- Use `multer` with:
  - file type validation (images only)
  - size limits
  - safe filenames (avoid user-provided raw names)
- Serve uploads via controlled static routes (do not expose arbitrary filesystem paths).

## Data model (SQL) — implement in `db-init.sql`

Create at least these tables (names may vary but keep the fields/constraints):

- `users`
  - `id` PK
  - `username` UNIQUE NOT NULL
  - `password_hash` NOT NULL
  - `real_name`, `dob`, `bio`
  - avatar:
    - `avatar_type` (`predefined` | `upload`)
    - `avatar_key` (predefined id) and/or `avatar_path` (uploaded file path)
  - `is_admin` BOOLEAN NOT NULL DEFAULT 0
  - timestamps

- `articles`
  - `id` PK
  - `author_user_id` FK → `users.id` (ON DELETE CASCADE)
  - `title` NOT NULL
  - `content_html` NOT NULL
  - optional `header_image_path`
  - timestamps

- `comments`
  - `id` PK
  - `article_id` FK → `articles.id` (ON DELETE CASCADE)
  - `author_user_id` FK → `users.id` (ON DELETE CASCADE)
  - `parent_comment_id` nullable FK → `comments.id` (ON DELETE CASCADE or SET NULL; choose one and be consistent)
  - `content` NOT NULL
  - `created_at`

- `images` (optional but recommended if you want metadata)
  - `id` PK, `owner_user_id` FK, `article_id` nullable FK, `path`, `mime`, `created_at`

- `sessions`
  - `id` PK
  - `token_hash` UNIQUE NOT NULL
  - `user_id` FK → `users.id` (ON DELETE CASCADE)
  - `expires_at`, `created_at`

Seed data must include:

- At least 2 non-admin users with known passwords
- At least 1 admin user for Swing testing
- A few sample articles and comments (including nested replies)

## REST API requirements (implement all)

All endpoints:

- Return JSON (except where returning images)
- Use appropriate HTTP status codes
- Enforce auth/authorization server-side
- Use `credentials: include` cookie auth

### Auth (required)

- `POST /api/login`
  - Body: `{ "username": string, "password": string }`
  - 200: sets `sid` cookie; returns `{ id, username, realName, isAdmin, ... }`
  - 401: invalid credentials

- `POST /api/logout` (or `GET /api/logout`)
  - 204: clears cookie and deletes session

- `GET /api/me`
  - 200: current logged-in user profile
  - 401: not logged in

### Username availability (required “immediate” feedback)

- `GET /api/users/exists?username=...`
  - 200: `{ "available": boolean }`

### User self-service (website)

- `POST /api/users` (register)
  - Validate username rules, password match handled in frontend but **also validate** basics server-side
  - Hash password with bcrypt

- `PATCH /api/users/me` (edit profile)
  - Allow username change (must remain unique)
  - Allow real name, dob, bio updates
  - Allow choosing predefined avatar

- `DELETE /api/users/me` (delete own account)
  - Must delete user and all their content (articles/comments) via cascades

- `POST /api/users/me/avatar` (upload avatar)
  - multipart/form-data image upload

- `GET /api/users/:id/avatar`
  - Return avatar image (predefined or uploaded). Use caching headers if easy.

### Articles

- `GET /api/articles`
  - Supports:
    - `q=...` search in title + content (case-insensitive)
    - `sort=title|username|date` and `order=asc|desc`
    - optional `mine=true` (only current user)
  - Return list with author username and created date

- `POST /api/articles` (create, auth required)

- `GET /api/articles/:id` (view one)
  - Include author info and header image URL if present

- `PATCH /api/articles/:id` (edit, author-only)

- `DELETE /api/articles/:id` (delete, author-only)

- `POST /api/articles/:id/header-image` (optional but recommended for full marks)
  - upload/replace/remove header image

- `POST /api/articles/:id/images` (for editor embedded images)
  - returns `{ url: "..." }` (or array) suitable for TinyMCE insertion

### Comments (nested, any depth)

- `GET /api/articles/:id/comments`
  - Return either:
    - flat array with `parentCommentId`, OR
    - nested tree
  - Must support unlimited depth in UI

- `POST /api/articles/:id/comments` (auth required)
  - Body: `{ "content": string, "parentCommentId": number|null }`

- `DELETE /api/comments/:id`
  - Allowed if requester is:
    - the comment author, OR
    - the article author (moderation)

### Admin-only endpoints (required for Swing)

- `GET /api/users`
  - Admin-only
  - Return list including `articleCount`
  - 401 unauthenticated, 403 not admin

- `DELETE /api/users/:id`
  - Admin-only
  - 204 on success

## Frontend requirements (Svelte)

Implement pages/features:

- **Register**
  - Live username availability check (`/api/users/exists`)
  - Password confirmation with inline validation (no `alert()`)
  - Avatar selection: predefined and/or upload

- **Login/Logout**

- **Profile**
  - Edit username/real name/dob/bio/avatar
  - Delete account

- **Article list**
  - Show all articles
  - “My articles” view (or toggle)
  - Search + sort controls with good UX

- **Article detail**
  - Render WYSIWYG HTML content
  - Header image display if present
  - Comments section with nested replies

- **Article editor**
  - TinyMCE (or approved WYSIWYG) with:
    - formatting tools
    - image embed using backend upload endpoint
  - Create/edit/delete article controls with proper permissions

- **Comments UI**
  - Recursive component to display unlimited nesting
  - Reply per comment
  - Delete buttons visible only when permitted

- **Responsive design**
  - Mobile/tablet/desktop layouts tested and consistent

## Swing admin app requirements (Java Swing)

Build a single-window Swing app:

- Login form (username/password) + Login/Logout buttons
- Users table (`JTable`) showing at least:
  - username, real name, dob, article count (and any other helpful fields)
- Selected user details panel:
  - username displayed
  - avatar thumbnail **centered**
- Delete selected user button

Non-freezing requirement:

- All network calls must be async via `SwingWorker` (or equivalent):
  - login
  - fetch `/api/users`
  - fetch avatar image on row selection
  - delete user

UI behavior:

- Disable login when logged in; disable logout when logged out
- Disable delete unless logged in and a row is selected

HTTP details:

- Use Java `HttpClient`
- Maintain session (cookie) or token:
  - If backend uses cookie sessions, implement a simple cookie manager to store and resend `Set-Cookie` value

## Custom feature (choose one and implement end-to-end)

Pick ONE safe feature and implement DB + API + UI for it. Choose from:

- **Tags + tag filtering**
- **Draft vs Published** for articles
- **Bookmarks** (save articles)

Prefer the simplest to deliver cleanly. Document it in `README.md`.

## Definition of Done (acceptance checks)

You are done only when all are true:

- Backend starts with one command and serves API without crashes
- Frontend starts with one command and can:
  - register, login, logout
  - edit profile + avatar
  - create/edit/delete articles with WYSIWYG + embedded images
  - search/sort articles
  - create nested comments and display unlimited nesting
  - delete comments with correct permissions
- Admin:
  - `GET /api/users` and `DELETE /api/users/:id` require admin
  - Swing app can login, list users, show centered avatar, delete user without freezing
- `db-init.sql` builds schema and seeds demo data
- `README.md` includes required information and at least two demo logins

## Implementation order (follow this)

1. Create/confirm repo structure and dependencies
2. Implement DB schema + seed (`db-init.sql`) and DB access layer
3. Implement backend auth + users endpoints
4. Implement articles + uploads endpoints
5. Implement comments (flat retrieval + frontend tree build)
6. Build frontend pages and API client wrapper
7. Build Swing admin client (async HTTP + cookie handling)
8. Add the custom feature end-to-end
9. Final polish: validation, error handling, status codes, README

## Output expectations while working

As you implement, keep changes cohesive:

- Prefer small, clear modules
- Keep route handlers thin; put DB logic into a small repository/service layer
- Use consistent JSON shapes and error responses
- Add minimal but useful inline comments only where clarity is needed


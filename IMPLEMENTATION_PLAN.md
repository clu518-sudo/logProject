# PGCIT Final Project — Implementation Plan (A Personal Blogging System)

This plan is written to match the requirements in `PGCIT-Project-Brief-LY-2025.pdf`, including website features (Req. 1–20), admin REST API, and the Java Swing admin app.

## Goals and constraints (from the brief)

- **Build**: A blogging website (Svelte frontend + Node.js backend + SQL database).
- **Must-have**:
  - User accounts (Req. 1–7)
  - Articles + WYSIWYG + images (Req. 8–12)
  - Nested comments to any depth (Req. 13–16)
  - Responsive + consistent UI, good usability (Req. 17–19)
  - Add at least one **custom feature** beyond the list (Req. 20) and get it approved at check-in.
  - Admin REST API endpoints (explicit requirements include `/api/login`, `/api/logout`, `/api/users`, `/api/users/:id`)
  - Java Swing admin interface (Req. Swing 1–13) using HTTP calls to the backend.
- **Deliverables**:
  - **Check-in**: risk plan, sprint backlog + task allocation, ER diagram + API design, optional wireframes (due Feb 5).
  - **Source code due**: Feb 13 (include `db-init.sql` + `README.md` with required contents).
  - **Presentation**: Feb 16.
  - **Individual report**: Feb 17 (architecture, contributions, taught vs not-taught topics, AI use, teamwork reflection).
- **Important constraint**: Avoid third‑party libraries beyond those taught **unless** you have permission (TinyMCE is suggested for WYSIWYG; bcrypt/multer are expected/referenced).
- **Git workflow** (if using GitHub as required in class): feature branches + PRs; no direct commits to main.

## Proposed architecture (high-level)

- **Frontend (Svelte)**: Pages/components for auth, article list/search/sort, article view, editor (TinyMCE), profile management, nested comments UI.
- **Backend (Node.js/Express)**:
  - REST API for website + admin Swing client (shared endpoints where possible).
  - Auth using a **cookie session** (simple and beginner-friendly): login sets an HTTP-only cookie; backend checks it on each request.
  - File uploads for avatars + article images using `multer` and controlled static serving.
- **Database (SQL)**:
  - Tables for users, articles, comments, images (and optionally sessions).
  - Enforce referential integrity with FKs and cascade deletes where required.

## Key dates → milestone plan

### By Feb 5: Planning package + design check-in

- **Risk mitigation plan** (deliverable):
  - Scope risk: cut list of “nice-to-haves”; prioritize core requirements first.
  - Integration risk (frontend↔backend↔DB): early “thin vertical slice” (login → create article → view article).
  - WYSIWYG + images risk: implement TinyMCE editor early with minimal toolbar, then add image handling.
  - Nested comments risk: implement DB model + recursive UI early (Svelte recursion).
  - Swing risk: implement minimal login/users table early, then add async avatar fetch + delete.
- **Sprint backlog + initial allocation** (deliverable):
  - Create a board with epics: Auth, Profiles/Avatars, Articles/Editor/Images, Comments/Nesting, Search/Sort, Admin API, Swing UI, Polish/UX, Docs/Submission.
- **ER diagram + API design** (deliverable):
  - Draft schema and endpoint list (see below).
- **Optional wireframes**:
  - Basic wireframes for: Home/article list, article detail, editor, profile, admin views (Swing).

Docs (ready to submit/share at check-in):
- `RISK_MITIGATION_PLAN.md`
- `SPRINT_BACKLOG_ALLOCATION.md`
- `PLANNING_INITIAL_DESIGN.md` (includes ER diagram + API design)
- `WIREFRAMES.md`

### By Feb 13: “Feature complete” + submission-ready repo

- Complete all compulsory requirements (Req. 1–19 + admin API + Swing).
- Implement at least one approved **custom feature** (Req. 20).
- Produce submission artifacts:
  - `db-init.sql` with `CREATE TABLE` + seed data (including test accounts and sample content).
  - `README.md` with team name, setup, at least two test users/passwords, API docs, page descriptions, Swing usage.

### By Feb 16–17: Presentation + individual report

- Prepare a demo script/video focusing on architecture + features (not low-level code).
- Each member: write the IEEE-format report (architecture diagrams + personal contributions + AI usage reflection).

## Data model (ER → tables) plan

Minimum tables to satisfy requirements cleanly:

- **`users`**
  - `id` (PK), `username` (UNIQUE), `password_hash`, `real_name`, `dob`, `bio`
  - avatar fields:
    - `avatar_type` (enum: `predefined` | `upload`)
    - `avatar_key` (e.g., predefined icon id) and/or `avatar_path` (uploaded file path)
  - `is_admin` (boolean) for admin API access control
  - timestamps (created/updated)
- **`articles`**
  - `id` (PK), `author_user_id` (FK → users), `title`, `content_html` (from WYSIWYG), timestamps
  - optionally: `header_image_id` (FK → images) or `header_image_path`
- **`article_images` / `images`**
  - Store uploaded image metadata: `id`, `owner_user_id`, `article_id` (nullable), `path`, `mime`, `created_at`
  - If using embedded images: store them and return URLs to insert in editor.
- **`comments`**
  - `id` (PK), `article_id` (FK → articles), `author_user_id` (FK → users)
  - `parent_comment_id` (nullable FK → comments) for unlimited nesting
  - `content`, `created_at`
- **Cascade delete** requirements:
  - Deleting a user deletes their **articles + comments** (Req. 7) → DB `ON DELETE CASCADE` for `articles.author_user_id` and `comments.author_user_id`.
  - Deleting an article deletes its comments.

## API design (REST plan)

Design the API to serve both the Svelte site and Swing admin app. Return JSON, use correct HTTP status codes, and apply auth rules consistently.

### Authentication (explicit admin requirements)

- **POST `/api/login`**
  - Body: `{ "username": "...", "password": "..." }`
  - **200**: set session/auth token + return user info (and maybe `isAdmin`)
  - **401**: invalid credentials
- **POST or GET `/api/logout`**
  - Clear session/token
  - **204**

### Users (website + admin)

- **GET `/api/users/exists?username=...`** (to satisfy Req. 2 “immediate” username availability)
  - **200**: `{ "available": true/false }`
- **POST `/api/users`** (register, Req. 1)
- **GET `/api/me`** (current profile)
- **PATCH `/api/users/me`** (edit profile including username, Req. 7)
- **DELETE `/api/users/me`** (delete account, Req. 7)
- **POST `/api/users/me/avatar`** (upload avatar) and/or choose predefined avatar via profile update
- **GET `/api/users/:id/avatar`** (serve avatar image for website + Swing)

Admin-only (explicit requirement):

- **GET `/api/users`** (admin-only)
  - **200**: array of users + profile info + `articleCount`
  - **401**: unauthenticated
  - **403**: authenticated but not admin
- **DELETE `/api/users/:id`** (admin-only)
  - **204** on success (delete user + all content)
  - **401/403** as above

### Articles (Req. 8–12)

- **GET `/api/articles`**
  - Supports query params for search/sort:
    - `q=...` (case-insensitive match in title + content; can be done server-side or client-side depending on dataset size)
    - `sort=title|username|date` and `order=asc|desc`
    - optional `mine=true` (only logged-in user’s articles, Req. 8)
- **POST `/api/articles`** (create, logged-in, Req. 10)
- **GET `/api/articles/:id`** (view + include author info)
- **PATCH `/api/articles/:id`** (author-only, Req. 10)
- **DELETE `/api/articles/:id`** (author-only, Req. 10)
- **POST `/api/articles/:id/header-image`** (upload/change/remove header image)
- **POST `/api/articles/:id/images`** (upload images used by editor, return URL(s) for embedding)

### Comments (Req. 13–16)

- **GET `/api/articles/:id/comments`**
  - Return nested structure or a flat list with `parentCommentId` for client-side tree building.
- **POST `/api/articles/:id/comments`**
  - Body: `{ "content": "...", "parentCommentId": null|number }`
- **DELETE `/api/comments/:id`**
  - Allowed if:
    - requester is comment author, OR
    - requester is the article author (Req. 16)

## Frontend pages/components (Svelte) plan

- **Auth**
  - Register form (Req. 1–5): live username availability (Req. 2), password match validation (Req. 3), avatar choice (Req. 5)
  - Login/logout (Req. 6)
- **Profile**
  - Edit username/real name/dob/bio/avatar; delete account (Req. 7)
- **Articles**
  - Article list: all articles + optional “My articles” (Req. 8)
  - Search + sort controls with good UX (Req. 9)
  - Article view page: render HTML from WYSIWYG safely (sanitize if needed), show comments
  - Article editor page:
    - TinyMCE configured with only required tools (Req. 11)
    - Image embedding flow (Req. 12)
    - Header image upload (Req. 12 full marks)
- **Comments**
  - Recursive comment component (`svelte:self` hint in brief) to display unlimited nesting (Req. 15)
  - Reply form per comment/article; delete controls with permissions (Req. 16)
- **UI/UX**
  - Responsive layout + consistent styling (Req. 17)
  - Inline validation + non-blocking error messages (avoid `alert()`) (Req. 3)

## Backend implementation plan (Node.js/SQL)

- **Auth**
  - Use `bcrypt` (or similar) for password hashing/salting (Req. 4)
  - Implement session/token middleware; attach `req.user`
  - Authorization helpers: `requireAuth`, `requireAdmin`, `requireArticleAuthor`, etc.
- **Uploads**
  - `multer` for avatars and article images (brief references this approach)
  - Validate file type + size; store with safe filenames; serve via controlled static route
- **Database access**
  - Create a small data access layer (models/repositories) to keep routes readable
  - Use transactions where deletion spans multiple tables (if not purely cascaded)
- **Edge cases**
  - Username change must preserve uniqueness and update references (usually by `user_id`, so OK)
  - Deleting user must remove their content (Req. 7) → verify cascading works
  - Comment nesting depth: ensure retrieval query is efficient; consider returning flat + build tree

## Java Swing admin interface plan (Req. Swing 1–13, no Maven)

### Build/run (plain `.java`)

- Keep the Swing app as **plain Java source** (no Maven/Gradle).
- Use standard library only: `javax.swing`, `java.net.HttpURLConnection`, `java.io`, `java.util`.
- Swing file layout (matches the project structure):
  - `java-client/AdminApp.java` (main JFrame + integration)
  - `java-client/LoginDialog.java` (login/logout UI)
  - `java-client/HTTPClient.java` (HTTP helper + cookie session)
  - `java-client/UserTableModel.java` (MVC model for JTable)
  - `java-client/UserTablePanel.java` (JTable panel + selection)
  - `java-client/AvatarPanel.java` (async avatar loading via SwingWorker)
- Compile/run (Windows):
  - `cd java-client`
  - `javac *.java`
  - `java AdminApp`

### UI layout (single `JFrame`)

- Top: username/password fields + Login/Logout buttons
- Center: `JTable` showing users (username, real name, dob, article count, etc.)
- Side/bottom: profile panel (`JPanel`) with selected username + avatar thumbnail (centered)
- Delete user button

### HTTP + non-freezing requirement

- Use `SwingWorker` for all network calls:
  - POST `/api/login` (store cookie or token in memory)
  - GET `/api/users` after login
  - GET `/api/users/:id/avatar` when row is selected (Req. 9: must not freeze)
  - DELETE `/api/users/:id`
- Use `HttpURLConnection` to make requests and read JSON responses.
- Keep auth state in memory (session cookie header or token header based on backend design).

### Patterns (Req. 12)

- `TableModel` (MVC) for `JTable` data.
- Observer/listener pattern: selection listener triggers background fetch for avatar.
- Adapter pattern where helpful (e.g., mapping JSON DTOs into UI models).

### Button enable/disable logic (Req. 11)

- Disable login when logged in; disable logout when logged out.
- Disable delete unless logged in **and** a row is selected.

## Custom feature (Req. 20) — choose one and scope it

Pick one feature that is meaningful but safe to deliver by Feb 13, for example:

- **Tags + tag filtering** (articles can have tags; filter list by tag).
- **Draft/publish state** (save drafts; only published visible to everyone).
- **Like/bookmark system** (users can like or bookmark articles).
- **Markdown export** (export article to Markdown or PDF).

Implementation approach:

- Add minimal DB changes + API endpoints + UI.
- Present scope to teaching team at check-in for approval.

## Quality, usability, and readiness checklist

- **UX**
  - Consistent navigation, clear CTA buttons, inline form errors, loading spinners for network actions.
  - Responsive layout tested at common widths (mobile/tablet/desktop).
- **Security**
  - Hash passwords; never return password hashes.
  - Restrict upload types; avoid XSS via sanitization or strict editor config.
  - Enforce access control server-side for edit/delete actions.
- **Code quality**
  - Clear folder structure; small modules; consistent naming; comments where needed.
  - Reusable API client wrapper in frontend (handles JSON + errors).
- **Submission**
  - `db-init.sql` auto-runs to initialize schema + seed data.
  - `README.md` includes:
    - team name
    - setup steps
    - at least 2 demo users/passwords + sample articles/comments
    - API documentation
    - description of all pages
    - how to use Swing admin app

## Suggested work breakdown (task list you can put on a board)

- **Planning package (Feb 5)**
  - Risk plan
  - ER diagram
  - API spec
  - Wireframes (optional)
- **Backend**
  - Auth (register/login/logout/session)
  - User CRUD + avatar upload
  - Articles CRUD + TinyMCE image endpoints + header image
  - Comments CRUD + permissions + nesting
  - Admin endpoints (`/api/users`, `/api/users/:id`)
- **Frontend**
  - Auth screens + validations
  - Article list/search/sort
  - Article view + comments tree
  - Article editor (TinyMCE) + image workflows
  - Profile edit/delete + avatar selection/upload
  - Responsive styling + usability polish
- **Swing**
  - Login/logout flow
  - JTable users list (admin-only)
  - Async avatar fetch on selection
  - Delete selected user + update table
- **Docs**
  - `README.md` with required content
  - `db-init.sql`
  - Presentation script/slides
  - Individual report inputs (diagrams, contribution log, AI usage notes)


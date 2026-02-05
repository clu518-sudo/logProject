<!-- PGCIT Final Project README -->

# PGCIT Blog (Personal Blogging System)

Team: **Team Placeholder**

## Assumptions

- SQLite is acceptable as the embedded SQL database.
- TinyMCE is loaded via CDN (no API key) to keep dependencies minimal.
- Draft articles are visible only in "My articles" and to their author/admin.
- Users can pick predefined avatars on registration and can upload a custom avatar from the Profile page.
- Use Node.js 20 LTS for sqlite3 prebuilt binaries (or install build tools for newer Node).
- Maven is available for building the Swing admin app.

## Project Structure

```
/
  backend/
  frontend/
  swing-admin/
  db/
```

## Demo Accounts

All demo accounts use the same password:

- **Password:** `Password123!`
- `alice` (user)
- `bob` (user)
- `admin` (admin)

## Setup & Run

### 1) Database

The backend auto-initializes the SQLite DB from `db/db-init.sql` on first run.

If you want to force re-init:

```
cd backend
npm install
npm run init-db
```

### 2) Backend (Node + Express)

```
cd backend
npm install
npm run start
```

Runs on `http://localhost:3001`.

### 3) Frontend (Svelte + Vite)

```
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` (Vite proxy to backend `/api` + `/uploads`).

### 4) Swing Admin (Java)

```
cd swing-admin
mvn -q -e -DskipTests package
java -jar target/swing-admin-1.0.0.jar
```

Log in using the **admin** account above.

## Features / Pages

- **Register**: live username availability check, password confirmation, predefined avatar selection.
- **Login/Logout**: session cookie auth.
- **Profile**: edit username/real name/dob/bio, choose predefined avatar, upload avatar, delete account.
- **Articles list**: search, sort, and "My articles" filter.
- **Article detail**: WYSIWYG HTML rendering, header image, nested comments.
- **Article editor**: TinyMCE with embedded image uploads, create/edit/delete, draft vs published.
- **Comments**: unlimited nesting, reply per comment, delete when permitted.
- **Responsive layout**: tested for mobile/tablet/desktop widths.

## Custom Feature

**Draft vs Published** for articles:

- Drafts are visible only to the author/admin.
- Published articles appear in the public list.

## REST API Documentation

All responses are JSON (except images). Uses cookie session `sid`.

### Auth

- `POST /api/login`
  - Body: `{ "username": "...", "password": "..." }`
  - 200: `{ id, username, realName, isAdmin, avatarType, avatarKey, avatarPath }`
  - 401: invalid credentials
- `POST /api/logout`
  - 204: clears session
- `GET /api/me`
  - 200: current user
  - 401: not logged in

### Username availability

- `GET /api/users/exists?username=...`
  - 200: `{ "available": true|false }`

### Users (self-service)

- `POST /api/users` (register)
  - Body: `{ username, password, realName, dob, bio, avatarKey }`
  - 201: created user profile
- `PATCH /api/users/me`
  - Body: `{ username, realName, dob, bio, avatarKey }`
- `DELETE /api/users/me`
  - 204: deletes user + content
- `POST /api/users/me/avatar`
  - multipart/form-data with `avatar`
- `GET /api/users/:id/avatar`
  - Returns predefined SVG or uploaded image

### Articles

- `GET /api/articles`
  - Query: `q`, `sort=title|username|date`, `order=asc|desc`, `mine=true`
- `POST /api/articles` (auth required)
  - Body: `{ title, contentHtml, isPublished }`
- `GET /api/articles/:id`
  - Drafts restricted to author/admin
- `PATCH /api/articles/:id` (author/admin)
- `DELETE /api/articles/:id` (author/admin)
- `POST /api/articles/:id/header-image`
  - multipart/form-data with `image`
  - optional `?remove=true`
- `POST /api/articles/:id/images`
  - multipart/form-data with `image`
  - returns `{ url }` for TinyMCE

### Comments

- `GET /api/articles/:id/comments`
  - Flat list with `parentCommentId` for nesting
- `POST /api/articles/:id/comments` (auth required)
  - Body: `{ content, parentCommentId }`
- `DELETE /api/comments/:id`
  - Comment author OR article author OR admin

### Admin (Swing)

- `GET /api/users` (admin only)
  - includes `articleCount`
- `DELETE /api/users/:id` (admin only)
  - 204 on success

## Swing Admin Usage

- Login with admin credentials.
- Users table lists all users and article counts.
- Select a row to see centered avatar thumbnail.
- Delete selected user (admin accounts are protected from deletion in UI).
- All network calls run in background (`SwingWorker`) to avoid freezing.

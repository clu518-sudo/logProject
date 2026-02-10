## Sprint Backlog + Task Allocation (Feature-Based Modules)

Aligned with `PGCIT-Project-Brief-LY-2025.pdf` deliverable "Sprint backlog with initial task allocation".

### Assumptions (keep it simple)

- Timeline is short (Feb 2 → Feb 13 code due).
- We will run **2 sprints** and aim to always keep a working build.
- This backlog is written so an **entry-level** team can follow it.

Team members: alpha, belta, and gamma. All team members are involved in front-end, back-end, and Java development.

### Module-Based Allocation Philosophy

Each team member owns a **complete feature module** (vertical slice) including:
- Frontend UI for their module
- Backend API for their module
- Java Swing components related to their module
- Database schema for their module

This ensures:
1. **Clear ownership**: Each person is responsible for one complete feature end-to-end
2. **Cross-functional work**: Everyone touches frontend (Svelte), backend (Node.js), and Java (Swing)
3. **Reduced conflicts**: Minimal file overlap between team members
4. **Feature completeness**: Each module can be developed, tested, and demoed independently

### Definition of Done (DoD) for a task

- Code runs locally.
- Basic manual test done (at least one happy path + one failure path).
- Error messages are shown in UI (no `alert()`).
- API returns correct status codes and JSON (where required).

---

## Feature Modules Overview

| Module | Owner | Description | Technologies |
|--------|-------|-------------|--------------|
| **User Authentication & Profile** | alpha | Complete user identity management: register, login, logout, profile editing, avatars | Frontend + Backend + Swing Login |
| **Articles & Content** | belta | Complete article lifecycle: create, view, edit, search, sort, images, WYSIWYG editor | Frontend + Backend + Database |
| **Comments & Administration** | gamma | Complete engagement & admin: comments (flat & nested), admin API, Swing admin panel | Frontend + Backend + Swing Admin |

---

## Sprint 1 (Feb 2 → Feb 6): Core foundations + vertical slice

**Sprint goal**: working end-to-end flow: register/login → create article → view article → comment once.

### Sprint 1 backlog (module-based allocation)

| ID | Module | Task | Maps to brief | Est. | Owner |
|----|--------|------|---------------|------|-------|
| **S1-1** | **Setup** | **Project setup & database foundation** | | | |
| S1-1.1 | Setup | Confirm folder structure + dev run commands; agree coding style; ensure ERD + API spec in `PLANNING_INITIAL_DESIGN.md` | PM | 1–2h | **alpha** |
| S1-1.2 | Setup | Create complete DB schema (`db-init.sql`): `users`, `sessions`, `articles`, `comments`, `images` with FKs + cascades | Req. 7, 15 | 3–5h | **belta** |
| S1-1.3 | Setup | Backend app setup: Express server, middleware, DB connection, error handling utilities | Foundation | 2–4h | **gamma** |
| **S1-2** | **Auth Module (Alpha)** | **User authentication & registration** | | | |
| S1-2.1 | Auth | Backend: Implement `POST /api/users` (register with hash+salt), `GET /api/users/exists`, `POST /api/login`, `POST /api/logout`, `GET /api/me` | Req. 1–6 | 6–10h | **alpha** |
| S1-2.2 | Auth | Backend: Session management service + auth middleware | Req. 4, 6 | 3–5h | **alpha** |
| S1-2.3 | Auth | Frontend: Register page with live username availability, password validation | Req. 1–3 | 4–6h | **alpha** |
| S1-2.4 | Auth | Frontend: Login page + logout functionality + auth state management | Req. 6 | 3–5h | **alpha** |
| S1-2.5 | Auth | Java Swing: Create `LoginDialog.java` - login/logout UI + session handling | Swing 1–5 | 4–6h | **alpha** |
| S1-2.6 | Auth | Java Swing: Create `HTTPClient.java` - HTTP helper for API calls (GET, POST, DELETE with cookies) | Swing | 3–5h | **alpha** |
| **S1-3** | **Articles Module (Belta)** | **Article creation & viewing** | | | |
| S1-3.1 | Articles | Backend: Article CRUD endpoints: `GET /api/articles`, `POST /api/articles`, `GET /api/articles/:id`, `PATCH /api/articles/:id`, `DELETE /api/articles/:id` | Req. 8, 10 | 6–10h | **belta** |
| S1-3.2 | Articles | Backend: Article service layer + validation | Req. 8 | 2–4h | **belta** |
| S1-3.3 | Articles | Frontend: Article list page (Home) + article cards | Req. 8 | 3–5h | **belta** |
| S1-3.4 | Articles | Frontend: Article detail page | Req. 8 | 2–4h | **belta** |
| S1-3.5 | Articles | Frontend: Basic article creation form (text only, WYSIWYG in Sprint 2) | Req. 10 | 3–5h | **belta** |
| S1-3.6 | Articles | Java Swing: Create `UserTableModel.java` - MVC TableModel for user data | Swing 6–7 | 3–5h | **belta** |
| S1-3.7 | Articles | Java Swing: Create `UserTablePanel.java` - JTable display with selection handling | Swing 8 | 3–5h | **belta** |
| **S1-4** | **Comments Module (Gamma)** | **Basic commenting system** | | | |
| S1-4.1 | Comments | Backend: `POST /api/articles/:id/comments`, `GET /api/articles/:id/comments` (flat list) | Req. 13–15 | 4–7h | **gamma** |
| S1-4.2 | Comments | Backend: Comments service layer | Req. 13 | 2–3h | **gamma** |
| S1-4.3 | Comments | Frontend: Comment list component + add comment form (flat structure) | Req. 13–14 | 4–6h | **gamma** |
| S1-4.4 | Comments | Backend: Admin API - `GET /api/users` with article/comment counts | Admin API 3 | 3–5h | **gamma** |
| S1-4.5 | Comments | Java Swing: Create `AdminApp.java` - Main JFrame integrating all Swing components | Swing | 3–5h | **gamma** |

**Sprint 1 demo checklist (for check-in)**:

- ✅ Register user (shows "username taken" live) - **alpha**
- ✅ Login and stay logged in (cookie/session) - **alpha**
- ✅ Create one article, view it in list, open detail - **belta**
- ✅ Add one comment and see it display - **gamma**
- ✅ Admin user can call `GET /api/users` (via Postman) - **gamma**
- ✅ Swing UI can login and show user table - **alpha + gamma**

---

## Sprint 2 (Feb 7 → Feb 13): Complete requirements + polish + submission artifacts

**Sprint goal**: finish all requirements + make it stable + docs + seed data.

### Sprint 2 backlog (module-based allocation)

| ID | Module | Task | Maps to brief | Est. | Owner |
|----|--------|------|---------------|------|-------|
| **S2-1** | **Auth Module (Alpha)** | **Profile management & avatars** | | | |
| S2-1.1 | Auth | Backend: `PATCH /api/users/me` (update profile including password change) | Req. 7 | 3–5h | **alpha** |
| S2-1.2 | Auth | Backend: `DELETE /api/users/me` with cascade deletes verified | Req. 7 | 2–4h | **alpha** |
| S2-1.3 | Auth | Backend: `POST /api/users/me/avatar` (avatar upload) + predefined avatar list | Req. 5 | 4–6h | **alpha** |
| S2-1.4 | Auth | Frontend: Profile page with edit form (username, password, avatar selection) | Req. 7 | 4–6h | **alpha** |
| S2-1.5 | Auth | Frontend: Avatar display in UI (navbar, article cards, comments) | Req. 5 | 2–4h | **alpha** |
| S2-1.6 | Auth | Frontend: Responsive layout + loading states + error handling | Req. 17–18 | 4–6h | **alpha** |
| S2-1.7 | Auth | Frontend: Form validation utilities + UX polish | Req. 17 | 2–3h | **alpha** |
| **S2-2** | **Articles Module (Belta)** | **Advanced article features** | | | |
| S2-2.1 | Articles | Backend: Image upload service + storage for article images | Req. 12 | 4–6h | **belta** |
| S2-2.2 | Articles | Backend: `POST /api/articles/:id/images` (header + embedded images) | Req. 12 | 3–5h | **belta** |
| S2-2.3 | Articles | Backend: Search + sort API (by title, author, date) | Req. 9 | 3–5h | **belta** |
| S2-2.4 | Articles | Backend: "My articles" filter (`?mine=true`) | Req. 8 | 1–2h | **belta** |
| S2-2.5 | Articles | Frontend: TinyMCE WYSIWYG editor integration (headings, bold, italic, underline, lists) | Req. 11 | 6–10h | **belta** |
| S2-2.6 | Articles | Frontend: Article editor with header image upload + embedded images | Req. 12 | 4–7h | **belta** |
| S2-2.7 | Articles | Frontend: Search bar + sort controls (UX-friendly) | Req. 9 | 3–5h | **belta** |
| S2-2.8 | Articles | Frontend: "My articles" view/filter | Req. 8 | 2–3h | **belta** |
| S2-2.9 | Articles | Documentation: Finalize `README.md` (setup, demo users, API docs) | Deliverable | 3–6h | **belta** |
| **S2-3** | **Comments & Admin Module (Gamma)** | **Advanced comments & admin panel** | | | |
| S2-3.1 | Comments | Backend: Nested comments - update schema with `parent_comment_id`, recursive queries | Req. 15 | 4–6h | **gamma** |
| S2-3.2 | Comments | Backend: `DELETE /api/comments/:id` (author OR article author can delete) | Req. 16 | 3–5h | **gamma** |
| S2-3.3 | Comments | Backend: `DELETE /api/users/:id` (admin only) with cascade verification | Admin API 4 | 4–6h | **gamma** |
| S2-3.4 | Comments | Frontend: Recursive comment component (nested replies to any depth) | Req. 15 | 6–10h | **gamma** |
| S2-3.5 | Comments | Frontend: Delete button with permission checks (show only if authorized) | Req. 16 | 2–4h | **gamma** |
| S2-3.6 | Comments | Java Swing: Create `AvatarPanel.java` - async image loading with SwingWorker, no UI freeze | Swing 9 | 4–6h | **gamma** |
| S2-3.7 | Comments | Java Swing: In `AdminApp.java` - delete user button + table refresh + enable/disable logic | Swing 10–11 | 4–6h | **gamma** |
| S2-3.8 | Comments | Java Swing: Document MVC patterns used (TableModel, observers, listeners) in code comments | Swing 12 | 2–4h | **gamma** |
| S2-3.9 | Comments | Database: Finalize seed data (2+ users, sample articles, nested comments) | Deliverable | 2–4h | **gamma** |
| **S2-4** | **Integration & Polish** | **Team collaboration on final features** | | | |
| S2-4.1 | Custom | Implement custom feature (e.g., tags, draft/publish, bookmarks) | Req. 20 | 6–12h | **alpha, belta, gamma** |
| S2-4.2 | Polish | CSS consistency + responsive design final touches | Req. 17 | 2–4h | **alpha** |
| S2-4.3 | Polish | Integration testing + bug fixes | QA | 3–5h | **all** |

---

## Feature Module Ownership Summary

### **ALPHA - User Authentication & Profile Module** 👤

**Responsibility**: Complete user identity lifecycle from registration to profile management

#### Frontend (Svelte)
- Registration page with live validation
- Login/logout functionality
- Profile editing page
- Avatar selection & display throughout app
- Auth state management (store.js)
- Responsive UI & loading states
- Form validation utilities

#### Backend (Node.js/Express)
- `backend/src/routes/auth.js` - Login, logout, current user (`GET /api/me`)
- `backend/src/routes/users.js` - Register + username availability + profile CRUD + avatar upload
- `backend/src/services/users.js` - User business logic
- `backend/src/services/sessions.js` - Session management
- `backend/src/middleware/auth.js` - Authentication middleware
- `backend/src/util/validation.js` - Validation utilities

#### Java (Swing)
- `java-client/LoginDialog.java` - Login/logout dialog component
- `java-client/HTTPClient.java` - HTTP client utility for API calls with cookie/session management

#### Database
- Users table schema
- Sessions table schema

**Estimated effort**: 45-65 hours

---

### **BELTA - Articles & Content Module** 📝

**Responsibility**: Complete article lifecycle from creation to search/display

#### Frontend (Svelte)
- Article list (Home page)
- Article detail view
- Article editor with WYSIWYG (TinyMCE)
- Article cards component
- Search & sort controls
- "My articles" filter
- Image upload UI

#### Backend (Node.js/Express)
- `backend/src/routes/articles.js` - Article CRUD endpoints
- `backend/src/services/articles.js` - Article business logic
- `backend/src/services/images.js` - Image upload & storage
- `backend/src/util/uploads.js` - File upload utilities
- `backend/src/db/db.js` - Database connection
- `backend/src/db/init.js` - Database initialization
- Search & sort implementation

#### Java (Swing)
- `java-client/UserTableModel.java` - Custom TableModel implementing MVC pattern
- `java-client/UserTablePanel.java` - JTable panel with user list display and selection handling

#### Database
- Articles table schema
- Images table schema
- Initial schema setup (`db-init.sql`)

#### Documentation
- `README.md` - Final documentation

**Estimated effort**: 54-80 hours

---

### **GAMMA - Comments & Administration Module** 💬🔧

**Responsibility**: Complete commenting system + admin panel for user management

#### Frontend (Svelte)
- Comment display component (flat & nested)
- Add comment form
- Reply functionality (nested to any depth)
- Delete comment UI with permissions
- API helper utilities (`lib/api.js`)

#### Backend (Node.js/Express)
- `backend/src/routes/comments.js` - Comment CRUD endpoints
- `backend/src/services/comments.js` - Comment business logic (including nested)
- `backend/src/routes/admin.js` - Admin API (user list, delete user)
- `backend/src/app.js` - Express app setup
- `backend/src/util/http.js` - HTTP utilities

#### Java (Swing)
- `java-client/AdminApp.java` - Main application frame, integrates all components
- `java-client/AvatarPanel.java` - Avatar display panel with async image loading (SwingWorker)
- Delete user functionality and table refresh
- MVC patterns documentation (observers, listeners)

#### Database
- Comments table schema (including parent_comment_id)
- Seed data (users, articles, nested comments)

**Estimated effort**: 50-72 hours

---

## Cross-Functional Verification

✅ **Alpha** - Frontend (7 pages/components) + Backend (6 files) + Java (2 Swing files: LoginDialog, HTTPClient) + Database (2 tables)
✅ **Belta** - Frontend (8 components) + Backend (7 files) + Java (2 Swing files: UserTableModel, UserTablePanel) + Database (3 tables + schema) + Docs
✅ **Gamma** - Frontend (4 components) + Backend (5 files) + Java (2 Swing files: AdminApp, AvatarPanel) + Database (1 table + seed)

All team members work across:
- **Frontend development**: Svelte components, routing, UI/UX, responsive design
- **Backend development**: Express APIs, services, middleware, database operations
- **Java development**: Swing UI, MVC patterns, async operations, HTTP networking

---

## Integration Points (Minimal Overlap)

| Integration | Owner A | Owner B | Description |
|-------------|---------|---------|-------------|
| Auth → Articles | alpha | belta | Auth middleware protects article endpoints |
| Auth → Comments | alpha | gamma | Auth middleware protects comment endpoints |
| Articles → Comments | belta | gamma | Comments display on article detail page |
| Frontend API | alpha | gamma | Shared API utility functions (minimal collaboration) |
| Swing Integration | alpha | gamma | Alpha handles login, gamma handles admin features |

---

## Notes on Module-Based Approach

1. **Clear boundaries**: Each module has distinct responsibilities with minimal overlap
2. **Independent development**: Modules can be developed in parallel with minimal merge conflicts
3. **Complete ownership**: Each person owns their feature end-to-end, making them the expert
4. **Fair workload**: Each module has 45-72 estimated hours (balanced distribution)
5. **Cross-functional**: Every person touches all three technology stacks (Svelte, Node.js, Java)
6. **Testable**: Each module can be tested independently before integration
7. **Demoable**: Each person can demo their complete feature module

This allocation ensures the teaching team can clearly see:
- Each team member's complete contribution
- Fair distribution of work
- Cross-functional skill development
- Professional software engineering practices (module ownership, separation of concerns)

---

## Java/Swing File Breakdown

The Swing admin application is divided into **6 separate Java files** to ensure clear ownership:

### **Alpha's Java Files** (Authentication Layer)
1. **LoginDialog.java** (80-120 lines)
   - Login/logout UI component
   - Session cookie management
   - Authentication state handling

2. **HTTPClient.java** (150-200 lines)
   - Reusable HTTP utility class
   - GET/POST/DELETE methods
   - Cookie header management
   - JSON handling

**Alpha's Java responsibility**: Authentication infrastructure that other components depend on

### **Belta's Java Files** (Data Model Layer)
3. **UserTableModel.java** (80-120 lines)
   - Extends AbstractTableModel (MVC pattern)
   - Manages user data list
   - Column definitions and data access
   - Observer pattern implementation

4. **UserTablePanel.java** (60-100 lines)
   - JTable display component
   - Selection handling (ListSelectionListener)
   - Scroll pane integration
   - Event propagation

**Belta's Java responsibility**: Data model and table display following MVC pattern

### **Gamma's Java Files** (Application & Features Layer)
5. **AdminApp.java** (150-200 lines)
   - Main JFrame application
   - Component integration (LoginDialog, UserTablePanel, AvatarPanel)
   - Delete user functionality
   - Button state management
   - Application entry point (main method)

6. **AvatarPanel.java** (100-150 lines)
   - Avatar display panel
   - SwingWorker for async loading (no UI freeze)
   - Image fetching and scaling
   - Loading/error states

**Gamma's Java responsibility**: Main application and advanced features (async operations)

### **Total Java Distribution**
- Each person: 2 Java files
- Total lines: ~620-890 lines
- All demonstrate: OOP, Swing GUI, MVC patterns, event handling, networking

This ensures **fair Java workload** and **clear module boundaries**.

---

## Complete File Count Summary

| Team Member | Frontend (Svelte) | Backend (Node.js) | Java (Swing) | Database | Config/Docs | Total Files | Est. Hours |
|-------------|-------------------|-------------------|--------------|----------|-------------|-------------|------------|
| **alpha** | 10 files | 6 files | 2 files | 2 tables | 1 file | **19 files** | 52-72h |
| **belta** | 9 files | 6 files | 2 files | 3 tables + schema | 5 files | **22 files** | 54-80h |
| **gamma** | 2 files | 5 files | 2 files | 1 table + seed | 2 files | **11 files** | 56-80h |

✅ All team members have equal Java involvement (2 files each)
✅ All team members work across frontend, backend, and Java
✅ Workload is balanced (52-80 hours per person)
✅ Each person owns a complete, testable feature module

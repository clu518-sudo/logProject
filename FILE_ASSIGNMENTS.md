# File Assignment by Feature Module

Based on feature-based module allocation in `SPRINT_BACKLOG_ALLOCATION.md`.

**Allocation Philosophy**: Each team member owns a complete feature module (vertical slice) including frontend UI, backend API, Java Swing components, and database schema. This ensures clear ownership, minimal conflicts, and complete feature responsibility.

---

## **Cendong Lu - User Authentication, Profile & AI Research Module** 👤🔎

**Module Responsibility**: Complete user identity management from registration to profile editing + AI article content research (online research agent)

### **Frontend Files** (Svelte)

#### Authentication Pages & Components

- `frontend/src/routes/register/+page.svelte` - Registration page route
- `frontend/src/routes/login/+page.svelte` - Login page route
- `frontend/src/routes/profile/+page.svelte` - Profile editing page route
- `frontend/src/lib/pages/Register.svelte` - Registration form component
- `frontend/src/lib/pages/Login.svelte` - Login form component
- `frontend/src/lib/pages/Profile.svelte` - Profile edit component

#### State & Utilities

- `frontend/src/lib/store.js` - Auth state management (user session, login status)
- `frontend/src/lib/validation.js` - Form validation (username, password, email)

**Frontend Total**: 8 files  
*(Layout & global styling assigned to Yanzhi Huang for balance.)*

### **Backend Files** (Node.js/Express)

#### Routes

- `backend/src/routes/users.js` - User management endpoints (profile update, delete, avatar)

#### Services

- `backend/src/services/users.js` - User business logic (create, update, password hashing)

*(Auth route (login, logout, current user), session management, auth middleware, and server-side validation assigned to Yanzhi Huang for balance.)*

**Backend Total**: 2 files

### **Java Files** (Swing – package `pccit.finalproject.javaclient`)

- `java-client/src/pccit/finalproject/javaclient/http/ApiHttpClient.java` - HTTP client utility
  - GET/POST/DELETE and getBytes; CookieManager for session persistence
  - Timeouts and `java.net.http.HttpClient` usage
- `java-client/src/pccit/finalproject/javaclient/api/ApiClient.java` - Backend API client
  - Login/logout, getUsers (admin), deleteUser, fetchAvatarAsync (callback-based)
  - Uses ApiHttpClient and JsonHelper; Executor for async avatar fetch
- `java-client/src/pccit/finalproject/javaclient/model/LoginResult.java` - Login result DTO (success, admin, errorMessage)
- `java-client/src/pccit/finalproject/javaclient/util/JsonHelper.java` - Minimal JSON parsing (no external lib) for login response and user list

**Java Total**: 4 files

### **Database Schema**

- `db/db-init.sql` (partial):
  - `users` table definition
  - `sessions` table definition

### **Documentation**

- `README.md` - Auth setup section

**Module Total**: ~15 source files (8 frontend + 2 backend + 4 Java + 1 docs) + database tables

**Estimated Effort**: 36-50 hours

### **AI Article Content Research (Online Research Agent)** 🔎

**Feature Responsibility**: AI-powered live “Related info” panel for articles (online search + fetch + summarization + SSE updates)

#### Frontend Files (Svelte)

- `frontend/src/lib/pages/ArticleDetail.svelte` - “Related info” panel UI + start/retry + SSE listening for `research` events

#### Backend Files (Node.js/Express)

- `backend/src/routes/articles.js` - Research endpoints:
  - `GET /api/articles/:id/research`
  - `POST /api/articles/:id/research`
  - SSE: `GET /api/articles/events` emits `research` events
- `backend/src/services/article_research_agent.js` - Background job orchestration (search/fetch/summarize, caching TTL)
- `backend/src/services/article_research.js` - DB read/write + emits `research.updated`
- `backend/src/services/research_tools.js` - Web search + safe fetch + text extraction (SSRF protection)
- `backend/src/services/research_rate_limit.js` - Rate limiting per user/IP
- `backend/src/services/article_events.js` - Event emitter used by SSE stream (`research.updated`)
- `backend/src/db/init.js` - DB migrations for `article_research` table
- `backend/src/sql/db-init.sql` - Base schema includes `article_research`

---

## **Nuona Liang - Articles & Content Module** 📝

**Module Responsibility**: Complete article lifecycle including creation, viewing, editing, search, images + AI header image generation (shared with Yanzhi Huang)

### **Frontend Files** (Svelte)

#### Article Pages & Components

- `frontend/src/routes/+page.svelte` - Home page route (article list)
- `frontend/src/routes/article/[id]/+page.svelte` - Article detail page route
- `frontend/src/routes/editor/+page.svelte` - New article editor route
- `frontend/src/routes/editor/[id]/+page.svelte` - Edit article route
- `frontend/src/lib/pages/Home.svelte` - Article list component with search/sort
- `frontend/src/lib/pages/ArticleDetail.svelte` - Article detail view
- `frontend/src/lib/pages/ArticleEditor.svelte` - Article editor wrapper
- `frontend/src/lib/components/TinyEditor.svelte` - WYSIWYG editor (TinyMCE wrapper)

**Frontend Total**: 8 files  
*(ArticleCard.svelte assigned to Yanzhi Huang for balance.)*

### **Backend Files** (Node.js/Express)

#### Routes

- `backend/src/routes/articles.js` - Article CRUD endpoints + search/sort

#### Services

- `backend/src/services/articles.js` - Article business logic
- `backend/src/services/images.js` - Image upload & storage service
- `backend/src/services/article_header_image_ai.js` - AI header image generation background job (shared with Yanzhi Huang)
- `backend/src/services/image_generation.js` - AI image generation provider integration (shared with Yanzhi Huang)
- `backend/src/services/text_generation.js` - AI prompt generation for images (shared with Yanzhi Huang)

#### Database

- `backend/src/db/init.js` - Database initialization

**Backend Total**: 7 files  
*(db.js and uploads.js assigned to Yanzhi Huang for balance.)*

### **Java Files** (Swing – package `pccit.finalproject.javaclient`)

- `java-client/src/pccit/finalproject/javaclient/model/User.java` - User DTO (id, username, realName, dob, bio, avatar fields, admin, articleCount)
- `java-client/src/pccit/finalproject/javaclient/ui/UserTableModel.java` - Custom TableModel (MVC)
  - Extends AbstractTableModel; backed by list of User
  - Columns: ID, Username, Real Name, Admin, Articles
  - setUsers, removeUserAt, getUserAt, clear; fireTableDataChanged

**Java Total**: 2 files

### **Database Schema**

- `db/db-init.sql`:
  - Complete schema structure (all tables)
  - `articles` table definition
  - `images` table definition
  - Foreign keys & cascade rules
  - Indexes for search/sort

### **Configuration**

- `frontend/package.json` - Frontend dependencies (including TinyMCE)
- `frontend/svelte.config.js` - SvelteKit configuration
- `frontend/vite.config.js` - Vite build configuration
- `backend/package.json` - Backend dependencies

### **Documentation**

- `README.md` - Final complete documentation:
  - Setup instructions
  - Demo users
  - API documentation
  - Feature list
  - Deployment guide

**Module Total**: ~22 source files (8 frontend + 7 backend + 2 Java + 1 database + 4 config/docs)

**Estimated Effort**: 48-72 hours

---

## **Yanzhi Huang - Comments & Administration Module** 💬🔧

**Module Responsibility**: Complete commenting system (flat & nested) + admin panel for user management + app layout & global styling + shared utilities (DB connection, uploads) + AI header image generation (shared with Nuona Liang)

### **Frontend Files** (Svelte)

#### Comment Components

- `frontend/src/lib/components/CommentItem.svelte` - Comment display (recursive for nesting)
- `frontend/src/lib/components/ArticleCard.svelte` - Article card component (used in article list; assigned from Nuona for balance)

#### Layout & Styling (assigned from Cendong for balance)

- `frontend/src/routes/+layout.svelte` - App layout with auth-aware navigation
- `frontend/src/app.css` - Global styles + responsive design

#### API Utilities

- `frontend/src/lib/api.js` - API helper functions (fetch wrappers, error handling)

**Frontend Total**: 5 files

### **Backend Files** (Node.js/Express)

#### Routes

- `backend/src/routes/comments.js` - Comment CRUD endpoints (including nested)
- `backend/src/routes/admin.js` - Admin API endpoints (user list, delete user)

#### Services

- `backend/src/services/comments.js` - Comment business logic (nested queries)
- `backend/src/services/article_header_image_ai.js` - AI header image generation background job (shared with Nuona Liang)
- `backend/src/services/image_generation.js` - AI image generation provider integration (shared with Nuona Liang)
- `backend/src/services/text_generation.js` - AI prompt generation for images (shared with Nuona Liang)

#### Main Application

- `backend/src/app.js` - Express app setup, middleware registration, routes

#### Database & Utilities (assigned from Nuona for balance)

- `backend/src/db/db.js` - Database connection setup
- `backend/src/util/uploads.js` - File upload utilities (multer config, storage)
- `backend/src/util/http.js` - HTTP utilities (status codes, error responses)

#### Auth API & support (assigned from Cendong for balance)

- `backend/src/routes/auth.js` - Authentication endpoints (login, logout, current user)
- `backend/src/services/sessions.js` - Session management
- `backend/src/middleware/auth.js` - Authentication middleware (protect routes)
- `backend/src/util/validation.js` - Server-side validation utilities

**Backend Total**: 14 files

### **Java Files** (Swing – package `pccit.finalproject.javaclient`)

- `java-client/src/pccit/finalproject/javaclient/Main.java` - Entry point; launches AdminFrame on EDT
- `java-client/src/pccit/finalproject/javaclient/ui/AdminFrame.java` - Main JFrame (integrates all UI)
  - North: login fields (username, password), Login/Logout buttons
  - Center: JTable with UserTableModel, Delete user button; East: AvatarPanel
  - Login/logout/delete via ApiClient; SwingWorker for login and user list load
  - Button enable/disable by login and selection state (requirement 11)
- `java-client/src/pccit/finalproject/javaclient/ui/AvatarPanel.java` - Selected user panel
  - JPanel: username label + avatar thumbnail (async via ApiClient.fetchAvatarAsync)
  - clearSelection, setSelectedUsername, setAvatarImage, setAvatarError

**Java Total**: 3 files

### **Database Schema**

- `db/db-init.sql` (partial):
  - `comments` table definition with `parent_comment_id`
  - Seed data:
    - Demo users (admin + regular users)
    - Sample articles
    - Nested comments (showing replies)
    - Sample images

### **Configuration**

- `backend/.nvmrc` - Node version specification

### **Documentation**

- `java-client/README.md` - Swing admin usage guide (if needed)

**Module Total**: ~24 source files (5 frontend + 14 backend + 3 Java + 1 database + 1 config)

**Estimated Effort**: 64-88 hours

---

## **Java/Swing File Structure** (Package: `pccit.finalproject.javaclient`)

The Swing admin client uses a **package-based layout** under `java-client/src/pccit/finalproject/javaclient/` with **9 Java files**:

### **Cendong Lu's Java Components** (Auth, HTTP, API client)

1. **http/ApiHttpClient.java**
   - Purpose: Low-level HTTP client with session cookie handling
   - Responsibilities: GET, POST (JSON and no-body), DELETE, getBytes; CookieManager; timeouts via `java.net.http.HttpClient`
   - Integration: Used by ApiClient for all backend calls

2. **api/ApiClient.java**
   - Purpose: Backend API client (login, logout, getUsers, deleteUser, fetchAvatarAsync)
   - Responsibilities: Login/logout with cookie storage; admin user list and delete; async avatar fetch with callback; uses JsonHelper for response parsing
   - Integration: Used by AdminFrame for all API operations

3. **model/LoginResult.java**
   - Purpose: Login result DTO (success, admin flag, errorMessage)
   - Integration: Returned by ApiClient.login()

4. **util/JsonHelper.java**
   - Purpose: Minimal JSON parsing (no external library) for login response and user list
   - Integration: Used by ApiClient

### **Nuona Liang's Java Components** (Data model & table)

5. **model/User.java**
   - Purpose: User DTO as returned by admin users API (id, username, realName, dob, bio, avatar fields, admin, articleCount)
   - Integration: Used by UserTableModel and AdminFrame

6. **ui/UserTableModel.java**
   - Purpose: MVC TableModel for the user list
   - Responsibilities: Extends AbstractTableModel; columns ID, Username, Real Name, Admin, Articles; setUsers, removeUserAt, getUserAt, clear; fireTableDataChanged
   - Integration: Set as model for JTable in AdminFrame

### **Yanzhi Huang's Java Components** (Main app & UI)

7. **Main.java**
   - Purpose: Application entry point
   - Responsibilities: SwingUtilities.invokeLater; setLookAndFeel; create and show AdminFrame
   - Integration: Run with `java -cp out pccit.finalproject.javaclient.Main`

8. **ui/AdminFrame.java**
   - Purpose: Main JFrame integrating login UI, user table, avatar panel, delete action
   - Responsibilities: North—username/password fields, Login/Logout; Center—JTable (UserTableModel) + Delete user button; East—AvatarPanel; SwingWorker for login and user list; button state by login/selection
   - Integration: Uses ApiClient, UserTableModel, AvatarPanel

9. **ui/AvatarPanel.java**
   - Purpose: Selected user panel (username + avatar thumbnail)
   - Responsibilities: clearSelection, setSelectedUsername, setAvatarImage (from bytes), setAvatarError; async load via ApiClient.fetchAvatarAsync callback
   - Integration: Embedded in AdminFrame east panel

### **Component Communication Flow**

```
Main (entry)
  └─ AdminFrame (Yanzhi Huang)
       ├─ North: login fields + Login/Logout → ApiClient (Cendong Lu)
       │    └─ ApiHttpClient (Cendong Lu), JsonHelper (Cendong Lu), LoginResult (Cendong Lu)
       ├─ Center: JTable(UserTableModel) (Nuona Liang) + Delete → ApiClient
       │    └─ UserTableModel uses User (Nuona Liang)
       └─ East: AvatarPanel (Yanzhi Huang) → ApiClient.fetchAvatarAsync
```

### **Why This Structure?**

1. **Clear ownership**: Cendong (auth/HTTP/API + JSON), Nuona (user model + table model), Yanzhi (entry + frame + avatar UI)
2. **Package layout**: api, http, model, ui, util follow Java conventions
3. **Reusability**: ApiClient and ApiHttpClient used by the single frame; no duplicate HTTP code
4. **MVC**: Model (User, UserTableModel), View (AdminFrame, AvatarPanel), API layer (ApiClient)
5. **Async**: Login, user list, and avatar load use background threads so the UI stays responsive

---

## **Shared/Configuration Files** (All team members)

These files are touched by multiple people during initial setup:

### **Project Root**

- `PLANNING_INITIAL_DESIGN.md` - ERD + API spec (reference for all)
- `SPRINT_BACKLOG_ALLOCATION.md` - This file (task tracking)
- `FILE_ASSIGNMENTS.md` - This file (module assignments)
- `.gitignore` - Git ignore rules

### **Frontend Config** (Setup phase)

- `frontend/src/routes/+layout.js` - Root layout configuration

### **Backend Config** (Setup phase)

- `backend/package.json` - Shared dependencies

---

## **Module Boundaries & Integration Points**

### **Clear Boundaries**

- **Cendong Lu** owns user profile API & user service (users route, user CRUD logic) + **AI article content research** feature; **Yanzhi Huang** implements the **auth API** (auth route: login, logout, current user) + session management, auth middleware, and server-side validation (assigned for workload balance).
- **Nuona Liang** owns all core article-related code + **co-owns AI header image generation** with Yanzhi Huang
- **Yanzhi Huang** owns all comment & admin-related code + **auth backend** (auth route, sessions, middleware, validation) + **co-owns AI header image generation** with Nuona Liang

### **Integration Points** (Minimal overlap)

| Integration             | Owner A      | Owner B                   | How it works                                                               |
| ----------------------- | ------------ | ------------------------- | -------------------------------------------------------------------------- |
| Auth protects Articles  | Yanzhi Huang | Nuona Liang               | Nuona Liang imports Yanzhi Huang's auth middleware                          |
| Auth protects Comments  | Yanzhi Huang | (same)                    | Yanzhi Huang owns auth route + middleware                                 |
| Comments on Articles    | Nuona Liang  | Yanzhi Huang              | Yanzhi Huang's comment component used in Nuona Liang's article detail page |
| Article list + card     | Nuona Liang  | Yanzhi Huang              | Nuona Liang's Home.svelte uses Yanzhi Huang's ArticleCard component        |
| Layout & global styles  | Yanzhi Huang | Cendong Lu, Nuona Liang   | All routes use Yanzhi Huang's +layout.svelte and app.css                    |
| DB connection & uploads | Yanzhi Huang | Nuona Liang               | Article/image code may use Yanzhi Huang's db.js and uploads.js             |
| API utilities           | Yanzhi Huang | Cendong Lu, Nuona Liang   | Cendong Lu & Nuona Liang import Yanzhi Huang's `api.js` helper              |
| Swing API/HTTP          | Cendong Lu   | Nuona Liang, Yanzhi Huang | ApiClient & ApiHttpClient (Cendong); AdminFrame uses ApiClient for all API calls |
| Swing table integration | Nuona Liang  | Yanzhi Huang              | Yanzhi Huang's AdminFrame uses Nuona Liang's UserTableModel for the JTable |
| Swing login UI          | Cendong Lu   | Yanzhi Huang              | Login logic in ApiClient (Cendong); login fields and flow in AdminFrame (Yanzhi) |

### **Development Order**

1. **Sprint 1 Week 1**: Each person sets up their module foundations in parallel
2. **Sprint 1 Week 2**: Integration points tested (auth → articles → comments flow)
3. **Sprint 2**: Each person completes their advanced features independently
4. **Final Days**: Polish, integration testing, documentation

---

## **Technology Distribution Verification**

### **Cendong Lu** ✅ Cross-functional

- **Frontend**: 8 Svelte files (auth pages, components, state, validation)
- **Backend**: 2 Node.js files (users route, users service)
- **Java**: 4 Swing files (ApiHttpClient, ApiClient, LoginResult, JsonHelper) in packages http, api, model, util
- **Database**: 2 tables (users, sessions)
- **AI research feature**: Online “Related info” research agent (see **AI Article Content Research** section above)

### **Nuona Liang** ✅ Cross-functional

- **Frontend**: 8 Svelte files (article UI, editor, search)
- **Backend**: 7 Node.js files (articles, images, AI header image generation, db init)
- **Java**: 2 Swing files (User, UserTableModel) in packages model, ui
- **Database**: 3 tables + complete schema (articles, images, structure)
- **Config**: Package management, build tools
- **Docs**: Complete README

### **Yanzhi Huang** ✅ Cross-functional

- **Frontend**: 5 Svelte files (comments, ArticleCard, layout, app.css, API utils)
- **Backend**: 14 Node.js files (comments, admin, app setup, db connection, uploads, **auth route, sessions, auth middleware, validation**—auth API from Cendong for balance—AI header image generation)
- **Java**: 3 Swing files (Main, AdminFrame, AvatarPanel) in root package and ui
- **Database**: 1 table + seed data (comments, demo data)

**All three team members work across Svelte, Node.js/Express, and Java as required.**

---

## **Benefits of Feature-Based Module Allocation**

### **1. Clear Ownership**

- Each person is the expert on their module
- Easy to identify who to ask about specific features
- Clear responsibility for bugs and fixes

### **2. Minimal Merge Conflicts**

- Separate file ownership reduces git conflicts
- Integration points are well-defined
- Parallel development is easier

### **3. Complete Feature Delivery**

- Each person can demo a complete, working feature
- End-to-end testing within module is straightforward
- Features can be deployed independently

### **4. Fair & Balanced Workload**

- Cendong Lu: 36-50 hours (~15 files: 8 frontend + 2 backend + 4 Java + 1 docs; excludes AI research; auth API + sessions/middleware/validation moved to Yanzhi for balance)
- Nuona Liang: 48-72 hours (22 files: 8 frontend + 7 backend + 2 Java + 5 config/docs)
- Yanzhi Huang: 64-88 hours (~24 files: 5 frontend + 14 backend + 3 Java + 2 database/config; includes auth route, sessions, auth middleware, validation from Cendong)

### **5. Professional Practice**

- Mirrors real-world development (team owns services/features)
- Encourages deep understanding of a complete vertical slice
- Demonstrates software engineering principles

### **6. Easy Progress Tracking**

- Each module has clear deliverables
- Sprint demos show complete features (not scattered tasks)
- Teaching team can easily assess individual contributions

---

## **Sprint Demo Strategy**

### **Sprint 1 Demo** (Feb 6)

- **Cendong Lu demonstrates**: "I can register a new user, login, and logout. Watch the live username availability check."
- **Nuona Liang demonstrates**: "I can create an article, see it in the list, and view the detail page."
- **Yanzhi Huang demonstrates**: "I can add a comment on an article. As admin, I can see the user list with counts."

### **Sprint 2 Demo** (Feb 13)

- **Cendong Lu demonstrates**: "I can edit my profile, change avatar, see avatars everywhere. The UI is responsive."
- **Nuona Liang demonstrates**: "I can create rich articles with images using WYSIWYG editor. I can search and sort articles."
- **Yanzhi Huang demonstrates**: "Comments support nested replies to any depth. Swing admin client (Main → AdminFrame) manages users with avatar panel."

Each person showcases their **complete, working feature module** end-to-end.

---

## **Quick Reference: Java File Ownership**

| File (under `java-client/src/pccit/finalproject/javaclient/`) | Owner            | Purpose                              |
| ------------------------------------------------------------- | ---------------- | ------------------------------------ |
| `http/ApiHttpClient.java`                                     | **Cendong Lu**   | HTTP client + session cookies        |
| `api/ApiClient.java`                                          | **Cendong Lu**   | Login, logout, users, delete, avatar |
| `model/LoginResult.java`                                      | **Cendong Lu**   | Login result DTO                     |
| `util/JsonHelper.java`                                        | **Cendong Lu**   | JSON parsing for API responses       |
| `model/User.java`                                             | **Nuona Liang**  | User DTO                             |
| `ui/UserTableModel.java`                                      | **Nuona Liang**  | MVC TableModel for user table        |
| `Main.java`                                                   | **Yanzhi Huang** | Entry point                          |
| `ui/AdminFrame.java`                                          | **Yanzhi Huang** | Main frame + login/table/avatar/delete |
| `ui/AvatarPanel.java`                                         | **Yanzhi Huang** | Selected user + avatar thumbnail     |

**Total**: 9 Java files (package-based). Build/run: `javac -d out -sourcepath src src/pccit/finalproject/javaclient/Main.java` then `java -cp out pccit.finalproject.javaclient.Main`.

Demonstrates:

- ✅ Package layout (api, http, model, ui, util)
- ✅ Swing GUI (JFrame, JTable, JPanel)
- ✅ MVC (UserTableModel, User)
- ✅ Async (SwingWorker, ApiClient.fetchAvatarAsync)
- ✅ HTTP (java.net.http.HttpClient, CookieManager)
- ✅ No external JSON library (JsonHelper)

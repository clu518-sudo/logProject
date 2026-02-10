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

### **Java Files** (Swing)

- `java-client/LoginDialog.java` - Login/logout dialog component
  - Login form UI (username, password fields)
  - Login/logout buttons and event handlers
  - Session cookie management
  - Authentication state display
- `java-client/HTTPClient.java` - HTTP client utility
  - GET/POST/DELETE request methods
  - Cookie/session header management
  - JSON request/response handling
  - Error handling and status codes

**Java Total**: 2 files

### **Database Schema**

- `db/db-init.sql` (partial):
  - `users` table definition
  - `sessions` table definition

### **Documentation**

- `README.md` - Auth setup section

**Module Total**: ~13 source files (8 frontend + 2 backend + 2 Java + 1 docs) + database tables

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

### **Java Files** (Swing)

- `java-client/UserTableModel.java` - Custom TableModel (MVC pattern)
  - Implements AbstractTableModel
  - Manages user data list
  - Column definitions (username, articles, comments, created)
  - Observers/listeners for data updates
  - Add/remove/update user rows
- `java-client/UserTablePanel.java` - User table display panel
  - JTable component with custom model
  - Column sizing and formatting
  - Row selection handling (ListSelectionListener)
  - Scroll pane integration
  - Selection event firing to parent

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

### **Java Files** (Swing)

- `java-client/AdminApp.java` - Main application frame (integrates all components)
  - JFrame main window setup (BorderLayout)
  - Top panel with LoginDialog integration
  - Center panel with UserTablePanel integration
  - Right panel with AvatarPanel integration
  - Delete user button (admin operations)
  - Button enable/disable logic based on login/selection state
  - Menu bar (if needed)
  - Main method and application entry point
- `java-client/AvatarPanel.java` - Avatar display panel
  - JPanel for avatar image display
  - SwingWorker for async image loading (no UI freeze)
  - Image fetching from API
  - Image scaling and display
  - Loading indicator
  - Error handling for missing avatars

**Java Total**: 2 files

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

**Module Total**: ~23 source files (5 frontend + 14 backend + 2 Java + 1 database + 1 config)

**Estimated Effort**: 64-88 hours

---

## **Java/Swing File Structure** (Modular Design)

The Swing admin application is split into **6 separate Java files** for clean separation of concerns:

### **Cendong Lu's Java Components** (Authentication)

1. **LoginDialog.java**
   - Purpose: User authentication UI
   - Responsibilities:
     - Login form with username/password fields
     - Login and logout buttons
     - Session cookie storage
     - Authentication state management
     - Success/error message display
   - Integration: Called by AdminApp on startup

2. **HTTPClient.java**
   - Purpose: Reusable HTTP communication utility
   - Responsibilities:
     - GET/POST/DELETE request methods
     - Cookie header management (session persistence)
     - JSON serialization/deserialization
     - Error handling and HTTP status codes
     - Connection timeout configuration
   - Integration: Used by all other components for API calls

### **Nuona Liang's Java Components** (Data Model)

3. **UserTableModel.java**
   - Purpose: MVC TableModel for user data
   - Responsibilities:
     - Extends AbstractTableModel
     - Manages list of user objects
     - Defines columns: username, articles, comments, created date
     - Provides getValueAt, getRowCount, getColumnCount
     - Notifies listeners on data changes (fireTableDataChanged)
     - Add/remove/update row methods
   - Integration: Used by UserTablePanel

4. **UserTablePanel.java**
   - Purpose: User list display component
   - Responsibilities:
     - Creates JTable with UserTableModel
     - Configures column widths and renderers
     - Implements ListSelectionListener for row selection
     - Provides getSelectedUser() method
     - Wraps table in JScrollPane
     - Fires selection events to parent
   - Integration: Embedded in AdminApp center panel

### **Yanzhi Huang's Java Components** (Main Application & Features)

5. **AdminApp.java**
   - Purpose: Main application frame and integration point
   - Responsibilities:
     - JFrame setup (title, size, layout)
     - Integrates LoginDialog in top panel
     - Embeds UserTablePanel in center
     - Embeds AvatarPanel on right side
     - Delete user button and functionality
     - Refresh table after operations
     - Enable/disable buttons based on state
     - Application entry point (main method)
   - Integration: Main class that ties everything together

6. **AvatarPanel.java**
   - Purpose: Async avatar image display
   - Responsibilities:
     - JPanel with JLabel for image
     - SwingWorker for background image loading
     - Fetches avatar from API using HTTPClient
     - Scales image to fit panel
     - Shows loading indicator during fetch
     - Handles missing/error images gracefully
     - No UI freezing (proper threading)
   - Integration: Called by AdminApp when user is selected

### **Component Communication Flow**

```
AdminApp (main frame)
  ├─ Top: LoginDialog (Cendong Lu)
  │    └─ Uses: HTTPClient (Cendong Lu)
  │
  ├─ Center: UserTablePanel (Nuona Liang)
  │    ├─ Uses: UserTableModel (Nuona Liang)
  │    └─ Data from: HTTPClient (Cendong Lu)
  │
  ├─ Right: AvatarPanel (Yanzhi Huang)
  │    └─ Uses: HTTPClient (Cendong Lu)
  │
  └─ Bottom: Delete button (Yanzhi Huang)
       └─ Uses: HTTPClient (Cendong Lu)
```

### **Why Split Into Multiple Files?**

1. **Clear ownership**: Each person owns 2 complete Java files
2. **Separation of concerns**: Each file has a single, well-defined purpose
3. **Reusability**: HTTPClient can be used by all components
4. **Testability**: Each component can be tested independently
5. **MVC pattern**: Clear separation of Model (UserTableModel), View (panels), Controller (AdminApp)
6. **Professional practice**: Follows Java best practices (one public class per file)
7. **Reduced conflicts**: Different people work on different files

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
| Swing HTTP utility      | Cendong Lu   | Nuona Liang, Yanzhi Huang | Nuona Liang & Yanzhi Huang use Cendong Lu's HTTPClient for API calls       |
| Swing table integration | Nuona Liang  | Yanzhi Huang              | Yanzhi Huang's AdminApp uses Nuona Liang's UserTablePanel                  |
| Swing login integration | Cendong Lu   | Yanzhi Huang              | Yanzhi Huang's AdminApp embeds Cendong Lu's LoginDialog                    |

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
- **Java**: 2 Swing files (LoginDialog, HTTPClient)
- **Database**: 2 tables (users, sessions)
- **AI research feature**: Online “Related info” research agent (see **AI Article Content Research** section above)

### **Nuona Liang** ✅ Cross-functional

- **Frontend**: 8 Svelte files (article UI, editor, search)
- **Backend**: 7 Node.js files (articles, images, AI header image generation, db init)
- **Java**: 2 Swing files (UserTableModel, UserTablePanel)
- **Database**: 3 tables + complete schema (articles, images, structure)
- **Config**: Package management, build tools
- **Docs**: Complete README

### **Yanzhi Huang** ✅ Cross-functional

- **Frontend**: 5 Svelte files (comments, ArticleCard, layout, app.css, API utils)
- **Backend**: 14 Node.js files (comments, admin, app setup, db connection, uploads, **auth route, sessions, auth middleware, validation**—auth API from Cendong for balance—AI header image generation)
- **Java**: 2 Swing files (AdminApp main frame, AvatarPanel)
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

- Cendong Lu: 36-50 hours (13 files: 8 frontend + 2 backend + 2 Java + 1 docs; excludes AI research; auth API + sessions/middleware/validation moved to Yanzhi for balance)
- Nuona Liang: 48-72 hours (22 files: 8 frontend + 7 backend + 2 Java + 5 config/docs)
- Yanzhi Huang: 64-88 hours (23 files: 5 frontend + 14 backend + 2 Java + 2 database/config; includes auth route, sessions, auth middleware, validation from Cendong)

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
- **Yanzhi Huang demonstrates**: "Comments support nested replies to any depth. Swing admin panel manages users with avatar display."

Each person showcases their **complete, working feature module** end-to-end.

---

## **Quick Reference: Java File Ownership**

| File                  | Owner            | Purpose                              | Lines (est.) |
| --------------------- | ---------------- | ------------------------------------ | ------------ |
| `LoginDialog.java`    | **Cendong Lu**   | Login/logout UI + session management | 80-120       |
| `HTTPClient.java`     | **Cendong Lu**   | HTTP utility for API calls           | 150-200      |
| `UserTableModel.java` | **Nuona Liang**  | MVC TableModel for user data         | 80-120       |
| `UserTablePanel.java` | **Nuona Liang**  | JTable display panel                 | 60-100       |
| `AdminApp.java`       | **Yanzhi Huang** | Main frame + integration             | 150-200      |
| `AvatarPanel.java`    | **Yanzhi Huang** | Async avatar loading panel           | 100-150      |

**Total**: 6 Java files, ~620-890 lines, evenly distributed (2 files per person)

Each person creates **2 complete Java files** demonstrating:

- ✅ Object-oriented design
- ✅ Swing GUI components
- ✅ Event handling (listeners, observers)
- ✅ MVC pattern
- ✅ Async operations (SwingWorker)
- ✅ HTTP networking
- ✅ Professional code organization

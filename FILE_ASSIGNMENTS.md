# File Assignment by Feature Module

Based on feature-based module allocation in `SPRINT_BACKLOG_ALLOCATION.md`.

**Allocation Philosophy**: Each team member owns a complete feature module (vertical slice) including frontend UI, backend API, Java Swing components, and database schema. This ensures clear ownership, minimal conflicts, and complete feature responsibility.

---

## **ALPHA - User Authentication & Profile Module** 👤

**Module Responsibility**: Complete user identity management from registration to profile editing

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

#### Layout & Styling
- `frontend/src/routes/+layout.svelte` - App layout with auth-aware navigation
- `frontend/src/app.css` - Global styles + responsive design

**Frontend Total**: 10 files

### **Backend Files** (Node.js/Express)

#### Routes
- `backend/src/routes/auth.js` - Authentication endpoints (register, login, logout)
- `backend/src/routes/users.js` - User management endpoints (profile update, delete, avatar)

#### Services
- `backend/src/services/users.js` - User business logic (create, update, password hashing)
- `backend/src/services/sessions.js` - Session management

#### Middleware
- `backend/src/middleware/auth.js` - Authentication middleware (protect routes)

#### Utilities
- `backend/src/util/validation.js` - Server-side validation utilities

**Backend Total**: 6 files

### **Java Files** (Swing)
- `swing-admin/LoginDialog.java` - Login/logout dialog component
  - Login form UI (username, password fields)
  - Login/logout buttons and event handlers
  - Session cookie management
  - Authentication state display
- `swing-admin/HTTPClient.java` - HTTP client utility
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

**Module Total**: ~19 source files (10 frontend + 6 backend + 2 Java + 1 docs) + database tables

**Estimated Effort**: 52-72 hours

---

## **BELTA - Articles & Content Module** 📝

**Module Responsibility**: Complete article lifecycle including creation, viewing, editing, search, and images

### **Frontend Files** (Svelte)

#### Article Pages & Components
- `frontend/src/routes/+page.svelte` - Home page route (article list)
- `frontend/src/routes/article/[id]/+page.svelte` - Article detail page route
- `frontend/src/routes/editor/+page.svelte` - New article editor route
- `frontend/src/routes/editor/[id]/+page.svelte` - Edit article route
- `frontend/src/lib/pages/Home.svelte` - Article list component with search/sort
- `frontend/src/lib/pages/ArticleDetail.svelte` - Article detail view
- `frontend/src/lib/pages/ArticleEditor.svelte` - Article editor wrapper
- `frontend/src/lib/components/ArticleCard.svelte` - Article card component
- `frontend/src/lib/components/TinyEditor.svelte` - WYSIWYG editor (TinyMCE wrapper)

**Frontend Total**: 9 files

### **Backend Files** (Node.js/Express)

#### Routes
- `backend/src/routes/articles.js` - Article CRUD endpoints + search/sort

#### Services
- `backend/src/services/articles.js` - Article business logic
- `backend/src/services/images.js` - Image upload & storage service

#### Database
- `backend/src/db/db.js` - Database connection setup
- `backend/src/db/init.js` - Database initialization

#### Utilities
- `backend/src/util/uploads.js` - File upload utilities (multer config, storage)

**Backend Total**: 6 files

### **Java Files** (Swing)
- `swing-admin/UserTableModel.java` - Custom TableModel (MVC pattern)
  - Implements AbstractTableModel
  - Manages user data list
  - Column definitions (username, articles, comments, created)
  - Observers/listeners for data updates
  - Add/remove/update user rows
- `swing-admin/UserTablePanel.java` - User table display panel
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

**Module Total**: ~22 source files (9 frontend + 6 backend + 2 Java + 1 database + 4 config/docs)

**Estimated Effort**: 54-80 hours

---

## **GAMMA - Comments & Administration Module** 💬🔧

**Module Responsibility**: Complete commenting system (flat & nested) + admin panel for user management

### **Frontend Files** (Svelte)

#### Comment Components
- `frontend/src/lib/components/CommentItem.svelte` - Comment display (recursive for nesting)

#### API Utilities
- `frontend/src/lib/api.js` - API helper functions (fetch wrappers, error handling)

**Frontend Total**: 2 files

### **Backend Files** (Node.js/Express)

#### Routes
- `backend/src/routes/comments.js` - Comment CRUD endpoints (including nested)
- `backend/src/routes/admin.js` - Admin API endpoints (user list, delete user)

#### Services
- `backend/src/services/comments.js` - Comment business logic (nested queries)

#### Main Application
- `backend/src/app.js` - Express app setup, middleware registration, routes

#### Utilities
- `backend/src/util/http.js` - HTTP utilities (status codes, error responses)

**Backend Total**: 5 files

### **Java Files** (Swing)
- `swing-admin/AdminApp.java` - Main application frame (integrates all components)
  - JFrame main window setup (BorderLayout)
  - Top panel with LoginDialog integration
  - Center panel with UserTablePanel integration
  - Right panel with AvatarPanel integration
  - Delete user button (admin operations)
  - Button enable/disable logic based on login/selection state
  - Menu bar (if needed)
  - Main method and application entry point
- `swing-admin/AvatarPanel.java` - Avatar display panel
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
- `swing-admin/README.md` - Swing admin usage guide (if needed)

**Module Total**: ~11 source files (2 frontend + 5 backend + 2 Java + 1 database + 1 config)

**Estimated Effort**: 56-80 hours

---

## **Java/Swing File Structure** (Modular Design)

The Swing admin application is split into **6 separate Java files** for clean separation of concerns:

### **Alpha's Java Components** (Authentication)
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

### **Belta's Java Components** (Data Model)
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

### **Gamma's Java Components** (Main Application & Features)
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
  ├─ Top: LoginDialog (alpha)
  │    └─ Uses: HTTPClient (alpha)
  │
  ├─ Center: UserTablePanel (belta)
  │    ├─ Uses: UserTableModel (belta)
  │    └─ Data from: HTTPClient (alpha)
  │
  ├─ Right: AvatarPanel (gamma)
  │    └─ Uses: HTTPClient (alpha)
  │
  └─ Bottom: Delete button (gamma)
       └─ Uses: HTTPClient (alpha)
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
- **Alpha** owns all auth-related code (no one else touches auth)
- **Belta** owns all article-related code (no one else touches articles)
- **Gamma** owns all comment & admin-related code (no one else touches comments/admin)

### **Integration Points** (Minimal overlap)

| Integration | Owner A | Owner B | How it works |
|-------------|---------|---------|--------------|
| Auth protects Articles | alpha | belta | Belta imports alpha's auth middleware |
| Auth protects Comments | alpha | gamma | Gamma imports alpha's auth middleware |
| Comments on Articles | belta | gamma | Gamma's comment component used in belta's article detail page |
| API utilities | gamma | alpha, belta | Alpha & belta import gamma's `api.js` helper |
| Swing HTTP utility | alpha | belta, gamma | Belta & gamma use alpha's HTTPClient for API calls |
| Swing table integration | belta | gamma | Gamma's AdminApp uses belta's UserTablePanel |
| Swing login integration | alpha | gamma | Gamma's AdminApp embeds alpha's LoginDialog |

### **Development Order**
1. **Sprint 1 Week 1**: Each person sets up their module foundations in parallel
2. **Sprint 1 Week 2**: Integration points tested (auth → articles → comments flow)
3. **Sprint 2**: Each person completes their advanced features independently
4. **Final Days**: Polish, integration testing, documentation

---

## **Technology Distribution Verification**

### **Alpha** ✅ Cross-functional
- **Frontend**: 10 Svelte files (pages, components, state management)
- **Backend**: 6 Node.js files (routes, services, middleware)
- **Java**: 2 Swing files (LoginDialog, HTTPClient)
- **Database**: 2 tables (users, sessions)

### **Belta** ✅ Cross-functional
- **Frontend**: 9 Svelte files (article UI, editor, search)
- **Backend**: 6 Node.js files (articles, images, database setup)
- **Java**: 2 Swing files (UserTableModel, UserTablePanel)
- **Database**: 3 tables + complete schema (articles, images, structure)
- **Config**: Package management, build tools
- **Docs**: Complete README

### **Gamma** ✅ Cross-functional
- **Frontend**: 2 Svelte files (comments, API utils)
- **Backend**: 5 Node.js files (comments, admin, app setup)
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
- Alpha: 52-72 hours (19 files: 10 frontend + 6 backend + 2 Java + 1 docs)
- Belta: 54-80 hours (22 files: 9 frontend + 6 backend + 2 Java + 5 config/docs)
- Gamma: 56-80 hours (11 files: 2 frontend + 5 backend + 2 Java + 2 database/config)

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
- **Alpha demonstrates**: "I can register a new user, login, and logout. Watch the live username availability check."
- **Belta demonstrates**: "I can create an article, see it in the list, and view the detail page."
- **Gamma demonstrates**: "I can add a comment on an article. As admin, I can see the user list with counts."

### **Sprint 2 Demo** (Feb 13)
- **Alpha demonstrates**: "I can edit my profile, change avatar, see avatars everywhere. The UI is responsive."
- **Belta demonstrates**: "I can create rich articles with images using WYSIWYG editor. I can search and sort articles."
- **Gamma demonstrates**: "Comments support nested replies to any depth. Swing admin panel manages users with avatar display."

Each person showcases their **complete, working feature module** end-to-end.

---

## **Quick Reference: Java File Ownership**

| File | Owner | Purpose | Lines (est.) |
|------|-------|---------|--------------|
| `LoginDialog.java` | **alpha** | Login/logout UI + session management | 80-120 |
| `HTTPClient.java` | **alpha** | HTTP utility for API calls | 150-200 |
| `UserTableModel.java` | **belta** | MVC TableModel for user data | 80-120 |
| `UserTablePanel.java` | **belta** | JTable display panel | 60-100 |
| `AdminApp.java` | **gamma** | Main frame + integration | 150-200 |
| `AvatarPanel.java` | **gamma** | Async avatar loading panel | 100-150 |

**Total**: 6 Java files, ~620-890 lines, evenly distributed (2 files per person)

Each person creates **2 complete Java files** demonstrating:
- ✅ Object-oriented design
- ✅ Swing GUI components
- ✅ Event handling (listeners, observers)
- ✅ MVC pattern
- ✅ Async operations (SwingWorker)
- ✅ HTTP networking
- ✅ Professional code organization

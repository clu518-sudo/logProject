# File Assignment by Team Member

Based on `SPRINT_BACKLOG_ALLOCATION.md` and actual project structure.

---

## **ALPHA's Files**

### **Root/Documentation**
- `README.md` - Project setup & documentation
- `PLANNING_INITIAL_DESIGN.md` - Shared design doc

### **Frontend - Authentication UI (S1-4)**
- `frontend/src/routes/register/+page.svelte` - Registration page route
- `frontend/src/routes/login/+page.svelte` - Login page route
- `frontend/src/lib/pages/Register.svelte` - Registration form component
- `frontend/src/lib/pages/Login.svelte` - Login form component
- `frontend/src/lib/validation.js` - Username/password validation logic
- `frontend/src/lib/store.js` - Auth state management (shared)

### **Backend - Comments (S1-7)**
- `backend/src/routes/comments.js` - Comment endpoints
- `backend/src/services/comments.js` - Comment business logic

### **Frontend - WYSIWYG Editor (S2-3)**
- `frontend/src/routes/editor/+page.svelte` - New article editor route
- `frontend/src/routes/editor/[id]/+page.svelte` - Edit article route
- `frontend/src/lib/pages/ArticleEditor.svelte` - Editor component
- `frontend/src/lib/components/TinyEditor.svelte` - TinyMCE wrapper

### **Frontend - Search/Sort (S2-5)**
- `frontend/src/lib/pages/Home.svelte` - Home with search/sort controls

### **Frontend - Responsive UI & Polish (S2-13)**
- `frontend/src/app.css` - Global styles & responsive design
- `frontend/src/routes/+layout.svelte` - Layout with loading states

### **Backend - Comment Delete Rules (S2-8)**
- `backend/src/routes/comments.js` - DELETE endpoint with permissions (shared with comments work)

### **Java - Swing Admin (S1-10, S2-10)**
- `swing-admin/AdminApp.java` - Main Swing application
  - Login/logout functionality
  - JTable for user list
  - Avatar panel with async loading
  - HTTP helper utilities

**Total: ~14 primary files**

---

## **BELTA's Files**

### **Database (S1-2)**
- `db/db-init.sql` - Complete schema & seed data

### **Backend - Database Setup**
- `backend/src/db/db.js` - Database connection
- `backend/src/db/init.js` - Database initialization

### **Backend - Articles (S1-5)**
- `backend/src/routes/articles.js` - Article CRUD endpoints
- `backend/src/services/articles.js` - Article business logic

### **Frontend - Comments UI (S1-8)**
- `frontend/src/lib/components/CommentItem.svelte` - Individual comment display

### **Frontend/Backend - Profile System (S2-1)**
- `frontend/src/routes/profile/+page.svelte` - Profile page route
- `frontend/src/lib/pages/Profile.svelte` - Profile edit component
- `backend/src/routes/users.js` - PATCH/DELETE user endpoints (shared)
- `backend/src/services/users.js` - User update/delete logic (shared)

### **Backend - Article Images (S2-4)**
- `backend/src/services/images.js` - Image upload & storage
- `backend/src/util/uploads.js` - File upload utilities

### **Frontend - "My Articles" View (S2-6)**
- `frontend/src/lib/pages/Home.svelte` - Filter for "my articles" (shared with alpha)

### **Frontend - Comment Delete UI (S2-8)**
- `frontend/src/lib/components/CommentItem.svelte` - Delete button UI (shared)

### **Java - Swing Delete (S2-11)**
- `swing-admin/AdminApp.java` - Delete user functionality (shared with alpha)

### **Documentation (S2-15)**
- `README.md` - Final documentation updates

**Total: ~14 primary files**

---

## **GAMMA's Files**

### **Backend - Authentication System (S1-3)**
- `backend/src/routes/auth.js` - Login/logout/register endpoints
- `backend/src/routes/users.js` - User registration & exists check
- `backend/src/services/users.js` - User creation & password hashing
- `backend/src/services/sessions.js` - Session management
- `backend/src/middleware/auth.js` - Authentication middleware

### **Frontend - Articles Display (S1-6)**
- `frontend/src/routes/+page.svelte` - Home page route
- `frontend/src/routes/article/[id]/+page.svelte` - Article detail route
- `frontend/src/lib/pages/Home.svelte` - Article list component (shared)
- `frontend/src/lib/pages/ArticleDetail.svelte` - Article detail component
- `frontend/src/lib/components/ArticleCard.svelte` - Article card component
- `frontend/src/lib/api.js` - API helper functions

### **Backend - Admin API (S1-9)**
- `backend/src/routes/admin.js` - Admin endpoints (GET users, article counts)

### **Backend - Main Application (S1-9)**
- `backend/src/app.js` - Express app setup & middleware
- `backend/src/util/http.js` - HTTP utilities
- `backend/src/util/validation.js` - Backend validation

### **Frontend/Backend - Avatars (S2-2)**
- `backend/src/routes/users.js` - Avatar upload endpoint (shared)
- Avatar display components (integrated into existing components)

### **Frontend - Nested Comments (S2-7)**
- `frontend/src/lib/components/CommentItem.svelte` - Recursive comment component (shared)
- `backend/src/services/comments.js` - Nested comment queries (shared)

### **Backend - Admin Delete User (S2-9)**
- `backend/src/routes/admin.js` - DELETE user endpoint (shared)

### **Java - Swing Patterns (S2-12)**
- `swing-admin/AdminApp.java` - MVC patterns documentation (shared)

### **Database - Seed Data (S2-16)**
- `db/db-init.sql` - Seed data section (shared with belta)

**Total: ~18 primary files**

---

## **Shared Configuration Files** (All team members)

### **Frontend Config**
- `frontend/package.json`
- `frontend/svelte.config.js`
- `frontend/vite.config.js`
- `frontend/src/routes/+layout.js`

### **Backend Config**
- `backend/package.json`
- `backend/.nvmrc`

### **Project Root**
- `PLANNING_INITIAL_DESIGN.md`
- `SPRINT_BACKLOG_ALLOCATION.md`
- `IMPLEMENTATION_PLAN.md`
- `RISK_MITIGATION_PLAN.md`
- `WIREFRAMES.md`

---

## **Summary by Technology Area**

### **Alpha** (Cross-functional)
- **Frontend**: 9 files (Auth UI, Editor, Search, Responsive)
- **Backend**: 2 files (Comments)
- **Java**: 1 file (Swing - shared)
- **Config/Docs**: 2 files

### **Belta** (Cross-functional)
- **Database**: 1 file (schema + seed)
- **Frontend**: 4 files (Comments UI, Profile, My Articles)
- **Backend**: 8 files (DB setup, Articles, Images, Users)
- **Java**: 1 file (Swing - shared)
- **Config/Docs**: 1 file

### **Gamma** (Cross-functional)
- **Frontend**: 7 files (Articles display, Home, API)
- **Backend**: 12 files (Auth system, Admin, Services, Main app)
- **Java**: 1 file (Swing - shared)
- **Database**: 1 file (seed data - shared)

---

## **Notes**

1. **Cross-functional requirement**: All team members work across frontend (Svelte), backend (Node.js/Express), and Java (Swing) as required by the project brief.

2. **Shared files**: Some files are marked as "shared" where multiple team members collaborate or where ownership overlaps (e.g., `Home.svelte` has search/sort from alpha and article list from gamma).

3. **Sprint alignment**: File assignments align with task allocations in `SPRINT_BACKLOG_ALLOCATION.md`.

4. **Fair workload**: Distribution ensures approximately equal effort across all team members (~14-18 primary files each).

5. **Task IDs**: Sprint task IDs (e.g., S1-4, S2-3) are included to trace files back to specific backlog items.

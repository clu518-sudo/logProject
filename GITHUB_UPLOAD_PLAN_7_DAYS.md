# GitHub Upload Plan – 7 Days (by Person)

Based on `FILE_ASSIGNMENTS.md`. **Database**: All DB schema and migrations are uploaded by **Cendong Lu** only (no separate DB uploads by Nuona or Yanzhi).

---

## **Cendong Lu** – Upload Schedule

**Extra responsibility**: All database uploads for the project (db-init.sql, backend migrations, article_research table, etc.).

| Day | Upload focus | Files to push |
|-----|--------------|----------------|
| **Day 1** | Project setup + **full database** | `.gitignore`, `db/db-init.sql` (or `backend/src/sql/db-init.sql`), `backend/src/db/init.js` (DB init/migrations). README.md auth + DB setup section. |
| **Day 2** | Auth frontend + user profile backend only | `frontend/src/routes/register/+page.svelte`, `frontend/src/routes/login/+page.svelte`, `frontend/src/routes/profile/+page.svelte`, `frontend/src/lib/pages/Register.svelte`, `frontend/src/lib/pages/Login.svelte`, `frontend/src/lib/pages/Profile.svelte`, `frontend/src/lib/store.js`, `frontend/src/lib/validation.js`. `backend/src/routes/users.js`, `backend/src/services/users.js`. *(Auth route, sessions, middleware, validation pushed by Yanzhi – see Yanzhi Day 2.)* |
| **Day 3** | Java (Swing) auth + HTTP + API client | `java-client/src/pccit/finalproject/javaclient/http/ApiHttpClient.java`, `java-client/src/pccit/finalproject/javaclient/api/ApiClient.java`, `java-client/src/pccit/finalproject/javaclient/model/LoginResult.java`, `java-client/src/pccit/finalproject/javaclient/util/JsonHelper.java`. |
| **Day 4** | AI research – backend | `backend/src/routes/articles.js` (research endpoints + SSE), `backend/src/services/article_research_agent.js`, `backend/src/services/article_research.js`, `backend/src/services/research_tools.js`, `backend/src/services/research_rate_limit.js`, `backend/src/services/article_events.js`. DB: `article_research` table (in Cendong’s DB upload). |
| **Day 5** | AI research – frontend | `frontend/src/lib/pages/ArticleDetail.svelte` (Related info panel + SSE for research). |
| **Day 6** | (Buffer / integration) | Any auth or research fixes, README updates, integration tests. |
| **Day 7** | (Final) | Final DB script updates, last README/auth docs, tag/release if needed. |

---

## **Nuona Liang** – Upload Schedule

**No database uploads** (Cendong handles all DB). Focus: articles, content, images, AI header image (shared), config/docs.

| Day | Upload focus | Files to push |
|-----|--------------|----------------|
| **Day 1** | Article routes + list + detail | `frontend/src/routes/+page.svelte`, `frontend/src/routes/article/[id]/+page.svelte`, `frontend/src/lib/pages/Home.svelte`, `frontend/src/lib/pages/ArticleDetail.svelte` (article view only; Related info is Cendong). `backend/src/routes/articles.js` (article CRUD + search/sort), `backend/src/services/articles.js`. |
| **Day 2** | Editor + TinyMCE | `frontend/src/routes/editor/+page.svelte`, `frontend/src/routes/editor/[id]/+page.svelte`, `frontend/src/lib/pages/ArticleEditor.svelte`, `frontend/src/lib/components/TinyEditor.svelte`. `frontend/package.json`, `frontend/svelte.config.js`, `frontend/vite.config.js`. |
| **Day 3** | Images + backend init | `backend/src/services/images.js`, `backend/src/db/init.js` (if not owned by Cendong for DB; otherwise only article/image logic). `backend/package.json`. |
| **Day 4** | AI header image (shared) | `backend/src/services/article_header_image_ai.js`, `backend/src/services/image_generation.js`, `backend/src/services/text_generation.js`. |
| **Day 5** | Java (Swing) – user model + table | `java-client/src/pccit/finalproject/javaclient/model/User.java`, `java-client/src/pccit/finalproject/javaclient/ui/UserTableModel.java`. |
| **Day 6** | Config + README | `README.md` (setup, demo users, API, features, deployment). |
| **Day 7** | (Final) | Polish, README tweaks, integration checks. |

---

## **Yanzhi Huang** – Upload Schedule

**No database uploads** (Cendong handles all DB). Focus: comments, admin, layout, styling, **auth API** (auth route + sessions, middleware, validation – per FILE_ASSIGNMENTS), shared utilities, AI header image (shared).

| Day | Upload focus | Files to push |
|-----|--------------|----------------|
| **Day 1** | Layout + global styles + API | `frontend/src/routes/+layout.svelte`, `frontend/src/app.css`, `frontend/src/lib/api.js`. |
| **Day 2** | Comments + Auth API backend | `frontend/src/lib/components/CommentItem.svelte`, `backend/src/routes/comments.js`, `backend/src/services/comments.js`. **Auth API (from Cendong assignment):** `backend/src/routes/auth.js`, `backend/src/services/sessions.js`, `backend/src/middleware/auth.js`, `backend/src/util/validation.js`. |
| **Day 3** | ArticleCard + admin API | `frontend/src/lib/components/ArticleCard.svelte`, `backend/src/routes/admin.js`. |
| **Day 4** | App setup + DB connection + uploads | `backend/src/app.js`, `backend/src/db/db.js`, `backend/src/util/uploads.js`, `backend/src/util/http.js`. |
| **Day 5** | AI header image (shared) | Same shared files as Nuona: `backend/src/services/article_header_image_ai.js`, `backend/src/services/image_generation.js`, `backend/src/services/text_generation.js` (coordinate with Nuona – one person pushes, or split commits). |
| **Day 6** | Java (Swing) – main app + avatar | `java-client/src/pccit/finalproject/javaclient/Main.java`, `java-client/src/pccit/finalproject/javaclient/ui/AdminFrame.java`, `java-client/src/pccit/finalproject/javaclient/ui/AvatarPanel.java`. `backend/.nvmrc`. `java-client/README.md`. |
| **Day 7** | (Final) | Polish, layout/nav fixes, admin flow checks. |

---

## **Summary**

| Day | Cendong Lu | Nuona Liang | Yanzhi Huang |
|-----|------------|-------------|--------------|
| **1** | DB + project setup, README auth | Article list/detail + backend CRUD | Layout, app.css, api.js |
| **2** | Auth frontend + user profile backend (users route, user service) | Editor + TinyMCE + config | Comments + Auth API (auth route, sessions, middleware, validation) |
| **3** | Swing: ApiHttpClient, ApiClient, LoginResult, JsonHelper | Images + backend init | ArticleCard + admin API |
| **4** | AI research backend + DB | AI header image backend | app.js, db.js, uploads, http |
| **5** | AI research frontend (ArticleDetail) | Swing: User, UserTableModel | AI header image (shared) or Swing |
| **6** | Buffer / integration | README full docs | Swing: Main, AdminFrame, AvatarPanel |
| **7** | Final DB + docs | Polish | Polish |

- **Database**: Only **Cendong** pushes `db/db-init.sql`, `backend/src/sql/db-init.sql`, `backend/src/db/init.js`, and any migration/seed files.
- **Auth backend split**: **Cendong** pushes auth frontend + users route + user service (Day 2); **Yanzhi** pushes auth route (login/logout/current user), sessions, auth middleware, and validation (Day 2). Coordinate so both are in before protected routes (articles/comments) depend on middleware.
- **Shared files** (e.g. `article_header_image_ai.js`, `image_generation.js`, `text_generation.js`): Nuona and Yanzhi should coordinate so one person does the main push or they merge before pushing to avoid conflicts.
- **Order**: Day 1 layout + DB + auth/article foundations; Days 2–4 features; Days 5–6 Swing + docs; Day 7 final polish.

Use this plan to assign branches/PRs or direct pushes per person per day.

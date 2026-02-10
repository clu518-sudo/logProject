# Lines of Code by Person (per FILE_ASSIGNMENTS.md)

Counts are from the current codebase. **Shared files** are counted for each owner (so totals can overlap).

---

## **Cendong Lu** – User Auth, Profile, AI Research & **all database**

| Category                  | File                                                               | Lines |
| ------------------------- | ------------------------------------------------------------------ | ----- |
| **Frontend (auth)**       | `frontend/src/routes/register/+page.svelte`                        | 4     |
|                           | `frontend/src/routes/login/+page.svelte`                           | 4     |
|                           | `frontend/src/routes/profile/+page.svelte`                         | 4     |
|                           | `frontend/src/lib/pages/Register.svelte`                           | 276   |
|                           | `frontend/src/lib/pages/Login.svelte`                              | 67    |
|                           | `frontend/src/lib/pages/Profile.svelte`                            | 378   |
|                           | `frontend/src/lib/store.js`                                        | 31    |
|                           | `frontend/src/lib/validation.js`                                   | 53    |
| **Backend (auth)**        | `backend/src/routes/auth.js`                                       | 144   |
|                           | `backend/src/routes/users.js`                                      | 326   |
|                           | `backend/src/services/users.js`                                    | 172   |
|                           | `backend/src/services/sessions.js`                                 | 113   |
|                           | `backend/src/middleware/auth.js`                                   | 79    |
|                           | `backend/src/util/validation.js`                                   | 95    |
| **Java (Swing)**          | `java-client/LoginDialog.java`                                     | 169   |
|                           | `java-client/HTTPClient.java`                                      | 253   |
| **AI research (backend)** | `backend/src/services/article_research_agent.js`                   | 222   |
|                           | `backend/src/services/article_research.js`                         | 91    |
|                           | `backend/src/services/research_tools.js`                           | 114   |
|                           | `backend/src/services/research_rate_limit.js`                      | 17    |
|                           | `backend/src/services/article_events.js`                           | 24    |
| **Database (all DB)**     | `backend/src/db/init.js`                                           | 166   |
|                           | `backend/src/sql/db-init.sql`                                      | 107   |
| **Shared**                | `frontend/src/lib/pages/ArticleDetail.svelte` (Related info panel) | 510   |
|                           | `backend/src/routes/articles.js` (research endpoints + SSE)        | 399   |

**Cendong Lu subtotal:** **3,814** lines

---

## **Nuona Liang** – Articles & content, AI header image (shared)

| Category                     | File                                              | Lines |
| ---------------------------- | ------------------------------------------------- | ----- |
| **Frontend (articles)**      | `frontend/src/routes/+page.svelte`                | 4     |
|                              | `frontend/src/routes/article/[id]/+page.svelte`   | 11    |
|                              | `frontend/src/routes/editor/+page.svelte`         | 4     |
|                              | `frontend/src/routes/editor/[id]/+page.svelte`    | 11    |
|                              | `frontend/src/lib/pages/Home.svelte`              | 534   |
|                              | `frontend/src/lib/pages/ArticleDetail.svelte`     | 510   |
|                              | `frontend/src/lib/pages/ArticleEditor.svelte`     | 272   |
|                              | `frontend/src/lib/components/TinyEditor.svelte`   | 63    |
| **Backend (articles)**       | `backend/src/routes/articles.js`                  | 399   |
|                              | `backend/src/services/articles.js`                | 148   |
|                              | `backend/src/services/images.js`                  | 17    |
| **AI header image (shared)** | `backend/src/services/article_header_image_ai.js` | 66    |
|                              | `backend/src/services/image_generation.js`        | 193   |
|                              | `backend/src/services/text_generation.js`         | 173   |
| **Config**                   | `frontend/package.json`                           | 23    |
|                              | `frontend/svelte.config.js`                       | 10    |
|                              | `frontend/vite.config.js`                         | 12    |
|                              | `backend/package.json`                            | 25    |
| **Java (Swing)**             | `java-client/UserTableModel.java`                 | 68    |
|                              | `java-client/UserTablePanel.java`                 | 55    |
| **Docs**                     | `README.md`                                       | 127   |

**Nuona Liang subtotal:** **2,725** lines

---

## **Yanzhi Huang** – Comments, admin, layout, shared utilities, AI header image (shared)

| Category                         | File                                              | Lines |
| -------------------------------- | ------------------------------------------------- | ----- |
| **Frontend (layout & comments)** | `frontend/src/lib/components/CommentItem.svelte`  | 43    |
|                                  | `frontend/src/lib/components/ArticleCard.svelte`  | 227   |
|                                  | `frontend/src/routes/+layout.svelte`              | 47    |
|                                  | `frontend/src/app.css`                            | 211   |
|                                  | `frontend/src/lib/api.js`                         | 92    |
| **Backend (comments & admin)**   | `backend/src/routes/comments.js`                  | 72    |
|                                  | `backend/src/routes/admin.js`                     | 40    |
|                                  | `backend/src/services/comments.js`                | 57    |
| **AI header image (shared)**     | `backend/src/services/article_header_image_ai.js` | 66    |
|                                  | `backend/src/services/image_generation.js`        | 193   |
|                                  | `backend/src/services/text_generation.js`         | 173   |
| **Backend (app & utils)**        | `backend/src/app.js`                              | 61    |
|                                  | `backend/src/db/db.js`                            | 58    |
|                                  | `backend/src/util/uploads.js`                     | 86    |
|                                  | `backend/src/util/http.js`                        | 126   |
| **Java (Swing)**                 | `java-client/AdminApp.java`                       | 217   |
|                                  | `java-client/AvatarPanel.java`                    | 85    |
| **Config**                       | `backend/.nvmrc`                                  | 1     |

**Yanzhi Huang subtotal:** **1,855** lines

_(java-client/README.md is assigned to Yanzhi but not present in repo; 0 lines counted.)_

---

## **Summary**

| Person                    | Total lines (charged) | Notes                                                                    |
| ------------------------- | --------------------- | ------------------------------------------------------------------------ |
| **Cendong Lu**            | **3,814**             | Includes all DB; shared: ArticleDetail.svelte, articles.js               |
| **Nuona Liang**           | **2,725**             | Shared: ArticleDetail.svelte, articles.js; AI image services with Yanzhi |
| **Yanzhi Huang**          | **1,855**             | AI image services shared with Nuona                                      |
| **Total (if no overlap)** | ~6,800                | Shared files counted once → lower total                                  |

**Shared files (counted in more than one person’s total):**

- `ArticleDetail.svelte`, `articles.js` → Cendong + Nuona
- `article_header_image_ai.js`, `image_generation.js`, `text_generation.js` → Nuona + Yanzhi

So “total lines charged” (3,814 + 2,725 + 1,855 = **8,394**) is larger than the project’s actual line count because of these overlaps.

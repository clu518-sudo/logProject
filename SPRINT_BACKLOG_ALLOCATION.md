## Sprint Backlog + Initial Task Allocation (Due Feb 5)

Aligned with `PGCIT-Project-Brief-LY-2025.pdf` deliverable “Sprint backlog with initial task allocation”.

### Assumptions (keep it simple)

- Timeline is short (Feb 2 → Feb 13 code due).
- We will run **2 sprints** and aim to always keep a working build.
- This backlog is written so an **entry-level** team can follow it.

Team members: alpha, belta, and gamma. All team members are involved in front-end, back-end, and Java development.

### Definition of Done (DoD) for a task

- Code runs locally.
- Basic manual test done (at least one happy path + one failure path).
- Error messages are shown in UI (no `alert()`).
- API returns correct status codes and JSON (where required).

---

## Sprint 1 (Feb 2 → Feb 6): Core foundations + vertical slice

**Sprint goal**: working end-to-end flow: register/login → create article → view article → comment once.

### Sprint 1 backlog (initial allocation)

| ID | Epic | Task | Maps to brief | Est. | Owner |
|----|------|------|---------------|------|-------|
| S1-1 | Project setup | Confirm folder structure + dev run commands; agree coding style; ensure the “single source of truth” ERD + API spec is in `PLANNING_INITIAL_DESIGN.md` | PM | 1–2h | alpha |
| S1-2 | Database | Create DB schema script (`db-init.sql` skeleton): `users`, `sessions`, `articles`, `comments`, `images` with FKs + cascades | Req. 7, 15; Deliverable | 3–5h | belta |
| S1-3 | Auth | Implement `POST /api/users` register (hash+salt), `GET /api/users/exists`, `POST /api/login`, `POST /api/logout`, `GET /api/me` | Req. 1–6; Admin API 1–2 | 6–10h | gamma |
| S1-4 | Frontend auth UI | Register page: live username availability, password match validation, avatar choice UI placeholder; Login/Logout UI | Req. 1–3, 6 | 6–10h | alpha |
| S1-5 | Articles (backend) | CRUD endpoints: `GET /api/articles`, `POST /api/articles`, `GET /api/articles/:id` (minimum) | Req. 8, 10 | 4–7h | belta |
| S1-6 | Articles (frontend) | Article list page + article detail page wired to API | Req. 8 | 4–7h | gamma |
| S1-7 | Comments (backend) | `POST /api/articles/:id/comments`, `GET /api/articles/:id/comments` (flat list) | Req. 13–15 | 4–7h | alpha |
| S1-8 | Comments (frontend) | Basic comments UI on article detail (flat list + add comment form) | Req. 13–14 | 4–6h | belta |
| S1-9 | Admin API (backend) | Add `is_admin` to users, then implement admin-only `GET /api/users` returning `articleCount` | Admin API 3 | 3–5h | gamma |
| S1-10 | Swing skeleton | Create Swing JFrame + login/logout buttons + JTable + basic HTTP helper (no freeze) | Swing 1–8 | 6–10h | alpha |

**Sprint 1 demo checklist (for check-in)**:

- Register user (shows “username taken” live).
- Login and stay logged in (cookie/session).
- Create one article, view it in list, open detail.
- Add one comment and see it display.
- Admin user can call `GET /api/users` (even via curl/Postman).
- Swing UI can login and populate the JTable (even if avatar panel is placeholder).

---

## Sprint 2 (Feb 7 → Feb 13): Complete requirements + polish + submission artifacts

**Sprint goal**: finish all requirements + make it stable + docs + seed data.

### Sprint 2 backlog (initial allocation)

| ID | Epic | Task | Maps to brief | Est. | Owner |
|----|------|------|---------------|------|-------|
| S2-1 | Profile | Implement `PATCH /api/users/me`, `DELETE /api/users/me` (cascade deletes verified) + profile UI | Req. 7 | 6–10h | alpha, belta |
| S2-2 | Avatars | Predefined avatar list + optional upload endpoint `POST /api/users/me/avatar` + display avatars in UI | Req. 5 | 6–10h | gamma |
| S2-3 | WYSIWYG | Integrate TinyMCE editor page (minimal toolbar: headings, bold/italic/underline, lists) | Req. 11 | 6–10h | alpha |
| S2-4 | Article images | Header image upload + embedded images via editor upload endpoint (`/api/articles/:id/images`) | Req. 12 | 8–14h | belta, gamma |
| S2-5 | Search/sort | Implement search + sort by title/username/date (UX-friendly controls) | Req. 9 | 6–10h | alpha |
| S2-6 | “My articles” | Add “My articles” view (server filter `mine=true` or client-side) | Req. 8 | 2–4h | belta |
| S2-7 | Nested comments | Implement replies to any depth (DB `parent_comment_id` + recursive Svelte component) | Req. 15 | 6–12h | gamma |
| S2-8 | Comment delete rules | `DELETE /api/comments/:id` allowed for comment author OR article author; UI controls reflect permissions | Req. 16 | 4–7h | alpha, belta |
| S2-9 | Admin delete user | Implement `DELETE /api/users/:id` (admin only) + verify cascade removes articles/comments | Admin API 4 | 4–7h | gamma |
| S2-10 | Swing avatar panel | On JTable selection, async fetch avatar image and show in JPanel without freezing | Swing 9 | 6–10h | alpha |
| S2-11 | Swing delete | Delete selected user via API and remove row from JTable; enable/disable buttons correctly | Swing 10–11 | 4–8h | belta |
| S2-12 | Swing patterns | Ensure MVC TableModel + observers/listeners; document patterns used | Swing 12 | 2–4h | gamma |
| S2-13 | Responsive UI | Make layout responsive + consistent styling across pages; add loading states + inline errors | Req. 17–18 | 6–10h | alpha |
| S2-14 | Custom feature | Implement one approved extra feature (small): e.g. tags OR draft/publish OR bookmarks | Req. 20 | 6–12h | alpha, belta, gamma |
| S2-15 | Submission docs | Finalize `README.md` (setup, demo users, API docs, pages, Swing usage) | Deliverables | 3–6h | belta |
| S2-16 | Seed data | Finalize `db-init.sql` with at least 2 users + sample articles + nested comments | Deliverables | 2–4h | gamma |

---

## Initial high-level allocation (fair workload)

You can show this to the teaching team as evidence of fair distribution.

- **alpha (cross-functional)**: Project setup, frontend auth UI, WYSIWYG editor, search/sort, responsive UI, comment backend, Swing avatar panel
- **belta (cross-functional)**: Database schema, articles backend, comments frontend, profile system, "My articles" view, Swing delete, submission docs
- **gamma (cross-functional)**: Auth system, articles frontend, admin API, avatars, nested comments, Swing patterns, seed data

### Rotation note (important for marking fairness)

All team members (alpha, belta, and gamma) are involved in:
- **Frontend development**: Svelte components, UI/UX, responsive design
- **Backend development**: Node.js/Express APIs, database operations, authentication
- **Java development**: Swing UI, MVC patterns, async networking

This cross-functional approach ensures fair distribution and comprehensive skill development across all technology areas.


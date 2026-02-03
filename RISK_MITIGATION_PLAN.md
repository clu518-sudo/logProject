## Risk Mitigation Strategy Plan (Due Feb 5)

Aligned with `PGCIT-Project-Brief-LY-2025.pdf` deliverable “Risk mitigation strategy plan”.

### How to use this (entry-level)

- A **risk** is something that could go wrong.
- **Mitigation** is what we do early to reduce the chance/impact.
- **Trigger** is how we’ll notice the risk is happening.
- **Fallback** is what we will do if the risk happens anyway.

### Risk table (simple)

| ID  | Risk                                                            | Likelihood | Impact | Mitigation (do early)                                                                                                                                     | Trigger (warning sign)                              | Fallback / contingency                                                          | Owner          |
| --- | --------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- | -------------- |
| R1  | **Scope too big** (try to do too many features)                 | Med        | High   | Implement required items first (Req. 1–19 + admin API + Swing). Custom feature (Req. 20) must be small. Use a “must/should/could” list.                   | Many tasks still “in progress” late in Sprint 2     | Drop “could” items; simplify custom feature                                     | alpha          |
| R2  | **Frontend–backend integration issues** (API mismatch)          | High       | High   | Write the ERD + API spec first (in `PLANNING_INITIAL_DESIGN.md`) and use it as the source of truth. Build a thin “vertical slice” early: login → create article → view article. | Frontend receives unexpected JSON / 4xx errors      | Add API client wrapper + consistent error responses                             | alpha, belta, gamma |
| R3  | **Auth/session bugs** (can’t stay logged in; wrong permissions) | Med        | High   | Use one consistent auth method (HTTP-only cookie session). Add middleware: `requireAuth`, `requireAdmin`. Add simple manual tests for login/logout.       | Random 401/403 while logged in                      | Switch to server-stored sessions table and re-check cookie handling             | belta          |
| R4  | **Password security requirement missed** (Req. 4)               | Low        | High   | Use `bcrypt` for hashing/salting; never store plaintext. Confirm DB contains only hashes.                                                                 | DB shows readable passwords                         | Immediate fix + migrate existing users in seed data                             | belta          |
| R5  | **File upload issues** (avatars/images)                         | Med        | High   | Implement uploads early with `multer` and validate file types/sizes. Store file metadata + serve via controlled routes.                                   | Upload crashes server / wrong file paths            | Temporarily disable uploads; use predefined avatars only; re-enable after fixes | gamma          |
| R6  | **WYSIWYG editor integration takes too long** (Req. 11–12)      | Med        | High   | Keep TinyMCE config minimal (only required toolbar + lists). Implement image upload endpoint early.                                                       | Editor not working by mid Sprint 1                  | Freeze editor features to minimum required; defer extra formatting/plugins      | alpha          |
| R7  | **Nested comments complexity** (Req. 15)                        | Med        | Med    | Store `parent_comment_id` and return a flat list; build tree in Svelte using recursion (`svelte:self`).                                                   | Replies don’t render correctly / infinite recursion | Temporarily limit to 2 levels (for debugging only) then restore                 | belta          |
| R8  | **Swing UI freezes** during HTTP or image fetch (Swing Req. 9)  | Med        | High   | Use `SwingWorker` for all network calls; never block the EDT. Test selecting users repeatedly.                                                            | UI becomes unresponsive while loading avatar        | Add loading placeholder; move all IO into background worker                     | gamma          |
| R9  | **Admin access control broken** (GET/DELETE `/api/users...`)    | Low        | High   | Add `is_admin` column and enforce it server-side for admin endpoints. Test with admin vs normal user.                                                     | Non-admin can fetch users / delete users            | Hotfix: lock endpoints behind admin middleware and re-test                      | alpha          |
| R10 | **XSS / unsafe HTML** from WYSIWYG content                      | Med        | Med    | Configure editor to restrict features; never allow script tags. Prefer safe rendering strategies.                                                         | Script-like content appears in articles             | Add HTML sanitization step server-side before saving or before rendering        | belta          |
| R11 | **Database schema errors / cascade deletes not correct**        | Med        | High   | Use FK + `ON DELETE CASCADE` where required. Test deleting user and article and verify comments/images are removed.                                       | Orphan rows remain after deletes                    | Add missing constraints; write cleanup query for dev DB                         | gamma          |
| R12 | **Time risk near submission** (Feb 13)                          | High       | High   | Weekly/daily short standups. Keep tasks small. Merge frequently. Keep a working demo at all times.                                                        | “Big features” still unstarted in last 3 days       | Scope cut + focus on stability, docs, seed data, demo script                    | alpha, belta, gamma |

### Weekly checkpoints (quick)

- **Feb 5 check-in**: show risk plan + sprint backlog + ERD/API + at least one working vertical slice (even if minimal).
- **Before Feb 13**: run end-to-end manual test checklist (register/login, create article, upload image, comment nesting, admin API + Swing).

### Team composition

- **Team members**: alpha, belta, gamma
- All team members are involved in front-end, back-end, and Java development
- Risks are distributed fairly across all members with cross-functional ownership

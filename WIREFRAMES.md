## Optional Frontend Interface Design (Wireframes) (Due Feb 5)

Aligned with `PGCIT-Project-Brief-LY-2025.pdf` deliverable “Optional front end interface design (e.g. Figma)”.

### What this is (entry-level)

These are **simple wireframes** (layout sketches) for the main pages. They help us agree on:

- what elements must be on each page
- where the buttons/forms go
- what navigation exists between pages

If you want to do Figma, you can copy these layouts into frames and replace boxes with real components.

---

## Global layout (all pages)

**Top navbar**

- Left: Site name/logo
- Middle (optional): search bar (on article list pages)
- Right:
  - If logged out: **Login**, **Register**
  - If logged in: **New Article**, **My Articles**, **Profile**, **Logout**

**Main content area**

- Centered container, max width for readability
- Mobile: single column, stacked controls

**Consistent UI rules**

- Form validation errors shown inline (no `alert()` popups)
- Loading indicators for network calls
- Buttons disabled when action is impossible

---

## Page 1: Home / All Articles (Req. 8–9)

```
┌───────────────────────────────────────────────────────────────┐
│ Navbar: [Logo] [Search…]                  [Login/Register]     │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ All Articles                                                   │
│                                                               │
│ Sort by: (Title v) (Username v) (Date v)   Order: (Desc v)     │
│ Filter: [ ] My articles (only if logged in)                    │
│                                                               │
│ ┌───────────────┐  ┌───────────────────────────────────────┐  │
│ │ Header Image  │  │ Title (clickable)                      │  │
│ │ (optional)    │  │ by username • date                     │  │
│ └───────────────┘  │ short preview…                         │  │
│                    └───────────────────────────────────────┘  │
│ (repeat for each article)                                     │
└───────────────────────────────────────────────────────────────┘
```

Notes:

- Search is case-insensitive and matches title + content (Req. 9).
- Sorting is one field at a time (Req. 9).

---

## Page 2: Article Detail + Comments (Req. 13–16)

```
┌───────────────────────────────────────────────────────────────┐
│ Navbar                                                        │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ [Header image] (optional)                                     │
│ Title                                                         │
│ by username • date                                            │
│                                                               │
│ [Rendered HTML content from WYSIWYG editor]                    │
│                                                               │
│ If author: [Edit] [Delete]                                    │
│                                                               │
│ Comments                                                      │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Add a comment (only if logged in)                          │ │
│ │ [ textarea… ]                         [Post comment]       │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ Comment list (chronological, nested)                           │
│ - avatar + username + date                                     │
│   comment text                                                 │
│   [Reply] [Delete (if allowed)]                                │
│     - nested reply (indented)                                  │
│       ... unlimited depth using recursion                      │
└───────────────────────────────────────────────────────────────┘
```

Delete rules (Req. 16):

- Comment author can delete their own comment
- Article author can delete any comment on their article

---

## Page 3: Article Editor (Req. 10–12)

```
┌───────────────────────────────────────────────────────────────┐
│ Navbar                                                        │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ New Article / Edit Article                                     │
│                                                               │
│ Title: [_____________________________]                         │
│ Header image: [Choose file] [Remove] (optional)                │
│                                                               │
│ [ TinyMCE editor (WYSIWYG) ]                                   │
│ Toolbar: headings, bold/italic/underline, lists                │
│ Image embed button uploads image and inserts URL               │
│                                                               │
│ [Save] [Cancel]                                                │
└───────────────────────────────────────────────────────────────┘
```

Notes:

- Keep editor features minimal to meet the brief (Req. 11) and reduce risk.
- Image uploads: allow header image + embedded images (Req. 12).

---

## Page 4: Register (Req. 1–5)

```
┌───────────────────────────────────────────────────────────────┐
│ Navbar                                                        │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ Create account                                                 │
│ Username: [__________]  (✓ available / ✗ taken shown live)     │
│ Real name: [__________]                                        │
│ Date of birth: [____-__-__]                                    │
│ Bio: [___________________________]                             │
│                                                               │
│ Choose password:    [__________]                                │
│ Re-enter password:  [__________]  (inline “passwords match”)    │
│                                                               │
│ Avatar: ( ) Predefined  ( ) Upload                             │
│ - Predefined grid: [icon][icon][icon]                          │
│ - Upload: [Choose file]                                        │
│                                                               │
│ [Create account] (disabled until valid)                         │
└───────────────────────────────────────────────────────────────┘
```

---

## Page 5: Profile (Req. 7)

```
┌───────────────────────────────────────────────────────────────┐
│ Navbar                                                        │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ My Profile                                                     │
│ Avatar preview                                                 │
│ Username: [__________]                                         │
│ Real name: [__________]                                        │
│ DOB: [____-__-__]                                              │
│ Bio: [___________________________]                             │
│ [Save changes]                                                 │
│                                                               │
│ Danger zone:                                                   │
│ [Delete my account] (requires confirmation)                    │
└───────────────────────────────────────────────────────────────┘
```

---

## Optional: Figma plan (if you want a link)

- Create frames for: Home, Article Detail, Editor, Register, Profile
- Use a simple color palette and consistent spacing
- Add a placeholder “mobile” frame for Home + Article Detail to show responsiveness

Figma link (optional): `PUT_YOUR_FIGMA_LINK_HERE`


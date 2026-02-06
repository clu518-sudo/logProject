# Online Research Agent (Reader Companion) — Design

## Overview
This document describes an **AI “research agent”** feature that runs **online search + page fetching + summarization** while a user is reading an article.

The goal is to show a live panel such as **“Related info (live)”** on the article detail page that provides:
- A concise **summary of relevant external information**
- A short list of **credible source links**
- Optional **“things to verify”** / “open questions” if the article contains strong claims

This design fits the current stack:
- **Frontend**: Svelte
- **Backend**: Express
- **AI**: Qwen/DashScope via OpenAI-compatible API (`backend/src/services/text_generation.js`)
- **Realtime**: Server-Sent Events already used for header-image updates (`GET /api/articles/events`)
- **DB**: SQLite

## Goals and non-goals
### Goals
- Trigger a research job for a specific article (manual button, or auto on page open).
- Use online sources to provide relevant context and updates.
- Stream job progress to the UI (queued/searching/fetching/summarizing/ready).
- Cache results to minimize repeated web calls and cost.
- Provide safe defaults: rate limits, timeouts, and citations.

### Non-goals (initial version)
- Full academic fact-checking with guaranteed correctness.
- Crawling paywalled sites.
- Long-term conversational memory across users and sessions.
- Large-scale distributed job queue (single-node background jobs are sufficient).

## User experience (frontend)
### UI placement
On `frontend/src/lib/pages/ArticleDetail.svelte` (article reading page), add a right-side panel/card:
- **Title**: “Related info”
- **Button**: “Find latest info” (starts/restarts the job)
- **Status line**: “Searching…”, “Summarizing…”, “Ready”, “Failed”
- **Output**:
  - 3–8 bullet summary
  - “Sources” list (title + domain + date if available)
  - Optional: “Questions to verify”

### Trigger options
Choose one (or support both):
- **Manual**: only runs when user clicks.
- **Auto**: runs on article open if cache is missing or expired.

### Realtime updates
Reuse the existing SSE connection logic pattern (currently used on Home for header-image status):
- Client connects to SSE stream (see backend section) and listens for `research` events.
- When a research job reaches `ready/failed`, the UI fetches latest research result and updates the panel.

## Backend architecture
### High-level flow
1. Client requests research for an article.
2. Backend creates/updates a DB record for research job status (`queued`).
3. Backend starts a background task:
   - extract topics/claims
   - run web search
   - fetch top pages
   - extract readable text
   - summarize with citations
4. Backend stores the final summary + sources in DB (`ready`) or error state (`failed`).
5. Backend emits SSE events so clients refresh at the right time.

### Proposed modules
Add a service module, e.g.:
- `backend/src/services/article_research_agent.js`

Responsibilities:
- Orchestrate the job steps
- Enforce limits (max sources/pages/time)
- Persist status + output to DB
- Emit events (via existing event emitter pattern)

## Data model (SQLite)
Add a new table to cache research results per article.

### Table: `article_research`
Suggested schema:
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `article_id` INTEGER NOT NULL UNIQUE
- `status` TEXT NOT NULL CHECK (status IN ('none','queued','running','ready','failed'))
- `summary_md` TEXT NOT NULL DEFAULT ''
- `sources_json` TEXT NOT NULL DEFAULT '[]'
- `error_message` TEXT
- `created_at` TEXT NOT NULL DEFAULT (datetime('now','localtime'))
- `updated_at` TEXT NOT NULL DEFAULT (datetime('now','localtime'))
- `expires_at` TEXT (optional; used for cache invalidation)

Notes:
- `sources_json` stores an array of objects like:
  - `{ "title": "...", "url": "...", "snippet": "...", "publisher": "...", "publishedAt": "..." }`
- `article_id` is `UNIQUE` so you store the latest research summary per article (simple cache).
- `expires_at` allows re-running automatically after a TTL (e.g., 1 day or 1 week).

## API design (backend routes)
### Start / refresh research
`POST /api/articles/:id/research`

Behavior:
- Validates article exists and is accessible (published, or author/admin if draft).
- If there is a recent cached result (not expired), return it immediately unless `force=true`.
- Otherwise:
  - set status `queued` (or `running`)
  - start background job (do not block request)
  - return current status payload

Request body/query:
- Query: `force=true|false` (default false)
- Optional body: `{ "mode": "quick" | "standard" | "deep" }` (controls limits)

Response example:
```json
{
  "articleId": 123,
  "status": "queued",
  "updatedAt": "2026-02-06T12:00:00.000Z"
}
```

### Get current research status/result
`GET /api/articles/:id/research`

Response example:
```json
{
  "articleId": 123,
  "status": "ready",
  "summaryMd": "- ...\n- ...\n",
  "sources": [
    { "title": "Example", "url": "https://example.com", "publisher": "Example", "publishedAt": "2026-01-10" }
  ],
  "updatedAt": "2026-02-06T12:02:30.000Z",
  "expiresAt": "2026-02-07T12:02:30.000Z"
}
```

### SSE events (realtime updates)
Option A (simplest): extend the existing stream:
- `GET /api/articles/events` emits both `article` and `research` events.

Event payload example:
```json
{
  "type": "research.updated",
  "articleId": 123,
  "status": "running",
  "updatedAt": "2026-02-06T12:01:10.000Z"
}
```

Option B (cleaner separation): new stream:
- `GET /api/articles/:id/research/events`

Either way, the frontend listens and refreshes by calling `GET /api/articles/:id/research` when:
- status becomes `ready` or `failed`

## Agent design (LLM + tools)
Your code already supports “function calling / tools” via:
- `chatWithFunctions(userMessage, tools)` in `backend/src/services/text_generation.js`

### Core idea
Let the model decide:
- which search queries to run
- which results to open
- what to cite
…but keep strong **server-side constraints**.

### Tools to provide
Provide a small, safe toolset:
- `search_web({ query, recencyDays?, language? })`
  - returns top N results: title, url, snippet, date/publisher if available
- `fetch_url({ url })`
  - downloads HTML (with size/time limits)
- `extract_text({ html })`
  - converts HTML to readable text (boilerplate removed)

Optional extra tools (later):
- `get_article({ articleId })` (to fetch article content from DB)
- `log_step({ message })` (for debugging/progress traces)

### Prompting strategy (recommended)
Use a system prompt that enforces:
- always cite sources for claims in the summary
- do not invent URLs
- prefer reputable sources (gov/edu/major orgs)
- keep summary short and readable

### Output contract
Ask the LLM to return strict JSON for the final step, e.g.:
```json
{
  "summaryMd": "- ...\n- ...\n",
  "sources": [
    { "title": "...", "url": "...", "publisher": "...", "publishedAt": "..." }
  ],
  "questions": ["..."]
}
```

## Caching and invalidation
### Why cache
Web search + fetch is slow and costs API calls. Cache avoids re-running on every view.

### Suggested TTL
Pick a TTL per article:
- News-like articles: 1 day
- General topics: 7 days

Implementation:
- store `expires_at`
- when `GET /research` is called, if `now < expires_at` and `status=ready`, serve cache
- allow `force=true` to bypass

## Reliability limits (must-have)
To avoid slow or expensive runs:
- **Search results limit**: 5–8 results
- **Pages fetched**: 3–5 max
- **Per-fetch timeout**: 5–10 seconds
- **Max HTML size**: e.g., 1–2 MB
- **Overall job timeout**: e.g., 20–40 seconds
- **LLM max tokens**: cap summarization context; chunk/trim page text

## Security, safety, and abuse prevention
### Rate limiting
Apply per user (or per IP if unauthenticated viewing is allowed):
- e.g., 5 research runs / 10 minutes / user

### SSRF protection for `fetch_url`
Because `fetch_url` can be abused, enforce:
- allow only `http`/`https`
- block private IP ranges and localhost
- optionally allowlist domains or use a safe fetch proxy

### Source quality controls
At minimum:
- prefer reputable sources
- show **citations for each bullet**
Optional:
- domain allowlist (Wikipedia, NZ govt, major news, etc.)
- or domain blocklist (known spam)

### Transparency
Display in UI:
- “AI-generated summary”
- list of sources
- timestamp of last research run

## Implementation notes (fit to existing code patterns)
### Background job style
You already do background work for header images:
- status set to `generating`
- job runs
- SSE emits updates

Mirror that pattern:
- research status: `queued/running/ready/failed`
- emit events via an EventEmitter (similar to `articleEvents`)

### Access control
Match existing article access rules in `backend/src/routes/articles.js`:
- Published: anyone
- Draft: author or admin only

## Test plan (practical)
### Manual tests
- Start research on a published article:
  - status transitions: queued → running → ready
  - SSE event received; UI refreshes automatically
- Draft article:
  - non-author gets 403
  - author can run research
- Cache:
  - second request returns cached result quickly
  - `force=true` triggers a new run

### Failure tests
- Search API key missing: returns `failed` with safe error message
- Fetch fails (timeout/404): still completes with fewer sources
- LLM output invalid JSON: mark failed and log for debugging

## Future enhancements
- “Ask a question” chat that answers using both article + fetched sources.
- Embeddings/RAG over your own articles (site-wide “Ask this blog”).
- Better extraction with a readability library.
- Admin dashboard to see research runs, errors, rate limit metrics.
- **Content moderation**


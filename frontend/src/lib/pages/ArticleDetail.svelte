<script>
  import { onMount } from "svelte";
  import { apiFetch } from "$lib/api.js";
  import { me } from "$lib/store.js";
  import CommentItem from "$lib/components/CommentItem.svelte";

  export let id;
  let article = null;
  let comments = [];
  let error = "";
  let replyTo = null;
  let replyContent = "";
  let research = null;
  let researchError = "";
  let researchLoading = false;
  let researchStarting = false;
  let researchEs = null;
  let researchEsUrl = "";

  // Normalize image path for absolute URLs and local uploads.
  // Logic: empty -> "", absolute -> keep, else ensure leading slash.
  function normalizePath(p) {
    if (!p) return "";
    // allow absolute URLs
    if (/^https?:\/\//i.test(p)) return p;
    // ensure leading slash for local uploads
    return p.startsWith("/") ? p : `/${p}`;
  }

  // Build a nested comment tree from a flat list.
  // Logic: map by id -> attach children -> return top-level roots.
  function buildTree(list) {
    const map = new Map();
    list.forEach((c) => map.set(c.id, { ...c, children: [] }));
    const roots = [];
    map.forEach((c) => {
      if (c.parentCommentId) {
        const parent = map.get(c.parentCommentId);
        if (parent) parent.children.push(c);
        else roots.push(c);
      } else {
        roots.push(c);
      }
    });
    return roots;
  }

  function parseSqliteDate(value) {
    if (!value) return null;
    const iso = value.includes("T") ? value : value.replace(" ", "T");
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function isExpired(expiresAt) {
    const date = parseSqliteDate(expiresAt);
    return date ? date <= new Date() : false;
  }

  function parseSummary(md) {
    if (!md) return [];
    return md
      .split("\n")
      .map((line) => line.replace(/^\s*-\s*/, "").trim())
      .filter(Boolean);
  }

  function formatSourceLabel(source) {
    const url = source?.url || "";
    if (!url) return source?.title || "Source";
    try {
      const parsed = new URL(url);
      return source?.title || parsed.hostname;
    } catch {
      return source?.title || url;
    }
  }

  function statusLabel(status) {
    if (status === "queued") return "Queued…";
    if (status === "running") return "Searching…";
    if (status === "ready") return "Ready";
    if (status === "failed") return "Failed";
    return "Idle";
  }

  // Load article and comments, then compute delete permissions.
  // Logic: fetch article -> fetch comments -> add canDelete -> build tree.
  async function load() {
    if (!id) return;
    error = "";
    try {
      article = await apiFetch(`/api/articles/${id}`);
      const list = await apiFetch(`/api/articles/${id}/comments`);
      const current = $me;
      const enhanced = list.map((c) => ({
        ...c,
        canDelete: current && (current.id === c.authorUserId || current.id === article.author.id || current.isAdmin)
      }));
      comments = buildTree(enhanced);
      const researchData = await loadResearch();
      await ensureResearch(researchData);
    } catch (e) {
      error = e.message;
    }
  }

  // Submit a new comment (or reply) and refresh the list.
  // Logic: validate -> POST -> reset reply state -> reload.
  async function submitComment() {
    if (!replyContent.trim()) return;
    await apiFetch(`/api/articles/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: replyContent, parentCommentId: replyTo?.id || null })
    });
    replyTo = null;
    replyContent = "";
    await load();
  }

  // Delete a comment by id and refresh the list.
  async function deleteComment(comment) {
    await apiFetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    await load();
  }

  async function loadResearch() {
    if (!id) return null;
    researchLoading = true;
    researchError = "";
    try {
      const data = await apiFetch(`/api/articles/${id}/research`);
      research = data;
      return data;
    } catch (e) {
      researchError = e.message;
      return null;
    } finally {
      researchLoading = false;
    }
  }

  async function startResearch({ force = false } = {}) {
    if (!id) return null;
    researchStarting = true;
    researchError = "";
    try {
      const query = force ? "?force=true" : "";
      const data = await apiFetch(`/api/articles/${id}/research${query}`, {
        method: "POST",
        body: JSON.stringify({ mode: "standard" })
      });
      research = data;
      return data;
    } catch (e) {
      researchError = e.message;
      return null;
    } finally {
      researchStarting = false;
    }
  }

  async function ensureResearch(current) {
    if (!current) return;
    if (current.status === "none") {
      await startResearch({ force: false });
      return;
    }
    if (current.status === "ready" && isExpired(current.expiresAt)) {
      await startResearch({ force: false });
    }
  }

  function stopResearchRealtime() {
    if (researchEs) {
      researchEs.close();
      researchEs = null;
    }
  }

  function startResearchRealtime(url) {
    stopResearchRealtime();
    try {
      researchEsUrl = url;
      researchEs = new EventSource(url);
      researchEs.addEventListener("research", (e) => {
        try {
          const payload = JSON.parse(e.data || "{}");
          if (!payload?.articleId) return;
          if (Number(payload.articleId) !== Number(id)) return;
          research = {
            ...(research || {}),
            status: payload.status || research?.status,
            updatedAt: payload.updatedAt || research?.updatedAt
          };
          if (payload.status === "ready" || payload.status === "failed") {
            loadResearch();
          }
        } catch {
          // ignore
        }
      });
      researchEs.onerror = () => {
        stopResearchRealtime();
      };
    } catch {
      // ignore
    }
  }

  // Set the current comment being replied to.
  function openReply(comment) {
    replyTo = comment;
  }

  // On mount, apply page-specific body styles and load data.
  onMount(() => {
    // Apply the "Article Detail" page look without affecting other routes
    document.body.classList.add("article-detail-body");
    load();
    return () => {
      stopResearchRealtime();
      document.body.classList.remove("article-detail-body");
    };
  });

  let lastLoadedId = null;
  // Reload data when the route id changes.
  $: if (id && id !== lastLoadedId) {
    lastLoadedId = id;
    load();
  }

  // Reactive derived values for avatars and header image URL.
  $: authorAvatarUrl = article ? `/api/users/${article.author.id}/avatar` : "";
  $: rawHeaderPath = article?.headerImagePath || article?.header_image_path || "";
  $: headerPath = normalizePath(rawHeaderPath);
  $: cacheKey = article?.updatedAt || article?.createdAt || Date.now();
  $: coverUrl = headerPath ? `${headerPath}?ts=${encodeURIComponent(cacheKey)}` : "";
  $: summaryItems = parseSummary(research?.summaryMd || "");
  $: questions = research?.questions || [];
  $: {
    if (id) {
      const wantMine = article && !article.isPublished && $me;
      const nextUrl = wantMine ? "/api/articles/events?mine=true" : "/api/articles/events";
      if (nextUrl !== researchEsUrl) {
        startResearchRealtime(nextUrl);
      }
    }
  }
</script>

<div class="article-detail">
  <div class="responsive-wrapper">
    <div class="layout">
      <div class="main">
      {#if error}
        <div class="widget">
          <h2>Couldn’t load article</h2>
          <p class="muted">{error}</p>
        </div>
      {:else if !article}
        <div class="widget">
          <h2>Loading…</h2>
          <p class="muted">Fetching article content.</p>
        </div>
      {:else}
        <article class="widget widget--article">
          <a class="back-link" href="/">← Back to articles</a>

          {#if coverUrl}
            <img class="header-image" src={coverUrl} alt="Header image for {article.title}" />
          {/if}

          <h2 class="title">{article.title}</h2>

          <div class="meta-row">
            <img src={authorAvatarUrl} alt="{article.author.username}'s avatar" class="author-avatar" />
            <div class="muted">
              by <strong>{article.author.username}</strong> · {new Date(article.createdAt).toLocaleString()}
            </div>
          </div>

          <div class="meta-row">
            {#if !article.isPublished}
              <span class="badge">Draft</span>
            {/if}

            {#if $me && ($me.id === article.author.id || $me.isAdmin)}
              <a class="btn secondary" href={`/editor/${article.id}`}>Edit</a>
            {/if}
          </div>

          <div class="article-content">{@html article.contentHtml}</div>
        </article>

        <section class="widget widget--comments">
          <h2>Comments</h2>

          {#if $me}
            <div class="field">
              <label for="comment-textarea">{replyTo ? `Reply to ${replyTo.author.username}` : "Add a comment"}</label>
              <textarea id="comment-textarea" rows="3" bind:value={replyContent} maxlength="2000"></textarea>
            </div>

            <div class="comment-actions">
              <button class="btn" on:click={submitComment}>Post</button>
              {#if replyTo}
                <button class="btn secondary" on:click={() => (replyTo = null)}>Cancel reply</button>
              {/if}
            </div>
          {:else}
            <p class="muted">Login to comment.</p>
          {/if}

          <div class="comments-list">
            {#if comments.length === 0}
              <p class="muted">No comments yet.</p>
            {:else}
              {#each comments as c}
                <CommentItem comment={c} onReply={openReply} onDelete={deleteComment} />
              {/each}
            {/if}
          </div>
        </section>
      {/if}
      </div>
      <aside class="sidebar">
        <section class="widget widget--research">
          <div class="research-header">
            <h2>Related info</h2>
            <button class="btn secondary" on:click={() => startResearch({ force: true })} disabled={researchStarting}>
              Find latest info
            </button>
          </div>
          <p class="muted status-line">{statusLabel(research?.status)}</p>

          {#if researchError}
            <p class="muted">{researchError}</p>
          {/if}

          {#if summaryItems.length}
            <div>
              <h3 class="research-subtitle">Summary</h3>
              <ul class="research-list">
                {#each summaryItems as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>
          {:else if research?.status === "ready"}
            <p class="muted">No summary available.</p>
          {:else if researchLoading}
            <p class="muted">Loading research…</p>
          {/if}

          {#if (research?.sources || []).length}
            <div>
              <h3 class="research-subtitle">Sources</h3>
              <ul class="research-sources">
                {#each research.sources as source}
                  <li>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">{formatSourceLabel(source)}</a>
                    {#if source.publisher}
                      <span class="muted"> · {source.publisher}</span>
                    {/if}
                    {#if source.publishedAt}
                      <span class="muted"> · {source.publishedAt}</span>
                    {/if}
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if questions.length}
            <div>
              <h3 class="research-subtitle">Questions to verify</h3>
              <ul class="research-list">
                {#each questions as q}
                  <li>{q}</li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if research?.updatedAt}
            <p class="muted">Last updated {new Date(research.updatedAt).toLocaleString()}</p>
          {/if}
        </section>
      </aside>
    </div>
  </div>
</div>

<style>
  :global(body.article-detail-body) {
    font-family: "Caveat", "Segoe UI", system-ui, sans-serif;
    background-color: #000000;
    line-height: 1.5;
  }

  :global(body.article-detail-body *),
  :global(body.article-detail-body *:after),
  :global(body.article-detail-body *:before) {
    box-sizing: border-box;
  }

  .responsive-wrapper {
    width: 100%;
    max-width: none;
    margin-left: auto;
    margin-right: auto;
    padding-left: 2vw;
    padding-right: 2vw;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 2rem;
    margin-top: 3rem;
    margin-bottom: 2rem;
    align-items: start;
  }

  .main {
    min-width: 0;
  }

  .sidebar {
    position: relative;
  }

  .widget {
    width: 100%;
    max-width: 600px;
    border-radius: 8px;
    box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.5);
    background-color: #fff;
    padding: 2.5rem;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2rem;
    font-size: 1.125rem;
  }

  .widget--article {
    max-width: 96vw;
  }

  .widget--comments {
    max-width: 96vw;
  }

  .widget--research {
    position: sticky;
    top: 2rem;
  }

  .widget > * + * {
    margin-top: 1.25em;
  }

  .widget h2 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.25;
    margin: 0;
  }

  .back-link {
    display: inline-block;
    text-decoration: none;
    color: inherit;
    font-weight: 500;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .header-image {
    width: 100%;
    height: 260px;
    object-fit: cover;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  }

  .title {
    margin-top: 0.9rem;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .author-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #132860;
  }

  .comment-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .research-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .research-subtitle {
    font-size: 1.05rem;
    margin: 0 0 0.6rem;
  }

  .research-list,
  .research-sources {
    margin: 0;
    padding-left: 1.2rem;
  }

  .status-line {
    margin-top: 0.25rem;
  }

  .comments-list {
    margin-top: 12px;
  }

  /* Make article HTML content look good */
  .article-content :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
  }

  .article-content :global(pre) {
    overflow: auto;
    padding: 0.9rem 1rem;
    border-radius: 8px;
    background: #000000;
    box-shadow: inset 0 0 0 1px rgba(19, 40, 96, 0.5);
  }

  .article-content :global(code) {
    display: inline-block;
    padding: 0.125em 0.25em;
    border-radius: 2px;
    background-color: #132860;
  }

  .article-content :global(pre code) {
    display: inline;
    padding: 0;
    background: transparent;
  }

  @media (max-width: 640px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .widget {
      padding: 1.5rem;
      font-size: 1.05rem;
    }

    .header-image {
      height: 200px;
    }
  }
</style>


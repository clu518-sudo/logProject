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

  function normalizePath(p) {
    if (!p) return "";
    // allow absolute URLs
    if (/^https?:\/\//i.test(p)) return p;
    // ensure leading slash for local uploads
    return p.startsWith("/") ? p : `/${p}`;
  }

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
    } catch (e) {
      error = e.message;
    }
  }

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

  async function deleteComment(comment) {
    await apiFetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    await load();
  }

  function openReply(comment) {
    replyTo = comment;
  }

  onMount(() => {
    // Apply the "Article Detail" page look without affecting other routes
    document.body.classList.add("article-detail-body");
    load();
    return () => {
      document.body.classList.remove("article-detail-body");
    };
  });

  let lastLoadedId = null;
  $: if (id && id !== lastLoadedId) {
    lastLoadedId = id;
    load();
  }

  $: authorAvatarUrl = article ? `/api/users/${article.author.id}/avatar` : "";
  $: rawHeaderPath = article?.headerImagePath || article?.header_image_path || "";
  $: headerPath = normalizePath(rawHeaderPath);
  $: cacheKey = article?.updatedAt || article?.createdAt || Date.now();
  $: coverUrl = headerPath ? `${headerPath}?ts=${encodeURIComponent(cacheKey)}` : "";
</script>

<div class="article-detail">
  <div class="responsive-wrapper">
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
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap");

  :global(body.article-detail-body) {
    font-family: "DM Sans", sans-serif;
    background-color: #f2f5f7;
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

  .main {
    margin-top: 3rem;
    margin-bottom: 2rem;
  }

  .widget {
    width: 100%;
    max-width: 600px;
    border-radius: 8px;
    box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.1);
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
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
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
    border: 2px solid #e5e7eb;
  }

  .comment-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
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
    background: #f2f5f7;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  }

  .article-content :global(code) {
    display: inline-block;
    padding: 0.125em 0.25em;
    border-radius: 2px;
    background-color: #bee5d3;
  }

  .article-content :global(pre code) {
    display: inline;
    padding: 0;
    background: transparent;
  }

  @media (max-width: 640px) {
    .widget {
      padding: 1.5rem;
      font-size: 1.05rem;
    }

    .header-image {
      height: 200px;
    }
  }
</style>


<script>
  export let article;

  function normalizePath(p) {
    if (!p) return "";
    // allow absolute URLs
    if (/^https?:\/\//i.test(p)) return p;
    // ensure leading slash for local uploads
    return p.startsWith("/") ? p : `/${p}`;
  }

  $: rawHeaderPath = article?.headerImagePath || article?.header_image_path || "";
  $: headerPath = normalizePath(rawHeaderPath);
  $: cacheKey = article?.updatedAt || article?.createdAt || Date.now();
  $: coverUrl = headerPath ? `${headerPath}?ts=${encodeURIComponent(cacheKey)}` : "";
  $: authorAvatarUrl = article ? `/api/users/${article.author.id}/avatar` : "";
</script>

<article class="card">
  <div class="cover-bg" aria-hidden="true" style={coverUrl ? `--card-cover: url("${coverUrl}")` : ""}></div>

  <div class="text">
    <h2>{article.title}</h2>
    <div class="meta-row">
      <img src={authorAvatarUrl} alt="{article.author.username}'s avatar" class="author-avatar" />
      <p class="meta">by {article.author.username} · {new Date(article.createdAt).toLocaleString()}</p>
    </div>
    {#if !article.isPublished}
      <p class="badge">Draft</p>
    {/if}
    <a class="read-link" href={`/article/${article.id}`}>Read</a>
  </div>
</article>

<style>
  :global(:root) {
    --cover-timing: 0.5s;
    --cover-ease: cubic-bezier(0.66, 0.08, 0.19, 0.97);
    --cover-stagger: 0.15s;
    --text-timing: 0.75s;
    --text-ease: cubic-bezier(0.38, 0.26, 0.05, 1.07);
    --highlight: white;
  }

  .card {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    border-radius: 7px;
    color: white;
    /* Let text scale based on this card's size */
    container-type: inline-size;
    box-shadow:
      rgba(255, 255, 255, 0.3) 0 5vw 6vw -8vw,
      rgba(255, 255, 255, 0) 0 4.5vw 5vw -6vw,
      rgba(50, 50, 80, 0.5) 0px 4vw 8vw -2vw,
      rgba(0, 0, 0, 0.8) 0px 4vw 5vw -3vw;
    transition: box-shadow 1s var(--cover-ease);
  }

  .card > * {
    z-index: 2;
  }

  .card::before,
  .card::after {
    content: "";
    width: 100%;
    height: 50%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    transform-origin: left;
    transform: scaleX(0);
    transition: all var(--cover-timing) var(--cover-ease);
    z-index: 1;
  }

  .card::after {
    transition-delay: var(--cover-stagger);
    top: 50%;
  }

  .card:hover,
  .card:focus-within {
    box-shadow:
      white 0 5vw 6vw -9vw,
      var(--highlight) 0 5.5vw 5vw -7.5vw,
      rgba(50, 50, 80, 0.5) 0px 4vw 8vw -2vw,
      rgba(0, 0, 0, 0.8) 0px 4vw 5vw -3vw;
  }

  .card:hover::before,
  .card:hover::after,
  .card:focus-within::before,
  .card:focus-within::after {
    transform: scaleX(1);
  }

  .card:hover h2,
  .card:hover p,
  .card:hover .author-avatar,
  .card:hover .read-link,
  .card:focus-within h2,
  .card:focus-within p,
  .card:focus-within .author-avatar,
  .card:focus-within .read-link {
    opacity: 1;
    transform: translateY(0);
    color: inherit;
  }

  .card:hover .cover-bg,
  .card:focus-within .cover-bg {
    transform: scale(1.1);
  }

  .card:nth-of-type(1) {
    --highlight: coral;
  }

  .card:nth-of-type(2) {
    --highlight: #56ffe5;
  }

  .cover-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 7px;
    z-index: 0;
  }

  .cover-bg {
    background-image: var(--card-cover, linear-gradient(135deg, #3b4154, #1f2430));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transition: all 0.8s var(--cover-ease);
  }

  .text {
    position: absolute;
    inset: clamp(12px, 6cqw, 22px);
    top: auto;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1.6cqw, 10px);
  }

  h2 {
    font-size: clamp(18px, 9cqw, 40px);
    font-weight: 800;
    margin: 0 0 0.2em;
    line-height: 1.05;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    transition:
      transform var(--text-timing) var(--text-ease),
      opacity var(--text-timing) var(--text-ease),
      color calc(var(--text-timing) * 2) var(--text-ease);
  }

  p {
    font-size: clamp(10px, 3.2cqw, 14px);
    line-height: 1.4;
    margin: 0;
    opacity: 0;
    transform: translateY(20px);
    transition:
      transform var(--text-timing) var(--text-ease),
      opacity var(--text-timing) var(--text-ease),
      color calc(var(--text-timing) * 2) var(--text-ease);
  }

  .meta {
    text-align: justify;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: clamp(6px, 2cqw, 10px);
  }

  .author-avatar {
    width: clamp(20px, 6cqw, 28px);
    height: clamp(20px, 6cqw, 28px);
    border-radius: 50%;
    object-fit: cover;
    flex: 0 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.12);
    opacity: 0;
    transform: translateY(20px);
    transition:
      transform var(--text-timing) var(--text-ease),
      opacity var(--text-timing) var(--text-ease),
      color calc(var(--text-timing) * 2) var(--text-ease);
  }

  .badge {
    display: inline-block;
    width: fit-content;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.4);
    color: var(--highlight);
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  .read-link {
    width: fit-content;
    padding: clamp(5px, 1.8cqw, 8px) clamp(10px, 3.6cqw, 14px);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: inherit;
    text-decoration: none;
    font-weight: 600;
    font-size: clamp(11px, 3cqw, 14px);
    opacity: 0;
    transform: translateY(20px);
    transition:
      transform var(--text-timing) var(--text-ease),
      opacity var(--text-timing) var(--text-ease),
      color calc(var(--text-timing) * 2) var(--text-ease);
  }
</style>


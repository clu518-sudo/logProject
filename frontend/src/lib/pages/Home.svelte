<script>
  import { onDestroy, onMount } from "svelte";
  import { fly } from "svelte/transition";
  import ArticleCard from "$lib/components/ArticleCard.svelte";
  import { apiFetch } from "$lib/api.js";
  import { me } from "$lib/store.js";

  let articles = [];
  let q = "";
  let sort = "date";
  let order = "desc";
  let mine = "false";
  let error = "";
  let loading = false;
  let showFilters = false;
  let refreshTimer;
  let es;

  function getHeaderStatus(a) {
    return a?.headerImageStatus || a?.header_image_status || "none";
  }

  function anyGenerating(list) {
    return (list || []).some((a) => getHeaderStatus(a) === "generating");
  }

  function stopRealtime() {
    if (es) {
      es.close();
      es = null;
    }
  }

  function startRealtime() {
    stopRealtime();
    try {
      const query = new URLSearchParams();
      if (mine === "true") query.set("mine", "true");
      es = new EventSource(`/api/articles/events?${query.toString()}`);
      es.addEventListener("article", (e) => {
        try {
          const payload = JSON.parse(e.data || "{}");
          if (
            payload?.headerImageStatus === "ready" ||
            payload?.headerImageStatus === "failed" ||
            payload?.headerImageStatus === "none"
          ) {
            // Only refresh when generation finishes (or gets cleared/failed).
            load();
          }
        } catch {
          // ignore
        }
      });
      // If realtime fails (network/proxy), fall back to polling.
      es.onerror = () => {
        stopRealtime();
      };
    } catch {
      // ignore and fall back to polling
    }
  }

  /**
   * Load articles based on the current filter state (search/sort/mine).
   *
   * **Inputs**: uses component state (`q`, `sort`, `order`, `mine`)
   * **Output**: none (updates `articles`, `error`, `loading`)
   * **Side effects**: sends an HTTP request to the backend
   *
   * **Logic**
   * - Set loading -> build query string -> GET `/api/articles` -> store results or error -> clear loading.
   */
  async function load() {
    loading = true;
    error = "";
    try {
      const query = new URLSearchParams(); // #explained it in report
      if (q) query.set("q", q);
      query.set("sort", sort);
      query.set("order", order);
      if (mine === "true") query.set("mine", "true");
      articles = await apiFetch(`/api/articles?${query.toString()}`);

      // Prefer realtime updates; fallback to polling only when needed.
      if (refreshTimer) clearTimeout(refreshTimer);
      startRealtime();
      if (anyGenerating(articles) && !es) {
        refreshTimer = setTimeout(() => {
          if (!loading && document.visibilityState !== "hidden") load();
        }, 4000);
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  onMount(load);

  onDestroy(() => {
    if (refreshTimer) clearTimeout(refreshTimer);
    stopRealtime();
  });
</script>

<div class="container">
  <div class="card articles-card">
    <h2>Articles</h2>
    <div class="row filter-panel">
      <div class="field search-field" style="flex: 2;">
        <label for="search-input">Search</label>
        <!-- 
          Animated search input with rotating gradient border effect
          
          Original Authors:
          Copyright © 2026 Lakshay Gupta (Lakshay-art)
          Copyright © 2026 Pankaj Meharchandani (Pankaj-Meharchandani)
          
          Licensed under MIT License
          Modified: Adapted colors, integrated with Svelte, adjusted animations
        -->
        <div class="search-shell">
          <div class="search-pod">
            <div class="search-glow"></div>
            <div class="search-darkBorderBg"></div> <!-- Neon-style glow -->
            <div class="search-darkBorderBg"></div> <!-- Neon-style glow -->
            <div class="search-darkBorderBg"></div> <!-- Neon-style glow -->
            <div class="search-white"></div> <!-- Neon-style glow -->
            <div class="search-border"></div> <!-- Neon-style glow -->
            <div class="search-main">
              <input
                id="search-input"
                class="search-input"
                name="text"
                type="text"
                placeholder="Search title or content"
                bind:value={q}
                on:keydown={(e)=>{
                  if (e.key === "Enter") load();
                }}
              />
              <div class="search-filterBorder"></div>
              <button
                class="search-filter-icon"
                type="button"
                on:click={() => (showFilters = !showFilters)}
              >
                <svg
                  fill="none"
                  viewBox="4.8 4.56 14.832 15.408"
                  width="27"
                  height="27"
                  preserveAspectRatio="none"
                >
                  <path
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="1"
                    stroke="#132860"
                    d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                  ></path>
                </svg>
              </button>
              <div class="search-icon" aria-hidden="true">
                <svg
                  class="feather feather-search"
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="11" cy="11" r="8" stroke="url(#search)"></circle>
                  <line x1="22" x2="16.65" y1="22" y2="16.65" stroke="url(#searchl)"></line>
                  <defs>
                    <linearGradient id="search" gradientTransform="rotate(50)">
                      <stop offset="0%" stop-color="#ffffff"></stop>
                      <stop offset="50%" stop-color="#ffffff"></stop>
                    </linearGradient>
                    <linearGradient id="searchl">
                      <stop offset="0%" stop-color="#ffffff"></stop>
                      <stop offset="50%" stop-color="#ffffff"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      {#if showFilters}
        <div class="field retro-field" style="min-width: 180px;" in:fly={{ x: -60, duration: 260 }}>
          <label for="sort-select">Sort by</label>
          <select id="sort-select" class="retro-select" bind:value={sort}>
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="username">Author</option>
          </select>
        </div>
        <div class="field retro-field" style="min-width: 140px;" in:fly={{ x: -70, duration: 300, delay: 40 }}>
          <label for="order-select">Order</label>
          <select id="order-select" class="retro-select" bind:value={order}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
        <div class="field retro-field" style="min-width: 160px;" in:fly={{ x: -80, duration: 340, delay: 80 }}>
          <label for="view-select">View</label>
          <select id="view-select" class="retro-select" bind:value={mine}>
            <option value="false">All published</option>
            <option value="true">My articles</option>
          </select>
        </div>
      {/if}
      <button class="btn retro-apply" on:click={load} disabled={loading}>Apply</button>
    </div>
    {#if error}
      <p class="muted">{error}</p>
    {/if}
    <div class="grid two" style="margin-top: 16px;">
      {#if loading}
        <p>Loading...</p>
      {:else if articles.length === 0}
        <p class="muted">No articles found.</p>
      {:else}
        {#each articles as article}
          <ArticleCard {article} />
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .search-field {
    position: relative;
  }

  .articles-card {
    background-color: #ffffff;
    background-image: url("/back_ground.jpg"); /*url("/back_ground.png")*/
    background-size: 280px auto;
    background-repeat: repeat;
    background-position: center;
  }

  .search-shell {
    position: relative;
    width: 100%;
    padding: 8px 0;
    z-index: 0;
  }

  .filter-panel {
    position: relative;
    padding: 14px 16px 12px;
    border-radius: 14px;
    background: radial-gradient(circle at top left, rgba(19, 40, 96, 0.25), transparent 60%),
      linear-gradient(180deg, rgba(19, 40, 96, 0.7), rgba(0, 0, 0, 0.85));
    border: 1px solid rgba(19, 40, 96, 0.6);
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.4);
    align-items: center;
    color: #ffffff;
  }

  .search-pod {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 520px;
  }

  .search-white,
  .search-border,
  .search-darkBorderBg,
  .search-glow {
    max-height: 70px;
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    z-index: -1;
    border-radius: 12px;
    filter: blur(3px);
  }

  .search-input {
    background-color: #000000;
    color: #ffffff;
    border: none;
    width: 100%;
    height: 56px;
    border-radius: 10px;
    padding: 0 56px 0 56px;
    font-size: 1rem;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  .search-input:focus {
    outline: none;
  }

  .search-main {
    position: relative;
    width: 100%;
    font-family: inherit;
  }

  .search-white {
    max-height: 63px;
    border-radius: 10px;
    filter: blur(2px);
  }

  .search-white::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(83deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.4);
    background-image: conic-gradient(
      rgba(255, 255, 255, 0) 0%,
      #ffffff,
      rgba(255, 255, 255, 0) 8%,
      rgba(255, 255, 255, 0) 50%,
      #ffffff,
      rgba(255, 255, 255, 0) 58%
    );
    transition: all 2s;
  }

  .search-border {
    max-height: 59px;
    border-radius: 11px;
    filter: blur(0.5px);
  }

  .search-border::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(70deg);
    position: absolute;
    width: 600px;
    height: 600px;
    filter: brightness(1.3);
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #ffffff,
      #ffffff 5%,
      #ffffff 14%,
      #ffffff 50%,
      #ffffff 60%,
      #ffffff 64%
    );
    transition: all 2s;
  }

  .search-darkBorderBg {
    max-height: 65px;
  }

  .search-darkBorderBg::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(82deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      rgba(255, 255, 255, 0),
      #ffffff,
      rgba(255, 255, 255, 0) 10%,
      rgba(255, 255, 255, 0) 50%,
      #ffffff,
      rgba(255, 255, 255, 0) 60%
    );
    transition: all 2s;
  }

  .search-pod:hover > .search-darkBorderBg::before,
  .search-pod:focus-within > .search-darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(262deg);
    transition: all 4s;
  }

  .search-pod:hover > .search-glow::before,
  .search-pod:focus-within > .search-glow::before {
    transform: translate(-50%, -50%) rotate(240deg);
    transition: all 4s;
  }

  .search-pod:hover > .search-white::before,
  .search-pod:focus-within > .search-white::before {
    transform: translate(-50%, -50%) rotate(263deg);
    transition: all 4s;
  }

  .search-pod:hover > .search-border::before,
  .search-pod:focus-within > .search-border::before {
    transform: translate(-50%, -50%) rotate(250deg);
    transition: all 4s;
  }

  .search-glow {
    overflow: hidden;
    filter: blur(30px);
    opacity: 0.4;
    max-height: 130px;
  }

  .search-glow::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(60deg);
    position: absolute;
    width: 999px;
    height: 999px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      rgba(255, 255, 255, 0),
      #ffffff 5%,
      rgba(255, 255, 255, 0) 38%,
      rgba(255, 255, 255, 0) 50%,
      #ffffff 60%,
      rgba(255, 255, 255, 0) 87%
    );
    transition: all 2s;
  }

  .search-filter-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    max-height: 40px;
    max-width: 38px;
    height: 100%;
    width: 100%;
    isolation: isolate;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(180deg, #132860, #000000);
    border: 1px solid transparent;
    cursor: pointer;
    padding: 0;
  }

  .search-filter-icon:focus-visible {
    outline: 2px solid rgba(19, 40, 96, 0.75);
    outline-offset: 2px;
  }

  .search-filterBorder {
    height: 42px;
    width: 40px;
    position: absolute;
    overflow: hidden;
    top: 7px;
    right: 7px;
    border-radius: 10px;
  }

  .search-filterBorder::before {
    content: "";
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.1);
    background-image: conic-gradient(
      rgba(255, 255, 255, 0),
      #ffffff,
      rgba(255, 255, 255, 0) 50%,
      rgba(255, 255, 255, 0) 50%,
      #ffffff,
      rgba(255, 255, 255, 0) 100%
    );
    animation: search-rotate 4s linear infinite;
  }

  .search-icon {
    position: absolute;
    left: 18px;
    top: 15px;
    color: #ffffff;
  }

  .retro-field label {
    color: #ffffff;
  }

  .retro-select {
    appearance: none;
    background-color: #000000;
    color: #ffffff;
    border: 1px solid #132860;
    border-radius: 10px;
    padding: 0 14px;
    height: 56px;
    font-weight: 600;
    box-shadow: inset 0 1px 0 rgba(19, 40, 96, 0.35);
    background-image: linear-gradient(180deg, rgba(19, 40, 96, 0.25), transparent);
  }

  .retro-select:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(19, 40, 96, 0.55);
  }

  .retro-apply {
    background: linear-gradient(180deg, #132860, #000000);
    color: #ffffff;
    border: 1px solid #000000;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
    height: 56px;
    padding: 0 24px;
    align-self: center;
    font-family: inherit;
  }

  .retro-apply:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  @keyframes search-rotate {
    100% {
      transform: translate(-50%, -50%) rotate(450deg);
    }
  }

  @media (max-width: 640px) {
    .search-pod {
      max-width: 100%;
    }

    .search-input {
      height: 52px;
      font-size: 0.95rem;
    }
  }
</style>

<script>
  import { onMount } from "svelte";
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

  async function load() {
    loading = true;
    error = "";
    try {
      const query = new URLSearchParams();
      if (q) query.set("q", q);
      query.set("sort", sort);
      query.set("order", order);
      if (mine === "true") query.set("mine", "true");
      articles = await apiFetch(`/api/articles?${query.toString()}`);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  onMount(load);
</script>

<div class="container">
  <div class="card">
    <h2>Articles</h2>
    <div class="row">
      <div class="field" style="flex: 2;">
        <label for="search-input">Search</label>
        <input id="search-input" type="text" placeholder="Search title or content" bind:value={q} />
      </div>
      <div class="field" style="min-width: 180px;">
        <label for="sort-select">Sort by</label>
        <select id="sort-select" bind:value={sort}>
          <option value="date">Date</option>
          <option value="title">Title</option>
          <option value="username">Author</option>
        </select>
      </div>
      <div class="field" style="min-width: 140px;">
        <label for="order-select">Order</label>
        <select id="order-select" bind:value={order}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      <div class="field" style="min-width: 160px;">
        <label for="view-select">View</label>
        <select id="view-select" bind:value={mine}>
          <option value="false">All published</option>
          <option value="true">My articles</option>
        </select>
      </div>
    </div>
    <button class="btn" on:click={load} disabled={loading}>Apply</button>
    {#if error}
      <p class="muted">{error}</p>
    {/if}
  </div>

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


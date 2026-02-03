<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { apiFetch, uploadFile } from "$lib/api.js";
  import { me } from "$lib/store.js";
  import { isNonEmptyString } from "$lib/validation.js";
  import TinyEditor from "$lib/components/TinyEditor.svelte";

  export let id;
  let title = "";
  let contentHtml = "";
  let isPublished = "true";
  let error = "";
  let success = "";
  let headerFile;
  let headerImagePath = "";
  let headerImageNonce = Date.now();

  function stripHtml(html) {
    return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  async function load() {
    if (!id) return;
    try {
      const article = await apiFetch(`/api/articles/${id}`);
      title = article.title;
      contentHtml = article.contentHtml;
      isPublished = article.isPublished ? "true" : "false";
      headerImagePath = article.headerImagePath || "";
      headerImageNonce = Date.now();
    } catch (e) {
      error = `Failed to load article: ${e.message}`;
    }
  }

  onMount(load);

  let lastLoadedId = null;
  $: if (id && id !== lastLoadedId) {
    lastLoadedId = id;
    load();
  }

  async function save() {
    error = "";
    success = "";
    const cleanTitle = (title ?? "").trim();
    const plainContent = stripHtml(contentHtml);
    if (!isNonEmptyString(cleanTitle, 200)) {
      error = "Title is required (max 200 characters).";
      return;
    }
    if (!isNonEmptyString(plainContent, 20000)) {
      error = "Content is required (max 20,000 characters).";
      return;
    }
    try {
      if (id) {
        await apiFetch(`/api/articles/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ title: cleanTitle, contentHtml, isPublished: isPublished === "true" })
        });
        await goto("/");
      } else {
        await apiFetch("/api/articles", {
          method: "POST",
          body: JSON.stringify({ title: cleanTitle, contentHtml, isPublished: isPublished === "true" })
        });
        await goto("/");
      }
    } catch (e) {
      error = `Failed to save: ${e.message}`;
    }
  }

  async function uploadHeader() {
    if (!id || !headerFile) return;
    error = "";
    success = "";
    try {
      await uploadFile(`/api/articles/${id}/header-image`, headerFile);
      await load();
      success = "Header image updated.";
      headerImageNonce = Date.now();
    } catch (e) {
      error = `Failed to upload header: ${e.message}`;
    }
  }

  async function removeHeader() {
    if (!id) return;
    error = "";
    success = "";
    try {
      await apiFetch(`/api/articles/${id}/header-image?remove=true`, { method: "POST" });
      success = "Header image removed.";
      headerImagePath = "";
      headerImageNonce = Date.now();
    } catch (e) {
      error = `Failed to remove header: ${e.message}`;
    }
  }

  async function removeArticle() {
    if (!confirm("Delete this article?")) return;
    error = "";
    success = "";
    try {
      await apiFetch(`/api/articles/${id}`, { method: "DELETE" });
      await goto("/");
    } catch (e) {
      error = `Failed to delete article: ${e.message}`;
    }
  }
</script>

<div class="container">
  <div class="card" style="max-width: 900px; margin: 20px auto;">
    <h2>{id ? "Edit Article" : "New Article"}</h2>
    {#if !$me}
      <p class="muted">Login required to write.</p>
    {:else}
      <div class="field">
        <label for="article-title">Title</label>
        <input type="text" id="article-title" bind:value={title} maxlength="200" required />
      </div>
      <div class="field">
        <label for="article-status">Status</label>
        <select id="article-status" bind:value={isPublished}>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>
      <div class="field">
        <div class="label">Content</div>
        <TinyEditor bind:value={contentHtml} />
      </div>

      {#if id}
        <div class="field">
          <label for="article-header-image">Article card image</label>
          {#if headerImagePath}
            <img
              src={`${headerImagePath}?ts=${headerImageNonce}`}
              alt="Article card"
              class="header-preview"
            />
          {:else}
            <div class="muted" style="margin: 6px 0 10px;">No card image yet.</div>
          {/if}
          <input
            id="article-header-image"
            type="file"
            accept="image/*"
            on:change={(e) => (headerFile = e.target.files[0])}
          />
          <div style="margin-top: 8px;">
            <button class="btn secondary" on:click={uploadHeader} disabled={!headerFile}>Change article image</button>
            <button
              class="btn secondary"
              on:click={removeHeader}
              style="margin-left: 8px;"
              disabled={!headerImagePath}
            >
              Remove header
            </button>
          </div>
          <div class="muted" style="margin-top: 6px;">Used on the article card. Embed detail images in the editor.</div>
        </div>
      {/if}

      <div style="margin-top: 12px;">
        <button class="btn" on:click={save}>Save</button>
        {#if id}
          <button class="btn danger" on:click={removeArticle} style="margin-left: 8px;">Delete</button>
        {/if}
      </div>

      {#if error}
        <p style="color: #d32f2f; margin-top: 12px;">{error}</p>
      {/if}
      {#if success}
        <p style="color: #388e3c; margin-top: 12px;">{success}</p>
      {/if}
    {/if}
  </div>
</div>

<style>
  .header-preview {
    width: 100%;
    max-height: 260px;
    object-fit: cover;
    border-radius: 10px;
    margin: 6px 0 10px;
    border: 1px solid #e5e7eb;
  }
</style>


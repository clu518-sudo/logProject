<script>
  import { onDestroy, onMount } from "svelte";
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
  let headerPreviewUrl = "";

  // Backend upload limit (see backend/src/util/uploads.js).
  const MAX_HEADER_BYTES = 10 * 1024 * 1024; // 10MB

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(kb >= 10 ? 0 : 1)}KB`;
  }

  function onHeaderFileChange(e) {
    success = "";
    const f = e?.currentTarget?.files?.[0];
    if (!f) {
      headerFile = undefined;
      headerPreviewUrl = "";
      return;
    }
    if (f.size > MAX_HEADER_BYTES) {
      headerFile = undefined;
      headerPreviewUrl = "";
      // Clear the file input so re-selecting the same file will retrigger change.
      e.currentTarget.value = "";
      error = `Failed to upload header: File too large (max ${formatBytes(MAX_HEADER_BYTES)}).`;
      return;
    }
    error = "";
    headerFile = f;
  }

  // Local preview for "new article" before the backend upload exists.
  // Logic: when file changes -> create object URL -> cleanup old URL.
  $: if (headerFile) {
    const nextUrl = URL.createObjectURL(headerFile);
    if (headerPreviewUrl && headerPreviewUrl !== nextUrl) URL.revokeObjectURL(headerPreviewUrl);
    headerPreviewUrl = nextUrl;
  }

  onDestroy(() => {
    if (headerPreviewUrl) URL.revokeObjectURL(headerPreviewUrl);
  });

  // Remove HTML tags to estimate plain text length.
  // Logic: strip tags -> collapse whitespace -> trim.
  function stripHtml(html) {
    return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  // Load article data for editing.
  // Logic: fetch article -> populate fields -> refresh image cache key.
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
  // Reload when the route id changes.
  $: if (id && id !== lastLoadedId) {
    lastLoadedId = id;
    load();
  }

  // Save changes (create or update).
  // Logic: validate -> POST or PATCH -> redirect home -> handle errors.
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
          body: JSON.stringify({
            title: cleanTitle,
            contentHtml,
            isPublished: isPublished === "true",
            // If there's no header image currently, request backend AI generation.
            generateHeaderImage: !headerImagePath,
          })
        });
        await goto("/");
      } else {
        const created = await apiFetch("/api/articles", {
          method: "POST",
          body: JSON.stringify({
            title: cleanTitle,
            contentHtml,
            isPublished: isPublished === "true",
            // Only generate an AI header if the user didn't select a header file.
            generateHeaderImage: !headerFile,
          })
        });

        // If a header file was selected while creating, upload it right after creation.
        // If the upload fails, take the user to the edit page so they can retry.
        const newId = created?.id;
        if (newId && headerFile) {
          try {
            await uploadFile(`/api/articles/${newId}/header-image`, headerFile);
          } catch (e) {
            error = `Article created, but header image upload failed: ${e.message}`;
            await goto(`/editor/${newId}`);
            return;
          }
        }
        await goto("/");
      }
    } catch (e) {
      error = `Failed to save: ${e.message}`;
    }
  }

  // Upload a header image for the article card.
  // Logic: POST image -> reload article -> update cache key.
  async function uploadHeader() {
    if (!id || !headerFile) return;
    error = "";
    success = "";
    try {
      if (headerFile.size > MAX_HEADER_BYTES) {
        throw new Error(`File too large (max ${formatBytes(MAX_HEADER_BYTES)})`);
      }
      await uploadFile(`/api/articles/${id}/header-image`, headerFile);
      await load();
      success = "Header image updated.";
      headerImageNonce = Date.now();
    } catch (e) {
      error = `Failed to upload header: ${e.message}`;
    }
  }

  // Remove the article header image.
  // Logic: POST remove flag -> clear local state -> update cache key.
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

  // Delete the current article and go back home.
  // Logic: confirm -> DELETE -> redirect.
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

      <div class="field">
        <label for="article-header-image">Article card image</label>
        {#if headerImagePath}
          <img
            src={`${headerImagePath}?ts=${headerImageNonce}`}
            alt="Article card"
            class="header-preview"
          />
        {:else if !id && headerPreviewUrl}
          <img
            src={headerPreviewUrl}
            alt="Selected article card preview"
            class="header-preview"
          />
        {:else}
          <div class="muted" style="margin: 6px 0 10px;">No card image yet.</div>
        {/if}

        <input
          id="article-header-image"
          type="file"
          accept="image/*"
          on:change={onHeaderFileChange}
        />

        <div style="margin-top: 8px;">
          <button class="btn secondary" on:click={uploadHeader} disabled={!id || !headerFile}>Change article image</button>
          {#if id}
            <button
              class="btn secondary"
              on:click={removeHeader}
              style="margin-left: 8px;"
              disabled={!headerImagePath}
            >
              Remove header
            </button>
          {/if}
        </div>

        <div class="muted" style="margin-top: 6px;">
          Used on the article card. {#if !id}Select an image now and it will upload after your first Save.{/if} Embed detail images in the editor.
        </div>
      </div>

      <div style="margin-top: 12px;">
        <button class="btn" on:click={save}>Save</button>
        {#if id}
          <button class="btn danger" on:click={removeArticle} style="margin-left: 8px;">Delete</button>
        {/if}
      </div>

      {#if error}
        <p style="color: #132860; margin-top: 12px;">{error}</p>
      {/if}
      {#if success}
        <p style="color: #132860; margin-top: 12px;">{success}</p>
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
    border: 1px solid #132860;
  }
</style>


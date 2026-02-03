<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { apiFetch } from "$lib/api.js";
  import { me, loadMe } from "$lib/store.js";

  onMount(async () => {
    await loadMe();
  });

  async function logout() {
    await apiFetch("/api/logout", { method: "POST" });
    me.set(null);
    await goto("/");
  }
</script>

<div class="navbar">
  <div class="container">
    <a href="/"><strong>PGCIT Blog</strong></a>
    <div class="nav-links">
      <a href="/">Articles</a>
      {#if $me}
        <a href="/profile">Profile</a>
        <a href="/editor">Write</a>
        <button class="btn secondary" on:click={logout}>Logout</button>
        <a href="/profile" class="user-info">
          <img src="/api/users/{$me.id}/avatar" alt="{$me.username}'s avatar" class="nav-avatar" />
          <span class="nav-username">{$me.username}</span>
        </a>
      {:else}
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      {/if}
    </div>
  </div>
</div>

<slot />


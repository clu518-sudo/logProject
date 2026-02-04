<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { apiFetch } from "$lib/api.js";
  import { me, loadMe } from "$lib/store.js";

  // Load current user when the app layout mounts.
  onMount(async () => {
    await loadMe();
  });

  // Active nav highlighting.
  // Logic: exact match for "/" and prefix match for other sections.
  $: pathname = $page.url.pathname;
  $: isArticlesActive = pathname === "/";
  $: isProfileActive = pathname === "/profile" || pathname.startsWith("/profile/");
  $: isEditorActive = pathname === "/editor" || pathname.startsWith("/editor/");
  $: isLoginActive = pathname === "/login" || pathname.startsWith("/login/");
  $: isRegisterActive = pathname === "/register" || pathname.startsWith("/register/");

  // Log out from the navbar and return to home.
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
      <a href="/" class="nav-link" class:active={isArticlesActive}>Articles</a>
      {#if $me}
        <a href="/profile" class="nav-link" class:active={isProfileActive}>Profile</a>
        <a href="/editor" class="nav-link" class:active={isEditorActive}>Write</a>
        <button class="btn secondary" on:click={logout}>Logout</button>
        <a href="/profile" class="user-info">
          <img src="/api/users/{$me.id}/avatar" alt="{$me.username}'s avatar" class="nav-avatar" />
          <span class="nav-username">{$me.username}</span>
        </a>
      {:else}
        <a href="/login" class="nav-link" class:active={isLoginActive}>Login</a>
        <a href="/register" class="nav-link" class:active={isRegisterActive}>Register</a>
      {/if}
    </div>
  </div>
</div>

<slot />


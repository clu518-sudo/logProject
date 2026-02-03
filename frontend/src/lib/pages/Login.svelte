<script>
  import { goto } from "$app/navigation";
  import { apiFetch } from "$lib/api.js";
  import { me, loadMe } from "$lib/store.js";

  let username = "";
  let password = "";
  let error = "";
  let loading = false;

  async function submit() {
    error = "";
    loading = true;
    try {
      await apiFetch("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
      await loadMe();
      await goto("/");
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function logout() {
    await apiFetch("/api/logout", { method: "POST" });
    me.set(null);
    await goto("/");
  }
</script>

<div class="container">
  <div class="card" style="max-width: 460px; margin: 20px auto;">
    <h2>Login</h2>
    <div class="field">
      <label for="login-username">Username</label>
      <input id="login-username" type="text" bind:value={username} maxlength="20" autocomplete="username" />
    </div>
    <div class="field">
      <label for="login-password">Password</label>
      <input id="login-password" type="password" bind:value={password} maxlength="72" autocomplete="current-password" />
    </div>
    {#if error}
      <p class="muted">{error}</p>
    {/if}
    <button class="btn" on:click={submit} disabled={loading}>Login</button>
    {#if $me}
      <button class="btn secondary" on:click={logout} style="margin-left: 8px;">Logout</button>
    {/if}
  </div>
</div>


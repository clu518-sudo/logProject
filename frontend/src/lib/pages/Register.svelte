<script>
  import { goto } from "$app/navigation";
  import { apiFetch } from "$lib/api.js";
  import { normalizeUsername, isValidUsername, isValidPassword, normalizeDob } from "$lib/validation.js";

  const avatarOptions = [
    { key: "pikachu", name: "Pikachu", image: "/uploads/avatars/pikachu_no_border.png" },
    { key: "charmander", name: "Charmander", image: "/uploads/avatars/charmander_no_border.png" },
    { key: "squirtle", name: "Squirtle", image: "/uploads/avatars/squirtle_no_border.png" },
    { key: "bulbasaur", name: "Bulbasaur", image: "/uploads/avatars/bulbasaur_no_border.png" },
    { key: "eevee", name: "Eevee", image: "/uploads/avatars/eevee_no_border.png" },
    { key: "gengar", name: "Gengar", image: "/uploads/avatars/gengar_no_border.png" }
  ];

  let username = "";
  let password = "";
  let confirm = "";
  let realName = "";
  let dob = "";
  let bio = "";
  let avatarKey = "pikachu";
  let avatarMode = "predefined"; // "predefined" or "custom"
  let customAvatarFile = null;
  let customAvatarPreview = null;
  let available = null;
  let error = "";
  let loading = false;
  const today = new Date().toISOString().slice(0, 10);

  let timer;
  function checkAvailability() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!username.trim()) {
        available = null;
        return;
      }
      const data = await apiFetch(`/api/users/exists?username=${encodeURIComponent(username.trim())}`);
      available = data.available;
    }, 300);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      customAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        customAvatarPreview = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function selectPredefinedMode() {
    avatarMode = "predefined";
    customAvatarFile = null;
    customAvatarPreview = null;
  }

  function selectCustomMode() {
    avatarMode = "custom";
  }

  async function submit() {
    error = "";
    const normalizedUsername = normalizeUsername(username);
    if (!isValidUsername(normalizedUsername)) {
      error = "Username must be 3-20 characters (letters, numbers, underscore).";
      return;
    }
    if (!isValidPassword(password)) {
      error = "Password must be 8-72 characters.";
      return;
    }
    if (password !== confirm) {
      error = "Passwords do not match.";
      return;
    }
    if (avatarMode === "custom" && !customAvatarFile) {
      error = "Please select an image file for your custom avatar.";
      return;
    }
    const normalizedDob = normalizeDob(dob);
    if (dob && !normalizedDob) {
      error = "Date of birth must be YYYY-MM-DD.";
      return;
    }
    loading = true;
    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          username: normalizedUsername,
          password,
          realName: realName.trim(),
          dob: normalizedDob,
          bio: bio.trim(),
          avatarKey
        })
      });

      // If custom avatar was selected, upload it after account creation
      if (avatarMode === "custom" && customAvatarFile) {
        // First, login to get session
        await apiFetch("/api/login", {
          method: "POST",
          body: JSON.stringify({ username: normalizedUsername, password })
        });

        // Upload avatar
        const form = new FormData();
        form.append("avatar", customAvatarFile);
        const res = await fetch("/api/users/me/avatar", {
          method: "POST",
          body: form,
          credentials: "include"
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          error = `Account created but avatar upload failed: ${data?.error?.message || "Unknown error"}`;
          loading = false;
          return;
        }
      }

      await goto("/login");
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <div class="card" style="max-width: 560px; margin: 20px auto;">
    <h2>Register</h2>
    <div class="field">
      <label for="register-username">Username</label>
      <input
        type="text"
        id="register-username"
        bind:value={username}
        on:input={checkAvailability}
        minlength="3"
        maxlength="20"
        autocomplete="username"
        required
      />
      {#if available === true}
        <span class="muted">Username is available.</span>
      {:else if available === false}
        <span class="muted">Username is taken.</span>
      {/if}
    </div>
    <div class="field">
      <label for="register-password">Password</label>
      <input
        id="register-password"
        type="password"
        bind:value={password}
        minlength="8"
        maxlength="72"
        autocomplete="new-password"
        required
      />
    </div>
    <div class="field">
      <label for="register-confirm">Confirm Password</label>
      <input
        id="register-confirm"
        type="password"
        bind:value={confirm}
        minlength="8"
        maxlength="72"
        autocomplete="new-password"
        required
      />
    </div>
    <div class="field">
      <label for="register-realname">Real Name</label>
      <input id="register-realname" bind:value={realName} maxlength="80" autocomplete="name" />
    </div>
    <div class="field">
      <label for="register-dob">Date of Birth (YYYY-MM-DD)</label>
      <input id="register-dob" type="date" bind:value={dob} max={today} lang="en" />
    </div>
    <div class="field">
      <label for="register-bio">Bio</label>
      <textarea id="register-bio" rows="3" bind:value={bio} maxlength="500"></textarea>
    </div>
    <div class="field">
      <div class="label">Choose your avatar</div>

      <div style="margin-bottom: 12px; display: flex; gap: 12px;">
        <button
          type="button"
          class={`mode-btn ${avatarMode === "predefined" ? "active" : ""}`}
          on:click={selectPredefinedMode}
        >
          Predefined Avatars
        </button>
        <button
          type="button"
          class={`mode-btn ${avatarMode === "custom" ? "active" : ""}`}
          on:click={selectCustomMode}
        >
          Upload Custom
        </button>
      </div>

      {#if avatarMode === "predefined"}
        <div class="row" style="gap: 12px; flex-wrap: wrap;">
          {#each avatarOptions as opt}
            <button
              type="button"
              class={`avatar-option ${avatarKey === opt.key ? "selected" : ""}`}
              on:click={() => (avatarKey = opt.key)}
              aria-pressed={avatarKey === opt.key}
              aria-label={`Choose ${opt.name} avatar`}
              title={opt.name}
            >
              <img src={opt.image} alt={opt.name} class="avatar-preview" />
            </button>
          {/each}
        </div>
      {:else}
        <div class="custom-upload-area">
          <input type="file" id="custom-avatar" accept="image/*" on:change={handleFileSelect} />
          {#if customAvatarPreview}
            <div style="margin-top: 12px;">
              <img src={customAvatarPreview} alt="Avatar preview" class="custom-preview" />
            </div>
          {/if}
        </div>
      {/if}
    </div>
    {#if error}
      <p class="muted">{error}</p>
    {/if}
    <button class="btn" on:click={submit} disabled={loading}>
      {loading ? "Creating account..." : "Create account"}
    </button>
  </div>
</div>

<style>
  .mode-btn {
    padding: 8px 16px;
    border: 2px solid #e5e7eb;
    background: #fff;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .mode-btn:hover {
    border-color: #93c5fd;
    background: #eff6ff;
  }

  .mode-btn.active {
    border-color: #2563eb;
    background: #dbeafe;
    color: #1e40af;
  }

  .custom-upload-area {
    padding: 20px;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    background: #f9fafb;
  }

  .custom-preview {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid #e5e7eb;
  }
</style>


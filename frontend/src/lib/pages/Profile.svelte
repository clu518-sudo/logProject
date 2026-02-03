<script>
  import { goto } from "$app/navigation";
  import { me, loadMe } from "$lib/store.js";
  import { apiFetch, uploadAvatar } from "$lib/api.js";
  import { normalizeUsername, isValidUsername, normalizeDob } from "$lib/validation.js";

  const avatarOptions = [
    { key: "pikachu", name: "Pikachu", image: "/uploads/avatars/pikachu_no_border.png" },
    { key: "charmander", name: "Charmander", image: "/uploads/avatars/charmander_no_border.png" },
    { key: "squirtle", name: "Squirtle", image: "/uploads/avatars/squirtle_no_border.png" },
    { key: "bulbasaur", name: "Bulbasaur", image: "/uploads/avatars/bulbasaur_no_border.png" },
    { key: "eevee", name: "Eevee", image: "/uploads/avatars/eevee_no_border.png" },
    { key: "gengar", name: "Gengar", image: "/uploads/avatars/gengar_no_border.png" }
  ];

  let username = "";
  let realName = "";
  let dob = "";
  let bio = "";
  let avatarKey = "pikachu";
  let error = "";
  let success = "";
  let loading = false;
  let file;
  let showAvatarModal = false;
  let avatarNonce = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  $: if ($me) {
    username = $me.username;
    realName = $me.realName || "";
    dob = $me.dob || "";
    bio = $me.bio || "";
    if ($me.avatarType === "predefined") avatarKey = $me.avatarKey || "pikachu";
    avatarNonce = Date.now();
  }

  $: currentAvatarUrl = $me ? `/api/users/${$me.id}/avatar?ts=${avatarNonce}` : "";
  $: uploadedAvatarUrl = $me && $me.avatarPath ? `${$me.avatarPath}?ts=${avatarNonce}` : "";

  async function saveProfile() {
    error = "";
    success = "";
    const normalizedUsername = normalizeUsername(username);
    if (!isValidUsername(normalizedUsername)) {
      error = "Username must be 3-20 characters (letters, numbers, underscore).";
      return;
    }
    const normalizedDob = normalizeDob(dob);
    if (dob && !normalizedDob) {
      error = "Date of birth must be YYYY-MM-DD.";
      return;
    }
    loading = true;
    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          username: normalizedUsername,
          realName: realName.trim(),
          dob: normalizedDob,
          bio: bio.trim()
        })
      });
      await loadMe();
      success = "Profile updated.";
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function selectPredefinedAvatar(key) {
    error = "";
    success = "";
    loading = true;
    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ avatarKey: key })
      });
      await loadMe();
      avatarNonce = Date.now();
      success = "Avatar updated.";
      showAvatarModal = false;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function selectUploadedAvatar() {
    error = "";
    success = "";
    loading = true;
    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ avatarType: "upload" })
      });
      await loadMe();
      avatarNonce = Date.now();
      success = "Avatar updated.";
      showAvatarModal = false;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function upload() {
    error = "";
    success = "";
    if (!file) return;
    loading = true;
    try {
      await uploadAvatar(file);
      await loadMe();
      avatarNonce = Date.now();
      success = "Avatar uploaded.";
      showAvatarModal = false;
      file = null;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function removeAccount() {
    if (!confirm("Delete your account permanently?")) return;
    await apiFetch("/api/users/me", { method: "DELETE" });
    me.set(null);
    await goto("/");
  }
</script>

<div class="container">
  <div class="card" style="max-width: 680px; margin: 20px auto;">
    <h2>Profile</h2>
    {#if !$me}
      <p class="muted">Please log in to edit your profile.</p>
    {:else}
      <div class="field">
        <label for="profile-username">Username</label>
        <input
          type="text"
          id="profile-username"
          bind:value={username}
          minlength="3"
          maxlength="20"
          autocomplete="username"
          required
        />
      </div>
      <div class="field">
        <label for="profile-realname">Real Name</label>
        <input id="profile-realname" bind:value={realName} maxlength="80" autocomplete="name" />
      </div>
      <div class="field">
        <label for="profile-dob">Date of Birth</label>
        <input id="profile-dob" type="date" bind:value={dob} max={today} />
      </div>
      <div class="field">
        <label for="profile-bio">Bio</label>
        <textarea id="profile-bio" rows="3" bind:value={bio} maxlength="500"></textarea>
      </div>

      <div class="field">
        <div class="label">Avatar</div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src={currentAvatarUrl} alt="Your avatar" class="current-avatar" />
          <button class="btn secondary" on:click={() => (showAvatarModal = true)}>Change Avatar</button>
        </div>
      </div>

      <button class="btn" on:click={saveProfile} disabled={loading}>Save profile</button>

      <div style="margin-top: 20px;">
        <button class="btn danger" on:click={removeAccount}>Delete my account</button>
      </div>

      {#if error}
        <p class="muted">{error}</p>
      {/if}
      {#if success}
        <p class="muted">{success}</p>
      {/if}
    {/if}
  </div>
</div>

{#if showAvatarModal}
  <div
    class="modal-overlay"
    role="button"
    tabindex="0"
    aria-label="Close avatar dialog"
    on:click={(e) => {
      if (e.target === e.currentTarget) showAvatarModal = false;
    }}
    on:keydown={(e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showAvatarModal = false;
      }
    }}
  >
    <div class="modal-content" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Choose Avatar</h3>
        <button class="close-btn" on:click={() => (showAvatarModal = false)}>&times;</button>
      </div>

      <div class="modal-body">
        <div class="avatar-section">
          <h4>Predefined Avatars</h4>
          <div class="avatar-grid">
            {#each avatarOptions as opt}
              <button
                type="button"
                class="avatar-option-modal"
                on:click={() => selectPredefinedAvatar(opt.key)}
                disabled={loading}
              >
                <img src={opt.image} alt={opt.name} class="avatar-preview-modal" />
                <span class="avatar-name">{opt.name}</span>
              </button>
            {/each}
          </div>
        </div>

        {#if uploadedAvatarUrl}
          <div class="avatar-section">
            <h4>Uploaded Avatars</h4>
            <div class="avatar-grid">
              <button
                type="button"
                class="avatar-option-modal"
                on:click={selectUploadedAvatar}
                disabled={loading}
              >
                <img src={uploadedAvatarUrl} alt="Uploaded avatar" class="avatar-preview-modal" />
                <span class="avatar-name">My Upload</span>
              </button>
            </div>
          </div>
        {/if}

        <div class="avatar-section">
          <h4>Upload Custom Avatar</h4>
          <div class="upload-area">
            <input
              id="modal-avatar-file"
              type="file"
              accept="image/*"
              on:change={(e) => (file = e.target.files[0])}
              disabled={loading}
            />
            <button class="btn" on:click={upload} disabled={!file || loading} style="margin-top: 8px;">
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .current-avatar {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid #e5e7eb;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #6b7280;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
  }

  .close-btn:hover {
    color: #1f2937;
  }

  .modal-body {
    padding: 20px;
  }

  .avatar-section {
    margin-bottom: 24px;
  }

  .avatar-section h4 {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    color: #374151;
  }

  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .avatar-option-modal {
    border: 3px solid transparent;
    background: #f9fafb;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .avatar-option-modal:hover:not(:disabled) {
    border-color: #93c5fd;
    background: #eff6ff;
    transform: translateY(-2px);
  }

  .avatar-option-modal:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .avatar-preview-modal {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .avatar-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: #4b5563;
  }

  .upload-area {
    background: #f9fafb;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
  }

  #modal-avatar-file {
    width: 100%;
    max-width: 300px;
  }
</style>


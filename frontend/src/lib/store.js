import { writable } from "svelte/store";
import { apiFetch } from "./api.js";

/**
 * Global Svelte store holding the current logged-in user.
 *
 * **Value shape**
 * - `null` when logged out
 * - user object when logged in (see backend `/api/me`)
 *
 * **Key term**
 * - *Store*: a reactive value container in Svelte. Components auto-update when it changes.
 */
export const me = writable(null);

/**
 * Load the current user from the backend and update the `me` store.
 *
 * **Inputs**: none
 * **Output**: none (updates store)
 * **Side effects**: sends HTTP request; updates `me`
 *
 * **Logic**
 * - Call `/api/me` -> set store -> on any error set store to null.
 */
export async function loadMe() {
  try {
    const data = await apiFetch("/api/me");
    me.set(data);
  } catch {
    me.set(null);
  }
}


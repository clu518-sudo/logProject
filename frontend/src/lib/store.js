import { writable } from "svelte/store";
import { apiFetch } from "./api.js";

export const me = writable(null);

export async function loadMe() {
  try {
    const data = await apiFetch("/api/me");
    me.set(data);
  } catch {
    me.set(null);
  }
}


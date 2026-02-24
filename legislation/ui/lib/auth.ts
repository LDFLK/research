"use client";

export const AUTH_TOKEN_KEY = "auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Wrapper around fetch that automatically attaches the Authorization header
 * using the token stored in localStorage (if present).
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getAuthToken();

  const headers = new Headers(init.headers || {});
  if (token) {
    // Backend expects raw token, not "Bearer ..."
    headers.set("Authorization", token);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}


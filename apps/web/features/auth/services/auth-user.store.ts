"use client";

import { useSyncExternalStore } from "react";

import type { AuthUser } from "@/features/auth/types/auth";

export type StoredAuthUser = AuthUser;

type AuthUserState = StoredAuthUser | null;

type StoredEnvelope = {
  user: StoredAuthUser;
  savedAt: string;
};

const STORAGE_KEY = "auction.auth.user";
const listeners = new Set<() => void>();
let currentUser: AuthUserState = null;
let hydrated = false;

function hydrateAuthUser() {
  if (hydrated || typeof window === "undefined") {
    return;
  }

  hydrated = true;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    currentUser = null;
    return;
  }

  try {
    const parsed = JSON.parse(raw) as StoredEnvelope;
    currentUser = parsed.user ?? null;
  } catch {
    currentUser = null;
  }
}

function emitAuthUserChange() {
  listeners.forEach((listener) => listener());
}

export function setAuthUser(user: StoredAuthUser | null) {
  currentUser = user;

  if (typeof window !== "undefined") {
    if (user) {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user, savedAt: new Date().toISOString() }),
      );
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  emitAuthUserChange();
}

export function clearAuthUser() {
  setAuthUser(null);
}

export function getAuthUser(): AuthUserState {
  hydrateAuthUser();
  return currentUser;
}

export function subscribeAuthUser(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAuthUser(): AuthUserState {
  return useSyncExternalStore(subscribeAuthUser, getAuthUser, () => null);
}

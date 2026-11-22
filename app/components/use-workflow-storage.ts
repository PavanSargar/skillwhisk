"use client";

import { useState, useSyncExternalStore } from "react";
import { parseLocalJson, readDraft, type LocalDraft } from "@/lib/catalog/workflow-settings";

const storageEvent = "skillwhisk:local-workflows";
const favoritesKey = "skillwhisk:favorites";
const memory = new Map<string, string>();

function readStorage(key: string) {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    memory.delete(key);
  } catch {
    memory.set(key, value);
  }
  window.dispatchEvent(new Event(storageEvent));
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(storageEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(storageEvent, callback);
  };
}

function subscribeSearch(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function readFavorites(raw: string | null): string[] {
  const value = parseLocalJson(raw);
  return Array.isArray(value) ? [...new Set(value.filter((slug): slug is string => typeof slug === "string"))] : [];
}

export function useFavoriteRecipes() {
  const raw = useSyncExternalStore(subscribeStorage, () => readStorage(favoritesKey), () => null);

  function toggleFavorite(slug: string) {
    const current = readFavorites(readStorage(favoritesKey));
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    writeStorage(favoritesKey, JSON.stringify(next));
  }

  return { favorites: readFavorites(raw), toggleFavorite };
}

export function useWorkflowDraft(key: string) {
  const raw = useSyncExternalStore(subscribeStorage, () => readStorage(key), () => null);
  const search = useSyncExternalStore(subscribeSearch, () => window.location.search, () => "");
  const [editedSearch, setEditedSearch] = useState<string>();

  function saveDraft(draft: LocalDraft) {
    setEditedSearch(search);
    writeStorage(key, JSON.stringify(draft));
  }

  return {
    draft: readDraft(raw),
    shared: new URLSearchParams(editedSearch === search ? "" : search),
    saveDraft,
  };
}

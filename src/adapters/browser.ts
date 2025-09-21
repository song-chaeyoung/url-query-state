"use client";
import { useSyncExternalStore } from "react";
import { createUseQueryState, type UpdateMode } from "../core";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener("popstate", handler);
  window.addEventListener("pushstate", handler as EventListener);
  window.addEventListener("replacestate", handler as EventListener);
  return () => {
    window.removeEventListener("popstate", handler);
    window.removeEventListener("pushstate", handler as EventListener);
    window.removeEventListener("replacestate", handler as EventListener);
  };
}

function snapshot() {
  if (typeof window === "undefined") return "|";
  return `${window.location.pathname}|${window.location.search}`;
}

function getServerSnapshot() {
  return "|";
}

function push(url: string) {
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event("pushstate"));
}
function replace(url: string) {
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event("replacestate"));
}

export const useBrowserQueryState = createUseQueryState(() => {
  useSyncExternalStore(subscribe, snapshot, getServerSnapshot);
  const pathname =
    typeof window === "undefined" ? "" : window.location.pathname;
  const raw = typeof window === "undefined" ? "" : window.location.search;
  const search = raw.startsWith("?") ? raw.slice(1) : raw;

  const navigate = (url: string, mode: UpdateMode) => {
    if (typeof window === "undefined") return;
    mode === "replace" ? replace(url) : push(url);
  };

  return { pathname, search, navigate };
});

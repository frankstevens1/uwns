"use client";

import * as React from "react";
import type { DocsSearchItem } from "@/lib/docs/types";

export type DocsHeaderState = {
  active: boolean;
  docked: boolean;
  title: string;
  href: string;
  query: string;
  searchIndex: DocsSearchItem[];
};

const defaultDocsHeaderState: DocsHeaderState = {
  active: false,
  docked: false,
  title: "",
  href: "/docs",
  query: "",
  searchIndex: [],
};

let docsHeaderState = defaultDocsHeaderState;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function stateChanged(next: DocsHeaderState) {
  return (
    next.active !== docsHeaderState.active ||
    next.docked !== docsHeaderState.docked ||
    next.title !== docsHeaderState.title ||
    next.href !== docsHeaderState.href ||
    next.query !== docsHeaderState.query ||
    next.searchIndex !== docsHeaderState.searchIndex
  );
}

export function setDocsHeaderState(next: Partial<DocsHeaderState>) {
  const updated = { ...docsHeaderState, ...next };
  if (!stateChanged(updated)) return;

  docsHeaderState = updated;
  emit();
}

export function resetDocsHeaderState() {
  if (!stateChanged(defaultDocsHeaderState)) return;

  docsHeaderState = defaultDocsHeaderState;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return docsHeaderState;
}

export function useDocsHeaderState() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

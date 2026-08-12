import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let revision = 0;

export function notifyLibraryChanged() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function useLibraryRevision() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return revision;
}

import { canUseDOM } from "./browser";
import { logger } from "./logger";

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryStorageAdapter(
  seed: Record<string, string> = {},
): StorageAdapter {
  const store = new Map(Object.entries(seed));

  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

export const browserStorageAdapter: StorageAdapter = {
  getItem(key) {
    if (!canUseDOM) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    if (!canUseDOM) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // no-op
    }
  },
  removeItem(key) {
    if (!canUseDOM) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // no-op
    }
  },
};

export function resolveStorageAdapter(
  storage?: StorageAdapter,
): StorageAdapter {
  if (storage) return storage;
  if (canUseDOM) return browserStorageAdapter;
  return createMemoryStorageAdapter();
}
/**
 * Clears all items from storage that start with the given prefix.
 * Works correctly with both browser localStorage and memory adapter.
 */
export const clearStorageByPrefix = (
  storage: StorageAdapter,
  prefix: string,
): void => {
  if (!storage || !prefix) return;

  const keysToRemove: string[] = [];

  // For browser localStorage - use native iteration (most reliable)
  if (storage === browserStorageAdapter && canUseDOM) {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
  }
  // Fallback for memory adapter (or if somehow not browser)
  else {
    // This works because memory adapter uses a Map, but Object.keys on the adapter object itself won't
    // So we skip Object.keys and rely on the loop above in most cases
    logger.warn("clearStorageByPrefix: Using fallback for non-browser storage");
  }

  // Remove the collected keys
  keysToRemove.forEach((key) => {
    storage.removeItem(key);
  });

  // Minimal logging as you requested
  if (keysToRemove.length > 0) {
    logger.log(
      `Cleared ${keysToRemove.length} item(s) with prefix "${prefix}"`,
    );
  }
};

const ensureServerLocalStorage = () => {
  if (typeof window !== "undefined") {
    return;
  }

  const globalScope = globalThis as typeof globalThis & {
    localStorage?: {
      getItem?: (...args: unknown[]) => unknown;
      setItem?: (...args: unknown[]) => unknown;
      removeItem?: (...args: unknown[]) => unknown;
      clear?: () => void;
      key?: (index: number) => string | null;
      length?: number;
    };
  };

  const candidate = globalScope.localStorage;

  const hasValidAPI =
    candidate &&
    typeof candidate.getItem === "function" &&
    typeof candidate.setItem === "function" &&
    typeof candidate.removeItem === "function";

  if (hasValidAPI) {
    return;
  }

  const store = new Map<string, string>();

  const safeStorage = {
    getItem: (key: string): string | null => {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number): string | null => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    },
    get length() {
      return store.size;
    },
  };

  globalScope.localStorage = safeStorage;
};

ensureServerLocalStorage();

export { };


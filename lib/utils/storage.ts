type SafeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const hasStorageAPIs = (storage: Storage | undefined): storage is Storage => {
  if (!storage) return false;
  return (
    typeof storage.getItem === "function" &&
    typeof storage.setItem === "function" &&
    typeof storage.removeItem === "function"
  );
};

export const getSafeLocalStorage = (): SafeStorage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storage = window.localStorage;
  if (!hasStorageAPIs(storage)) {
    return null;
  }

  return storage;
};


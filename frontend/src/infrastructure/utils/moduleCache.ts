const moduleCacheStore = new Map<string, unknown>();

export const getModuleCache = <T>(key: string): T | null => {
  const hasKey = moduleCacheStore.has(key);
  return hasKey ? (moduleCacheStore.get(key) as T) : null;
};

export const setModuleCache = <T>(key: string, value: T): void => {
  moduleCacheStore.set(key, value);
};

export const clearModuleCache = (key: string): void => {
  moduleCacheStore.delete(key);
};

const cache = new Map();

export const setCache = (key, value, ttl = 300) => {
  const expiresAt = Date.now() + ttl * 1000;
  cache.set(key, { value, expiresAt });
};

export const getCache = (key) => {
  const item = cache.get(key);
  
  if (!item) {
    return null;
  }
  
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
};

export const deleteCache = (key) => {
  cache.delete(key);
};

export const clearCache = () => {
  cache.clear();
};

export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
};

export const LocalStorageService = {
  set: (key: string, value: string): void => {
    localStorage.setItem(key, value);
  },
  get: (key: string): string | null => {
    return localStorage.getItem(key);
  },
  delete: (key: string): void => {
    localStorage.removeItem(key);
  },
};

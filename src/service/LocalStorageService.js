export const LocalStorageService = {
    set: (key, value) => {
        localStorage.setItem(key, value);
    },
    get: (key) => {
        return localStorage.getItem(key);
    },
    delete: (key) => {
        localStorage.removeItem(key);
    },
};

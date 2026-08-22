// ── SHARED STORAGE ────────────────────────────────────────────────────────────
// Substitui window.storage (Claude artifacts) por localStorage (Vite/browser)
// Usado por todos os módulos do monorepo

const PREFIX = "lifetree_";

export const storage = {
  async get(key) {
    try {
      const val = localStorage.getItem(PREFIX + key);
      if (val === null) return null;
      return { key, value: val };
    } catch (e) {
      console.error("storage.get error:", e);
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value);
      return { key, value };
    } catch (e) {
      console.error("storage.set error:", e);
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true };
    } catch (e) {
      return null;
    }
  },

  async list(prefix = "") {
    try {
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX + prefix))
        .map(k => k.replace(PREFIX, ""));
      return { keys };
    } catch (e) {
      return { keys: [] };
    }
  },
};

// Injetar no window para compatibilidade com código legado (window.storage)
if (typeof window !== "undefined") {
  window.storage = storage;
}

export default storage;

const STORAGE_KEY = "favorites";
const FAVORITES_CHANGED_EVENT = "favorites-changed";

type FavoritesStore = Record<string, number[]>;

function readStore(): FavoritesStore {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as FavoritesStore) : {};
}

function writeStore(store: FavoritesStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT));
}

export function getFavoriteIds(userId: number) {
  return readStore()[String(userId)] ?? [];
}

export function isFavorite(userId: number, productId: number) {
  return getFavoriteIds(userId).includes(productId);
}

export function toggleFavorite(userId: number, productId: number) {
  const store = readStore();
  const key = String(userId);
  const current = new Set(store[key] ?? []);

  if (current.has(productId)) {
    current.delete(productId);
  } else {
    current.add(productId);
  }

  store[key] = [...current];
  writeStore(store);

  return store[key];
}

export function subscribeFavorites(onChange: () => void) {
  window.addEventListener(FAVORITES_CHANGED_EVENT, onChange);

  return () => {
    window.removeEventListener(FAVORITES_CHANGED_EVENT, onChange);
  };
}

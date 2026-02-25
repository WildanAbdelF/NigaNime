export interface WatchedEpisodeEntry {
  episodeId: string;
  episodeNumber: number;
  watchedAt: number;
}

export interface VisitedEpisodeEntry {
  episodeId: string;
  episodeNumber: number;
  visitedAt: number;
}

const STORAGE_KEY = "watchedEpisodes:v1";
const WATCHED_EVENT = "watched-episode";
const VISITED_STORAGE_KEY = "visitedEpisodes:v1";
const VISITED_EVENT = "visited-episode";

type WatchedStore = Record<string, Record<string, WatchedEpisodeEntry>>;
type VisitedStore = Record<string, Record<string, VisitedEpisodeEntry>>;

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

const readStore = (): WatchedStore => {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as WatchedStore;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // ignore malformed storage
  }
  return {};
};

const writeStore = (store: WatchedStore) => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors silently for now
  }
};

const readVisitedStore = (): VisitedStore => {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(VISITED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as VisitedStore;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // ignore malformed storage
  }
  return {};
};

const writeVisitedStore = (store: VisitedStore) => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors silently for now
  }
};

const dispatchWatchedEvent = (animeId: string, episodeId: string) => {
  if (!isBrowser()) return;
  const detail = { animeId, episodeId };
  window.dispatchEvent(new CustomEvent(WATCHED_EVENT, { detail }));
};

const dispatchVisitedEvent = (animeId: string, episodeId: string) => {
  if (!isBrowser()) return;
  const detail = { animeId, episodeId };
  window.dispatchEvent(new CustomEvent(VISITED_EVENT, { detail }));
};

export const getWatchedEpisodeIds = (animeId: string): Set<string> => {
  const store = readStore();
  const entries = store[animeId];
  if (!entries) return new Set();
  return new Set(Object.keys(entries));
};

export const markEpisodeWatched = (animeId: string, entry: WatchedEpisodeEntry) => {
  if (!animeId || !entry.episodeId) return;
  const store = readStore();
  const existingByAnime = store[animeId] ?? {};

  existingByAnime[entry.episodeId] = {
    ...entry,
    episodeNumber: Number.isFinite(entry.episodeNumber) ? entry.episodeNumber : 0,
    watchedAt: entry.watchedAt || Date.now(),
  };

  // keep only the most recent 200 entries per anime to avoid unbounded growth
  const sorted = Object.values(existingByAnime).sort((a, b) => b.watchedAt - a.watchedAt).slice(0, 200);
  const trimmed: Record<string, WatchedEpisodeEntry> = {};
  sorted.forEach((item) => {
    trimmed[item.episodeId] = item;
  });

  store[animeId] = trimmed;
  writeStore(store);
  dispatchWatchedEvent(animeId, entry.episodeId);
};

export const watchedStorageKey = STORAGE_KEY;
export const watchedEventName = WATCHED_EVENT;

export const getVisitedEpisodeIds = (animeId: string): Set<string> => {
  const store = readVisitedStore();
  const entries = store[animeId];
  if (!entries) return new Set();
  return new Set(Object.keys(entries));
};

export const markEpisodeVisited = (animeId: string, entry: VisitedEpisodeEntry) => {
  if (!animeId || !entry.episodeId) return;
  const store = readVisitedStore();
  const existingByAnime = store[animeId] ?? {};

  existingByAnime[entry.episodeId] = {
    ...entry,
    episodeNumber: Number.isFinite(entry.episodeNumber) ? entry.episodeNumber : 0,
    visitedAt: entry.visitedAt || Date.now(),
  };

  const trimmedList = Object.values(existingByAnime)
    .sort((a, b) => b.visitedAt - a.visitedAt)
    .slice(0, 300);

  const trimmed: Record<string, VisitedEpisodeEntry> = {};
  trimmedList.forEach((item) => {
    trimmed[item.episodeId] = item;
  });

  store[animeId] = trimmed;
  writeVisitedStore(store);
  dispatchVisitedEvent(animeId, entry.episodeId);
};

/**
 * Returns the most recently visited episode for a given anime,
 * or null if no episode has been visited yet.
 */
export const getLastVisitedEpisode = (animeId: string): VisitedEpisodeEntry | null => {
  const store = readVisitedStore();
  const entries = store[animeId];
  if (!entries) return null;
  const sorted = Object.values(entries).sort((a, b) => b.visitedAt - a.visitedAt);
  return sorted.length > 0 ? sorted[0] : null;
};

/**
 * Returns all visited episode entries for a given anime, keyed by episodeId.
 */
export const getVisitedEpisodeEntries = (animeId: string): Record<string, VisitedEpisodeEntry> => {
  const store = readVisitedStore();
  return store[animeId] ?? {};
};

export const visitedStorageKey = VISITED_STORAGE_KEY;
export const visitedEventName = VISITED_EVENT;

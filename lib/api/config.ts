/**
 * Jikan API Configuration
 * Documentation: https://docs.api.jikan.moe/
 */

export const API_CONFIG = {
  BASE_URL: "https://api.jikan.moe/v4",
  
  // Rate limiting: Jikan has rate limits, so we need to be careful
  // Free tier: 3 requests per second, 60 requests per minute
  RATE_LIMIT: {
    REQUESTS_PER_SECOND: 3,
    REQUESTS_PER_MINUTE: 60,
  },

  // Default pagination
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 25,
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Anime
  ANIME: {
    LIST: "/anime",
    DETAIL: (id: number) => `/anime/${id}`,
    FULL: (id: number) => `/anime/${id}/full`,
    CHARACTERS: (id: number) => `/anime/${id}/characters`,
    EPISODES: (id: number) => `/anime/${id}/episodes`,
    RECOMMENDATIONS: (id: number) => `/anime/${id}/recommendations`,
    REVIEWS: (id: number) => `/anime/${id}/reviews`,
  },

  // Top Anime
  TOP: {
    ANIME: "/top/anime",
    MANGA: "/top/manga",
    CHARACTERS: "/top/characters",
  },

  // Seasons
  SEASONS: {
    NOW: "/seasons/now",
    UPCOMING: "/seasons/upcoming",
    LIST: "/seasons",
    BY_YEAR: (year: number, season: string) => `/seasons/${year}/${season}`,
  },

  // Search
  SEARCH: {
    ANIME: "/anime",
    MANGA: "/manga",
    CHARACTERS: "/characters",
  },

  // Schedules
  SCHEDULES: "/schedules",

  // Genres
  GENRES: {
    ANIME: "/genres/anime",
    MANGA: "/genres/manga",
  },
} as const;

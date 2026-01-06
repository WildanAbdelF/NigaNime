/**
 * Consumet API Configuration (HiAnime Provider)
 * Documentation: https://docs.consumet.org/
 */

export const API_CONFIG = {
  BASE_URL: "https://api.consumet.org/anime/hianime",
  
  // Default pagination
  DEFAULT_LIMIT: 24,
  MAX_LIMIT: 24,
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Search
  SEARCH: (query: string) => `/${encodeURIComponent(query)}`,
  SEARCH_SUGGESTIONS: (query: string) => `/search-suggestions/${encodeURIComponent(query)}`,
  ADVANCED_SEARCH: "/advanced-search",

  // Anime Info
  INFO: "/info",
  
  // Watch/Streaming
  WATCH: (episodeId: string) => `/watch/${episodeId}`,
  
  // Schedule
  SCHEDULE: "/schedule",

  // Top/Rankings
  TOP_AIRING: "/top-airing",
  MOST_POPULAR: "/most-popular",
  MOST_FAVORITE: "/most-favorite",

  // Recent
  RECENTLY_UPDATED: "/recently-updated",
  RECENTLY_ADDED: "/recently-added",
  LATEST_COMPLETED: "/latest-completed",

  // Upcoming
  TOP_UPCOMING: "/top-upcoming",

  // Categories/Types
  SUBBED: "/subbed-anime",
  DUBBED: "/dubbed-anime",
  MOVIE: "/movie",
  TV: "/tv",
  OVA: "/ova",
  ONA: "/ona",
  SPECIAL: "/special",

  // Genres
  GENRES: "/genres",
  GENRE: (genre: string) => `/genre/${genre}`,

  // Studio
  STUDIO: (studio: string) => `/studio/${studio}`,

  // Spotlight
  SPOTLIGHT: "/spotlight",
} as const;

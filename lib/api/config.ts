/**
 * Jikan API Configuration (MyAnimeList)
 * Documentation: https://docs.api.jikan.moe/
 * 
 * Note: Jikan is a free, open-source API for MyAnimeList
 * Rate limit: 3 requests per second, 60 per minute
 */

export const API_CONFIG = {
  BASE_URL: "https://api.jikan.moe/v4",
  
  // Default pagination
  DEFAULT_LIMIT: 24,
  MAX_LIMIT: 25,
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Search
  SEARCH: "/anime",
  
  // Anime Info
  INFO: (id: number) => `/anime/${id}/full`,
  
  // Top Rankings
  TOP: "/top/anime",
  TOP_AIRING: "/top/anime?filter=airing",
  TOP_UPCOMING: "/top/anime?filter=upcoming",
  TOP_BYPOPULARITY: "/top/anime?filter=bypopularity",
  TOP_FAVORITE: "/top/anime?filter=favorite",
  
  // Seasons
  SEASON_NOW: "/seasons/now",
  SEASON_UPCOMING: "/seasons/upcoming",
  SEASON: (year: number, season: string) => `/seasons/${year}/${season}`,
  
  // Schedules
  SCHEDULES: "/schedules",
  SCHEDULE_DAY: (day: string) => `/schedules?filter=${day}`,
  
  // Random
  RANDOM: "/random/anime",
  
  // Genres
  GENRES: "/genres/anime",
  
  // Recommendations
  RECOMMENDATIONS: (id: number) => `/anime/${id}/recommendations`,
  
  // Characters & Staff
  CHARACTERS: (id: number) => `/anime/${id}/characters`,
  STAFF: (id: number) => `/anime/${id}/staff`,
  
  // Episodes
  EPISODES: (id: number) => `/anime/${id}/episodes`,
  
  // Reviews
  REVIEWS: (id: number) => `/anime/${id}/reviews`,
} as const;

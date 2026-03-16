/**
 * HiAnime API Configuration (via aniwatch-api)
 * This provides streaming data including spotlight, trending, etc.
 * 
 * Note: This is separate from Jikan API which provides MAL metadata
 */

export const HIANIME_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_HIANIME_API_BASE_URL ||
    process.env.HIANIME_API_BASE_URL ||
    "https://niga-nime-api.vercel.app/api/v2/hianime",
} as const;

export const HIANIME_ENDPOINTS = {
  // Home page data (spotlight, trending, etc.)
  HOME: "/home",
  
  // Search
  SEARCH: "/search",
  SEARCH_SUGGESTION: "/search/suggestion",
  
  // Anime Info
  INFO: (id: string) => `/anime/${id}`,
  
  // Episodes
  EPISODES: (id: string) => `/anime/${id}/episodes`,
  
  // Episode Servers
  SERVERS: (episodeId: string) => `/episode/servers?animeEpisodeId=${episodeId}`,
  
  // Streaming Sources
  SOURCES: (episodeId: string, server?: string, category?: string) => {
    let url = `/episode/sources?animeEpisodeId=${episodeId}`;
    if (server) url += `&server=${server}`;
    if (category) url += `&category=${category}`;
    return url;
  },
  
  // A-Z List
  AZ_LIST: (letter: string, page?: number) => `/azlist/${letter}${page ? `?page=${page}` : ""}`,
  
  // Categories
  TOP_AIRING: "/top-airing",
  MOST_POPULAR: "/most-popular",
  MOST_FAVORITE: "/most-favorite",
  LATEST_COMPLETED: "/latest-completed",
  LATEST_EPISODES: "/latest-episodes",
  NEW_ADDED: "/new-added",
  TOP_UPCOMING: "/top-upcoming",
  
  // Schedule
  SCHEDULE: (date: string) => `/schedule?date=${date}`,
  
  // Genre
  GENRE: (name: string, page?: number) => `/genre/${name}${page ? `?page=${page}` : ""}`,
  
  // Producer/Studio
  PRODUCER: (name: string, page?: number) => `/producer/${name}${page ? `?page=${page}` : ""}`,
  
  // Category (TV, Movie, OVA, etc.)
  CATEGORY: (name: string, page?: number) => `/category/${name}${page ? `?page=${page}` : ""}`,
} as const;

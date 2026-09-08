/**
 * HiAnime API Configuration (via aniwatch-api)
 * This provides streaming data including spotlight, trending, etc.
 * 
 * Note: This is separate from Jikan API which provides MAL metadata
 */

function getBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_HIANIME_API_BASE_URL ||
    process.env.HIANIME_API_BASE_URL;

  // If envUrl is set and is NOT the decommissioned old API domain, use it
  if (envUrl && !envUrl.includes("niga-nime-api.vercel.app")) {
    let trimmed = envUrl.replace(/\/+$/, "");
    if (trimmed.includes("niganime-api-v2.vercel.app") && !trimmed.endsWith("/api")) {
      trimmed += "/api";
    }
    return trimmed;
  }

  return "https://niganime-api-v2.vercel.app/api";
}

export const HIANIME_CONFIG = {
  BASE_URL: getBaseUrl(),
} as const;

export const HIANIME_ENDPOINTS = {
  // Home page data (spotlight, trending, etc.)
  HOME: "/home",
  
  // Search
  SEARCH: "/search",
  SEARCH_SUGGESTION: "/search/suggestions",
  
  // Anime Info
  INFO: (id: string) => `/anime/${id}`,
  
  // Episodes
  EPISODES: (id: string) => `/anime/${id}/episodes`,
  
  // Episode Servers
  SERVERS: (episodeId: string) => `/episode/servers?id=${episodeId}`,
  
  // Streaming Sources
  SOURCES: (episodeId: string, server?: string, category?: string) => {
    let url = `/episode/sources?id=${episodeId}`;
    if (server) url += `&server=${server.toLowerCase()}`;
    if (category) url += `&category=${category.toLowerCase()}`;
    return url;
  },
  
  // A-Z List
  AZ_LIST: (letter: string, page?: number) => `/az-list?sort=${letter}${page ? `&page=${page}` : ""}`,
  

  // Categories
  TOP_AIRING: "/category/top-airing",
  MOST_POPULAR: "/category/most-popular",
  MOST_FAVORITE: "/category/most-favorite",
  LATEST_COMPLETED: "/category/latest-completed",
  LATEST_EPISODES: "/category/recently-updated",
  NEW_ADDED: "/category/new-added",
  TOP_UPCOMING: "/category/top-upcoming",
  
  // Schedule
  SCHEDULE: (date: string) => `/schedule?date=${date}`,
  
  // Genre
  GENRE: (name: string, page?: number) => `/genre/${name}${page ? `?page=${page}` : ""}`,
  
  // Producer/Studio
  PRODUCER: (name: string, page?: number) => `/producer/${name}${page ? `?page=${page}` : ""}`,
  
  // Category (TV, Movie, OVA, etc.)
  CATEGORY: (name: string, page?: number) => `/category/${name}${page ? `?page=${page}` : ""}`,
} as const;

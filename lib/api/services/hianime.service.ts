import { HIANIME_CONFIG, HIANIME_ENDPOINTS } from "../hianime-config";
import type {
  HiAnimeHomeResponse,
  HiAnimeInfoResponse,
  HiAnimeEpisodesResponse,
  HiAnimeServersResponse,
  HiAnimeSourcesResponse,
  HiAnimeSearchResponse,
  HiAnimeScheduleResponse,
} from "@/types/hianime";

/**
 * HiAnime Service
 * Handles all HiAnime API calls for streaming data
 */

async function fetchHiAnime<T>(
  endpoint: string,
  options?: { revalidate?: number }
): Promise<T> {
  const url = `${HIANIME_CONFIG.BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    next: { revalidate: options?.revalidate || 300 }, // Cache for 5 minutes by default
  });

  if (!response.ok) {
    throw new Error(`HiAnime API error: ${response.status}`);
  }

  return response.json();
}

export const hianimeService = {
  /**
   * Get home page data (spotlight, trending, top 10, etc.)
   */
  async getHome() {
    return fetchHiAnime<HiAnimeHomeResponse>(HIANIME_ENDPOINTS.HOME);
  },

  /**
   * Get anime info by ID
   */
  async getInfo(id: string) {
    return fetchHiAnime<HiAnimeInfoResponse>(HIANIME_ENDPOINTS.INFO(id));
  },

  /**
   * Get anime episodes
   */
  async getEpisodes(id: string) {
    return fetchHiAnime<HiAnimeEpisodesResponse>(HIANIME_ENDPOINTS.EPISODES(id));
  },

  /**
   * Get episode servers
   */
  async getServers(episodeId: string) {
    return fetchHiAnime<HiAnimeServersResponse>(HIANIME_ENDPOINTS.SERVERS(episodeId));
  },

  /**
   * Get streaming sources
   */
  async getSources(episodeId: string, server?: string, category?: string) {
    return fetchHiAnime<HiAnimeSourcesResponse>(
      HIANIME_ENDPOINTS.SOURCES(episodeId, server, category)
    );
  },

  /**
   * Search anime
   */
  async search(query: string) {
    return fetchHiAnime<HiAnimeSearchResponse>(`${HIANIME_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get schedule for a specific date
   */
  async getSchedule(date: string) {
    return fetchHiAnime<HiAnimeScheduleResponse>(HIANIME_ENDPOINTS.SCHEDULE(date));
  },

  /**
   * Get most popular anime
   */
  async getMostPopular(page: number = 1) {
    return fetchHiAnime<any>(`${HIANIME_ENDPOINTS.MOST_POPULAR}?page=${page}`);
  },

  /**
   * Get most favorite anime
   */
  async getMostFavorite(page: number = 1) {
    return fetchHiAnime<any>(`${HIANIME_ENDPOINTS.MOST_FAVORITE}?page=${page}`);
  },

  /**
   * Get top airing anime
   */
  async getTopAiring(page: number = 1) {
    return fetchHiAnime<any>(`${HIANIME_ENDPOINTS.TOP_AIRING}?page=${page}`);
  },

  /**
   * Get latest episodes
   */
  async getLatestEpisodes(page: number = 1) {
    return fetchHiAnime<any>(`${HIANIME_ENDPOINTS.LATEST_EPISODES}?page=${page}`);
  },

  /**
   * Get anime by A-Z list
   * @param letter - The letter to filter by: "all", "#" (for 0-9), or A-Z
   * @param page - Page number (default 1)
   */
  async getAZList(letter: string = "all", page: number = 1) {
    // Convert letter to API format: "all", "0-9" for "#", or lowercase letter
    let sortOption: string;
    if (letter.toLowerCase() === "all") {
      sortOption = "all";
    } else if (letter === "#") {
      sortOption = "0-9";
    } else {
      sortOption = letter.toLowerCase();
    }
    return fetchHiAnime<any>(HIANIME_ENDPOINTS.AZ_LIST(sortOption, page));
  },

  /**
   * Get anime by category
   * Supported categories: "most-favorite", "most-popular", "subbed-anime", 
   * "dubbed-anime", "recently-updated", "recently-added", "top-upcoming", 
   * "top-airing", "movie", "special", "ova", "ona", "tv", "completed"
   * @param category - The category name
   * @param page - Page number (default 1)
   */
  async getCategory(category: string = "most-popular", page: number = 1) {
    return fetchHiAnime<any>(HIANIME_ENDPOINTS.CATEGORY(category, page));
  },
};

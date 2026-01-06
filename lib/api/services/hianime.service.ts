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

async function fetchHiAnime<T>(endpoint: string): Promise<T> {
  const url = `${HIANIME_CONFIG.BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
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
};

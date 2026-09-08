import { HIANIME_CONFIG, HIANIME_ENDPOINTS } from "../config/hianime-config";
import type {
  HiAnimeHomeResponse,
  HiAnimeInfoResponse,
  HiAnimeEpisodesResponse,
  HiAnimeServersResponse,
  HiAnimeSourcesResponse,
  HiAnimeSearchResponse,
  HiAnimeScheduleResponse,
} from "@/types/api/hianime";

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
    const res = await fetchHiAnime<HiAnimeInfoResponse>(HIANIME_ENDPOINTS.INFO(id));
    if (res?.data?.anime) {
      const moreInfo = res.data.anime.moreInfo as any;
      const stats = res.data.anime.info?.stats as any;
      const score =
        moreInfo?.malScore ||
        moreInfo?.malscore ||
        moreInfo?.score ||
        stats?.score ||
        stats?.malScore;

      if (score && moreInfo) {
        moreInfo.malscore = score;
        moreInfo.malScore = score;
        moreInfo.score = score;
      }
      if (score && stats) {
        stats.score = score;
        stats.malScore = score;
      }
    }
    return res;
  },

  /**
   * Get anime episodes
   */
  async getEpisodes(id: string) {
    const res = await fetchHiAnime<HiAnimeEpisodesResponse>(HIANIME_ENDPOINTS.EPISODES(id));
    if (res?.data?.episodes) {
      res.data.episodes = res.data.episodes.map((ep: any) => ({
        ...ep,
        episodeId: ep.id || ep.episodeId,
      }));
    }
    return res;
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
    return fetchHiAnime<HiAnimeSearchResponse>(`${HIANIME_ENDPOINTS.SEARCH}?keyword=${encodeURIComponent(query)}`);
  },

  /**
   * Search anime with pagination and optional filters
   * Uses the Search API which supports pagination and various filters
   * @param query - Search query string
   * @param page - Page number (default 1)
   * @param filters - Optional filters (sort, genres, type, etc.)
   */
  async searchWithPagination(query: string, page: number = 1, filters?: {
    genres?: string;  // comma-separated genres, e.g. "action,adventure"
    type?: string;    // movie, tv, ova, ona, special
    sort?: string;    // score, name, recently-added, recently-updated, most-watched, most-favourite
    season?: string;  // spring, summer, fall, winter
    language?: string; // sub, dub, sub-&-dub
    status?: string;  // finished-airing, currently-airing, not-yet-aired
    rated?: string;   // g, pg, pg-13, r, r+, rx
    startDate?: string;
    endDate?: string;
    score?: string;   // appalling, horrible, very-bad, bad, average, fine, good, very-good, great, masterpiece
  }) {
    const params = new URLSearchParams();
    params.set("keyword", query);
    if (page > 1) params.set("page", page.toString());
    
    if (filters) {
      if (filters.genres) params.set("genres", filters.genres);
      if (filters.type) params.set("type", filters.type);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.season) params.set("season", filters.season);
      if (filters.language) params.set("language", filters.language);
      if (filters.status) params.set("status", filters.status);
      if (filters.rated) params.set("rated", filters.rated);
      if (filters.startDate) params.set("start_date", filters.startDate);
      if (filters.endDate) params.set("end_date", filters.endDate);
      if (filters.score) params.set("score", filters.score);
    }
    
    return fetchHiAnime<HiAnimeSearchResponse>(`${HIANIME_ENDPOINTS.SEARCH}?${params.toString()}`);
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
    return fetchHiAnime<any>(HIANIME_ENDPOINTS.CATEGORY("most-popular", page));
  },

  /**
   * Get most favorite anime
   */
  async getMostFavorite(page: number = 1) {
    return fetchHiAnime<any>(HIANIME_ENDPOINTS.CATEGORY("most-favorite", page));
  },

  /**
   * Get top airing anime
   */
  async getTopAiring(page: number = 1) {
    return fetchHiAnime<any>(HIANIME_ENDPOINTS.CATEGORY("top-airing", page));
  },

  /**
   * Get latest episodes
   */
  async getLatestEpisodes(page: number = 1) {
    return fetchHiAnime<any>(HIANIME_ENDPOINTS.CATEGORY("recently-updated", page));
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

  /**
   * Get anime by genre
   * @param genre - The genre name (in kebab-case, e.g. "action", "slice-of-life")
   * @param page - Page number (default 1)
   */
  async getGenre(genre: string, page: number = 1) {
    return fetchHiAnime<any>(HIANIME_ENDPOINTS.GENRE(genre, page));
  },

  /**
   * Advanced search with multiple filters combined
   * Uses the search endpoint which supports: genres, type, sort, season, language, status, rated, dates, score
   * NOTE: The search API requires a query parameter. For filter-only searches, we use a minimal character.
   * @param filters - Object containing filter parameters
   */
  async advancedFilter(filters: {
    query?: string;
    genres?: string;  // comma-separated genres, e.g. "action,adventure"
    type?: string;    // movie, tv, ova, ona, special
    sort?: string;    // score, name, recently-added, recently-updated, most-watched, most-favourite
    season?: string;  // spring, summer, fall, winter
    language?: string; // sub, dub, sub-&-dub
    status?: string;  // finished-airing, currently-airing, not-yet-aired
    rated?: string;   // g, pg, pg-13, r, r+, rx
    startDate?: string;
    endDate?: string;
    score?: string;   // appalling, horrible, very-bad, bad, average, fine, good, very-good, great, masterpiece
    page?: number;
  }) {
    const params = new URLSearchParams();
    
    // Query is required for search API - use a wildcard-like character for filter-only mode
    // The API accepts any string, so we use a common letter to get broad results
    params.set("keyword", filters.query || "a");
    
    if (filters.genres) params.set("genres", filters.genres);
    if (filters.type) params.set("type", filters.type);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.season) params.set("season", filters.season);
    if (filters.language) params.set("language", filters.language);
    if (filters.status) params.set("status", filters.status);
    if (filters.rated) params.set("rated", filters.rated);
    if (filters.startDate) params.set("start_date", filters.startDate);
    if (filters.endDate) params.set("end_date", filters.endDate);
    if (filters.score) params.set("score", filters.score);
    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    
    return fetchHiAnime<any>(`${HIANIME_ENDPOINTS.SEARCH}?${params.toString()}`);
  },
};

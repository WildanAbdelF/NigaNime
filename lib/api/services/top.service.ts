import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { TopAnimeResponse } from "@/types/anime";

/**
 * Top/Rankings Service
 * Handles top anime rankings API calls using Jikan API
 */

export interface TopAnimeParams {
  page?: number;
  limit?: number;
}

export const topService = {
  /**
   * Get top airing anime
   */
  async getTopAiring(params?: TopAnimeParams) {
    return fetcher<TopAnimeResponse>(ENDPOINTS.TOP, { 
      filter: "airing",
      page: params?.page,
      limit: params?.limit || 25,
    });
  },

  /**
   * Get most popular anime (by popularity rank)
   */
  async getMostPopular(params?: TopAnimeParams) {
    return fetcher<TopAnimeResponse>(ENDPOINTS.TOP, { 
      filter: "bypopularity",
      page: params?.page,
      limit: params?.limit || 25,
    });
  },

  /**
   * Get most favorite anime
   */
  async getMostFavorite(params?: TopAnimeParams) {
    return fetcher<TopAnimeResponse>(ENDPOINTS.TOP, { 
      filter: "favorite",
      page: params?.page,
      limit: params?.limit || 25,
    });
  },

  /**
   * Get top upcoming anime
   */
  async getTopUpcoming(params?: TopAnimeParams) {
    return fetcher<TopAnimeResponse>(ENDPOINTS.TOP, { 
      filter: "upcoming",
      page: params?.page,
      limit: params?.limit || 25,
    });
  },

  /**
   * Get top anime by score
   */
  async getTopByScore(params?: TopAnimeParams) {
    return fetcher<TopAnimeResponse>(ENDPOINTS.TOP, { 
      page: params?.page,
      limit: params?.limit || 25,
    });
  },
};


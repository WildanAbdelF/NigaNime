import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { AnimeSearchResponse } from "@/types/anime";

/**
 * Top/Rankings Service
 * Handles top anime rankings API calls using Consumet HiAnime API
 */

export interface TopAnimeParams {
  page?: number;
}

export const topService = {
  /**
   * Get top airing anime
   */
  async getTopAiring(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.TOP_AIRING, { page });
  },

  /**
   * Get most popular anime
   */
  async getMostPopular(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.MOST_POPULAR, { page });
  },

  /**
   * Get most favorite anime
   */
  async getMostFavorite(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.MOST_FAVORITE, { page });
  },

  /**
   * Get top upcoming anime
   */
  async getTopUpcoming(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.TOP_UPCOMING, { page });
  },

  /**
   * Get latest completed anime
   */
  async getLatestCompleted(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.LATEST_COMPLETED, { page });
  },
};

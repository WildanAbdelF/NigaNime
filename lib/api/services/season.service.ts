import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { AnimeSearchResponse, SpotlightResponse } from "@/types/anime";

/**
 * Season/Category Service
 * Handles seasonal and category-based anime API calls using Consumet HiAnime API
 */

export interface ListParams {
  page?: number;
}

export const seasonService = {
  /**
   * Get currently airing anime
   */
  async getTopAiring(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.TOP_AIRING, { page });
  },

  /**
   * Get recently updated anime
   */
  async getRecentlyUpdated(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.RECENTLY_UPDATED, { page });
  },

  /**
   * Get recently added anime
   */
  async getRecentlyAdded(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.RECENTLY_ADDED, { page });
  },

  /**
   * Get latest completed anime
   */
  async getLatestCompleted(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.LATEST_COMPLETED, { page });
  },

  /**
   * Get upcoming anime
   */
  async getUpcoming(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.TOP_UPCOMING, { page });
  },

  /**
   * Get spotlight/featured anime
   */
  async getSpotlight() {
    return fetcher<SpotlightResponse>(ENDPOINTS.SPOTLIGHT);
  },

  /**
   * Get subbed anime
   */
  async getSubbedAnime(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.SUBBED, { page });
  },

  /**
   * Get dubbed anime
   */
  async getDubbedAnime(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.DUBBED, { page });
  },

  /**
   * Get movies
   */
  async getMovies(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.MOVIE, { page });
  },

  /**
   * Get TV series
   */
  async getTVSeries(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.TV, { page });
  },

  /**
   * Get OVAs
   */
  async getOVAs(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.OVA, { page });
  },

  /**
   * Get ONAs
   */
  async getONAs(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.ONA, { page });
  },

  /**
   * Get specials
   */
  async getSpecials(page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.SPECIAL, { page });
  },
};

import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { Anime } from "@/types/anime";

/**
 * Season Service
 * Handles seasonal anime API calls
 */

export type SeasonType = "winter" | "spring" | "summer" | "fall";

export interface SeasonParams {
  page?: number;
  limit?: number;
  filter?: string;
}

export const seasonService = {
  /**
   * Get current season anime
   */
  async getCurrentSeason(params?: SeasonParams) {
    return fetcher<Anime[]>(ENDPOINTS.SEASONS.NOW, params);
  },

  /**
   * Get upcoming anime
   */
  async getUpcoming(params?: SeasonParams) {
    return fetcher<Anime[]>(ENDPOINTS.SEASONS.UPCOMING, params);
  },

  /**
   * Get anime by specific year and season
   */
  async getBySeason(year: number, season: SeasonType, params?: SeasonParams) {
    return fetcher<Anime[]>(ENDPOINTS.SEASONS.BY_YEAR(year, season), params);
  },

  /**
   * Get list of available seasons
   */
  async getSeasonsList() {
    return fetcher<{ year: number; seasons: SeasonType[] }[]>(ENDPOINTS.SEASONS.LIST);
  },
};

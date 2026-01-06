import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { SeasonListResponse, TopAnimeResponse } from "@/types/anime";

/**
 * Season/Category Service
 * Handles seasonal and category-based anime API calls using Jikan API
 */

export interface SeasonParams {
  page?: number;
  limit?: number;
  filter?: "tv" | "movie" | "ova" | "special" | "ona" | "music";
  sfw?: boolean;
}

export const seasonService = {
  /**
   * Get current season anime
   */
  async getCurrentSeason(params?: SeasonParams) {
    return fetcher<SeasonListResponse>(ENDPOINTS.SEASON_NOW, { 
      page: params?.page,
      limit: params?.limit || 25,
      sfw: params?.sfw !== false ? "true" : undefined,
      filter: params?.filter,
    });
  },

  /**
   * Get upcoming season anime
   */
  async getUpcomingSeason(params?: SeasonParams) {
    return fetcher<SeasonListResponse>(ENDPOINTS.SEASON_UPCOMING, { 
      page: params?.page,
      limit: params?.limit || 25,
      sfw: params?.sfw !== false ? "true" : undefined,
      filter: params?.filter,
    });
  },

  /**
   * Get anime from a specific season
   * @param year - Year (e.g., 2024)
   * @param season - Season name ("winter", "spring", "summer", "fall")
   */
  async getSeason(year: number, season: string, params?: SeasonParams) {
    return fetcher<SeasonListResponse>(ENDPOINTS.SEASON(year, season.toLowerCase()), { 
      page: params?.page,
      limit: params?.limit || 25,
      sfw: params?.sfw !== false ? "true" : undefined,
      filter: params?.filter,
    });
  },

  /**
   * Get top airing anime (used for spotlight/hero section)
   */
  async getSpotlight(limit?: number) {
    return fetcher<TopAnimeResponse>(ENDPOINTS.TOP, { 
      filter: "airing",
      limit: limit || 10,
      sfw: "true",
    });
  },

  /**
   * Get top anime by popularity (for featured sections)
   */
  async getFeatured(limit?: number) {
    return fetcher<TopAnimeResponse>(ENDPOINTS.TOP, { 
      filter: "bypopularity",
      limit: limit || 10,
      sfw: "true",
    });
  },

  /**
   * Get movies
   */
  async getMovies(params?: SeasonParams) {
    return fetcher<SeasonListResponse>(ENDPOINTS.SEARCH, { 
      type: "movie",
      order_by: "popularity",
      sort: "asc",
      page: params?.page,
      limit: params?.limit || 25,
      sfw: "true",
    });
  },

  /**
   * Get TV series
   */
  async getTVSeries(params?: SeasonParams) {
    return fetcher<SeasonListResponse>(ENDPOINTS.SEARCH, { 
      type: "tv",
      status: "airing",
      order_by: "popularity",
      sort: "asc",
      page: params?.page,
      limit: params?.limit || 25,
      sfw: "true",
    });
  },

  /**
   * Get OVA
   */
  async getOVA(params?: SeasonParams) {
    return fetcher<SeasonListResponse>(ENDPOINTS.SEARCH, { 
      type: "ova",
      order_by: "popularity",
      sort: "asc",
      page: params?.page,
      limit: params?.limit || 25,
      sfw: "true",
    });
  },
};

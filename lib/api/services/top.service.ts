import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { Anime } from "@/types/anime";

/**
 * Top/Rankings Service
 * Handles top anime, manga, characters API calls
 */

export type TopAnimeFilter = "airing" | "upcoming" | "bypopularity" | "favorite";

export interface TopAnimeParams {
  page?: number;
  limit?: number;
  filter?: TopAnimeFilter;
}

export const topService = {
  /**
   * Get top anime list
   */
  async getTopAnime(params?: TopAnimeParams) {
    return fetcher<Anime[]>(ENDPOINTS.TOP.ANIME, params as Record<string, string | number | boolean | undefined>);
  },

  /**
   * Get top manga list
   */
  async getTopManga(params?: { page?: number; limit?: number }) {
    return fetcher<unknown[]>(ENDPOINTS.TOP.MANGA, params);
  },

  /**
   * Get top characters
   */
  async getTopCharacters(params?: { page?: number; limit?: number }) {
    return fetcher<unknown[]>(ENDPOINTS.TOP.CHARACTERS, params);
  },
};

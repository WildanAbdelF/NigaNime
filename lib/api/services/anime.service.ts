import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { Anime, AnimeSearchParams, AnimeFull } from "@/types/anime";

/**
 * Anime Service
 * Handles all anime-related API calls
 */
export const animeService = {
  /**
   * Get list of anime with optional filters
   */
  async getList(params?: AnimeSearchParams) {
    return fetcher<Anime[]>(ENDPOINTS.ANIME.LIST, params as Record<string, string | number | boolean | undefined>);
  },

  /**
   * Get anime by ID
   */
  async getById(id: number) {
    return fetcher<Anime>(ENDPOINTS.ANIME.DETAIL(id));
  },

  /**
   * Get full anime details by ID
   */
  async getFullById(id: number) {
    return fetcher<AnimeFull>(ENDPOINTS.ANIME.FULL(id));
  },

  /**
   * Get anime characters
   */
  async getCharacters(id: number) {
    return fetcher<unknown[]>(ENDPOINTS.ANIME.CHARACTERS(id));
  },

  /**
   * Get anime episodes
   */
  async getEpisodes(id: number, page?: number) {
    return fetcher<unknown[]>(ENDPOINTS.ANIME.EPISODES(id), { page });
  },

  /**
   * Get anime recommendations
   */
  async getRecommendations(id: number) {
    return fetcher<unknown[]>(ENDPOINTS.ANIME.RECOMMENDATIONS(id));
  },

  /**
   * Search anime
   */
  async search(query: string, params?: Omit<AnimeSearchParams, "q">) {
    return fetcher<Anime[]>(ENDPOINTS.SEARCH.ANIME, { q: query, ...params });
  },
};

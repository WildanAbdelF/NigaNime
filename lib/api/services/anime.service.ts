import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { 
  AnimeSearchResponse, 
  AnimeInfo, 
  EpisodeSourcesResponse,
  AdvancedSearchParams,
  SearchSuggestionsResponse,
  Genre
} from "@/types/anime";

/**
 * Anime Service
 * Handles all anime-related API calls using Consumet HiAnime API
 */
export const animeService = {
  /**
   * Search anime by query
   */
  async search(query: string, page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.SEARCH(query), { page });
  },

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string) {
    return fetcher<SearchSuggestionsResponse>(ENDPOINTS.SEARCH_SUGGESTIONS(query));
  },

  /**
   * Advanced search with filters
   */
  async advancedSearch(params?: AdvancedSearchParams) {
    return fetcher<AnimeSearchResponse>(
      ENDPOINTS.ADVANCED_SEARCH, 
      params as Record<string, string | number | boolean | undefined>
    );
  },

  /**
   * Get anime info by ID
   */
  async getInfo(id: string) {
    return fetcher<AnimeInfo>(ENDPOINTS.INFO, { id });
  },

  /**
   * Get episode streaming sources
   */
  async getEpisodeSources(episodeId: string, server?: string, category?: "sub" | "dub") {
    return fetcher<EpisodeSourcesResponse>(
      ENDPOINTS.WATCH(episodeId), 
      { server, category }
    );
  },

  /**
   * Get all genres
   */
  async getGenres() {
    return fetcher<Genre[]>(ENDPOINTS.GENRES);
  },

  /**
   * Get anime by genre
   */
  async getByGenre(genre: string, page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.GENRE(genre), { page });
  },

  /**
   * Get anime by studio
   */
  async getByStudio(studio: string, page?: number) {
    return fetcher<AnimeSearchResponse>(ENDPOINTS.STUDIO(studio), { page });
  },
};

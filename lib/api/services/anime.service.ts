import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { 
  SearchResponse, 
  AnimeResponse, 
  SearchParams,
  GenresResponse,
  CharactersResponse,
  EpisodesResponse,
  RecommendationsResponse,
  ReviewsResponse,
} from "@/types/anime";

/**
 * Anime Service
 * Handles all anime-related API calls using Jikan API
 */
export const animeService = {
  /**
   * Search anime by query
   */
  async search(query: string, params?: Omit<SearchParams, "q">) {
    return fetcher<SearchResponse>(ENDPOINTS.SEARCH, { 
      q: query,
      ...params,
      sfw: params?.sfw !== false ? "true" : undefined,
    });
  },

  /**
   * Advanced search with filters
   */
  async advancedSearch(params?: SearchParams) {
    return fetcher<SearchResponse>(ENDPOINTS.SEARCH, {
      ...params,
      sfw: params?.sfw !== false ? "true" : undefined,
    });
  },

  /**
   * Get anime info by MAL ID
   */
  async getInfo(id: number) {
    return fetcher<AnimeResponse>(ENDPOINTS.INFO(id));
  },

  /**
   * Get anime characters
   */
  async getCharacters(id: number) {
    return fetcher<CharactersResponse>(ENDPOINTS.CHARACTERS(id));
  },

  /**
   * Get anime episodes
   */
  async getEpisodes(id: number, page?: number) {
    return fetcher<EpisodesResponse>(ENDPOINTS.EPISODES(id), { page });
  },

  /**
   * Get anime recommendations
   */
  async getRecommendations(id: number) {
    return fetcher<RecommendationsResponse>(ENDPOINTS.RECOMMENDATIONS(id));
  },

  /**
   * Get anime reviews
   */
  async getReviews(id: number, page?: number) {
    return fetcher<ReviewsResponse>(ENDPOINTS.REVIEWS(id), { page });
  },

  /**
   * Get all genres
   */
  async getGenres() {
    return fetcher<GenresResponse>(ENDPOINTS.GENRES);
  },

  /**
   * Get random anime
   */
  async getRandom() {
    return fetcher<AnimeResponse>(ENDPOINTS.RANDOM);
  },
};


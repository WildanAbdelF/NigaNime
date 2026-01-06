/**
 * Anime Types
 * Based on Consumet API HiAnime response structure
 * Documentation: https://docs.consumet.org/
 */

/**
 * Basic anime result from search/listing
 */
export interface AnimeResult {
  id: string;
  title: string;
  url?: string;
  image: string;
  duration?: string;
  japaneseTitle?: string;
  type?: string;
  nsfw?: boolean;
  sub?: number;
  dub?: number;
  episodes?: number;
}

/**
 * Search/Listing response with pagination
 */
export interface AnimeSearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  totalPages?: number;
  results: AnimeResult[];
}

/**
 * Episode information
 */
export interface Episode {
  id: string;
  number: number;
  title?: string;
  isFiller?: boolean;
  url?: string;
}

/**
 * Related anime
 */
export interface RelatedAnime {
  id: string;
  title: string;
  url?: string;
  image: string;
  japaneseTitle?: string;
  type?: string;
  sub?: number;
  dub?: number;
  episodes?: number;
}

/**
 * Recommendation
 */
export interface Recommendation {
  id: string;
  title: string;
  url?: string;
  image: string;
  duration?: string;
  japaneseTitle?: string;
  type?: string;
  nsfw?: boolean;
  sub?: number;
  dub?: number;
  episodes?: number;
}

/**
 * Full anime information
 */
export interface AnimeInfo {
  id: string;
  title: string;
  url?: string;
  image: string;
  cover?: string;
  description?: string;
  type?: string;
  releaseDate?: string;
  genres?: string[];
  status?: string;
  studios?: string[];
  duration?: string;
  totalEpisodes?: number;
  subOrDub?: "sub" | "dub" | "both";
  synonyms?: string[];
  countryOfOrigin?: string;
  isAdult?: boolean;
  isLicensed?: boolean;
  season?: string;
  popularity?: number;
  rating?: number;
  episodes?: Episode[];
  recommendations?: Recommendation[];
  relatedAnime?: RelatedAnime[];
}

/**
 * Streaming source
 */
export interface StreamingSource {
  url: string;
  isM3U8: boolean;
  quality?: string;
}

/**
 * Subtitle track
 */
export interface Subtitle {
  url: string;
  lang: string;
}

/**
 * Episode streaming sources response
 */
export interface EpisodeSourcesResponse {
  headers?: Record<string, string>;
  sources: StreamingSource[];
  subtitles?: Subtitle[];
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
}

/**
 * Schedule item
 */
export interface ScheduleItem {
  id: string;
  title: string;
  japaneseTitle?: string;
  url?: string;
  image?: string;
  time?: string;
  episode?: number;
  airingTime?: string;
}

/**
 * Schedule response
 */
export interface ScheduleResponse {
  scheduledAnimes: ScheduleItem[];
}

/**
 * Spotlight anime
 */
export interface SpotlightAnime {
  id: string;
  title: string;
  japaneseTitle?: string;
  url?: string;
  image: string;
  banner?: string;
  description?: string;
  type?: string;
  rank?: number;
  releaseDate?: string;
  quality?: string;
  sub?: number;
  dub?: number;
  episodes?: number;
}

/**
 * Spotlight response
 */
export interface SpotlightResponse {
  results: SpotlightAnime[];
}

/**
 * Genre item
 */
export interface Genre {
  id: string;
  title: string;
  url?: string;
}

/**
 * Search suggestion
 */
export interface SearchSuggestion {
  id: string;
  title: string;
  japaneseTitle?: string;
  image: string;
  type?: string;
  duration?: string;
  releaseDate?: string;
}

/**
 * Search suggestions response
 */
export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
}

/**
 * Advanced search parameters
 */
export interface AdvancedSearchParams {
  page?: number;
  type?: string;
  status?: string;
  rated?: string;
  score?: number;
  season?: string;
  language?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  genres?: string;
}

// Re-export for backward compatibility
export type Anime = AnimeResult;
export type AnimeFull = AnimeInfo;
export type AnimeSearchParams = AdvancedSearchParams & { q?: string };

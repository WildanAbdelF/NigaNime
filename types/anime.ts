/**
 * Jikan API Type Definitions (MyAnimeList)
 * Based on: https://docs.api.jikan.moe/
 */

// ============================================
// Common Types
// ============================================

export interface JikanImage {
  image_url: string;
  small_image_url?: string;
  large_image_url?: string;
}

export interface JikanImages {
  jpg: JikanImage;
  webp?: JikanImage;
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page?: number;
  items?: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanTitle {
  type: string;
  title: string;
}

export interface JikanDateProp {
  day: number | null;
  month: number | null;
  year: number | null;
}

export interface JikanAired {
  from: string | null;
  to: string | null;
  prop: {
    from: JikanDateProp;
    to: JikanDateProp;
  };
  string: string;
}

export interface JikanBroadcast {
  day: string | null;
  time: string | null;
  timezone: string | null;
  string: string | null;
}

export interface JikanMalEntity {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanTrailer {
  youtube_id: string | null;
  url: string | null;
  embed_url: string | null;
  images?: {
    image_url: string;
    small_image_url: string;
    medium_image_url: string;
    large_image_url: string;
    maximum_image_url: string;
  };
}

// ============================================
// Anime Types
// ============================================

export interface Anime {
  mal_id: number;
  url: string;
  images: JikanImages;
  trailer?: JikanTrailer;
  approved: boolean;
  titles: JikanTitle[];
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms: string[];
  type: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  aired: JikanAired;
  duration: string | null;
  rating: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: JikanBroadcast;
  producers: JikanMalEntity[];
  licensors: JikanMalEntity[];
  studios: JikanMalEntity[];
  genres: JikanMalEntity[];
  explicit_genres: JikanMalEntity[];
  themes: JikanMalEntity[];
  demographics: JikanMalEntity[];
}

export interface AnimeResponse {
  data: Anime;
}

export interface AnimeListResponse {
  pagination: JikanPagination;
  data: Anime[];
}

// ============================================
// Schedule Types
// ============================================

export interface ScheduleResponse {
  pagination: JikanPagination;
  data: Anime[];
}

// ============================================
// Top Anime Types
// ============================================

export interface TopAnimeResponse {
  pagination: JikanPagination;
  data: Anime[];
}

// ============================================
// Season Types
// ============================================

export interface SeasonListResponse {
  pagination: JikanPagination;
  data: Anime[];
}

// ============================================
// Search Types
// ============================================

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  type?: "tv" | "movie" | "ova" | "special" | "ona" | "music";
  score?: number;
  min_score?: number;
  max_score?: number;
  status?: "airing" | "complete" | "upcoming";
  rating?: "g" | "pg" | "pg13" | "r17" | "r" | "rx";
  sfw?: boolean;
  genres?: string;
  genres_exclude?: string;
  order_by?:
    | "mal_id"
    | "title"
    | "start_date"
    | "end_date"
    | "episodes"
    | "score"
    | "scored_by"
    | "rank"
    | "popularity"
    | "members"
    | "favorites";
  sort?: "desc" | "asc";
  letter?: string;
  producers?: string;
}

export interface SearchResponse {
  pagination: JikanPagination;
  data: Anime[];
}

// ============================================
// Character Types
// ============================================

export interface Character {
  mal_id: number;
  url: string;
  images: {
    jpg: JikanImage;
    webp?: JikanImage;
  };
  name: string;
}

export interface AnimeCharacter {
  character: Character;
  role: string;
  favorites: number;
  voice_actors: {
    person: {
      mal_id: number;
      url: string;
      images: {
        jpg: JikanImage;
      };
      name: string;
    };
    language: string;
  }[];
}

export interface CharactersResponse {
  data: AnimeCharacter[];
}

// ============================================
// Episode Types
// ============================================

export interface Episode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string | null;
  title_romanji: string | null;
  aired: string | null;
  score: number | null;
  filler: boolean;
  recap: boolean;
  forum_url: string | null;
}

export interface EpisodesResponse {
  pagination: JikanPagination;
  data: Episode[];
}

// ============================================
// Recommendation Types
// ============================================

export interface Recommendation {
  entry: {
    mal_id: number;
    url: string;
    images: JikanImages;
    title: string;
  };
  votes: number;
}

export interface RecommendationsResponse {
  data: Recommendation[];
}

// ============================================
// Genre Types
// ============================================

export interface Genre {
  mal_id: number;
  name: string;
  url: string;
  count: number;
}

export interface GenresResponse {
  data: Genre[];
}

// ============================================
// Review Types
// ============================================

export interface Review {
  mal_id: number;
  url: string;
  type: string;
  reactions: {
    overall: number;
    nice: number;
    love_it: number;
    funny: number;
    confusing: number;
    informative: number;
    well_written: number;
    creative: number;
  };
  date: string;
  review: string;
  score: number;
  tags: string[];
  is_spoiler: boolean;
  is_preliminary: boolean;
  episodes_watched: number | null;
  user: {
    username: string;
    url: string;
    images: {
      jpg: JikanImage;
      webp?: JikanImage;
    };
  };
}

export interface ReviewsResponse {
  pagination: JikanPagination;
  data: Review[];
}

// ============================================
// Helper types for UI components
// ============================================

export interface AnimeCardData {
  id: number;
  title: string;
  image: string;
  type: string | null;
  episodes: number | null;
  score: number | null;
  status: string | null;
  year: number | null;
}

// Convert Anime to AnimeCardData
export function toAnimeCard(anime: Anime): AnimeCardData {
  return {
    id: anime.mal_id,
    title: anime.title_english || anime.title,
    image: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
    type: anime.type,
    episodes: anime.episodes,
    score: anime.score,
    status: anime.status,
    year: anime.year,
  };
}

// ============================================
// Schedule UI Helper
// ============================================

export interface ScheduleItem {
  id: number;
  title: string;
  image: string;
  episode: number | null;
  time: string | null;
  airingTime?: string;
}

export function toScheduleItem(anime: Anime): ScheduleItem {
  return {
    id: anime.mal_id,
    title: anime.title_english || anime.title,
    image: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
    episode: anime.episodes,
    time: anime.broadcast?.time || null,
    airingTime: anime.broadcast?.string || undefined,
  };
}

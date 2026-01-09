/**
 * HiAnime API Type Definitions
 * Based on: aniwatch-api
 */

// ============================================
// Common Types
// ============================================

export interface HiAnimeEpisodeCount {
  sub: number | null;
  dub: number | null;
}

// ============================================
// Spotlight Anime
// ============================================

export interface SpotlightAnime {
  rank: number;
  id: string;
  name: string;
  description: string;
  poster: string;
  jname: string;
  episodes: HiAnimeEpisodeCount;
  type: string;
  otherInfo: string[];
}

// ============================================
// Trending Anime
// ============================================

export interface TrendingAnime {
  rank: number;
  id: string;
  name: string;
  poster: string;
  jname: string;
}

// ============================================
// Anime Card (for lists)
// ============================================

export interface HiAnimeCard {
  id: string;
  name: string;
  poster: string;
  duration: string;
  type: string;
  rating: string | null;
  episodes: HiAnimeEpisodeCount;
}

// ============================================
// Top 10 Anime
// ============================================

export interface Top10Anime {
  id: string;
  rank: number;
  name: string;
  poster: string;
  jname: string;
  episodes: HiAnimeEpisodeCount;
}

export interface Top10Response {
  today: Top10Anime[];
  week: Top10Anime[];
  month: Top10Anime[];
}

// ============================================
// Home Page Response
// ============================================

export interface HiAnimeHomeResponse {
  success?: boolean;
  status?: number;
  data: {
    spotlightAnimes: SpotlightAnime[];
    trendingAnimes: TrendingAnime[];
    latestEpisodeAnimes: HiAnimeCard[];
    topUpcomingAnimes: HiAnimeCard[];
    top10Animes: Top10Response;
    topAiringAnimes: HiAnimeCard[];
    mostPopularAnimes: HiAnimeCard[];
    mostFavoriteAnimes: HiAnimeCard[];
    latestCompletedAnimes: HiAnimeCard[];
    genres: string[];
  };
}

// ============================================
// Anime Info Types
// ============================================

export interface HiAnimeInfo {
  id: string;
  name: string;
  poster: string;
  description: string;
  stats: {
    rating: string;
    quality: string;
    episodes: HiAnimeEpisodeCount;
    type: string;
    duration: string;
  };
  promotionalVideos: {
    title: string;
    source: string;
    thumbnail: string;
  }[];
  charactersVoiceActors: {
    character: {
      id: string;
      poster: string;
      name: string;
      cast: string;
    };
    voiceActor: {
      id: string;
      poster: string;
      name: string;
      cast: string;
    };
  }[];
  anime: {
    info: {
      id: string;
      name: string;
      poster: string;
      description: string;
      stats: {
        rating: string;
        quality: string;
        episodes: HiAnimeEpisodeCount;
        type: string;
        duration: string;
      };
    };
    moreInfo: {
      japanese: string;
      synonyms: string;
      aired: string;
      premiered: string;
      duration: string;
      status: string;
      malscore: string;
      genres: string[];
      studios: string;
      producers: string[];
    };
  };
}

export interface HiAnimeInfoResponse {
  success: boolean;
  data: HiAnimeInfo;
}

// ============================================
// Episode Types
// ============================================

export interface HiAnimeEpisode {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
}

export interface HiAnimeEpisodesResponse {
  success: boolean;
  data: {
    totalEpisodes: number;
    episodes: HiAnimeEpisode[];
  };
}

// ============================================
// Streaming Types
// ============================================

export interface HiAnimeServer {
  serverName: string;
  serverId: number;
}

export interface HiAnimeServersResponse {
  success: boolean;
  data: {
    sub: HiAnimeServer[];
    dub: HiAnimeServer[];
    raw: HiAnimeServer[];
    episodeId: string;
    episodeNo: number;
  };
}

export interface HiAnimeSource {
  url: string;
  type: string;
}

export interface HiAnimeTrack {
  file: string;
  label: string;
  kind: string;
  default?: boolean;
}

export interface HiAnimeSourcesResponse {
  success: boolean;
  data: {
    tracks: HiAnimeTrack[];
    intro: { start: number; end: number };
    outro: { start: number; end: number };
    sources: HiAnimeSource[];
    anilistID: number | null;
    malID: number | null;
  };
}

// ============================================
// Search Types
// ============================================

export interface HiAnimeSearchResult {
  id: string;
  name: string;
  poster: string;
  duration: string;
  type: string;
  rating: string | null;
  episodes: HiAnimeEpisodeCount;
}

export interface HiAnimeSearchResponse {
  success: boolean;
  data: {
    animes: HiAnimeSearchResult[];
    mostPopularAnimes: HiAnimeCard[];
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
    searchQuery: string;
    searchFilters: Record<string, string>;
  };
}

// ============================================
// Schedule Types
// ============================================

export interface HiAnimeScheduleItem {
  id: string;
  time: string;
  name: string;
  jname: string;
  airingTimestamp: number;
  secondsUntilAiring: number;
  episode?: number;
}

export interface HiAnimeScheduleResponse {
  success?: boolean;
  status?: number;
  data: {
    scheduledAnimes: HiAnimeScheduleItem[];
  };
}

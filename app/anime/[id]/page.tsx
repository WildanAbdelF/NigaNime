import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api/services";
import { EpisodeList, AnimeTrailer, RecommendationSection } from "@/components/anime";
import type { HiAnimeEpisode, HiAnimeCard } from "@/types/hianime";

// Interface for anime data from HiAnime API
interface AnimeInfoData {
  anime: {
    info: {
      id: string;
      name: string;
      poster: string;
      description: string;
      stats: {
        rating: string;
        quality: string;
        episodes: { sub: number | null; dub: number | null };
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
  promotionalVideos?: { title: string; source: string; thumbnail: string }[];
  relatedAnimes?: HiAnimeCard[];
  recommendedAnimes?: HiAnimeCard[];
}

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AnimeDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await hianimeService.getInfo(id);
    const anime = response.data?.anime;
    if (!anime) {
      return { title: "Anime Not Found - NigaNime" };
    }
    return {
      title: `${anime.info.name} - NigaNime`,
      description: anime.info.description?.slice(0, 160) || `Watch ${anime.info.name} on NigaNime`,
      openGraph: {
        title: anime.info.name,
        description: anime.info.description || undefined,
        images: anime.info.poster ? [anime.info.poster] : [],
      },
    };
  } catch {
    return {
      title: "Anime Not Found - NigaNime",
    };
  }
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = await params;

  // Fetch anime info and episodes in parallel
  let animeData: AnimeInfoData | null = null;
  let episodes: HiAnimeEpisode[] = [];
  let relatedAnimes: HiAnimeCard[] = [];

  try {
    const [infoResponse, episodesResponse] = await Promise.allSettled([
      hianimeService.getInfo(id),
      hianimeService.getEpisodes(id),
    ]);

    if (infoResponse.status === "fulfilled" && infoResponse.value.data) {
      animeData = infoResponse.value.data as AnimeInfoData;
      // Use related or recommended animes from the response
      relatedAnimes = animeData.relatedAnimes || animeData.recommendedAnimes || [];
    }
    if (episodesResponse.status === "fulfilled" && episodesResponse.value.data) {
      episodes = episodesResponse.value.data.episodes || [];
    }
  } catch (error) {
    console.error("Error fetching anime details:", error);
  }

  if (!animeData?.anime) {
    notFound();
  }

  const anime = animeData.anime;
  const moreInfo = anime.moreInfo;

  // Extract year from premiered or aired
  const year = moreInfo?.premiered?.match(/\d{4}/)?.[0] || moreInfo?.aired?.match(/\d{4}/)?.[0] || "";

  return (
    <div className="min-h-screen bg-[#0f1729] overflow-x-hidden">
      <Navbar />

      <main className="pt-16 overflow-hidden">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4 overflow-hidden">
          <nav className="flex items-center gap-2 text-sm text-gray-400 overflow-hidden">
            <Link href="/" className="hover:text-white transition-colors flex-shrink-0">
              Home
            </Link>
            <span className="flex-shrink-0">›</span>
            <Link href="/anime" className="hover:text-white transition-colors flex-shrink-0">
              Anime
            </Link>
            <span className="flex-shrink-0">›</span>
            {moreInfo?.genres?.[0] && (
              <>
                <Link
                  href={`/genre/${moreInfo.genres[0].toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-white transition-colors flex-shrink-0"
                >
                  {moreInfo.genres[0]}
                </Link>
                <span className="flex-shrink-0">›</span>
              </>
            )}
            <span className="text-white truncate">{anime.info.name}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12 max-w-full overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              {/* Cover Image */}
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-4">
                {/* Status Badge */}
                <div
                  className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs font-bold ${
                    moreInfo?.status === "Currently Airing"
                      ? "bg-green-500 text-white"
                      : moreInfo?.status === "Not yet aired"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {moreInfo?.status || "Unknown"}
                </div>

                {anime.info.poster ? (
                  <Image
                    src={anime.info.poster}
                    alt={anime.info.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a2332] flex items-center justify-center text-gray-600">
                    No Image
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Link
                  href={episodes.length > 0 ? `/watch/${episodes[0].episodeId}` : "#"}
                  className="w-full flex items-center justify-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-semibold py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </Link>
                <button className="w-full flex items-center justify-center gap-2 bg-[#1a2332] hover:bg-[#232d3f] text-white font-semibold py-3 rounded-lg transition-colors border border-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Watchlist
                </button>
              </div>

              {/* Information */}
              <div className="bg-[#1a2332] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{anime.info.stats?.type || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Episodes:</span>
                    <span className="text-white">
                      {anime.info.stats?.episodes?.sub || anime.info.stats?.episodes?.dub || "?"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`${moreInfo?.status === "Currently Airing" ? "text-green-400" : "text-white"}`}>
                      {moreInfo?.status || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Aired:</span>
                    <span className="text-white text-right text-xs">{moreInfo?.aired || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Studios:</span>
                    <span className="text-[#f5c518] text-xs">
                      {moreInfo?.studios || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{anime.info.stats?.duration || moreInfo?.duration || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality:</span>
                    <span className="text-white">{anime.info.stats?.quality || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MAL Score:</span>
                    <span className="text-white">{moreInfo?.malscore || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {/* Title Section */}
              <div className="mb-6">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-1 break-words">
                  {anime.info.name}
                </h1>
                {moreInfo?.japanese && (
                  <p className="text-gray-400 text-lg italic mb-4 break-words">{moreInfo.japanese}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {anime.info.stats?.type && (
                    <span className="px-3 py-1 bg-[#1a2332] text-gray-300 text-sm rounded border border-gray-700">
                      {anime.info.stats.type}
                    </span>
                  )}
                  {year && (
                    <span className="px-3 py-1 bg-[#f5c518] text-black text-sm font-semibold rounded">
                      {year}
                    </span>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Score */}
                  <div className="bg-[#1a2332] rounded-lg p-4 text-center border border-gray-700/50">
                    <div className="flex items-center justify-center gap-1 text-[#f5c518] mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className="text-xl font-bold">{moreInfo?.malscore || "N/A"}</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Score</p>
                  </div>

                  {/* Quality */}
                  <div className="bg-[#1a2332] rounded-lg p-4 text-center border border-gray-700/50">
                    <div className="flex items-center justify-center gap-1 text-[#f5c518] mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
                      </svg>
                      <span className="text-xl font-bold">{anime.info.stats?.quality || "HD"}</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Quality</p>
                  </div>

                  {/* Sub Episodes */}
                  <div className="bg-[#1a2332] rounded-lg p-4 text-center border border-gray-700/50">
                    <div className="flex items-center justify-center gap-1 text-[#f5c518] mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z"/>
                      </svg>
                      <span className="text-xl font-bold">
                        {anime.info.stats?.episodes?.sub || "?"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Sub</p>
                  </div>

                  {/* Dub Episodes */}
                  <div className="bg-[#1a2332] rounded-lg p-4 text-center border border-gray-700/50">
                    <div className="flex items-center justify-center gap-1 text-[#f5c518] mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                      </svg>
                      <span className="text-xl font-bold">
                        {anime.info.stats?.episodes?.dub || "?"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Dub</p>
                  </div>
                </div>
              </div>

              {/* Trailer */}
              {animeData.promotionalVideos && animeData.promotionalVideos.length > 0 && (
                <AnimeTrailer 
                  videos={animeData.promotionalVideos} 
                  title={anime.info.name} 
                />
              )}

              {/* Synopsis */}
              <div className="mb-8">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
                  <svg className="w-5 h-5 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Synopsis
                </h2>
                <div className="text-gray-300 leading-relaxed break-words overflow-hidden">
                  <p className="whitespace-pre-line">
                    {anime.info.description || "No synopsis available."}
                  </p>
                </div>
              </div>

              {/* Genres & Themes */}
              {moreInfo?.genres && moreInfo.genres.length > 0 && (
                <div className="mb-8">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
                    <span className="text-[#f5c518]">●</span>
                    Genres & Themes
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {moreInfo.genres.map((genre) => (
                      <Link
                        key={genre}
                        href={`/genre/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                        className="px-4 py-2 bg-[#1a2332] hover:bg-[#232d3f] text-gray-300 text-sm rounded-lg transition-colors border border-gray-700"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Producers */}
              {moreInfo?.producers && moreInfo.producers.length > 0 && (
                <div className="mb-8">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
                    <span className="text-[#f5c518]">●</span>
                    Producers
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {moreInfo.producers.map((producer) => (
                      <span
                        key={producer}
                        className="px-4 py-2 bg-[#1a2332] text-gray-400 text-sm rounded-lg border border-gray-700"
                      >
                        {producer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Episode List */}
              {episodes.length > 0 && (
                <EpisodeList episodes={episodes} animeId={id} animeTitle={anime.info.name} />
              )}

              {/* Related Animes / Recommendations */}
              {relatedAnimes.length > 0 && (
                <RecommendationSection recommendations={relatedAnimes} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

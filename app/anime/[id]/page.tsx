import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { animeService } from "@/lib/api";
import { EpisodeList, AnimeTrailer, RecommendationSection } from "@/components/anime";
import type { Anime, Episode, Recommendation } from "@/types/anime";

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AnimeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const animeId = parseInt(id, 10);

  try {
    const response = await animeService.getInfo(animeId);
    const anime = response.data;
    return {
      title: `${anime.title_english || anime.title} - JikanStream`,
      description: anime.synopsis?.slice(0, 160) || `Watch ${anime.title} on JikanStream`,
      openGraph: {
        title: anime.title_english || anime.title,
        description: anime.synopsis || undefined,
        images: anime.images?.jpg?.large_image_url ? [anime.images.jpg.large_image_url] : [],
      },
    };
  } catch {
    return {
      title: "Anime Not Found - JikanStream",
    };
  }
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = await params;
  const animeId = parseInt(id, 10);

  if (isNaN(animeId)) {
    notFound();
  }

  // Fetch anime info, episodes, and recommendations in parallel
  let anime: Anime | null = null;
  let episodes: Episode[] = [];
  let recommendations: Recommendation[] = [];

  try {
    const [animeResponse, episodesResponse, recommendationsResponse] = await Promise.allSettled([
      animeService.getInfo(animeId),
      animeService.getEpisodes(animeId),
      animeService.getRecommendations(animeId),
    ]);

    if (animeResponse.status === "fulfilled") {
      anime = animeResponse.value.data;
    }
    if (episodesResponse.status === "fulfilled") {
      episodes = episodesResponse.value.data || [];
    }
    if (recommendationsResponse.status === "fulfilled") {
      recommendations = recommendationsResponse.value.data || [];
    }
  } catch (error) {
    console.error("Error fetching anime details:", error);
  }

  if (!anime) {
    notFound();
  }

  // Format numbers
  const formatNumber = (num: number | null) => {
    if (!num) return "N/A";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main className="pt-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>›</span>
            <Link href="/anime" className="hover:text-white transition-colors">
              Anime
            </Link>
            <span>›</span>
            {anime.genres?.[0] && (
              <>
                <Link
                  href={`/genre/${anime.genres[0].mal_id}`}
                  className="hover:text-white transition-colors"
                >
                  {anime.genres[0].name}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-white">{anime.title_english || anime.title}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              {/* Cover Image */}
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-4">
                {/* Status Badge */}
                <div
                  className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs font-bold ${
                    anime.airing
                      ? "bg-green-500 text-white"
                      : anime.status === "Not yet aired"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {anime.airing ? "Airing" : anime.status === "Not yet aired" ? "Upcoming" : "Finished Airing"}
                </div>

                {anime.images?.jpg?.large_image_url ? (
                  <Image
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title_english || anime.title}
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
                <button className="w-full flex items-center justify-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-semibold py-3 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </button>
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
                    <span className="text-white">{anime.type || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Episodes:</span>
                    <span className="text-white">{anime.episodes || "?"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`${anime.airing ? "text-green-400" : "text-white"}`}>
                      {anime.status || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Aired:</span>
                    <span className="text-white text-right text-xs">{anime.aired?.string || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Studios:</span>
                    <span className="text-[#f5c518]">
                      {anime.studios?.map((s) => s.name).join(", ") || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source:</span>
                    <span className="text-white">{anime.source || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{anime.duration || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating:</span>
                    <span className="text-white text-xs">{anime.rating || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Title and Stats */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-2">
                  {anime.type && (
                    <span className="px-2 py-1 bg-[#1a2332] text-gray-300 text-xs rounded">
                      {anime.type}
                    </span>
                  )}
                  {anime.year && (
                    <span className="px-2 py-1 bg-[#1a2332] text-gray-300 text-xs rounded">
                      {anime.year}
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
                  {anime.title_english || anime.title}
                </h1>
                {anime.title_japanese && (
                  <p className="text-gray-400 text-lg mb-4">{anime.title_japanese}</p>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[#f5c518] mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className="text-xl font-bold">{anime.score || "N/A"}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{formatNumber(anime.scored_by)} users</p>
                    <p className="text-gray-500 text-xs mt-1">SCORE</p>
                  </div>

                  <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[#f5c518] mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.5 21.5v-12l8.3-7 8.2 7v12h-6v-6h-4.5v6z"/>
                      </svg>
                      <span className="text-xl font-bold">#{anime.rank || "N/A"}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">RANKED</p>
                  </div>

                  <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[#f5c518] mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                      </svg>
                      <span className="text-xl font-bold">#{anime.popularity || "N/A"}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">POPULARITY</p>
                  </div>

                  <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[#f5c518] mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      <span className="text-xl font-bold">{formatNumber(anime.members)}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">MEMBERS</p>
                  </div>
                </div>
              </div>

              {/* Trailer */}
              {anime.trailer?.youtube_id && (
                <AnimeTrailer trailer={anime.trailer} title={anime.title} />
              )}

              {/* Synopsis */}
              <div className="mb-8">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
                  <svg className="w-5 h-5 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Synopsis
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {anime.synopsis || "No synopsis available."}
                </p>
              </div>

              {/* Genres & Themes */}
              {(anime.genres?.length > 0 || anime.themes?.length > 0) && (
                <div className="mb-8">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
                    <span className="text-[#f5c518]">●</span>
                    Genres & Themes
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres?.map((genre) => (
                      <Link
                        key={genre.mal_id}
                        href={`/genre/${genre.mal_id}`}
                        className="px-4 py-2 bg-[#1a2332] hover:bg-[#232d3f] text-gray-300 text-sm rounded-full transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                    {anime.themes?.map((theme) => (
                      <Link
                        key={theme.mal_id}
                        href={`/theme/${theme.mal_id}`}
                        className="px-4 py-2 bg-[#1a2332] hover:bg-[#232d3f] text-gray-300 text-sm rounded-full transition-colors"
                      >
                        {theme.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Episode List */}
              {episodes.length > 0 && (
                <EpisodeList episodes={episodes} animeId={animeId} animeTitle={anime.title} />
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <RecommendationSection recommendations={recommendations} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

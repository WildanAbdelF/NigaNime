import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api/services";
import VideoPlayer, { VideoSurface, PlayerControlRow } from "@/components/features/watch/VideoPlayer";
import EpisodeSidebar from "@/components/features/watch/EpisodeSidebar";
import AnimeInfo from "@/components/features/watch/AnimeInfo";
import ServerSelector from "@/components/features/watch/ServerSelector";
import type { HiAnimeEpisode } from "@/types/api/hianime";
import { buildWatchUrl } from "@/lib/utils/watchUrl";

interface WatchPageProps {
  params: Promise<{ episodeId: string }>;
  searchParams: Promise<{ server?: string; category?: string; ep?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { episodeId } = await params;
  
  // Extract anime ID from episode ID (format: anime-id?ep=xxx)
  const animeId = episodeId.split("?")[0];
  
  try {
    const response = await hianimeService.getInfo(animeId);
    const anime = response.data?.anime;
    if (!anime) {
      return { title: "Watch Anime - NigaNime" };
    }
    return {
      title: `Watch ${anime.info.name} - NigaNime`,
      description: `Watch ${anime.info.name} online for free on NigaNime`,
      openGraph: {
        title: `Watch ${anime.info.name}`,
        description: anime.info.description?.slice(0, 160) || undefined,
        images: anime.info.poster ? [anime.info.poster] : [],
      },
    };
  } catch {
    return {
      title: "Watch Anime - NigaNime",
    };
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { episodeId } = await params;
  const { server = "hd-2", category = "sub", ep } = await searchParams;
  
  // Decode the episode ID
  let decodedEpisodeId = decodeURIComponent(episodeId);
  
  // If ep is provided as a query param (URL format: /watch/anime-id?ep=xxx)
  // We need to combine them to get the full episodeId format: anime-id?ep=xxx
  if (ep && !decodedEpisodeId.includes("?ep=")) {
    decodedEpisodeId = `${decodedEpisodeId}?ep=${ep}`;
  }
  
  // Extract anime ID from episode ID (format: anime-id?ep=xxx)
  const animeId = decodedEpisodeId.split("?")[0];
  
  // Fetch anime info, episodes, and servers in parallel
  let animeData: any = null;
  let episodes: HiAnimeEpisode[] = [];
  let currentEpisode: HiAnimeEpisode | null = null;
  let episodeNumber: number = 1;

  try {
    const [infoResponse, episodesResponse] = await Promise.allSettled([
      hianimeService.getInfo(animeId),
      hianimeService.getEpisodes(animeId),
    ]);

    if (infoResponse.status === "fulfilled" && infoResponse.value.data) {
      animeData = infoResponse.value.data;
    }
    
    if (episodesResponse.status === "fulfilled" && episodesResponse.value.data) {
      episodes = episodesResponse.value.data.episodes || [];
      
      // If no episode specified in URL, use the first episode
      if (!decodedEpisodeId.includes("?ep=") && episodes.length > 0) {
        decodedEpisodeId = episodes[0].episodeId;
        currentEpisode = episodes[0];
        episodeNumber = episodes[0].number;
      } else {
        // Find current episode
        currentEpisode = episodes.find(ep => ep.episodeId === decodedEpisodeId) || null;
        if (currentEpisode) {
          episodeNumber = currentEpisode.number;
        } else {
          // Try to extract episode number from URL
          const epMatch = decodedEpisodeId.match(/ep=(\d+)/);
          if (epMatch) {
            const epNum = parseInt(epMatch[1]);
            currentEpisode = episodes.find(ep => ep.number === epNum) || episodes[0] || null;
            episodeNumber = currentEpisode?.number || 1;
            // Update decodedEpisodeId if we found a matching episode
            if (currentEpisode) {
              decodedEpisodeId = currentEpisode.episodeId;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching watch data:", error);
  }

  if (!animeData?.anime) {
    notFound();
  }

  const anime = animeData.anime;

  // Get prev/next episodes - use first episode (index 0) if current episode not found
  let currentIndex = episodes.findIndex(ep => ep.episodeId === decodedEpisodeId);
  if (currentIndex === -1 && episodes.length > 0) {
    // Try to find by episode number extracted from URL
    const epMatch = decodedEpisodeId.match(/ep=(\d+)/);
    if (epMatch) {
      const epNum = parseInt(epMatch[1]);
      currentIndex = episodes.findIndex(ep => ep.number === epNum);
    }
    // Default to first episode if still not found
    if (currentIndex === -1) {
      currentIndex = 0;
    }
  }
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;
  
  // Ensure currentEpisode is set if it wasn't found by exact match
  if (!currentEpisode && episodes.length > 0) {
    currentEpisode = episodes[currentIndex];
    episodeNumber = currentEpisode?.number || 1;
  }

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main className="pt-[10px]">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <div className="py-2 text-sm text-gray-400">
                <a href="/" className="hover:text-[#f5c518] transition-colors">Home</a>
                <span className="mx-2">›</span>
                <a href={`/anime/${animeId}`} className="hover:text-[#f5c518] transition-colors">
                  {anime.info.name}
                </a>
                <span className="mx-2">›</span>
                <span className="text-white">Episode {episodeNumber}</span>
              </div>

              {/* Video Player & Controls */}
              <VideoPlayer episodeId={decodedEpisodeId} server={server} category={category} episodeNumber={episodeNumber} animeTitle={anime.info.name} animePoster={anime.info.poster}>
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden w-full max-w-[1100px]">
                    <VideoSurface />
                  </div>

                  <div className="bg-[#1a2332] rounded-2xl p-4 text-white shadow-xl w-full max-w-[1100px]">
                    <div className="flex flex-col gap-3">
                      <div className="rounded-2xl bg-[#0f1729] border border-white/5 p-4 text-white">
                        <PlayerControlRow className="text-white" />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-300 flex-wrap">
                        <div className="w-full sm:w-auto flex justify-start">
                          {prevEpisode ? (
                            <a
                              href={buildWatchUrl(prevEpisode.episodeId, { server, category })}
                              className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-[#0f1729] hover:bg-[#232d3f] rounded-lg text-white transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              <span className="hidden sm:inline">Prev</span>
                              <span className="sm:hidden">Prev</span>
                            </a>
                          ) : (
                            <span className="px-4 py-2 text-xs uppercase tracking-widest text-gray-600">Start</span>
                          )}
                        </div>

                        <div className="w-full sm:w-auto flex justify-center">
                          <span className="text-gray-400">Episode {episodeNumber}</span>
                        </div>

                        <div className="w-full sm:w-auto flex justify-end">
                          {nextEpisode ? (
                            <a
                              href={buildWatchUrl(nextEpisode.episodeId, { server, category })}
                              className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-[#0f1729] hover:bg-[#232d3f] rounded-lg text-white transition-colors"
                            >
                              <span className="hidden sm:inline">Next</span>
                              <span className="sm:hidden">Next</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </a>
                          ) : (
                            <span className="px-4 py-2 text-xs uppercase tracking-widest text-gray-600">End</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </VideoPlayer>

              {/* Server Selector */}
              <ServerSelector
                episodeId={decodedEpisodeId}
                currentServer={server}
                currentCategory={category}
              />

              {/* Anime Info */}
              <AnimeInfo
                anime={anime}
                currentEpisode={currentEpisode}
              />
            </div>

            {/* Episode Sidebar */}
            <div className="w-full lg:w-[350px] lg:flex-shrink-0">
              <div className="bg-[#1a2332] rounded-lg overflow-hidden lg:sticky lg:top-20">
                <EpisodeSidebar
                  animeId={animeId}
                  episodes={episodes}
                  currentEpisodeId={decodedEpisodeId}
                  server={server}
                  category={category}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

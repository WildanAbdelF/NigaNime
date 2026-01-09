import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api/services";
import VideoPlayer from "@/components/watch/VideoPlayer";
import EpisodeSidebar from "@/components/watch/EpisodeSidebar";
import AnimeInfo from "@/components/watch/AnimeInfo";
import ServerSelector from "@/components/watch/ServerSelector";
import type { HiAnimeEpisode } from "@/types/hianime";

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
  const { server = "hd-1", category = "sub", ep } = await searchParams;
  
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

      <main className="pt-16">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Main Content */}
            <div className="flex-1 lg:pr-0">
              {/* Breadcrumb */}
              <div className="px-4 py-3 text-sm text-gray-400">
                <a href="/" className="hover:text-[#f5c518] transition-colors">Home</a>
                <span className="mx-2">›</span>
                <a href={`/anime/${animeId}`} className="hover:text-[#f5c518] transition-colors">
                  {anime.info.name}
                </a>
                <span className="mx-2">›</span>
                <span className="text-white">Episode {episodeNumber}</span>
              </div>

              {/* Video Player */}
              <VideoPlayer
                episodeId={decodedEpisodeId}
                server={server}
                category={category}
              />

              {/* Episode Navigation */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#1a2332] border-b border-[#2a3441]">
                {prevEpisode ? (
                  <a
                    href={`/watch/${encodeURIComponent(prevEpisode.episodeId)}?server=${server}&category=${category}`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f1729] hover:bg-[#232d3f] rounded-lg text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Prev</span>
                  </a>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">Episode {episodeNumber}</span>
                </div>

                {nextEpisode ? (
                  <a
                    href={`/watch/${encodeURIComponent(nextEpisode.episodeId)}?server=${server}&category=${category}`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f1729] hover:bg-[#232d3f] rounded-lg text-white transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ) : (
                  <div />
                )}
              </div>

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
            <div className="w-full lg:w-[380px] lg:border-l border-[#2a3441]">
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
      </main>

      <Footer />
    </div>
  );
}

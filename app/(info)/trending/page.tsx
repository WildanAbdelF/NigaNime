import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api";
import type { HiAnimeCard } from "@/types/api/hianime";

export const metadata: Metadata = {
  title: "Trending Anime | NigaNime",
  description: "Discover what everyone watches this week. Freshly curated trending anime with ratings, duration, and quick links to every show.",
};

async function getTrendingAnimes(): Promise<HiAnimeCard[]> {
  try {
    const response = await hianimeService.getHome();
    const collection = [
      ...(response?.data?.topAiringAnimes ?? []),
      ...(response?.data?.mostPopularAnimes ?? []),
      ...(response?.data?.mostFavoriteAnimes ?? []),
    ];

    const uniqueMap = new Map<string, HiAnimeCard>();
    for (const anime of collection) {
      if (!uniqueMap.has(anime.id)) {
        uniqueMap.set(anime.id, anime);
      }
    }

    return Array.from(uniqueMap.values()).slice(0, 30);
  } catch (error) {
    console.error("Failed to load trending animes:", error);
    return [];
  }
}

export default async function TrendingPage() {
  const trendingAnimes = await getTrendingAnimes();

  return (
    <div className="min-h-screen bg-[#0f1729] text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <p className="text-[#f5c518] font-semibold tracking-[0.3em] text-xs uppercase">
            Curated Daily
          </p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold mt-3">
            Trending Anime Spotlight
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4">
            Track the most-watched shows across subbed and dubbed releases. Updated automatically using HiAnime live data so you never miss the current hype.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="#trending-grid"
              className="px-6 py-3 rounded-full bg-[#f5c518] text-black font-semibold hover:bg-[#d6aa14] transition-colors"
            >
              Browse Top Charts
            </Link>
            <Link
              href="/anime"
              className="px-6 py-3 rounded-full border border-white/20 text-sm text-white hover:bg-white/10 transition-colors"
            >
              View Full Library
            </Link>
          </div>
        </section>

        {trendingAnimes.length > 0 ? (
          <section id="trending-grid" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">This Week</p>
                <h2 className="text-2xl font-bold mt-2">Top {trendingAnimes.length} Picks</h2>
              </div>
              <span className="text-sm text-gray-400">Powered by HiAnime API</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trendingAnimes.map((anime, index) => (
                <Link
                  key={anime.id}
                  href={`/anime/${anime.id}`}
                  className="bg-[#101a2c] rounded-2xl overflow-hidden border border-white/5 hover:border-[#f5c518]/40 transition-colors group flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={anime.poster}
                      alt={anime.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
                      #{index + 1}
                    </span>
                    {anime.rating && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#f5c518] text-black text-xs font-semibold">
                        {anime.rating}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs uppercase text-gray-400">
                      <span>{anime.type}</span>
                      {anime.duration && <span>{anime.duration}</span>}
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-[#f5c518] transition-colors line-clamp-2">
                      {anime.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                      {anime.episodes?.sub && (
                        <span className="px-2 py-1 rounded-full bg-[#f5c518]/10 text-[#f5c518] font-semibold">
                          SUB {anime.episodes.sub}
                        </span>
                      )}
                      {anime.episodes?.dub && (
                        <span className="px-2 py-1 rounded-full bg-blue-500/15 text-blue-300 font-semibold">
                          DUB {anime.episodes.dub}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {anime.jname || "High demand this season"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="bg-[#101a2c] border border-white/5 rounded-2xl p-10 text-center">
            <p className="text-lg font-semibold mb-2">No trending data right now</p>
            <p className="text-gray-400 mb-6">
              We could not fetch live stats. Please refresh or try again later.
            </p>
            <Link
              href="/anime"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              Explore anime catalog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

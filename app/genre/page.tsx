import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import GenreSidebar from "@/components/genre/GenreFilterBar";
import MobileGenreSelector from "@/components/genre/MobileGenreSelector";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api";

export const metadata: Metadata = {
  title: "Browse by Genre | NigaNime",
  description: "Filter anime by genre. Find the most popular anime in each genre.",
};

function extractGenres(list: string[] | undefined) {
  if (!list || list.length === 0) return [];
  return [...list].sort((a, b) => a.localeCompare(b));
}

async function fetchGenreData(genreSlug: string, page: number) {
  const home = await hianimeService.getHome();
  const genres = extractGenres(home?.data?.genres);

  // If no genre selected, show most popular as default
  if (!genreSlug) {
    const fallback = home?.data?.mostPopularAnimes || home?.data?.topAiringAnimes || [];
    return {
      genres,
      selectedGenre: "",
      results: fallback,
      currentPage: 1,
      hasNextPage: false,
    };
  }

  // Fetch anime for the selected genre
  const genreResponse: any = await hianimeService.getGenre(genreSlug, page);
  
  return {
    genres,
    selectedGenre: genreSlug,
    results: genreResponse?.data?.animes || [],
    currentPage: page,
    hasNextPage: Boolean(genreResponse?.data?.hasNextPage || false),
  };
}

export default async function GenrePage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string; page?: string }>;
}) {
  const params = await searchParams;
  const genreSlug = params.g || "";
  const page = Number(params.page || "1");
  
  const { genres, selectedGenre, results, currentPage, hasNextPage } = await fetchGenreData(
    genreSlug,
    Number.isNaN(page) ? 1 : page
  );

  const genreLabel = selectedGenre 
    ? selectedGenre.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Most Popular";

  return (
    <div className="min-h-screen bg-[#0f1729] text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-10">
        <div className="text-center space-y-3 mb-8">
          <p className="text-[#f5c518] font-semibold tracking-[0.35em] text-xs uppercase">Discover</p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold">Browse by Genre</h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Choose a genre to find popular anime from that category.
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Genre Sidebar - 30% */}
          <aside className="w-[30%] min-w-[220px] max-w-[300px] sticky top-20 flex-shrink-0 hidden md:block">
            <GenreSidebar genres={genres} selectedGenre={selectedGenre} />
          </aside>

          {/* Mobile Genre Selector */}
          <div className="md:hidden w-full mb-4">
            <MobileGenreSelector genres={genres} selectedGenre={selectedGenre} />
          </div>

          {/* Anime Results - 70% */}
          <div className="flex-1 min-w-0">
            <section className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Showing</p>
                  <h2 className="text-xl font-semibold">{genreLabel}</h2>
                </div>
                {selectedGenre && (
                  <span className="text-sm text-gray-400">
                    Page {currentPage}{hasNextPage ? " • more available" : ""}
                  </span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="bg-[#101a2c] border border-white/5 rounded-2xl p-8 text-center">
                  <p className="text-lg font-semibold mb-2">Belum ada hasil untuk genre ini</p>
                  <p className="text-gray-400">Coba pilih genre lain.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((anime: any) => (
                    <Link
                      key={anime.id}
                      href={`/anime/${anime.id}`}
                      className="bg-[#101a2c] rounded-2xl overflow-hidden border border-white/5 hover:border-[#f5c518]/40 transition-colors group flex flex-col"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={anime.poster}
                          alt={anime.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                        {anime.rating && (
                          <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-[#f5c518] text-black text-xs font-semibold">
                            {anime.rating}
                          </span>
                        )}
                      </div>

                      <div className="p-3 flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs uppercase text-gray-400">
                          <span>{anime.type}</span>
                          {anime.duration && <span>{anime.duration}</span>}
                        </div>
                        <h3 className="text-sm font-semibold group-hover:text-[#f5c518] transition-colors line-clamp-2">
                          {anime.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 text-xs text-gray-300 mt-auto">
                          {anime.episodes?.sub && (
                            <span className="px-2 py-0.5 rounded-full bg-[#f5c518]/10 text-[#f5c518] font-semibold">
                              SUB {anime.episodes.sub}
                            </span>
                          )}
                          {anime.episodes?.dub && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-semibold">
                              DUB {anime.episodes.dub}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {selectedGenre && (currentPage > 1 || hasNextPage) && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  {currentPage > 1 && (
                    <Link
                      href={`/genre?g=${selectedGenre}&page=${currentPage - 1}`}
                      className="px-4 py-2 rounded-lg bg-[#1a2332] text-white hover:bg-[#232d3f] transition-colors"
                    >
                      ← Previous
                    </Link>
                  )}
                  <span className="text-gray-400">Page {currentPage}</span>
                  {hasNextPage && (
                    <Link
                      href={`/genre?g=${selectedGenre}&page=${currentPage + 1}`}
                      className="px-4 py-2 rounded-lg bg-[#1a2332] text-white hover:bg-[#232d3f] transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

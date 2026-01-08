import Image from "next/image";
import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api";
import SortDropdown from "@/components/anime/SortDropdown";

const ALPHABET = ["All", "#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const SORT_OPTIONS = [
  { label: "Popularity", value: "most-popular" },
  { label: "Most Favorite", value: "most-favorite" },
  { label: "Latest Episodes", value: "recently-updated" },
  { label: "Recently Added", value: "recently-added" },
  { label: "Top Airing", value: "top-airing" },
  { label: "Top Upcoming", value: "top-upcoming" },
];

interface PageProps {
  searchParams: Promise<{ 
    page?: string;
    letter?: string;
    sort?: string;
  }>;
}

export default async function AnimePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const selectedLetter = params.letter || "All";
  const sortBy = params.sort || "most-popular";

  // Fetch data based on filter
  let response;
  try {
    if (selectedLetter && selectedLetter !== "All") {
      // Use A-Z list endpoint when a letter is selected
      response = await hianimeService.getAZList(selectedLetter, currentPage);
    } else {
      // Use category endpoint for sorting when no letter filter
      response = await hianimeService.getCategory(sortBy, currentPage);
    }
  } catch (error) {
    console.error("Failed to fetch anime:", error);
    response = {
      success: false,
      data: {
        animes: [],
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
      },
    };
  }

  const animes = response?.data?.animes || [];
  const totalPages = response?.data?.totalPages || 1;

  // Pagination helper
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Build query params
  const buildUrl = (params: { page?: number; letter?: string; sort?: string }) => {
    const newParams = new URLSearchParams();
    if (params.page && params.page !== 1) newParams.set("page", params.page.toString());
    if (params.letter && params.letter !== "All") newParams.set("letter", params.letter);
    if (params.sort && params.sort !== "most-popular") newParams.set("sort", params.sort);
    const query = newParams.toString();
    return query ? `/anime?${query}` : "/anime";
  };

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main className="pt-20 pb-12 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            Anime List
          </h1>
          <p className="text-gray-400">Browse the entire collection of anime.</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Left Side: Genres & Sort Dropdowns */}
          <div className="flex items-center gap-3">
            {/* All Genres Dropdown (placeholder for future) */}
            <div className="relative">
              <button className="flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2 rounded-lg hover:bg-[#2a3441] transition-colors border border-[#2a3441]">
                <span>All Genres</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Filter Icon */}
            <button className="p-2 bg-[#1e293b] rounded-lg hover:bg-[#2a3441] transition-colors border border-[#2a3441]">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>

            {/* Sort Dropdown */}
            <SortDropdown
              options={SORT_OPTIONS}
              currentValue={sortBy}
              currentLetter={selectedLetter}
            />
          </div>

          {/* Right Side: Grid/List Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1e293b] rounded-lg overflow-hidden border border-[#2a3441]">
              <button className="p-2.5 bg-[#f5c518] text-black transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              </button>
              <button className="p-2.5 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Alphabet Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALPHABET.map((letter) => (
            <Link
              key={letter}
              href={buildUrl({ letter, page: 1, sort: sortBy })}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedLetter === letter
                  ? "bg-[#f5c518] text-black"
                  : "bg-[#1e293b] text-gray-300 hover:bg-[#2a3441] border border-[#2a3441]"
              }`}
            >
              {letter}
            </Link>
          ))}
        </div>

        {/* Anime Grid */}
        {animes.length > 0 ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {animes.map((anime: any, index: number) => (
              <Link
                key={`${anime.id}-${index}`}
                href={`/anime/${anime.id}`}
                className="group"
              >
                <div className="relative">
                  {/* Poster */}
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                    {/* Type Badge */}
                    {anime.type && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-[#1a2332]/90 text-white text-xs font-medium rounded">
                        {anime.type}
                      </div>
                    )}

                    {/* Episodes Badge */}
                    <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1">
                      {anime.episodes?.sub && (
                        <span className="px-2 py-0.5 bg-[#f5c518] text-black text-xs font-bold rounded">
                          SUB: {anime.episodes.sub}
                        </span>
                      )}
                      {anime.episodes?.dub && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">
                          DUB: {anime.episodes.dub}
                        </span>
                      )}
                    </div>

                    {anime.poster ? (
                      <Image
                        src={anime.poster}
                        alt={anime.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1a2332] flex items-center justify-center text-gray-600">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#f5c518] transition-colors">
                    {anime.name}
                  </h3>

                  {/* Meta */}
                  {(anime.type || anime.rating) && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      {anime.type && <span>{anime.type}</span>}
                      {anime.rating && anime.type && <span>•</span>}
                      {anime.rating && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          {anime.rating}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No anime found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Link
              href={buildUrl({ page: Math.max(1, currentPage - 1), letter: selectedLetter, sort: sortBy })}
              className={`w-10 h-10 rounded-lg bg-[#1a2332] text-white flex items-center justify-center transition-colors ${
                currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:bg-[#232d3f]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            {getPageNumbers().map((page, index) => (
              page === "..." ? (
                <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-500">
                  {page}
                </span>
              ) : (
                <Link
                  key={index}
                  href={buildUrl({ page: page as number, letter: selectedLetter, sort: sortBy })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    page === currentPage
                      ? "bg-[#f5c518] text-black font-bold"
                      : "bg-[#1a2332] text-white hover:bg-[#232d3f]"
                  }`}
                >
                  {page}
                </Link>
              )
            ))}

            <Link
              href={buildUrl({ page: Math.min(totalPages, currentPage + 1), letter: selectedLetter, sort: sortBy })}
              className={`w-10 h-10 rounded-lg bg-[#1a2332] text-white flex items-center justify-center transition-colors ${
                currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-[#232d3f]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

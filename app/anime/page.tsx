import Image from "next/image";
import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api";

const ALPHABET = ["All", "#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const SORT_OPTIONS = [
  { label: "Most Popular", value: "most-popular" },
  { label: "Most Favorite", value: "most-favorite" },
  { label: "Top Airing", value: "top-airing" },
  { label: "Latest Episodes", value: "recently-updated" },
  { label: "Recently Added", value: "recently-added" },
  { label: "Top Upcoming", value: "top-upcoming" },
];

interface PageProps {
  searchParams: { 
    page?: string;
    letter?: string;
    sort?: string;
  };
}

export default async function AnimePage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || "1");
  const selectedLetter = searchParams.letter || "All";
  const sortBy = searchParams.sort || "most-popular";

  // Fetch data based on filter
  let response;
  try {
    if (selectedLetter && selectedLetter !== "All") {
      // Use A-Z list endpoint
      response = await hianimeService.getAZList(selectedLetter, currentPage);
    } else {
      // Use category endpoint for sorting
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
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            Anime List
          </h1>
          <p className="text-gray-400">
            {selectedLetter !== "All" 
              ? `Anime starting with "${selectedLetter}"`
              : `${SORT_OPTIONS.find(s => s.value === sortBy)?.label || "Most Popular"} Anime`
            }
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Alphabet Filter */}
          <div className="flex flex-wrap gap-1">
            {ALPHABET.map((letter) => (
              <Link
                key={letter}
                href={buildUrl({ letter, page: 1, sort: undefined })}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${
                  selectedLetter === letter
                    ? "bg-[#f5c518] text-black"
                    : "bg-[#1a2332] text-gray-300 hover:bg-[#232d3f]"
                }`}
              >
                {letter === "All" ? "All" : letter}
              </Link>
            ))}
          </div>

          {/* Sort Dropdown - Only show if no letter is selected */}
          {selectedLetter === "All" && (
            <div className="flex flex-wrap items-center gap-2">
              {SORT_OPTIONS.map((option) => (
                <Link
                  key={option.value}
                  href={buildUrl({ sort: option.value, page: 1, letter: undefined })}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    sortBy === option.value
                      ? "bg-[#f5c518] text-black font-medium"
                      : "bg-[#1a2332] text-gray-300 hover:bg-[#232d3f]"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          )}
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

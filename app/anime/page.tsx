import Image from "next/image";
import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api";
import SortDropdown from "@/components/anime/SortDropdown";
import ViewToggle from "@/components/anime/ViewToggle";
import SearchInput from "@/components/anime/SearchInput";

// Sort options - values must match Search API sort parameter
// Valid API values: default, recently-added, recently-updated, score, name-az, most-watched, most-favourite
const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Recently Updated", value: "recently-updated" },
  { label: "Recently Added", value: "recently-added" },
  { label: "Top Rated", value: "score" },
  { label: "Name A-Z", value: "name-az" },
  { label: "Most Watched", value: "most-watched" },
  { label: "Most Favourite", value: "most-favourite" },
];

interface PageProps {
  searchParams: Promise<{ 
    page?: string;
    q?: string;
    sort?: string;
    view?: string;
  }>;
}

export default async function AnimePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const searchQuery = params.q || "";
  const sortBy = params.sort || "default";
  const viewMode = (params.view as "grid" | "list") || "grid";

  // Fetch data based on filters
  let response;
  let animes: any[] = [];
  
  try {
    if (searchQuery) {
      // Search query - use Search API
      response = await hianimeService.searchWithPagination(searchQuery, currentPage, {
        sort: sortBy !== "default" ? sortBy : undefined,
      });
      animes = response?.data?.animes || [];
    } else if (sortBy !== "default") {
      // Sort only - map to category endpoint where possible
      const categoryMap: Record<string, string> = {
        "recently-updated": "recently-updated",
        "recently-added": "recently-added",
        "most-watched": "most-popular",
        "most-favourite": "most-favorite",
        "score": "top-airing",
      };
      
      if (categoryMap[sortBy]) {
        response = await hianimeService.getCategory(categoryMap[sortBy], currentPage);
      } else {
        // For name sorts, use A-Z list
        if (sortBy === "name-az") {
          response = await hianimeService.getAZList("all", currentPage);
        } else {
          response = await hianimeService.getCategory("most-popular", currentPage);
        }
      }
      animes = response?.data?.animes || [];
    } else {
      // Default - most popular
      response = await hianimeService.getCategory("most-popular", currentPage);
      animes = response?.data?.animes || [];
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
    animes = [];
  }

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

  // Build query params for search and sort filters
  const buildUrl = (newParams: { page?: number; q?: string; sort?: string }) => {
    const urlParams = new URLSearchParams();
    
    // Handle search query
    const newQuery = newParams.q !== undefined ? newParams.q : searchQuery;
    if (newQuery) {
      urlParams.set("q", newQuery);
    }
    
    // Handle sort
    const newSort = newParams.sort !== undefined ? newParams.sort : sortBy;
    if (newSort && newSort !== "default") {
      urlParams.set("sort", newSort);
    }
    
    // Handle page
    const page = newParams.page ?? currentPage;
    if (page && page !== 1) urlParams.set("page", page.toString());
    
    // Preserve view mode
    if (viewMode === "list") urlParams.set("view", "list");
    
    const query = urlParams.toString();
    return query ? `/anime?${query}` : "/anime";
  };

  // Get page title based on active filters
  const getPageTitle = () => {
    const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;
    
    if (searchQuery && sortBy !== "default") {
      return `Search: "${searchQuery}" • ${sortLabel}`;
    }
    
    if (searchQuery) {
      return `Search Results: "${searchQuery}"`;
    }
    
    if (sortBy !== "default") {
      return `${sortLabel} Anime`;
    }
    
    return "Browse Anime";
  };

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main className="pt-16 md:pt-20 pb-8 md:pb-12 px-3 md:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            {searchQuery 
              ? `Found ${animes.length} results${totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ""}`
              : "Browse the entire collection of anime."
            }
          </p>
        </div>

        {/* Filters Row - Mobile Optimized */}
        <div className="flex flex-col gap-3 mb-4 md:mb-6">
          {/* Search Input */}
          <SearchInput defaultValue={searchQuery} />

          {/* Top Row: Sort and View Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              {/* Sort Dropdown */}
              <SortDropdown
                options={SORT_OPTIONS}
                currentValue={sortBy}
              />
            </div>

            {/* View Toggle */}
            <ViewToggle currentView={viewMode} />
          </div>

          {/* Active Filter Indicator */}
          {(sortBy !== "default" || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-400 text-xs">Active filters:</span>
              {searchQuery && (
                <Link
                  href={buildUrl({ q: "", page: 1 })}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5c518]/20 text-[#f5c518] rounded text-xs hover:bg-[#f5c518]/30 transition-colors"
                >
                  <span>Search: {searchQuery}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              )}
              {sortBy !== "default" && (
                <Link
                  href={buildUrl({ sort: "default", page: 1 })}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                >
                  <span>Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Anime Grid/List View */}
        {animes.length > 0 ? (
          viewMode === "grid" ? (
            /* Grid View */
            <div className="grid gap-3 md:gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {animes.map((anime: any, index: number) => (
                <Link
                  key={`${anime.id}-${index}`}
                  href={`/anime/${anime.id}`}
                  className="group"
                >
                  <div className="relative">
                    {/* Poster */}
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-1.5 md:mb-2">
                      {/* Type Badge */}
                      {anime.type && (
                        <div className="absolute top-1 left-1 md:top-2 md:left-2 z-10 px-1.5 md:px-2 py-0.5 bg-[#1a2332]/90 text-white text-[10px] md:text-xs font-medium rounded">
                          {anime.type}
                        </div>
                      )}

                      {/* Episodes Badge */}
                      <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 z-10 flex flex-col gap-0.5 md:gap-1">
                        {anime.episodes?.sub && (
                          <span className="px-1.5 md:px-2 py-0.5 bg-[#f5c518] text-black text-[10px] md:text-xs font-bold rounded">
                            SUB: {anime.episodes.sub}
                          </span>
                        )}
                        {anime.episodes?.dub && (
                          <span className="px-1.5 md:px-2 py-0.5 bg-blue-500 text-white text-[10px] md:text-xs font-bold rounded">
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
                        <div className="w-full h-full bg-[#1a2332] flex items-center justify-center text-gray-600 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-white text-xs md:text-sm font-medium line-clamp-2 group-hover:text-[#f5c518] transition-colors">
                      {anime.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col gap-2 md:gap-3">
              {animes.map((anime: any, index: number) => (
                <Link
                  key={`${anime.id}-${index}`}
                  href={`/anime/${anime.id}`}
                  className="group flex gap-3 md:gap-4 bg-[#1a2332] rounded-lg p-2 md:p-3 hover:bg-[#232d3f] transition-colors"
                >
                  {/* Poster */}
                  <div className="relative w-16 md:w-24 aspect-[2/3] rounded-md overflow-hidden flex-shrink-0">
                    {anime.poster ? (
                      <Image
                        src={anime.poster}
                        alt={anime.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0f1729] flex items-center justify-center text-gray-600 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="text-white text-sm md:text-base font-medium line-clamp-1 group-hover:text-[#f5c518] transition-colors">
                      {anime.name}
                    </h3>

                    {/* Japanese Name */}
                    {anime.jname && (
                      <p className="text-gray-500 text-xs line-clamp-1 mb-1">
                        {anime.jname}
                      </p>
                    )}

                    {/* Description - show if available */}
                    {anime.description && (
                      <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-1.5 hidden sm:block">
                        {anime.description}
                      </p>
                    )}
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 mb-1.5">
                      {anime.type && (
                        <span className="px-1.5 py-0.5 bg-[#0f1729] rounded text-gray-300">{anime.type}</span>
                      )}
                      {anime.rating && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          {anime.rating}
                        </span>
                      )}
                      {anime.duration && <span>{anime.duration}</span>}
                    </div>

                    {/* Episodes */}
                    <div className="flex items-center gap-2">
                      {anime.episodes?.sub && (
                        <span className="px-1.5 py-0.5 bg-[#f5c518] text-black text-[10px] md:text-xs font-bold rounded">
                          SUB: {anime.episodes.sub}
                        </span>
                      )}
                      {anime.episodes?.dub && (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] md:text-xs font-bold rounded">
                          DUB: {anime.episodes.dub}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center text-gray-500 group-hover:text-[#f5c518]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12 md:py-20">
            <div className="text-gray-600 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-base md:text-lg">No anime found</p>
            <p className="text-gray-600 text-sm mt-1">
              {searchQuery ? "Try a different search term" : "Try adjusting your filters"}
            </p>
          </div>
        )}

        {/* Pagination - Mobile Optimized */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 md:gap-2 mt-8 md:mt-10">
            <Link
              href={buildUrl({ page: Math.max(1, currentPage - 1) })}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1a2332] text-white flex items-center justify-center transition-colors ${
                currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:bg-[#232d3f]"
              }`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            {getPageNumbers().map((page, index) => (
              page === "..." ? (
                <span key={index} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-500 text-sm">
                  {page}
                </span>
              ) : (
                <Link
                  key={index}
                  href={buildUrl({ page: page as number })}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors text-sm md:text-base ${
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
              href={buildUrl({ page: Math.min(totalPages, currentPage + 1) })}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1a2332] text-white flex items-center justify-center transition-colors ${
                currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-[#232d3f]"
              }`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Results Count */}
        <div className="text-center mt-4 text-gray-500 text-xs md:text-sm">
          Page {currentPage} of {totalPages} • {animes.length} results shown
        </div>
      </main>

      <Footer />
    </div>
  );
}

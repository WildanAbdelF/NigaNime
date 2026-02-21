import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { hianimeService } from "@/lib/api";
import { AnimatedAnimeList, BrowseHeader, BrowseFilters } from "@/components/features/anime";

interface PageProps {
  searchParams: Promise<{ 
    page?: string;
    q?: string;
    view?: string;
  }>;
}

export default async function MoviePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const searchQuery = params.q || "";
  const viewMode = (params.view as "grid" | "list") || "grid";

  // Fetch movie data
  let response;
  let animes: any[] = [];
  
  try {
    if (searchQuery) {
      // Search with movie type filter
      response = await hianimeService.searchWithPagination(searchQuery, currentPage, {
        type: "movie",
      });
      animes = response?.data?.animes || [];
    } else {
      // Default - use movie category
      response = await hianimeService.getCategory("movie", currentPage);
      animes = response?.data?.animes || [];
    }
  } catch (error) {
    console.error("Failed to fetch movies:", error);
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

  // Build query params
  const buildUrl = (newParams: { page?: number; q?: string }) => {
    const urlParams = new URLSearchParams();
    
    const newQuery = newParams.q !== undefined ? newParams.q : searchQuery;
    if (newQuery) {
      urlParams.set("q", newQuery);
    }
    
    const page = newParams.page ?? currentPage;
    if (page && page !== 1) urlParams.set("page", page.toString());
    
    if (viewMode === "list") urlParams.set("view", "list");
    
    const query = urlParams.toString();
    return query ? `/movie?${query}` : "/movie";
  };

  // Get page title
  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results: "${searchQuery}"`;
    }
    
    return "Anime Movies";
  };

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main className="pt-16 md:pt-20 pb-8 md:pb-12 px-3 md:px-4 lg:px-8">
        {/* Header */}
        <BrowseHeader
          title={getPageTitle()}
          subtitle={
            searchQuery
              ? `Found ${animes.length} results${totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ""}`
              : "Browse all anime movies in our collection."
          }
        />

        {/* Filters Row - Using shared components with /movie basePath */}
        <BrowseFilters
          sortOptions={[]}
          sortBy="default"
          viewMode={viewMode}
          searchQuery={searchQuery}
          basePath="/movie"
          showSort={false}
        />

        {/* Active Filter Indicator */}
        {searchQuery && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-gray-400 text-xs">Active filters:</span>
            <Link
              href={buildUrl({ q: "", page: 1 })}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5c518]/20 text-[#f5c518] rounded text-xs hover:bg-[#f5c518]/30 transition-colors"
            >
              <span>Search: {searchQuery}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        )}

        {/* Movie Grid/List View */}
        {animes.length > 0 ? (
          <AnimatedAnimeList animes={animes} viewMode={viewMode} />
        ) : (
          <div className="text-center py-12 md:py-20">
            <div className="text-gray-600 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-gray-500 text-base md:text-lg">No movies found</p>
            <p className="text-gray-600 text-sm mt-1">
              {searchQuery ? "Try a different search term" : "Try adjusting your filters"}
            </p>
          </div>
        )}

        {/* Pagination */}
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

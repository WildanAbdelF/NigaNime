"use client";
import SortDropdown from "./SortDropdown";
import ViewToggle from "./ViewToggle";
import SearchInput from "./SearchInput";

interface SortOption {
  label: string;
  value: string;
}

interface BrowseFiltersProps {
  sortOptions: SortOption[];
  sortBy: string;
  viewMode: "grid" | "list";
  searchQuery: string;
  basePath?: string;
  showSort?: boolean;
}

export default function BrowseFilters({ sortOptions, sortBy, viewMode, searchQuery, basePath = "/anime", showSort = true }: BrowseFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-4 md:mb-6">
      {/* Search Input */}
      <SearchInput defaultValue={searchQuery} basePath={basePath} />

      {/* Top Row: Sort and View Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {showSort && (
            <SortDropdown options={sortOptions} currentValue={sortBy} basePath={basePath} />
          )}
        </div>
        <ViewToggle currentView={viewMode} basePath={basePath} />
      </div>
    </div>
  );
}

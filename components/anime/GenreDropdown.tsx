"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// Available genres based on HiAnime API
const GENRES = [
  "Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", 
  "Drama", "Ecchi", "Fantasy", "Game", "Harem", "Historical", 
  "Horror", "Isekai", "Josei", "Kids", "Magic", "Martial Arts", 
  "Mecha", "Military", "Music", "Mystery", "Parody", "Police", 
  "Psychological", "Romance", "Samurai", "School", "Sci-Fi", 
  "Seinen", "Shoujo", "Shoujo Ai", "Shounen", "Shounen Ai", 
  "Slice of Life", "Space", "Sports", "Super Power", "Supernatural", 
  "Thriller", "Vampire"
];

interface GenreDropdownProps {
  currentGenre: string;
  currentPage: number;
}

export default function GenreDropdown({ currentGenre, currentPage }: GenreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredGenres = GENRES.filter(genre => 
    genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert genre name to URL-friendly format
  const toSlug = (genre: string) => genre.toLowerCase().replace(/\s+/g, "-");
  
  // Get display name from current genre slug
  const getDisplayName = () => {
    if (!currentGenre) return "All Genres";
    const found = GENRES.find(g => toSlug(g) === currentGenre);
    return found || "All Genres";
  };

  // Build URL for genre selection
  const buildUrl = (genre: string | null) => {
    if (!genre) return "/anime";
    return `/anime?genre=${toSlug(genre)}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#1e293b] text-white px-3 py-2 rounded-lg hover:bg-[#2a3441] transition-colors border border-[#2a3441] text-sm md:text-base md:px-4"
      >
        <span className="truncate max-w-[100px] md:max-w-[140px]">{getDisplayName()}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#1e293b] border border-[#2a3441] rounded-lg shadow-xl z-[100] overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-[#2a3441]">
            <input
              type="text"
              placeholder="Search genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f1729] border border-[#2a3441] rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f5c518]"
            />
          </div>

          {/* Genre List */}
          <div className="max-h-64 overflow-y-auto">
            {/* All Genres Option */}
            <Link
              href="/anime"
              onClick={() => {
                setIsOpen(false);
                setSearchQuery("");
              }}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                !currentGenre
                  ? "bg-[#f5c518] text-black font-medium"
                  : "text-gray-300 hover:bg-[#2a3441]"
              }`}
            >
              All Genres
            </Link>

            {filteredGenres.map((genre) => (
              <Link
                key={genre}
                href={buildUrl(genre)}
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  currentGenre === toSlug(genre)
                    ? "bg-[#f5c518] text-black font-medium"
                    : "text-gray-300 hover:bg-[#2a3441]"
                }`}
              >
                {genre}
              </Link>
            ))}

            {filteredGenres.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No genres found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";

interface GenreSidebarProps {
  genres: string[];
  selectedGenre: string;
}

export default function GenreSidebar({ genres, selectedGenre }: GenreSidebarProps) {
  return (
    <div className="w-full rounded-2xl bg-[#101a2c] border border-white/5 p-4 shadow-lg">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Filter</p>
        <h2 className="text-xl font-bold text-white mt-1">Select Genre</h2>
      </div>

      <div className="max-h-[70vh] overflow-auto pr-1 space-y-1.5 custom-scrollbar">
        {genres.map((genre) => {
          const genreSlug = genre.toLowerCase().replace(/\s+/g, "-");
          const isActive = selectedGenre.toLowerCase() === genreSlug;
          
          return (
            <Link
              key={genre}
              href={`/genre?g=${genreSlug}`}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "border-[#f5c518] bg-[#f5c518] text-black"
                  : "border-white/5 bg-[#0f1729] text-gray-200 hover:border-[#f5c518]/60 hover:bg-[#1a2332]"
              }`}
            >
              <span className="flex-1">{genre}</span>
              {isActive && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

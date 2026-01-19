"use client";

import Image from "next/image";
import Link from "next/link";

interface AnimatedAnimeListProps {
  animes: any[];
  viewMode: "grid" | "list";
}

// Renders anime cards for grid or list views.
export default function AnimatedAnimeList({ animes, viewMode }: AnimatedAnimeListProps) {
  return viewMode === "grid" ? (
    <div className="grid gap-3 md:gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {animes.map((anime, index) => (
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
    <div className="flex flex-col gap-2 md:gap-3">
      {animes.map((anime, index) => (
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
  );
}

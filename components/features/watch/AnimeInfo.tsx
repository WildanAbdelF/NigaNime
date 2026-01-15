"use client";

import Image from "next/image";
import Link from "next/link";
import type { HiAnimeEpisode } from "@/types/api/hianime";

interface AnimeInfoProps {
  anime: {
    info: {
      id: string;
      name: string;
      poster: string;
      description: string;
      stats: {
        rating: string;
        quality: string;
        episodes: { sub: number | null; dub: number | null };
        type: string;
        duration: string;
      };
    };
    moreInfo?: {
      japanese?: string;
      genres?: string[];
      studios?: string;
      status?: string;
      aired?: string;
    };
  };
  currentEpisode: HiAnimeEpisode | null;
}

export default function AnimeInfo({ anime, currentEpisode }: AnimeInfoProps) {
  return (
    <div className="px-4 py-6 bg-[#0f1729]">
      <div className="flex gap-4 md:gap-6">
        {/* Poster */}
        <Link
          href={`/anime/${anime.info.id}`}
          className="relative flex-shrink-0 w-24 md:w-32 aspect-[2/3] rounded-lg overflow-hidden group"
        >
          {anime.info.poster ? (
            <Image
              src={anime.info.poster}
              alt={anime.info.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-[#1a2332] flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/anime/${anime.info.id}`}
            className="text-white text-lg md:text-xl font-bold hover:text-[#f5c518] transition-colors line-clamp-2"
          >
            {anime.info.name}
          </Link>

          {currentEpisode && (
            <h2 className="text-[#f5c518] text-sm md:text-base mt-1">
              Episode {currentEpisode.number}: {currentEpisode.title || "Untitled"}
            </h2>
          )}

          {/* Meta Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {anime.info.stats.type && (
              <span className="px-2 py-1 bg-[#1a2332] text-gray-300 rounded text-xs">
                {anime.info.stats.type}
              </span>
            )}
            {anime.info.stats.quality && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                {anime.info.stats.quality}
              </span>
            )}
            {anime.info.stats.rating && (
              <span className="flex items-center gap-1 px-2 py-1 bg-[#f5c518]/20 text-[#f5c518] rounded text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {anime.info.stats.rating}
              </span>
            )}
            {anime.info.stats.episodes.sub && (
              <span className="px-2 py-1 bg-[#f5c518] text-black rounded text-xs font-bold">
                SUB: {anime.info.stats.episodes.sub}
              </span>
            )}
            {anime.info.stats.episodes.dub && (
              <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-bold">
                DUB: {anime.info.stats.episodes.dub}
              </span>
            )}
          </div>

          {/* Genres */}
          {anime.moreInfo?.genres && anime.moreInfo.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {anime.moreInfo.genres.slice(0, 5).map((genre, index) => (
                <a
                  key={index}
                  href={`/genre?g=${genre.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-2 py-1 bg-[#232d3f] text-gray-300 rounded text-xs hover:bg-[#f5c518] hover:text-black transition-colors"
                >
                  {genre}
                </a>
              ))}
            </div>
          )}

          {/* Description */}
          {anime.info.description && (
            <p className="text-gray-400 text-sm mt-4 line-clamp-3 hidden md:block">
              {anime.info.description}
            </p>
          )}
        </div>
      </div>

      {/* Mobile Description */}
      {anime.info.description && (
        <p className="text-gray-400 text-sm mt-4 line-clamp-4 md:hidden">
          {anime.info.description}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-4">
        <Link
          href={`/anime/${anime.info.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] hover:bg-[#232d3f] text-white rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View Details
        </Link>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] hover:bg-[#232d3f] text-white rounded-lg transition-colors text-sm"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: anime.info.name,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}

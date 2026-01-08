"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { HiAnimeCard } from "@/types/hianime";

interface TrendingSectionProps {
  animes: HiAnimeCard[];
}

export default function TrendingSection({ animes }: TrendingSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!animes || animes.length === 0) {
    return null;
  }

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#f5c518] rounded-full" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Trending Now
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-[#1a2332] border border-[#2a3441] flex items-center justify-center hover:border-[#f5c518] transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-[#1a2332] border border-[#2a3441] flex items-center justify-center hover:border-[#f5c518] transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Anime Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-4"
        >
          {animes.map((anime, index) => (
            <Link
              key={`${anime.id}-${index}`}
              href={`/anime/${anime.id}`}
              className="flex-shrink-0 w-[180px] group"
            >
              {/* Card Image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
                {/* Rating Badge */}
                {anime.rating && (
                  <div className="absolute top-2 left-2 z-10 bg-[#f5c518] text-black text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    {anime.rating}
                  </div>
                )}

                {/* Episodes Badge */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                  {anime.episodes?.sub && (
                    <span className="bg-[#f5c518]/90 text-black text-xs font-bold px-2 py-0.5 rounded">
                      SUB: {anime.episodes.sub}
                    </span>
                  )}
                  {anime.episodes?.dub && (
                    <span className="bg-blue-500/90 text-white text-xs font-bold px-2 py-0.5 rounded">
                      DUB: {anime.episodes.dub}
                    </span>
                  )}
                </div>

                <Image
                  src={anime.poster}
                  alt={anime.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Card Info */}
              <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1 group-hover:text-[#f5c518] transition-colors">
                {anime.name}
              </h3>
              <p className="text-gray-500 text-xs line-clamp-1">
                {anime.type} {anime.duration ? `• ${anime.duration}` : ""}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

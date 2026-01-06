"use client";

import Image from "next/image";
import Link from "next/link";
import type { Anime } from "@/types/anime";

interface HeroSectionProps {
  anime?: Anime;
}

export default function HeroSection({ anime }: HeroSectionProps) {
  // Default data jika tidak ada data dari API
  const defaultAnime = {
    mal_id: 0,
    title: "Frieren: Beyond Journey's End",
    title_english: "Frieren: Beyond Journey's End",
    synopsis:
      "The adventure is over but life goes on for an elven mage beginning to learn what living is all about. A gentle, reflective journey awaits.",
    images: { jpg: { large_image_url: "/placeholder-hero.jpg" } },
    rank: 1,
  } as Anime;

  const displayAnime = anime || defaultAnime;

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1729] via-[#0f1729]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-transparent to-transparent z-10" />
        {displayAnime.images?.jpg?.large_image_url ? (
          <Image
            src={displayAnime.images.jpg.large_image_url}
            alt={displayAnime.title_english || displayAnime.title}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a2332] to-[#0f1729]" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl">
          {/* Trending Badge */}
          <div className="inline-flex items-center gap-2 bg-[#f5c518] text-black px-3 py-1 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
            TRENDING #{displayAnime.rank || 1}
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {displayAnime.title_english || displayAnime.title}
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-base md:text-lg mb-8 line-clamp-3">
            {displayAnime.synopsis}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/anime/${displayAnime.mal_id}`}
              className="inline-flex items-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Now
            </Link>
            <button className="inline-flex items-center gap-2 bg-transparent border border-gray-500 hover:border-white text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              Add to List
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

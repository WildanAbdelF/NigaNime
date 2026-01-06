"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { SpotlightAnime } from "@/types/hianime";

interface SpotlightSliderProps {
  spotlights: SpotlightAnime[];
}

export default function SpotlightSlider({ spotlights }: SpotlightSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % spotlights.length);
  }, [spotlights.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + spotlights.length) % spotlights.length);
  }, [spotlights.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || spotlights.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, spotlights.length, nextSlide]);

  if (!spotlights || spotlights.length === 0) {
    return (
      <section className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-br from-[#1a2332] to-[#0f1729] flex items-center justify-center">
        <p className="text-gray-500">No spotlight anime available</p>
      </section>
    );
  }

  const current = spotlights[currentIndex];

  // Extract info from otherInfo array
  const getInfoItem = (index: number) => current.otherInfo?.[index] || null;
  const animeType = getInfoItem(0);
  const duration = getInfoItem(1);
  const releaseDate = getInfoItem(2);

  return (
    <section className="relative w-full h-[500px] md:h-[650px] lg:h-[700px] overflow-hidden bg-[#0f1729]">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1729] via-[#0f1729]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-transparent to-[#0f1729]/30 z-10" />

        {/* Background images with transitions */}
        {spotlights.map((spotlight, index) => (
          <div
            key={spotlight.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {spotlight.poster && (
              <Image
                src={spotlight.poster}
                alt={spotlight.name}
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority={index === 0}
                unoptimized
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          {/* Rank Badge */}
          <div className="inline-flex items-center gap-2 bg-[#f5c518] text-black px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            SPOTLIGHT #{current.rank}
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
            {current.name}
          </h1>

          {/* Japanese Title */}
          {current.jname && (
            <p className="text-gray-400 text-lg mb-4 italic">{current.jname}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            {animeType && (
              <span className="px-3 py-1 bg-white/10 text-white rounded-full">{animeType}</span>
            )}
            {duration && (
              <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full">{duration}</span>
            )}
            {releaseDate && (
              <span className="text-gray-400">{releaseDate}</span>
            )}
            {current.episodes?.sub && (
              <span className="px-3 py-1 bg-[#f5c518]/20 text-[#f5c518] rounded-full font-semibold">
                SUB: {current.episodes.sub} EP
              </span>
            )}
            {current.episodes?.dub && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                DUB: {current.episodes.dub} EP
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed">
            {current.description || "Discover this amazing anime and start watching now!"}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/watch/${current.id}`}
              className="inline-flex items-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Now
            </Link>
            <Link
              href={`/anime/${current.id}`}
              className="inline-flex items-center gap-2 bg-transparent border border-gray-500 hover:border-white text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {spotlights.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Ranking List Navigation */}
      {spotlights.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2">
          {spotlights.map((spotlight, index) => (
            <button
              key={spotlight.id}
              onClick={() => goToSlide(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                index === currentIndex
                  ? "bg-[#f5c518] text-black scale-110"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              title={`#${spotlight.rank} ${spotlight.name}`}
            >
              {spotlight.rank}
            </button>
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-6 right-8 z-30 text-white/70 text-sm bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-[#f5c518] font-bold">#{current.rank}</span>
        <span> of {spotlights.length}</span>
      </div>
    </section>
  );
}

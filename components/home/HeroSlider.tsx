"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { Anime } from "@/types/anime";

interface HeroSliderProps {
  animes: Anime[];
}

export default function HeroSlider({ animes }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % animes.length);
  }, [animes.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + animes.length) % animes.length);
  }, [animes.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || animes.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, animes.length, nextSlide]);

  if (!animes || animes.length === 0) {
    return (
      <section className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-br from-[#1a2332] to-[#0f1729] flex items-center justify-center">
        <p className="text-gray-500">No spotlight anime available</p>
      </section>
    );
  }

  const currentAnime = animes[currentIndex];
  // Use trailer thumbnail or large image as banner
  const bannerImage = currentAnime.trailer?.images?.maximum_image_url 
    || currentAnime.images.jpg.large_image_url 
    || currentAnime.images.jpg.image_url;

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image with transition */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1729] via-[#0f1729]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-transparent to-transparent z-10" />
        
        {animes.map((anime, index) => {
          const img = anime.trailer?.images?.maximum_image_url 
            || anime.images.jpg.large_image_url 
            || anime.images.jpg.image_url;
          return (
            <div
              key={anime.mal_id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {img && (
                <Image
                  src={img}
                  alt={anime.title}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl">
          {/* Trending Badge */}
          <div className="inline-flex items-center gap-2 bg-[#f5c518] text-black px-3 py-1 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
            TRENDING #{currentAnime.rank || currentIndex + 1}
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {currentAnime.title_english || currentAnime.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-400">
            {currentAnime.type && (
              <span className="px-2 py-1 bg-white/10 rounded">{currentAnime.type}</span>
            )}
            {currentAnime.score && (
              <span className="px-2 py-1 bg-[#f5c518]/20 text-[#f5c518] rounded flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                {currentAnime.score}
              </span>
            )}
            {currentAnime.year && (
              <span>{currentAnime.year}</span>
            )}
            {currentAnime.episodes && (
              <span>{currentAnime.episodes} Episodes</span>
            )}
            {currentAnime.status && (
              <span className={`px-2 py-1 rounded ${
                currentAnime.airing ? "bg-green-500/20 text-green-400" : "bg-gray-500/20"
              }`}>
                {currentAnime.status}
              </span>
            )}
          </div>

          {/* Genres */}
          {currentAnime.genres && currentAnime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentAnime.genres.slice(0, 3).map((genre) => (
                <span key={genre.mal_id} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 text-base md:text-lg mb-8 line-clamp-3">
            {currentAnime.synopsis || "Discover this amazing anime and start watching now!"}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/anime/${currentAnime.mal_id}`}
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

      {/* Navigation Arrows */}
      {animes.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {animes.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {animes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-[#f5c518] w-8"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-30 text-white/70 text-sm">
        <span className="text-[#f5c518] font-bold">{currentIndex + 1}</span>
        <span> / {animes.length}</span>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import type { JikanTrailer } from "@/types/anime";

interface AnimeTrailerProps {
  trailer: JikanTrailer;
  title: string;
}

export default function AnimeTrailer({ trailer, title }: AnimeTrailerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!trailer.youtube_id) return null;

  const thumbnailUrl =
    trailer.images?.maximum_image_url ||
    trailer.images?.large_image_url ||
    `https://img.youtube.com/vi/${trailer.youtube_id}/maxresdefault.jpg`;

  return (
    <div className="mb-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
        <svg className="w-5 h-5 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
        Official Trailer
      </h2>

      <div className="relative aspect-video rounded-lg overflow-hidden bg-[#1a2332]">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailer.youtube_id}?autoplay=1&rel=0`}
            title={`${title} - Official Trailer`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {/* Thumbnail */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Play Button */}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group"
            >
              <div className="w-20 h-20 rounded-full bg-[#f5c518] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>

            {/* Trailer Label */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 rounded text-white text-sm font-medium">
              Official Trailer 1
            </div>
          </>
        )}
      </div>
    </div>
  );
}

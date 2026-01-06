"use client";

import { useState } from "react";

interface PromotionalVideo {
  title: string;
  source: string;
  thumbnail: string;
}

interface AnimeTrailerProps {
  videos: PromotionalVideo[];
  title: string;
}

export default function AnimeTrailer({ videos, title }: AnimeTrailerProps) {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videos || videos.length === 0) return null;

  const currentVideo = videos[activeVideo];

  // Extract YouTube video ID from various URL formats
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = getYoutubeId(currentVideo.source);

  return (
    <div className="mb-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
        <svg className="w-5 h-5 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
        {videos.length > 1 ? "Promotional Videos" : "Official Trailer"}
      </h2>

      {/* Video Tabs if multiple */}
      {videos.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
          {videos.map((video, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveVideo(index);
                setIsPlaying(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeVideo === index
                  ? "bg-[#f5c518] text-black"
                  : "bg-[#1a2332] text-gray-300 hover:bg-[#232d3f]"
              }`}
            >
              {video.title || `Video ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-video rounded-lg overflow-hidden bg-[#1a2332]">
        {isPlaying && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={`${title} - ${currentVideo.title || "Trailer"}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {/* Thumbnail */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${currentVideo.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : '')})` 
              }}
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

            {/* Video Title Label */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 rounded text-white text-sm font-medium">
              {currentVideo.title || "Official Trailer"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

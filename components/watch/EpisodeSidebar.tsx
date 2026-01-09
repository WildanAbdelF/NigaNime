"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HiAnimeEpisode } from "@/types/hianime";

interface EpisodeSidebarProps {
  animeId: string;
  episodes: HiAnimeEpisode[];
  currentEpisodeId: string;
  server: string;
  category: string;
}

export default function EpisodeSidebar({
  animeId,
  episodes,
  currentEpisodeId,
  server,
  category,
}: EpisodeSidebarProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const listRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLAnchorElement>(null);

  // Scroll to current episode on mount
  useEffect(() => {
    if (activeEpisodeRef.current && listRef.current) {
      const container = listRef.current;
      const activeElement = activeEpisodeRef.current;
      
      // Calculate scroll position to center the active episode
      const containerHeight = container.clientHeight;
      const activeTop = activeElement.offsetTop;
      const activeHeight = activeElement.clientHeight;
      
      container.scrollTop = activeTop - (containerHeight / 2) + (activeHeight / 2);
    }
  }, [currentEpisodeId]);

  return (
    <div className="flex flex-col h-full bg-[#0f1729]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a2332] border-b border-[#2a3441]">
        <h2 className="text-white font-bold">Episodes</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "list" ? "bg-[#f5c518] text-black" : "text-gray-400 hover:text-white"
            }`}
            title="List View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "grid" ? "bg-[#f5c518] text-black" : "text-gray-400 hover:text-white"
            }`}
            title="Grid View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Episode List - Scrollable with max height */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-[#2a3441] scrollbar-track-transparent"
      >
        {viewMode === "list" ? (
          <div className="divide-y divide-[#2a3441]">
            {episodes.map((episode) => {
              const isActive = episode.episodeId === currentEpisodeId;
              
              return (
                <Link
                  key={episode.episodeId}
                  ref={isActive ? activeEpisodeRef : null}
                  href={`/watch/${encodeURIComponent(episode.episodeId)}?server=${server}&category=${category}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-[#f5c518]/10 border-l-2 border-[#f5c518]"
                      : "hover:bg-[#1a2332]"
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isActive ? "bg-[#f5c518] text-black" : "bg-[#1a2332] text-gray-400"
                  }`}>
                    {episode.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${
                      isActive ? "text-[#f5c518]" : "text-white"
                    }`}>
                      {episode.title || `Episode ${episode.number}`}
                    </h4>
                    {episode.isFiller && (
                      <span className="text-xs text-orange-400">Filler</span>
                    )}
                  </div>
                  {isActive && (
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 p-4">
            {episodes.map((episode) => {
              const isActive = episode.episodeId === currentEpisodeId;
              
              return (
                <Link
                  key={episode.episodeId}
                  href={`/watch/${encodeURIComponent(episode.episodeId)}?server=${server}&category=${category}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#f5c518] text-black"
                      : "bg-[#1a2332] text-gray-300 hover:bg-[#232d3f] hover:text-white"
                  }`}
                  title={episode.title || `Episode ${episode.number}`}
                >
                  {episode.number}
                </Link>
              );
            })}
          </div>
        )}

      </div>

      {/* Total Episodes */}
      <div className="px-4 py-3 bg-[#1a2332] border-t border-[#2a3441] text-center">
        <span className="text-gray-400 text-sm">
          Total: {episodes.length} Episodes
        </span>
      </div>
    </div>
  );
}

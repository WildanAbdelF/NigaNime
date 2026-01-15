"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { HiAnimeEpisode } from "@/types/api/hianime";
import { buildWatchUrl } from "@/lib/utils/watchUrl";

interface EpisodeListProps {
  episodes: HiAnimeEpisode[];
  animeId: string;
  animeTitle: string;
}

export default function EpisodeList({ episodes }: EpisodeListProps) {
  // Auto-select first episode on mount
  const [selectedEpisode, setSelectedEpisode] = useState<HiAnimeEpisode | null>(
    episodes.length > 0 ? episodes[0] : null
  );
  
  // Update selection if episodes change
  useEffect(() => {
    if (episodes.length > 0 && !selectedEpisode) {
      setSelectedEpisode(episodes[0]);
    }
  }, [episodes, selectedEpisode]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 24;

  // Filter episodes by search
  const filteredEpisodes = episodes.filter(
    (ep) =>
      ep.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.number.toString().includes(searchQuery)
  );

  // Pagination
  const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage);
  const paginatedEpisodes = filteredEpisodes.slice(
    (currentPage - 1) * episodesPerPage,
    currentPage * episodesPerPage
  );

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
          <svg className="w-5 h-5 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Episodes
          <span className="text-gray-500 text-sm font-normal">({episodes.length} total)</span>
        </h2>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search episode..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 px-4 py-2 pl-10 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c518]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Episode Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 mb-4">
        {paginatedEpisodes.map((episode) => (
          <button
            key={episode.episodeId}
            onClick={() => setSelectedEpisode(episode)}
            className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition-all hover:scale-105 ${
              selectedEpisode?.episodeId === episode.episodeId
                ? "bg-[#f5c518] text-black"
                : episode.isFiller
                ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                : "bg-[#1a2332] text-white hover:bg-[#232d3f]"
            }`}
            title={episode.title || `Episode ${episode.number}`}
          >
            <span>{episode.number}</span>
            {episode.isFiller && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-orange-500 rounded-full" title="Filler" />
            )}
          </button>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#1a2332] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#232d3f]"
          >
            ‹
          </button>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-[#1a2332] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#232d3f]"
          >
            ›
          </button>
        </div>
      )}

      {/* Episode Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-[#1a2332] rounded" />
          <span>Canon</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-orange-500/20 rounded" />
          <span>Filler</span>
        </div>
      </div>

      {/* Selected Episode Detail */}
      {selectedEpisode && (
        <div className="mt-6 bg-[#1a2332] rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-[#f5c518] text-black text-xs font-bold rounded">
                  EP {selectedEpisode.number}
                </span>
                {selectedEpisode.isFiller && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                    Filler
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {selectedEpisode.title || `Episode ${selectedEpisode.number}`}
              </h3>
            </div>
            <Link 
              href={buildWatchUrl(selectedEpisode.episodeId)}
              className="flex items-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Episode {selectedEpisode.number}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

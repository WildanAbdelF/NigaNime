"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { useUser } from "@/lib/hooks/useUser";
import { buildWatchUrl } from "@/lib/utils/watchUrl";

interface Favorite {
  id: string;
  anime_id: string;
  anime_title: string;
  anime_poster: string | null;
  anime_type: string | null;
  anime_rating: string | null;
  created_at: string;
}

interface WatchHistoryItem {
  id: string;
  anime_id: string;
  anime_title: string;
  anime_poster: string | null;
  episode_id: string;
  episode_number: number;
  watched_at: string;
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: userLoading, signOut } = useUser();
  const [activeTab, setActiveTab] = useState<"favorites" | "history">(
    searchParams.get("tab") === "history" ? "history" : "favorites"
  );
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Always fetch both so counts stay accurate
        const [favRes, histRes] = await Promise.all([
          fetch("/api/user/favorites"),
          fetch("/api/user/history?limit=100"),
        ]);
        const favJson = await favRes.json();
        const histJson = await histRes.json();
        setFavorites(favJson.data || []);
        setHistory(histJson.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab]);

  const removeFavorite = async (animeId: string) => {
    await fetch(`/api/user/favorites?anime_id=${animeId}`, { method: "DELETE" });
    setFavorites((prev) => prev.filter((f) => f.anime_id !== animeId));
  };

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to clear all watch history?")) return;
    await fetch("/api/user/history", { method: "DELETE" });
    setHistory([]);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Group watch history by anime
  const historyByAnime = history.reduce<Record<string, { anime: WatchHistoryItem; episodes: WatchHistoryItem[] }>>((acc, item) => {
    if (!acc[item.anime_id]) {
      acc[item.anime_id] = { anime: item, episodes: [] };
    }
    acc[item.anime_id].episodes.push(item);
    return acc;
  }, {});

  // Get unique anime count from history
  const uniqueAnimeWatched = Object.keys(historyByAnime).length;

  // Get total episodes watched
  const totalEpisodesWatched = history.length;

  // Get join date (approximate from created_at or use current date)
  const memberSince = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />
      <main className="pt-16">
        {/* Hero Banner Section */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#1a2332] via-[#0f1729] to-[#1a2332] overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h10v10H0zM20%2020h10v10H20zM40%2040h10v10H40z%22%20fill%3D%22%23f5c518%22%20fill-opacity%3D%22.1%22%2F%3E%3C%2Fsvg%3E')]" />
          </div>
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-transparent to-transparent" />
          <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#f5c518]/10 to-transparent blur-3xl" />
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#f5c518]/5 to-transparent blur-3xl" />
          
          {/* Decorative Elements */}
          <div className="absolute top-8 right-[10%] w-20 h-20 rounded-full bg-[#f5c518]/5 blur-2xl animate-pulse" />
          <div className="absolute bottom-12 left-[15%] w-32 h-32 rounded-full bg-[#f5c518]/3 blur-3xl animate-pulse delay-700" />
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Profile Card - Overlapping Banner */}
          <div className="relative -mt-24 md:-mt-32 mb-8">
            <div className="bg-gradient-to-br from-[#1a2332] to-[#151d29] rounded-2xl border border-[#2a3441]/50 shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar with Ring */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#f5c518] to-[#d4a817] rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#f5c518] to-[#d4a817] flex items-center justify-center text-black text-3xl md:text-4xl font-bold overflow-hidden ring-4 ring-[#0f1729] shadow-xl">
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        (user.user_metadata?.name || user.email || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Online Indicator */}
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full ring-4 ring-[#1a2332]" />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {user.user_metadata?.name || user.email?.split("@")[0]}
                    </h1>
                    <p className="text-gray-400 text-sm mb-4">{user.email}</p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f5c518]/10 text-[#f5c518] rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                        Anime Fan
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0f1729] text-gray-400 rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Member since {memberSince}
                      </span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={signOut}
                    className="absolute top-4 right-4 md:relative md:top-0 md:right-0 flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 bg-[#0f1729]/50 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-[#2a3441]/50">
                  <div className="bg-[#0f1729]/50 rounded-xl p-4 text-center group hover:bg-[#0f1729] transition-all cursor-default">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="text-2xl font-bold text-white">{favorites.length}</span>
                    </div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Favorites</p>
                  </div>
                  
                  <div className="bg-[#0f1729]/50 rounded-xl p-4 text-center group hover:bg-[#0f1729] transition-all cursor-default">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                      <span className="text-2xl font-bold text-white">{uniqueAnimeWatched}</span>
                    </div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Anime Watched</p>
                  </div>
                  
                  <div className="bg-[#0f1729]/50 rounded-xl p-4 text-center group hover:bg-[#0f1729] transition-all cursor-default">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-2xl font-bold text-white">{totalEpisodesWatched}</span>
                    </div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Episodes</p>
                  </div>
                  
                  <div className="bg-[#0f1729]/50 rounded-xl p-4 text-center group hover:bg-[#0f1729] transition-all cursor-default">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-2xl font-bold text-white">{Math.round(totalEpisodesWatched * 24 / 60)}h</span>
                    </div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Watch Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#1a2332] rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "favorites"
                  ? "bg-[#f5c518] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill={activeTab === "favorites" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === "favorites" ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-[#f5c518] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch History ({uniqueAnimeWatched})
            </button>
          </div>

          {/* Content */}
          <div className="pb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-3 border-[#f5c518] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Loading your collection...</p>
            </div>
          ) : activeTab === "favorites" ? (
            /* Favorites Grid */
            favorites.length === 0 ? (
              <div className="text-center py-20 bg-[#1a2332]/30 rounded-2xl">
                <div className="relative inline-block mb-6">
                  <div className="relative w-20 h-20 bg-[#0f1729] rounded-full flex items-center justify-center border border-[#2a3441]">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">No favorites yet</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Start building your collection! Add anime to your favorites from any anime detail page.
                </p>
                <Link 
                  href="/anime" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5c518] text-black font-semibold rounded-lg hover:bg-[#d4a817] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Anime
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {favorites.map((fav) => (
                  <div key={fav.id} className="group relative">
                    <Link href={`/anime/${fav.anime_id}`}>
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1a2332] ring-1 ring-[#2a3441] group-hover:ring-[#f5c518]/50 transition-all">
                        {fav.anime_poster ? (
                          <Image
                            src={fav.anime_poster}
                            alt={fav.anime_title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                            No Image
                          </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {fav.anime_type && (
                          <span className="absolute top-2 left-2 bg-[#f5c518] text-black text-xs font-bold px-2 py-0.5 rounded">
                            {fav.anime_type}
                          </span>
                        )}
                        
                        {/* Rating Badge */}
                        {fav.anime_rating && (
                          <span className="absolute top-2 right-10 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                            <svg className="w-3 h-3 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            {fav.anime_rating}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-sm text-white font-medium line-clamp-2 group-hover:text-[#f5c518] transition-colors">
                        {fav.anime_title}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeFavorite(fav.anime_id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      title="Remove from favorites"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Watch History */
            history.length === 0 ? (
              <div className="text-center py-20 bg-[#1a2332]/30 rounded-2xl">
                <div className="relative inline-block mb-6">
                  <div className="relative w-20 h-20 bg-[#0f1729] rounded-full flex items-center justify-center border border-[#2a3441]">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">No watch history yet</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Your watch history will appear here once you start watching anime.
                </p>
                <Link 
                  href="/trending" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5c518] text-black font-semibold rounded-lg hover:bg-[#d4a817] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Explore Trending
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400 text-sm">
                    {uniqueAnimeWatched} anime • {totalEpisodesWatched} episodes watched
                  </p>
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.values(historyByAnime).map(({ anime, episodes }) => (
                    <div key={anime.anime_id} className="bg-gradient-to-r from-[#1a2332] to-[#1a2332]/50 rounded-xl p-4 flex gap-4 group hover:from-[#1a2332] hover:to-[#232d3f]/50 transition-all ring-1 ring-[#2a3441]/50 hover:ring-[#f5c518]/20">
                      <Link href={`/anime/${anime.anime_id}`} className="flex-shrink-0">
                        <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-[#0f1729] ring-1 ring-[#2a3441] group-hover:ring-[#f5c518]/30 transition-all">
                          {anime.anime_poster ? (
                            <Image src={anime.anime_poster} alt={anime.anime_title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">N/A</div>
                          )}
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-[#f5c518] flex items-center justify-center">
                              <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/anime/${anime.anime_id}`} className="text-white font-bold hover:text-[#f5c518] transition-colors line-clamp-1 text-lg">
                          {anime.anime_title}
                        </Link>
                        <p className="text-gray-500 text-xs mt-1 mb-3">
                          {episodes.length} episode{episodes.length > 1 ? 's' : ''} watched
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {episodes.slice(0, 8).map((ep) => (
                            <Link
                              key={ep.id}
                              href={buildWatchUrl(ep.episode_id)}
                              className="px-2.5 py-1 bg-[#0f1729] hover:bg-[#f5c518] hover:text-black text-gray-300 text-xs font-bold rounded transition-colors"
                            >
                              EP {ep.episode_number}
                            </Link>
                          ))}
                          {episodes.length > 8 && (
                            <span className="px-3 py-1.5 text-gray-500 text-xs font-medium">
                              +{episodes.length - 8} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <svg className="w-3.5 h-3.5 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-400 text-xs">
                            Last watched: {new Date(episodes[0].watched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

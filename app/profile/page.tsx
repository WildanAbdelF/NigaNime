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
        if (activeTab === "favorites") {
          const res = await fetch("/api/user/favorites");
          const json = await res.json();
          setFavorites(json.data || []);
        } else {
          const res = await fetch("/api/user/history?limit=100");
          const json = await res.json();
          setHistory(json.data || []);
        }
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
        <div className="w-8 h-8 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />
      <main className="pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Profile Header */}
          <div className="flex items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-[#f5c518] flex items-center justify-center text-black text-2xl font-bold overflow-hidden">
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                (user.user_metadata?.name || user.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {user.user_metadata?.name || user.email?.split("@")[0]}
              </h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="ml-auto text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#1a2332] rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "favorites"
                  ? "bg-[#f5c518] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ♥ Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-[#f5c518] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ⏱ Watch History
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === "favorites" ? (
            /* Favorites Grid */
            favorites.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-400 text-lg">No favorites yet</p>
                <p className="text-gray-600 text-sm mt-1">
                  Add anime to your favorites from the anime detail page
                </p>
                <Link href="/anime" className="inline-block mt-4 text-[#f5c518] hover:underline">
                  Browse Anime →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {favorites.map((fav) => (
                  <div key={fav.id} className="group relative">
                    <Link href={`/anime/${fav.anime_id}`}>
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a2332]">
                        {fav.anime_poster ? (
                          <Image
                            src={fav.anime_poster}
                            alt={fav.anime_title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                            No Image
                          </div>
                        )}
                        {fav.anime_type && (
                          <span className="absolute top-2 left-2 bg-[#f5c518] text-black text-xs font-bold px-2 py-0.5 rounded">
                            {fav.anime_type}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm text-white font-medium line-clamp-2 group-hover:text-[#f5c518] transition-colors">
                        {fav.anime_title}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeFavorite(fav.anime_id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from favorites"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-lg">No watch history yet</p>
                <p className="text-gray-600 text-sm mt-1">
                  Start watching anime to build your history
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Clear All History
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.values(historyByAnime).map(({ anime, episodes }) => (
                    <div key={anime.anime_id} className="bg-[#1a2332] rounded-lg p-4 flex gap-4">
                      <Link href={`/anime/${anime.anime_id}`} className="flex-shrink-0">
                        <div className="relative w-16 h-24 rounded overflow-hidden bg-[#0f1729]">
                          {anime.anime_poster ? (
                            <Image src={anime.anime_poster} alt={anime.anime_title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">N/A</div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/anime/${anime.anime_id}`} className="text-white font-bold hover:text-[#f5c518] transition-colors line-clamp-1">
                          {anime.anime_title}
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {episodes.slice(0, 10).map((ep) => (
                            <Link
                              key={ep.id}
                              href={buildWatchUrl(ep.episode_id)}
                              className="px-2.5 py-1 bg-[#0f1729] hover:bg-[#f5c518] hover:text-black text-gray-300 text-xs font-bold rounded transition-colors"
                            >
                              EP {ep.episode_number}
                            </Link>
                          ))}
                          {episodes.length > 10 && (
                            <span className="px-2.5 py-1 text-gray-500 text-xs">
                              +{episodes.length - 10} more
                            </span>
                          )}
                        </div>
                        <p className="text-[#f5c518] text-xs font-semibold mt-2">
                          Last watched: {new Date(episodes[0].watched_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
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
        <div className="w-8 h-8 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

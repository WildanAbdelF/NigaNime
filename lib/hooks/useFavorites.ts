"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "./useUser";

interface Favorite {
  id: string;
  anime_id: string;
  anime_title: string;
  anime_poster: string | null;
  anime_type: string | null;
  anime_rating: string | null;
  created_at: string;
}

export function useFavorites() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavorites([]); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorites");
      const json = await res.json();
      setFavorites(json.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (animeId: string) => favorites.some((f) => f.anime_id === animeId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (anime: { id: string; title: string; poster?: string; type?: string; rating?: string }) => {
      if (!user) return false;
      const exists = isFavorite(anime.id);

      if (exists) {
        await fetch(`/api/user/favorites?anime_id=${anime.id}`, { method: "DELETE" });
        setFavorites((prev) => prev.filter((f) => f.anime_id !== anime.id));
      } else {
        const res = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anime_id: anime.id,
            anime_title: anime.title,
            anime_poster: anime.poster || null,
            anime_type: anime.type || null,
            anime_rating: anime.rating || null,
          }),
        });
        const json = await res.json();
        if (json.data) {
          setFavorites((prev) => [json.data, ...prev]);
        }
      }
      return !exists; // returns new state: true = added, false = removed
    },
    [user, isFavorite]
  );

  return { favorites, loading, isFavorite, toggleFavorite, refetch: fetchFavorites };
}

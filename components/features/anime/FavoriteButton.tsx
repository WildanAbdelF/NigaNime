"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";

interface FavoriteButtonProps {
  animeId: string;
  animeTitle: string;
  animePoster?: string;
  animeType?: string;
  animeRating?: string;
  className?: string;
}

export default function FavoriteButton({
  animeId,
  animeTitle,
  animePoster,
  animeType,
  animeRating,
  className = "",
}: FavoriteButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if anime is already a favorite
  useEffect(() => {
    if (!user) { setIsFavorite(false); return; }

    fetch("/api/user/favorites")
      .then((r) => r.json())
      .then((json) => {
        const favs = json.data || [];
        setIsFavorite(favs.some((f: { anime_id: string }) => f.anime_id === animeId));
      })
      .catch(() => {});
  }, [user, animeId]);

  const handleClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);

    if (isFavorite) {
      await fetch(`/api/user/favorites?anime_id=${animeId}`, { method: "DELETE" });
      setIsFavorite(false);
    } else {
      await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anime_id: animeId,
          anime_title: animeTitle,
          anime_poster: animePoster || null,
          anime_type: animeType || null,
          anime_rating: animeRating || null,
        }),
      });
      setIsFavorite(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition-colors border ${
        isFavorite
          ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
          : "bg-[#1a2332] hover:bg-[#232d3f] text-white border-gray-700"
      } disabled:opacity-50 ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
    </button>
  );
}

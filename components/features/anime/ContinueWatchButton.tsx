"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLastVisitedEpisode } from "@/lib/utils/watchedHistory";
import { buildWatchUrl } from "@/lib/utils/watchUrl";
import { useUser } from "@/lib/hooks/useUser";

interface ContinueWatchButtonProps {
  animeId: string;
  firstEpisodeId: string;
}

export default function ContinueWatchButton({ animeId, firstEpisodeId }: ContinueWatchButtonProps) {
  const [href, setHref] = useState(buildWatchUrl(firstEpisodeId));
  const [label, setLabel] = useState("Watch Now");
  const { user } = useUser();

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      // 1. Try Supabase history if logged in
      if (user) {
        try {
          const res = await fetch(`/api/user/history?anime_id=${encodeURIComponent(animeId)}&limit=1`);
          if (res.ok) {
            const json = await res.json();
            const last = json.data?.[0];
            if (last && !cancelled) {
              setHref(buildWatchUrl(last.episode_id));
              setLabel(`Continue EP ${last.episode_number}`);
              return;
            }
          }
        } catch { /* fall through to localStorage */ }
      }

      // 2. Fallback to localStorage
      const local = getLastVisitedEpisode(animeId);
      if (local && !cancelled) {
        setHref(buildWatchUrl(local.episodeId));
        setLabel(`Continue EP ${local.episodeNumber}`);
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [animeId, user]);

  return (
    <Link
      href={href}
      className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition-colors bg-[#f5c518] hover:bg-[#d4a817] text-black"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
      {label}
    </Link>
  );
}

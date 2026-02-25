"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLastVisitedEpisode } from "@/lib/utils/watchedHistory";
import { buildWatchUrl } from "@/lib/utils/watchUrl";

interface ContinueWatchButtonProps {
  animeId: string;
  firstEpisodeId: string;
}

export default function ContinueWatchButton({ animeId, firstEpisodeId }: ContinueWatchButtonProps) {
  const [href, setHref] = useState(buildWatchUrl(firstEpisodeId));
  const [label, setLabel] = useState("Watch Now");

  useEffect(() => {
    const last = getLastVisitedEpisode(animeId);
    if (last) {
      setHref(buildWatchUrl(last.episodeId));
      setLabel(`Continue EP ${last.episodeNumber}`);
    }
  }, [animeId]);

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

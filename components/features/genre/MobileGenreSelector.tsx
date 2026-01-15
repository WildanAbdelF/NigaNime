"use client";

import { useRouter } from "next/navigation";

interface MobileGenreSelectorProps {
  genres: string[];
  selectedGenre: string;
}

export default function MobileGenreSelector({ genres, selectedGenre }: MobileGenreSelectorProps) {
  const router = useRouter();

  return (
    <select
      className="w-full rounded-xl bg-[#1a2332] border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-[#f5c518]"
      value={selectedGenre}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value ? `/genre?g=${value}` : "/genre");
      }}
    >
      <option value="">Select Genre</option>
      {genres.map((genre) => {
        const slug = genre.toLowerCase().replace(/\s+/g, "-");
        return (
          <option key={genre} value={slug}>
            {genre}
          </option>
        );
      })}
    </select>
  );
}

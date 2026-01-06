"use client";

import Image from "next/image";
import Link from "next/link";
import type { Recommendation } from "@/types/anime";

interface RecommendationSectionProps {
  recommendations: Recommendation[];
}

export default function RecommendationSection({ recommendations }: RecommendationSectionProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
        <svg className="w-5 h-5 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        Recommendations
      </h2>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {recommendations.slice(0, 12).map((rec) => (
            <Link
              key={rec.entry.mal_id}
              href={`/anime/${rec.entry.mal_id}`}
              className="flex-shrink-0 w-36 group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                {rec.entry.images?.jpg?.large_image_url ? (
                  <Image
                    src={rec.entry.images.jpg.large_image_url}
                    alt={rec.entry.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a2332] flex items-center justify-center text-gray-600 text-xs">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Votes Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {rec.votes}
                </div>
              </div>
              <h3 className="text-sm text-white line-clamp-2 group-hover:text-[#f5c518] transition-colors">
                {rec.entry.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

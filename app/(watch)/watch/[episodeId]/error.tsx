"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";

export default function WatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Watch Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f1729] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Failed to Load Player</h2>
            <p className="text-gray-400 text-sm">
              An error occurred while loading this episode. Please try refreshing or switching to another server.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#1a2332] hover:bg-[#232d3f] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors border border-gray-700 text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

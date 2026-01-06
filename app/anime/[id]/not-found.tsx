import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";

export default function AnimeNotFound() {
  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main className="pt-16">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-8xl mb-6">😔</div>
            <h1 className="font-heading text-3xl font-bold text-white mb-4">
              Anime Not Found
            </h1>
            <p className="text-gray-400 mb-8">
              The anime you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

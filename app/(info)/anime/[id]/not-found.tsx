import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f1729] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-[#f5c518] mb-4">404</h1>
            <h2 className="text-4xl font-bold mb-4">Anime Not Found</h2>
            <p className="text-gray-400 text-lg mb-8">
              Oops! We couldn't find the anime you're looking for. It might have been removed or the ID might be incorrect.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/anime"
              className="inline-flex items-center justify-center gap-2 bg-[#f5c518] hover:bg-[#d4a817] text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
              Browse All Anime
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#1a2332] hover:bg-[#232d3f] text-white font-semibold px-8 py-3 rounded-lg transition-colors border border-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Go to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

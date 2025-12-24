export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center py-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            NigaNime
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-8">
            Discover your favorite anime. Explore rankings, seasonal anime, and more.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition-colors">
              Explore Anime
            </button>
            <button className="px-8 py-3 border border-zinc-600 hover:border-zinc-400 rounded-full font-semibold transition-colors">
              Browse Seasonal
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Top Anime</h3>
            <p className="text-zinc-400">
              Discover the highest-rated anime of all time based on user scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700">
            <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Seasonal Anime</h3>
            <p className="text-zinc-400">
              Stay updated with currently airing and upcoming anime each season.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Search & Filter</h3>
            <p className="text-zinc-400">
              Find anime by genre, year, rating, and more with powerful search.
            </p>
          </div>
        </div>

        {/* API Credit */}
        <div className="text-center py-8 text-zinc-500">
          <p>
            Powered by{" "}
            <a 
              href="https://jikan.moe/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Jikan API
            </a>
            {" "}- Unofficial MyAnimeList API
          </p>
        </div>
      </main>
    </div>
  );
}

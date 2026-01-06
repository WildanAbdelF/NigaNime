import { Navbar, Footer } from "@/components/layout";
import { HeroSlider, TrendingSection, ScheduleSection } from "@/components/home";
import { topService } from "@/lib/api";
import type { Anime } from "@/types/anime";

export default async function Home() {
  // Fetch data from API
  let rankedAnimes: Anime[] = [];
  let trendingAnimes: Anime[] = [];

  try {
    // Fetch top ranked anime (by score) and top airing in parallel
    const [rankedResponse, trendingResponse] = await Promise.allSettled([
      topService.getTopByScore({ limit: 10 }),
      topService.getTopAiring({ limit: 24 }),
    ]);

    // Extract top 10 ranked anime for slider
    if (rankedResponse.status === "fulfilled" && rankedResponse.value?.data) {
      rankedAnimes = rankedResponse.value.data.slice(0, 10);
    }

    // Extract trending data
    if (trendingResponse.status === "fulfilled" && trendingResponse.value?.data) {
      trendingAnimes = trendingResponse.value.data;
    }

    // Fallback: If no ranked anime, use trending for slider
    if (rankedAnimes.length === 0 && trendingAnimes.length > 0) {
      rankedAnimes = trendingAnimes.slice(0, 10);
    }
  } catch (error) {
    console.error("Error fetching homepage data:", error);
  }

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main>
        {/* Hero Slider with Top Ranked Anime (1-10) */}
        <HeroSlider animes={rankedAnimes} />

        {/* Trending Now Section */}
        <TrendingSection animes={trendingAnimes} />

        {/* Schedule Section */}
        <ScheduleSection />
      </main>

      <Footer />
    </div>
  );
}

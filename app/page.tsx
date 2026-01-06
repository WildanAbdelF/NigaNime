import { Navbar, Footer } from "@/components/layout";
import { HeroSlider, TrendingSection, ScheduleSection } from "@/components/home";
import { seasonService, topService } from "@/lib/api";
import type { Anime } from "@/types/anime";

export default async function Home() {
  // Fetch data from API
  let spotlightAnimes: Anime[] = [];
  let trendingAnimes: Anime[] = [];

  try {
    // Fetch spotlight, trending, and popular anime in parallel
    const [spotlightResponse, trendingResponse] = await Promise.allSettled([
      seasonService.getSpotlight(10),
      topService.getTopAiring({ limit: 24 }),
    ]);

    // Extract spotlight data (top airing for slider)
    if (spotlightResponse.status === "fulfilled" && spotlightResponse.value?.data) {
      spotlightAnimes = spotlightResponse.value.data.slice(0, 5);
    }

    // Extract trending data
    if (trendingResponse.status === "fulfilled" && trendingResponse.value?.data) {
      trendingAnimes = trendingResponse.value.data;
    }

    // Fallback: If no spotlight, use trending for slider
    if (spotlightAnimes.length === 0 && trendingAnimes.length > 0) {
      spotlightAnimes = trendingAnimes.slice(0, 5);
    }
  } catch (error) {
    console.error("Error fetching homepage data:", error);
  }

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main>
        {/* Hero Slider with Popular/Spotlight Anime */}
        <HeroSlider animes={spotlightAnimes} />

        {/* Trending Now Section */}
        <TrendingSection animes={trendingAnimes} />

        {/* Schedule Section */}
        <ScheduleSection />
      </main>

      <Footer />
    </div>
  );
}

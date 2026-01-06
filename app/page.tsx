import { Navbar, Footer } from "@/components/layout";
import { SpotlightSlider, TrendingSection, ScheduleSection } from "@/components/home";
import { hianimeService, topService } from "@/lib/api";
import type { Anime } from "@/types/anime";
import type { SpotlightAnime } from "@/types/hianime";

export default async function Home() {
  // Fetch data from API
  let spotlightAnimes: SpotlightAnime[] = [];
  let trendingAnimes: Anime[] = [];

  try {
    // Fetch HiAnime spotlight and Jikan top airing in parallel
    const [hianimeResponse, trendingResponse] = await Promise.allSettled([
      hianimeService.getHome(),
      topService.getTopAiring({ limit: 24 }),
    ]);

    // Extract spotlight data from HiAnime
    if (hianimeResponse.status === "fulfilled" && hianimeResponse.value?.success) {
      spotlightAnimes = hianimeResponse.value.data.spotlightAnimes || [];
    }

    // Extract trending data from Jikan
    if (trendingResponse.status === "fulfilled" && trendingResponse.value?.data) {
      trendingAnimes = trendingResponse.value.data;
    }
  } catch (error) {
    console.error("Error fetching homepage data:", error);
  }

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar />

      <main>
        {/* Hero Slider with HiAnime Spotlight */}
        <SpotlightSlider spotlights={spotlightAnimes} />

        {/* Trending Now Section */}
        <TrendingSection animes={trendingAnimes} />

        {/* Schedule Section */}
        <ScheduleSection />
      </main>

      <Footer />
    </div>
  );
}

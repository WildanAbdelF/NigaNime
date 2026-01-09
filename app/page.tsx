import { Navbar, Footer } from "@/components/layout";
import { SpotlightSlider, TrendingSection, ScheduleSection } from "@/components/home";
import { hianimeService } from "@/lib/api";
import type { SpotlightAnime, HiAnimeCard } from "@/types/hianime";

export default async function Home() {
  // Fetch data from HiAnime API
  let spotlightAnimes: SpotlightAnime[] = [];
  let trendingAnimes: HiAnimeCard[] = [];

  try {
    const homeResponse = await hianimeService.getHome();

    // Support both success: true and status: 200 response formats
    if (homeResponse?.success || homeResponse?.status === 200) {
      spotlightAnimes = homeResponse.data.spotlightAnimes || [];
      trendingAnimes = homeResponse.data.topAiringAnimes || [];
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

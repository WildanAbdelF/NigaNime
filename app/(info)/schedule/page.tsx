import Link from "next/link";
import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/layout";
import { ScheduleBoard } from "@/components/features/schedule";
import { getScheduleWithArtwork } from "@/lib/schedule";
import type { HiAnimeScheduleItem } from "@/types/api/hianime";

export const metadata: Metadata = {
  title: "Broadcast Schedule | NigaNime",
  description:
    "Plan your anime week with a grid-first view of every simulcast drop pulled live from HiAnime.",
};

async function getInitialSchedule(): Promise<HiAnimeScheduleItem[]> {
  const todayIso = new Date().toISOString().split("T")[0];

  try {
    const { response, scheduledAnimes } = await getScheduleWithArtwork(todayIso);
    if (response?.success || response?.status === 200) {
      return scheduledAnimes;
    }
  } catch (error) {
    console.error("Failed to prefetch schedule page data:", error);
  }

  return [];
}

export default async function SchedulePage() {
  const initialSchedule = await getInitialSchedule();

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-16 space-y-12">
        <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#1a2447] via-[#0e1528] to-[#040915] px-8 py-14 text-center">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -top-24 right-16 h-64 w-64 rounded-full bg-[#f5c518]/20 blur-[120px]" aria-hidden />
            <div className="absolute -bottom-20 left-12 h-60 w-60 rounded-full bg-blue-500/20 blur-[140px]" aria-hidden />
          </div>

          <div className="relative z-10 space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-[#f5c518]">Weekly drop radar</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold">WEEKLY SCHEDULES</h1>
            <p className="mx-auto max-w-3xl text-base text-gray-200">
              Everything that streams this week, reimagined as collectible cards. Swipe through each day, lock
              episodes into your queue, and keep up with both sub and dub premieres without missing a beat.
            </p>

            <div className="grid gap-4 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Live source</p>
                <p className="text-2xl font-semibold font-heading ">HiAnime API</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Coverage</p>
                <p className="text-2xl font-semibold font-heading ">7 Day Queue</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Refresh</p>
                <p className="text-2xl font-semibold font-heading ">Auto Hourly</p>
              </div>
            </div>
          </div>
        </header>

        <ScheduleBoard initialSchedule={initialSchedule} />

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/5 bg-[#0a1224] p-8">
            <p className="text-xs uppercase tracking-[0.4em] text-[#f5c518]">Stay ahead</p>
            <h3 className="mt-3 text-2xl font-semibold">Sync reminders to your calendar</h3>
            <p className="mt-3 text-gray-300">
              Pick your must-watch simulcasts and add them to any calendar app. We recommend locking in episode
              drops at least 15 minutes early to grab seats on your favorite server.
            </p>
            <ul className="mt-6 space-y-3 text-gray-400">
              <li>• Tap a card to jump straight to the anime page.</li>
              <li>• Toggle sub/dub filters from the watch view.</li>
              <li>• Scroll back daily for surprise schedule reshuffles.</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#111c34] via-[#0d1424] to-[#040a16] p-8">
            <p className="text-xs uppercase tracking-[0.4em] text-blue-200">Need something now?</p>
            <h3 className="mt-3 text-2xl font-semibold">Queue fillers while you wait</h3>
            <p className="mt-3 text-gray-300">
              Dive into trending hits or the complete catalog while the clock winds down on your next episode.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/trending"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
              >
                Trending heat list
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/anime"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-white"
              >
                Browse full library
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}

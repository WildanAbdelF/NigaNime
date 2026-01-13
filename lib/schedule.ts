import { hianimeService } from "@/lib/api";
import type { HiAnimeScheduleItem, HiAnimeScheduleResponse } from "@/types/hianime";

interface ScheduleWithArtwork {
  response: HiAnimeScheduleResponse | null;
  scheduledAnimes: HiAnimeScheduleItem[];
}

export async function getScheduleWithArtwork(date: string): Promise<ScheduleWithArtwork> {
  let response: HiAnimeScheduleResponse | null = null;

  try {
    response = await hianimeService.getSchedule(date);
  } catch (error) {
    console.error("Failed to fetch base schedule:", error);
    return { response: null, scheduledAnimes: [] };
  }

  const scheduledAnimes = response?.data?.scheduledAnimes ?? [];

  const enriched = await Promise.all(
    scheduledAnimes.map(async (item) => {
      if (item.poster) return item;

      try {
        const info = await hianimeService.getInfo(item.id);
        const poster =
          info?.data?.anime?.info?.poster ||
          info?.data?.poster ||
          null;

        return poster ? { ...item, poster } : item;
      } catch (error) {
        console.error(`Failed to fetch poster for schedule entry ${item.id}:`, error);
        return item;
      }
    })
  );

  return { response, scheduledAnimes: enriched };
}

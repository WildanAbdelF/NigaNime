import { hianimeService } from "@/lib/api";
import type { HiAnimeScheduleItem, HiAnimeScheduleResponse } from "@/types/api/hianime";

interface ScheduleWithArtwork {
  response: HiAnimeScheduleResponse | null;
  scheduledAnimes: HiAnimeScheduleItem[];
}

/**
 * Fallback parser to directly scrape HiAnime schedule when the upstream API stub returns []
 */
async function fetchScheduleFallback(dateStr: string): Promise<HiAnimeScheduleItem[]> {
  try {
    const url = `https://hianime.at/api/theme/schedule/day?tzOffset=-420&date=${encodeURIComponent(dateStr)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://hianime.at/home",
        "X-Requested-With": "XMLHttpRequest",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) return [];

    const json = await res.json();
    const html = json?.html || "";
    if (!html) return [];

    const items: HiAnimeScheduleItem[] = [];
    const liMatches = html.match(/<li[\s\S]*?<\/li>/gi) || [];

    for (const li of liMatches) {
      const hrefMatch =
        li.match(/href="[^"]*\/watch\/([^"?#]+)/i) ||
        li.match(/href="[^"]*\/anime\/([^"?#]+)/i);
      const id = hrefMatch ? hrefMatch[1] : "";

      const timeMatch = li.match(/<div class="time">([^<]+)<\/div>/i);
      const time = timeMatch ? timeMatch[1].trim() : "";

      const nameMatch = li.match(/<h3 class="film-name[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
      let name = "";
      if (nameMatch) {
        name = nameMatch[1].replace(/<[^>]+>/g, "").trim();
        name = name.replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
      }

      const jnameMatch = li.match(/data-jname="([^"]+)"/i);
      const jname = jnameMatch ? jnameMatch[1] : name;

      const epMatch = li.match(/Episode\s*(\d+)/i);
      const episode = epMatch ? parseInt(epMatch[1], 10) : undefined;

      let secondsUntilAiring = 0;
      let airingTimestamp = Math.floor(Date.now() / 1000);
      if (time) {
        const [h, m] = time.split(":").map(Number);
        const airDate = new Date(`${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+07:00`);
        airingTimestamp = Math.floor(airDate.getTime() / 1000);
        const now = new Date();
        secondsUntilAiring = Math.max(0, Math.floor((airDate.getTime() - now.getTime()) / 1000));
      }

      if (id && name) {
        items.push({
          id,
          time,
          name,
          jname,
          airingTimestamp,
          secondsUntilAiring,
          episode,
        });
      }
    }

    return items;
  } catch (err) {
    console.error("Direct schedule fallback error:", err);
    return [];
  }
}

export async function getScheduleWithArtwork(date: string): Promise<ScheduleWithArtwork> {
  let response: HiAnimeScheduleResponse | null = null;
  let scheduledAnimes: HiAnimeScheduleItem[] = [];

  try {
    response = await hianimeService.getSchedule(date);
    if (response?.data?.scheduledAnimes && response.data.scheduledAnimes.length > 0) {
      scheduledAnimes = response.data.scheduledAnimes;
    }
  } catch (error) {
    console.warn("Failed to fetch base schedule from API service:", error);
  }

  // If upstream API returns empty (e.g. stub implementation), use direct fallback
  if (scheduledAnimes.length === 0) {
    scheduledAnimes = await fetchScheduleFallback(date);
  }

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

  const finalResponse: HiAnimeScheduleResponse = response?.data
    ? {
        ...response,
        data: {
          ...response.data,
          scheduledAnimes: enriched,
        },
      }
    : {
        success: true,
        data: {
          scheduledAnimes: enriched,
        },
      };

  return { response: finalResponse, scheduledAnimes: enriched };
}

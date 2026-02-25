import { NextRequest, NextResponse } from "next/server";
import { HIANIME_CONFIG } from "@/lib/api/config/hianime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// HiAnime base URL for AJAX endpoints
const HIANIME_DOMAINS = [
  "https://hianime.to",
  "https://hianime.nz",
  "https://hianime.tv",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type CategoryKey = "sub" | "dub" | "raw";

interface ServerOption {
  serverName: string;
  serverId: number;
}

interface ServersPayload {
  sub: ServerOption[];
  dub: ServerOption[];
  raw: ServerOption[];
}

/**
 * Fetches the embed URL for a specific server from HiAnime.
 * HiAnime exposes an AJAX endpoint that returns the embed link for a given server ID.
 * This lets us render the Megacloud/Vidcloud embed player directly in an iframe,
 * bypassing the CDN 403 issues that occur with proxy-based streaming.
 */
async function getEmbedUrlFromHiAnime(
  serverId: number,
  episodeId: string
): Promise<string | null> {
  for (const domain of HIANIME_DOMAINS) {
    try {
      const ajaxUrl = `${domain}/ajax/v2/episode/sources?id=${serverId}`;
      console.log(`[Embed] Trying AJAX: ${ajaxUrl}`);

      const response = await fetch(ajaxUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${domain}/watch/${episodeId.split("?")[0]}`,
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.log(`[Embed] ${domain} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log(`[Embed] Response from ${domain}:`, JSON.stringify(data).substring(0, 200));

      if (data?.link) {
        return data.link;
      }
    } catch (error) {
      console.log(`[Embed] Error with ${domain}:`, String(error));
      continue;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const episodeId = request.nextUrl.searchParams.get("episodeId");
  const server = request.nextUrl.searchParams.get("server") || "hd-1";
  const category = (request.nextUrl.searchParams.get("category") || "sub") as CategoryKey;

  if (!episodeId) {
    return NextResponse.json(
      { error: "Episode ID is required" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Get servers from our aniwatch-api to find the server ID
    const serversUrl = `${HIANIME_CONFIG.BASE_URL}/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`;
    console.log(`[Embed] Fetching servers: ${serversUrl}`);

    const serversResponse = await fetch(serversUrl, { cache: "no-store" });

    if (!serversResponse.ok) {
      throw new Error(`Failed to fetch servers: ${serversResponse.status}`);
    }

    const serversResult = await serversResponse.json();
    const serversData: ServersPayload | null = serversResult?.data ?? null;

    if (!serversData) {
      throw new Error("No servers data available");
    }

    // Step 2: Find the matching server
    const categoryServers = serversData[category] || serversData.sub || [];
    const targetServer = categoryServers.find(
      (s) => s.serverName.toLowerCase() === server.toLowerCase()
    );

    if (!targetServer) {
      // Try to find any HD-1 server in any category
      const allServers = [
        ...serversData.sub,
        ...serversData.dub,
        ...serversData.raw,
      ];
      const fallbackServer = allServers.find(
        (s) => s.serverName.toLowerCase() === server.toLowerCase()
      );

      if (!fallbackServer) {
        return NextResponse.json(
          {
            error: `Server "${server}" not found`,
            availableServers: categoryServers.map((s) => s.serverName),
          },
          { status: 404 }
        );
      }

      // Use the fallback server
      const embedUrl = await getEmbedUrlFromHiAnime(fallbackServer.serverId, episodeId);

      return NextResponse.json({
        embedUrl,
        server: fallbackServer.serverName,
        serverId: fallbackServer.serverId,
        category,
      });
    }

    // Step 3: Get embed URL from HiAnime AJAX
    const embedUrl = await getEmbedUrlFromHiAnime(targetServer.serverId, episodeId);

    if (!embedUrl) {
      return NextResponse.json(
        {
          error: "Could not retrieve embed URL. HiAnime may be blocking requests.",
          embedUrl: null,
          server: targetServer.serverName,
          serverId: targetServer.serverId,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      embedUrl,
      server: targetServer.serverName,
      serverId: targetServer.serverId,
      category,
    });
  } catch (error) {
    console.error("[Embed] Error:", error);
    return NextResponse.json(
      { error: String(error), embedUrl: null },
      { status: 500 }
    );
  }
}

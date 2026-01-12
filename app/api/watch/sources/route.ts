import { NextRequest, NextResponse } from "next/server";
import { HIANIME_CONFIG } from "@/lib/api/hianime-config";

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

interface FallbackTarget {
  category: CategoryKey;
  server: string;
  origin: "same-category" | "cross-category";
}

interface RecoveryResult {
  success: boolean;
  payload?: Record<string, unknown>;
  status?: number;
  appliedTarget?: FallbackTarget;
  attemptedTargets: FallbackTarget[];
}

const CATEGORY_PRIORITY: CategoryKey[] = ["sub", "dub", "raw"];
const RECOVERABLE_STATUS = new Set([403, 404, 500]);
const FALLBACK_SUGGESTIONS = [
  "Player will auto-retry in a few seconds.",
  "Switch to another server/category from the sidebar.",
  "Open the episode with External Player if native playback fails."
];

// Helper function to fetch with retry
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        cache: "no-store",
      });
      
      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      // For server errors (5xx), retry
      if (response.status >= 500) {
        console.log(`Retry ${i + 1}/${maxRetries} - Server returned ${response.status}`);
        lastError = new Error(`Server error: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Retry ${i + 1}/${maxRetries} - Network error:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

const normalizeCategory = (value: string | null): CategoryKey => {
  const normalized = (value || "sub").toLowerCase() as CategoryKey;
  return CATEGORY_PRIORITY.includes(normalized) ? normalized : "sub";
};

async function fetchServerMatrix(episodeId: string): Promise<ServersPayload | null> {
  const url = `${HIANIME_CONFIG.BASE_URL}/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`;
  try {
    const response = await fetchWithRetry(url, 2);
    const text = await response.text();

    if (!response.ok) {
      console.error("Failed to fetch servers for recovery:", text);
      return null;
    }

    const parsed = JSON.parse(text);
    return parsed?.data ?? null;
  } catch (error) {
    console.error("Server matrix recovery failed:", error);
    return null;
  }
}

const buildFallbackQueue = (
  serversPayload: ServersPayload,
  failedServer: string,
  failedCategory: CategoryKey
): FallbackTarget[] => {
  const seen = new Set<string>();
  const queue: FallbackTarget[] = [];
  const orderedCategories: CategoryKey[] = [failedCategory, ...CATEGORY_PRIORITY.filter(cat => cat !== failedCategory)];

  for (const category of orderedCategories) {
    const serverList = serversPayload[category] || [];

    for (const option of serverList) {
      if (category === failedCategory && option.serverName === failedServer) {
        continue;
      }

      const key = `${category}:${option.serverName}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      queue.push({
        category,
        server: option.serverName,
        origin: category === failedCategory ? "same-category" : "cross-category",
      });
    }
  }

  return queue;
};

async function attemptAutoRecovery(
  episodeId: string,
  failedServer: string,
  failedCategory: CategoryKey
): Promise<RecoveryResult> {
  const serversPayload = await fetchServerMatrix(episodeId);
  if (!serversPayload) {
    return { success: false, attemptedTargets: [] };
  }

  const fallbackQueue = buildFallbackQueue(serversPayload, failedServer, failedCategory);
  if (fallbackQueue.length === 0) {
    return { success: false, attemptedTargets: [] };
  }

  const attemptedTargets: FallbackTarget[] = [];

  for (const target of fallbackQueue) {
    attemptedTargets.push(target);
    const apiUrl = `${HIANIME_CONFIG.BASE_URL}/episode/sources?animeEpisodeId=${encodeURIComponent(
      episodeId
    )}&server=${encodeURIComponent(target.server)}&category=${encodeURIComponent(target.category)}`;

    try {
      const fallbackResponse = await fetchWithRetry(apiUrl, 2);
      const fallbackText = await fallbackResponse.text();

      console.log(`Fallback attempt -> ${target.server} (${target.category}) status:`, fallbackResponse.status);

      if (!fallbackResponse.ok) {
        console.warn("Fallback response not OK:", fallbackText.substring(0, 200));
        continue;
      }

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(fallbackText);
      } catch (error) {
        console.error("Fallback JSON parse error:", error);
        continue;
      }

      return {
        success: true,
        payload,
        status: fallbackResponse.status,
        appliedTarget: target,
        attemptedTargets,
      };
    } catch (error) {
      console.error(`Fallback fetch failed for ${target.server} (${target.category}):`, error);
    }
  }

  return { success: false, attemptedTargets };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const episodeId = searchParams.get("episodeId");
  const server = searchParams.get("server") || "hd-1";
  const category: CategoryKey = normalizeCategory(searchParams.get("category"));

  console.log("=== Watch Sources API ===");
  console.log("Raw episodeId:", episodeId);
  console.log("Server:", server);
  console.log("Category:", category);
  console.log("Full URL:", request.url);

  if (!episodeId) {
    return NextResponse.json(
      { error: "Episode ID is required" },
      { status: 400 }
    );
  }

  // Check if episodeId contains the ep parameter
  if (!episodeId.includes("?ep=") && !episodeId.includes("ep=")) {
    console.error("Invalid episode ID format - missing ep parameter:", episodeId);
    return NextResponse.json(
      { error: "Invalid episode ID format. Expected format: anime-id?ep=xxx", received: episodeId },
      { status: 400 }
    );
  }

  try {
    // Build the URL - episodeId may contain ? so we need to encode it properly
    const apiUrl = `${HIANIME_CONFIG.BASE_URL}/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&category=${encodeURIComponent(category)}`;
    
    console.log("Fetching sources from:", apiUrl);

    const response = await fetchWithRetry(apiUrl, 3);

    const responseText = await response.text();
    const truncatedResponse = responseText.substring(0, 500);
    console.log("API Response status:", response.status);
    console.log("API Response:", truncatedResponse);

    if (!response.ok) {
      console.error("API error response:", responseText);

      if (RECOVERABLE_STATUS.has(response.status)) {
        const recoveryResult = await attemptAutoRecovery(episodeId, server, category);

        if (recoveryResult.success && recoveryResult.payload) {
          const payloadWithRecovery = {
            ...recoveryResult.payload,
            recovery: {
              autoSwitch: true,
              triggeredBy: response.status,
              attempted: recoveryResult.attemptedTargets,
              applied: recoveryResult.appliedTarget,
            },
          };

          return NextResponse.json(payloadWithRecovery, {
            status: recoveryResult.status ?? 200,
          });
        }

        return NextResponse.json(
          {
            error: "Streaming source temporarily unavailable after automatic recovery attempts.",
            details: truncatedResponse,
            recovery: {
              triggeredBy: response.status,
              autoRetryAfterMs: 5000,
              attempted: recoveryResult.attemptedTargets,
              suggestions: FALLBACK_SUGGESTIONS,
            },
          },
          {
            status: response.status,
            headers: { "Retry-After": "5" },
          }
        );
      }
      
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: truncatedResponse },
        { status: response.status }
      );
    }

    // Parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse JSON:", responseText);
      return NextResponse.json(
        { error: "Invalid JSON response from API" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch streaming sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch streaming sources", details: String(error) },
      { status: 500 }
    );
  }
}

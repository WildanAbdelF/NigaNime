import { NextResponse } from "next/server";
import { HIANIME_CONFIG } from "@/lib/api/config/hianime-config";

type EndpointCheck = {
  key: string;
  url: string;
  status: number;
  ok: boolean;
  durationMs: number;
  summary: string;
};

const ENDPOINTS: Array<{ key: string; path: string }> = [
  { key: "home", path: "/home" },
  { key: "search", path: "/search?keyword=naruto" },
  { key: "searchSuggestion", path: "/search/suggestions?keyword=naruto" },
  { key: "schedule", path: "/schedule?date=2026-03-16" },
  { key: "categoryMostPopular", path: "/category/most-popular?page=1" },
  { key: "categoryTopAiring", path: "/category/top-airing?page=1" },
];

function summarizePayload(data: any): string {
  if (!data || typeof data !== "object") return "empty payload";

  const payload = data.data ?? data;

  if (Array.isArray(payload?.animes)) {
    return `animes=${payload.animes.length}`;
  }

  if (Array.isArray(payload?.scheduledAnimes)) {
    return `scheduledAnimes=${payload.scheduledAnimes.length}`;
  }

  if (Array.isArray(payload?.suggestions)) {
    return `suggestions=${payload.suggestions.length}`;
  }

  if (Array.isArray(payload?.spotlightAnimes) || Array.isArray(payload?.topAiringAnimes)) {
    const spotlight = Array.isArray(payload.spotlightAnimes) ? payload.spotlightAnimes.length : 0;
    const topAiring = Array.isArray(payload.topAiringAnimes) ? payload.topAiringAnimes.length : 0;
    return `spotlight=${spotlight}, topAiring=${topAiring}`;
  }

  return "payload received";
}

async function checkEndpoint(path: string, key: string): Promise<EndpointCheck> {
  const url = `${HIANIME_CONFIG.BASE_URL}${path}`;
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    const durationMs = Date.now() - startedAt;

    let summary = "no body";
    try {
      const json = await response.json();
      summary = summarizePayload(json);
    } catch {
      summary = "non-JSON response";
    }

    return {
      key,
      url,
      status: response.status,
      ok: response.ok,
      durationMs,
      summary,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    return {
      key,
      url,
      status: 0,
      ok: false,
      durationMs,
      summary: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  const checks = await Promise.all(ENDPOINTS.map((endpoint) => checkEndpoint(endpoint.path, endpoint.key)));

  const failed = checks.filter((item) => !item.ok).length;
  const allEmpty = checks.every((item) => item.summary.includes("=0"));

  return NextResponse.json({
    success: failed === 0,
    upstream: HIANIME_CONFIG.BASE_URL,
    checkedAt: new Date().toISOString(),
    failedChecks: failed,
    allDataLikelyEmpty: allEmpty,
    checks,
  });
}

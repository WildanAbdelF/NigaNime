const baseUrl = process.env.HIANIME_API_BASE_URL || process.env.NEXT_PUBLIC_HIANIME_API_BASE_URL || "https://niganime-api-v2.vercel.app/api";

const endpoints = [
  ["home", "/home"],
  ["search", "/search?keyword=naruto"],
  ["searchSuggestion", "/search/suggestions?keyword=naruto"],
  ["schedule", "/schedule?date=2026-03-16"],
  ["categoryMostPopular", "/category/most-popular?page=1"],
  ["categoryTopAiring", "/category/top-airing?page=1"],
];

function summarizePayload(data) {
  const payload = data?.data ?? data;

  if (Array.isArray(payload?.animes)) return `animes=${payload.animes.length}`;
  if (Array.isArray(payload?.suggestions)) return `suggestions=${payload.suggestions.length}`;
  if (Array.isArray(payload?.scheduledAnimes)) return `scheduledAnimes=${payload.scheduledAnimes.length}`;

  if (Array.isArray(payload?.spotlightAnimes) || Array.isArray(payload?.topAiringAnimes)) {
    const spotlight = Array.isArray(payload?.spotlightAnimes) ? payload.spotlightAnimes.length : 0;
    const topAiring = Array.isArray(payload?.topAiringAnimes) ? payload.topAiringAnimes.length : 0;
    return `spotlight=${spotlight}, topAiring=${topAiring}`;
  }

  return "payload received";
}

async function check(key, path) {
  const url = `${baseUrl}${path}`;
  const start = Date.now();

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    const took = Date.now() - start;
    let summary = "no body";

    try {
      const body = await response.json();
      summary = summarizePayload(body);
    } catch {
      summary = "non-JSON response";
    }

    return { key, status: response.status, ok: response.ok, took, summary, url };
  } catch (error) {
    const took = Date.now() - start;
    return {
      key,
      status: 0,
      ok: false,
      took,
      summary: error instanceof Error ? error.message : String(error),
      url,
    };
  }
}

console.log(`Testing upstream: ${baseUrl}`);

const results = await Promise.all(endpoints.map(([key, path]) => check(key, path)));

for (const result of results) {
  const statusText = result.status === 0 ? "ERR" : String(result.status);
  console.log(`${result.key.padEnd(20)} ${statusText.padEnd(4)} ok=${String(result.ok).padEnd(5)} ${String(result.took).padStart(4)}ms  ${result.summary}`);
}

const failed = results.filter((r) => !r.ok).length;
const allEmpty = results.every((r) => r.summary.includes("=0"));

console.log(`\nfailedChecks=${failed} allDataLikelyEmpty=${allEmpty}`);
if (failed > 0) {
  process.exitCode = 1;
}

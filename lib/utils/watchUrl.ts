export function buildWatchUrl(
  episodeId: string,
  opts?: { server?: string; category?: string }
): string {
  const [idPart, queryPart] = episodeId.split("?");
  const params = new URLSearchParams(queryPart || "");

  if (opts?.server) params.set("server", opts.server);
  if (opts?.category) params.set("category", opts.category);

  const queryString = params.toString();
  return `/watch/${idPart}${queryString ? `?${queryString}` : ""}`;
}

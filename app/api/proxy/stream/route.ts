import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Referer": "https://megacloud.blog/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://megacloud.blog",
        "Accept": "*/*",
        "Accept-Encoding": "identity",
      },
    });

    if (!response.ok) {
      console.error(`Proxy fetch failed for ${url}: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const body = await response.arrayBuffer();

    // For M3U8 files, we need to rewrite the URLs to go through our proxy
    if (contentType.includes("mpegurl") || url.endsWith(".m3u8")) {
      let text = new TextDecoder().decode(body);
      
      // Get the base URL for relative paths
      const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
      
      // Replace ALL non-comment lines that look like segment/playlist references
      // Streaming CDNs use various extensions (.ts, .jpg, .html, .js, etc.) as obfuscation
      const lines = text.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (trimmed.startsWith('#') || trimmed === '') {
          return line;
        }
        // This is a segment or playlist URL
        const fullUrl = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
        return `/api/proxy/stream?url=${encodeURIComponent(fullUrl)}`;
      });
      
      text = rewrittenLines.join('\n');

      return new NextResponse(text, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Cache-Control": "no-cache",
        },
      });
    }

    // For TS segments and other files (video data)
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request", details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

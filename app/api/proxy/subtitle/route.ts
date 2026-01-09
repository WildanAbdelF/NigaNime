import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      console.error(`Subtitle fetch failed for ${url}: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch subtitle: ${response.status}` },
        { status: response.status }
      );
    }

    const text = await response.text();
    const contentType = response.headers.get("content-type") || "text/vtt";

    // Determine content type based on URL or response
    let mimeType = "text/vtt";
    if (url.endsWith(".srt") || contentType.includes("srt")) {
      mimeType = "text/plain";
    } else if (url.endsWith(".ass") || url.endsWith(".ssa")) {
      mimeType = "text/plain";
    }

    return new NextResponse(text, {
      headers: {
        "Content-Type": `${mimeType}; charset=utf-8`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Subtitle proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy subtitle", details: String(error) },
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

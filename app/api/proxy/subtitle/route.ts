import { NextRequest, NextResponse } from "next/server";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// Dynamic referer detection based on CDN hostname
function getHeadersForUrl(targetUrl: string): { referer: string; origin: string } {
  try {
    const urlObj = new URL(targetUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    // HiAnime/Megacloud rotating CDN domains
    if (
      hostname.match(/^[a-z]+\d+\.(live|pro|xyz|club|site|online)$/) ||
      hostname.includes('stormshade') ||
      hostname.includes('lightningspark') ||
      hostname.includes('fogtwist') ||
      hostname.includes('biananset') ||
      hostname.includes('megacloud') ||
      hostname.includes('kiwi')
    ) {
      return {
        referer: 'https://megacloud.tv/',
        origin: 'https://megacloud.tv',
      };
    }
    
    // Rabbitstream/Vidcloud
    if (hostname.includes('rabbitstream') || hostname.includes('vidcloud')) {
      return {
        referer: 'https://rabbitstream.net/',
        origin: 'https://rabbitstream.net',
      };
    }
    
    return {
      referer: `${urlObj.protocol}//${urlObj.host}/`,
      origin: `${urlObj.protocol}//${urlObj.host}`,
    };
  } catch {
    return {
      referer: 'https://megacloud.tv/',
      origin: 'https://megacloud.tv',
    };
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const { referer, origin } = getHeadersForUrl(url);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Referer": referer,
        "Origin": origin,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
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

import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime - Edge was getting blocked by CDN
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Dynamic referer detection based on CDN hostname
function getHeadersForUrl(targetUrl: string): { referer: string; origin: string | null } {
  try {
    const urlObj = new URL(targetUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    // HiAnime/Megacloud rotating CDN domains
    // Patterns: stormshade84.live, lightningspark77.pro, fogtwist21.xyz, rainveil36.xyz, sunshinerays42.xyz, etc.
    if (
      hostname.match(/^[a-z]+\d+\.(live|pro|xyz|club|site|online)$/) ||
      hostname.includes('stormshade') ||
      hostname.includes('lightningspark') ||
      hostname.includes('fogtwist') ||
      hostname.includes('rainveil') ||
      hostname.includes('biananset') ||
      hostname.includes('sunshinerays') ||
      hostname.includes('haildrop') ||
      hostname.includes('kiwi') ||
      hostname.includes('listeamed') ||
      hostname.includes('akamaized') ||
      hostname.includes('cloudfront')
    ) {
      // Megacloud CDN - try without Origin header
      return {
        referer: 'https://embed.megacloud.club/',
        origin: null,
      };
    }
    
    // Megacloud direct domains
    if (hostname.includes('megacloud') || hostname.includes('rapid-cloud')) {
      return {
        referer: 'https://embed.megacloud.club/',
        origin: null,
      };
    }
    
    // Rabbitstream/Vidcloud (HD-2 server)
    if (hostname.includes('rabbitstream') || hostname.includes('vidcloud') || hostname.includes('dokicloud')) {
      return {
        referer: 'https://rabbitstream.net/',
        origin: 'https://rabbitstream.net',
      };
    }
    
    // Gogoanime CDNs
    if (hostname.includes('gogocdn') || hostname.includes('playgo') || hostname.includes('gogoanime')) {
      return {
        referer: 'https://gogoanime3.co/',
        origin: 'https://gogoanime3.co',
      };
    }
    
    // Default: use target domain as referer
    return {
      referer: `${urlObj.protocol}//${urlObj.host}/`,
      origin: `${urlObj.protocol}//${urlObj.host}`,
    };
  } catch {
    return {
      referer: 'https://embed.megacloud.club/',
      origin: null,
    };
  }
}

// Retry fetch with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 5): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If we get a 403, retry with a longer delay
      if (response.status === 403 && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error("Max retries reached");
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // Get dynamic headers based on target URL
    const { referer, origin } = getHeadersForUrl(url);
    
    // Log untuk debugging
    console.log(`[Proxy] Fetching: ${url.substring(0, 100)}...`);
    console.log(`[Proxy] Using Referer: ${referer}, Origin: ${origin || 'none'}`);
    
    // Build headers dynamically
    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      "Referer": referer,
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "identity",
      "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
    };
    
    // Only add Origin if specified (Megacloud works better without it)
    if (origin) {
      headers["Origin"] = origin;
    }
    
    const response = await fetchWithRetry(url, { headers });

    if (!response.ok) {
      console.error(`[Proxy] Failed - Status: ${response.status}, URL: ${url.substring(0, 100)}`);
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

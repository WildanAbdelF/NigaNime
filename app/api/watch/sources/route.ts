import { NextRequest, NextResponse } from "next/server";
import { HIANIME_CONFIG } from "@/lib/api/hianime-config";

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const episodeId = searchParams.get("episodeId");
  const server = searchParams.get("server") || "hd-1";
  const category = searchParams.get("category") || "sub";

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
    console.log("API Response status:", response.status);
    console.log("API Response:", responseText.substring(0, 500));

    if (!response.ok) {
      console.error("API error response:", responseText);
      
      // Try alternative server if primary fails
      if (response.status === 403 || response.status === 500) {
        return NextResponse.json(
          { error: "Streaming source temporarily unavailable. Try a different server or use External Player.", details: responseText },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: responseText },
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

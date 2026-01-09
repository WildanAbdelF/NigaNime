import { NextRequest, NextResponse } from "next/server";
import { HIANIME_CONFIG } from "@/lib/api/hianime-config";

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

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const responseText = await response.text();
    console.log("API Response status:", response.status);
    console.log("API Response:", responseText.substring(0, 500));

    if (!response.ok) {
      console.error("API error response:", responseText);
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

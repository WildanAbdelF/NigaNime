import { NextRequest, NextResponse } from "next/server";
import { HIANIME_CONFIG } from "@/lib/api/hianime-config";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const episodeId = searchParams.get("episodeId");

  if (!episodeId) {
    return NextResponse.json(
      { error: "Episode ID is required" },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `${HIANIME_CONFIG.BASE_URL}/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`;
    console.log("Fetching servers from:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const responseText = await response.text();
    console.log("Servers API Response status:", response.status);

    if (!response.ok) {
      console.error("Servers API error response:", responseText);
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: responseText },
        { status: response.status }
      );
    }

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
    console.error("Failed to fetch episode servers:", error);
    return NextResponse.json(
      { error: "Failed to fetch episode servers", details: String(error) },
      { status: 500 }
    );
  }
}

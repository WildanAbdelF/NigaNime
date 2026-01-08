import { NextRequest, NextResponse } from "next/server";
import { HIANIME_CONFIG, HIANIME_ENDPOINTS } from "@/lib/api/hianime-config";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ data: { suggestions: [] } });
  }

  try {
    const response = await fetch(
      `${HIANIME_CONFIG.BASE_URL}${HIANIME_ENDPOINTS.SEARCH_SUGGESTION}?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch search suggestions:", error);
    return NextResponse.json(
      { data: { suggestions: [] }, error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

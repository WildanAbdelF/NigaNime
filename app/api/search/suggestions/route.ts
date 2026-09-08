import { NextRequest, NextResponse } from "next/server";
import { HIANIME_CONFIG, HIANIME_ENDPOINTS } from "@/lib/api/config/hianime-config";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const emptyPayload = { data: { suggestions: [] } };

  if (!query || query.length < 2) {
    return NextResponse.json(emptyPayload);
  }

  try {
    const response = await fetch(
      `${HIANIME_CONFIG.BASE_URL}${HIANIME_ENDPOINTS.SEARCH_SUGGESTION}?keyword=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      console.warn("Suggestions upstream returned non-OK status:", response.status);
      return NextResponse.json(emptyPayload);
    }

    const data = await response.json();
    return NextResponse.json(data ?? emptyPayload);
  } catch (error) {
    console.error("Failed to fetch search suggestions:", error);
    return NextResponse.json(emptyPayload);
  }
}

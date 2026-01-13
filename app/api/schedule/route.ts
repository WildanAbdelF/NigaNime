import { NextRequest, NextResponse } from "next/server";
import { getScheduleWithArtwork } from "@/lib/schedule";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { success: false, error: "Date parameter is required" },
      { status: 400 }
    );
  }

  try {
    const { response, scheduledAnimes } = await getScheduleWithArtwork(date);

    if (!response) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch schedule" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: response.success || response.status === 200,
      data: { scheduledAnimes }
    });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

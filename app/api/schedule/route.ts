import { NextRequest, NextResponse } from "next/server";
import { hianimeService } from "@/lib/api/services";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date"); // Format: YYYY-MM-DD

  try {
    // Use provided date or default to today
    const targetDate = date || new Date().toISOString().split("T")[0];
    const data = await hianimeService.getSchedule(targetDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedule", data: { scheduledAnimes: [] } },
      { status: 500 }
    );
  }
}

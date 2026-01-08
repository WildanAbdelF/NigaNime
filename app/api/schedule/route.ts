import { NextRequest, NextResponse } from "next/server";
import { hianimeService } from "@/lib/api";

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
    const response = await hianimeService.getSchedule(date);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

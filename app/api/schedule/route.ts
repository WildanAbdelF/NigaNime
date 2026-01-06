import { NextRequest, NextResponse } from "next/server";
import { scheduleService } from "@/lib/api";

type DayName = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const day = searchParams.get("day") as DayName | null;

  try {
    // If day is provided, fetch for that specific day
    if (day) {
      const data = await scheduleService.getScheduleByDay(day);
      return NextResponse.json(data);
    }
    
    // Otherwise get today's schedule
    const data = await scheduleService.getTodaySchedule();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule", data: [] },
      { status: 500 }
    );
  }
}

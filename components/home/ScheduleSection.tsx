"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import type { HiAnimeScheduleItem } from "@/types/hianime";

interface ScheduleSectionProps {
  initialSchedule?: HiAnimeScheduleItem[];
}

// Generate dates for the week
function getWeekDays() {
  const days = [];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      label: i === 0 ? "Today" : dayLabels[date.getDay()],
      date: date.toISOString().split("T")[0], // YYYY-MM-DD format
      fullDate: date,
    });
  }
  return days;
}

export default function ScheduleSection({ initialSchedule = [] }: ScheduleSectionProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [schedule, setSchedule] = useState<HiAnimeScheduleItem[]>(initialSchedule);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [timezone, setTimezone] = useState("");

  // Memoize weekDays to avoid recreation on every render
  const weekDays = useMemo(() => getWeekDays(), []);

  // Get user timezone
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const sign = offset <= 0 ? "+" : "-";
    setTimezone(`${tz} (GMT${sign}${hours})`);
  }, []);

  // Fetch schedule when day changes
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(false);
      try {
        const selectedDate = weekDays[activeDay].date;
        const response = await fetch(`/api/schedule?date=${selectedDate}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.scheduledAnimes) {
            setSchedule(data.data.scheduledAnimes);
          } else {
            setSchedule([]);
          }
        } else {
          setError(true);
          setSchedule([]);
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError(true);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [activeDay, weekDays]);

  // Format time until airing
  const formatTimeUntil = (seconds: number) => {
    if (seconds <= 0) return "Airing now";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <section className="py-10 bg-[#0a0f1a]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Schedule
            </h2>
          </div>

          <div className="text-gray-400 text-sm">
            Your timezone: <span className="text-white">{timezone || "Loading..."}</span>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
          {weekDays.map((day, index) => (
            <button
              key={day.date}
              onClick={() => setActiveDay(index)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeDay === index
                  ? "bg-[#f5c518] text-black"
                  : "bg-[#1a2332] text-gray-300 hover:bg-[#232d3f]"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse flex items-center gap-4 bg-[#1a2332] rounded-lg p-4">
                <div className="w-16 h-16 bg-[#232d3f] rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-[#232d3f] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#232d3f] rounded w-1/2" />
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Schedule not available</p>
                <p className="text-sm text-gray-600 mt-2">Check back later for updated schedules</p>
              </div>
            </div>
          ) : schedule.length > 0 ? (
            schedule.slice(0, 10).map((item, index) => (
              <Link
                key={`${item.id}-${index}`}
                href={`/anime/${item.id}`}
                className="flex items-center gap-4 bg-[#1a2332] hover:bg-[#232d3f] rounded-lg p-4 transition-colors group"
              >
                {/* Time */}
                <div className="text-center min-w-[60px]">
                  <span className="text-[#f5c518] font-bold text-lg">{item.time}</span>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatTimeUntil(item.secondsUntilAiring)}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px h-12 bg-[#2a3441]" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-[#f5c518] transition-colors">
                    {item.name}
                  </h3>
                  {item.jname && (
                    <p className="text-gray-500 text-xs line-clamp-1 mt-1">
                      {item.jname}
                    </p>
                  )}
                </div>

                {/* Episode */}
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-[#f5c518]/20 text-[#f5c518] text-xs font-bold px-3 py-1 rounded-full">
                    EP {item.airingEpisode}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            // Empty state
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No scheduled anime for {weekDays[activeDay].label}</p>
            </div>
          )}
        </div>

        {/* View Full Schedule Link */}
        <div className="text-center mt-8">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            View Full Schedule
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

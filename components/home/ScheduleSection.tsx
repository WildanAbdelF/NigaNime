"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Anime } from "@/types/anime";

interface ScheduleSectionProps {
  initialSchedule?: Anime[];
}

// Generate dates for the week with day names
function getWeekDays() {
  const days = [];
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      label: i === 0 ? "Today" : dayLabels[date.getDay()],
      dayName: dayNames[date.getDay()],
      date: date.toISOString().split("T")[0],
      fullDate: date,
    });
  }
  return days;
}

export default function ScheduleSection({ initialSchedule = [] }: ScheduleSectionProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [schedule, setSchedule] = useState<Anime[]>(initialSchedule);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [timezone, setTimezone] = useState("");

  const weekDays = getWeekDays();

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
        const selectedDay = weekDays[activeDay].dayName;
        const response = await fetch(`/api/schedule?day=${selectedDay}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            setSchedule(data.data);
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
  }, [activeDay]);

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

        {/* Schedule Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-[#1a2332]" />
                <div className="h-4 bg-[#1a2332] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#1a2332] rounded w-1/2" />
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Schedule not available</p>
                <p className="text-sm text-gray-600 mt-2">Check back later for updated schedules</p>
              </div>
            </div>
          ) : schedule.length > 0 ? (
            schedule.slice(0, 8).map((anime) => (
              <Link
                key={anime.mal_id}
                href={`/anime/${anime.mal_id}`}
                className="group"
              >
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3">
                  {/* Time Badge */}
                  {anime.broadcast?.time && (
                    <div className="absolute top-2 right-2 z-10 bg-[#f5c518] text-black text-xs font-bold px-2 py-1 rounded">
                      {anime.broadcast.time}
                    </div>
                  )}

                  {/* Score Badge */}
                  {anime.score && (
                    <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#f5c518]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      {anime.score}
                    </div>
                  )}

                  {anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url ? (
                    <Image
                      src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                      alt={anime.title_english || anime.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a2332] flex items-center justify-center text-gray-600">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">
                      {anime.title_english || anime.title}
                    </h3>
                  </div>
                </div>

                {/* Episode Info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#f5c518] font-semibold">
                    {anime.episodes ? `${anime.episodes} EP` : "Ongoing"}
                  </span>
                  <span className="text-gray-500">{anime.type || "TV"}</span>
                </div>
              </Link>
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-12 text-gray-500">
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

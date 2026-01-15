"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HiAnimeScheduleItem } from "@/types/api/hianime";

interface ScheduleBoardProps {
  initialSchedule?: HiAnimeScheduleItem[];
}

interface WeekDayItem {
  label: string;
  date: string;
  fullLabel: string;
}

const FALLBACK_BACKGROUNDS = [
  "from-[#1f2348] via-[#131833] to-[#080a19]",
  "from-[#1a2b3e] via-[#0f1c2d] to-[#050912]",
  "from-[#2c1f3a] via-[#1a1426] to-[#08050e]",
];

const formatTimeUntil = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "TBA";
  if (seconds <= 0) return "Airing now";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const buildWeekDays = (): WeekDayItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      label: index === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short" }),
      date: date.toISOString().split("T")[0],
      fullLabel: formatter.format(date),
    };
  });
};

export function ScheduleBoard({ initialSchedule = [] }: ScheduleBoardProps) {
  const weekDays = useMemo(() => buildWeekDays(), []);
  const initialDay = weekDays[0]?.date ?? "";

  const [activeDay, setActiveDay] = useState(0);
  const [schedule, setSchedule] = useState<HiAnimeScheduleItem[]>(initialSchedule);
  const [loading, setLoading] = useState(initialSchedule.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [timezoneLabel, setTimezoneLabel] = useState("Loading timezone...");

  const hasSkippedInitialFetch = useRef(false); // Prevent duplicate fetch when SSR provided fresh data

  useEffect(() => {
    setSchedule(initialSchedule);
    setLoading(initialSchedule.length === 0);
  }, [initialSchedule]);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offsetMinutes = new Date().getTimezoneOffset();
    const absoluteOffset = Math.abs(Math.floor(offsetMinutes / 60))
      .toString()
      .padStart(2, "0");
    const sign = offsetMinutes <= 0 ? "+" : "-";
    setTimezoneLabel(`${tz} (GMT${sign}${absoluteOffset})`);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      const selectedDate = weekDays[activeDay]?.date;
      if (!selectedDate) return;

      if (!hasSkippedInitialFetch.current && initialSchedule.length > 0 && selectedDate === initialDay) {
        hasSkippedInitialFetch.current = true;
        setLoading(false);
        return;
      }

      hasSkippedInitialFetch.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/schedule?date=${selectedDate}`);
        if (!response.ok) throw new Error("Failed to fetch schedule");
        const data = await response.json();
        if (data.success && data.data?.scheduledAnimes) {
          setSchedule(data.data.scheduledAnimes);
        } else {
          setSchedule([]);
        }
      } catch (err) {
        console.error("Schedule page fetch error:", err);
        setError("We could not load the schedule for this day.");
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [activeDay, weekDays, initialSchedule.length, initialDay]);

  const renderState = () => {
    if (loading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-white/5 bg-[#0c1526] p-6 animate-pulse">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-6 w-3/4 bg-white/10 rounded mt-4" />
              <div className="h-3 w-1/2 bg-white/10 rounded mt-2" />
              <div className="flex gap-3 mt-8">
                <div className="h-8 flex-1 bg-white/10 rounded" />
                <div className="h-8 w-16 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center">
          <p className="text-lg font-semibold text-red-200">{error}</p>
          <p className="text-sm text-red-200/80 mt-2">
            Hit refresh or pick another day while we reconnect to HiAnime.
          </p>
        </div>
      );
    }

    if (schedule.length === 0) {
      return (
        <div className="rounded-2xl border border-white/5 bg-[#0c1526] p-10 text-center text-gray-400">
          <p className="text-lg font-semibold text-white">
            Nothing listed for {weekDays[activeDay]?.fullLabel || "this day"}
          </p>
          <p className="text-sm text-gray-400 mt-2">Try another day or come back once new simulcasts lock in.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {schedule.map((item, index) => {
          const statusLabel = item.secondsUntilAiring <= 0 ? "Airing now" : "Up next";
          const fallbackGradient = FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length];

          return (
            <article
              key={`${item.id}-${item.airingTimestamp}`}
              className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#111c34] via-[#0e1528] to-[#050816] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#f5c518]/10 blur-3xl" aria-hidden />

              <div className="relative mb-6 overflow-hidden rounded-2xl">
                <div className="relative aspect-[4/5] w-full">
                  {item.poster ? (
                    <Image
                      src={item.poster}
                      alt={item.name}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      unoptimized
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-col gap-1 text-xs uppercase tracking-[0.3em] text-white/80">
                    <span>{weekDays[activeDay]?.label}</span>
                    <span className="tracking-[0.2em] text-white/60">{item.time}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs">
                    {item.episode && (
                      <span className="rounded-full bg-black/40 px-3 py-1 font-semibold text-white">Ep {item.episode}</span>
                    )}
                    <span className="rounded-full bg-[#f5c518] px-3 py-1 font-semibold text-black">{statusLabel}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-white line-clamp-2">{item.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-1 mt-2">{item.jname || "Fresh simulcast"}</p>

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-300">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {formatTimeUntil(item.secondsUntilAiring)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white/80">
                  Airs in local time
                </span>
              </div>

              <div className="mt-8 flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-400">Countdown</p>
                  <p className="text-lg font-semibold text-white">{formatTimeUntil(item.secondsUntilAiring)}</p>
                </div>
                <Link
                  href={`/anime/${item.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  View Details
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <section className="rounded-[32px] border border-white/5 bg-[#070d1b]/80 p-6 shadow-[0_40px_80px_rgba(5,8,15,0.45)] backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-[#f5c518]">Simulcast grid</p>
          <h2 className="font-heading text-3xl font-bold text-white mt-2">Pick a day, get the lineup</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl">
            Tap through the week to reveal sub & dub drops pulled live from HiAnime. Cards update instantly so your watchlist stays sharp.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Timezone</p>
          <p className="text-lg font-semibold text-white">{timezoneLabel}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {weekDays.map((day, index) => (
          <button
            key={day.date}
            onClick={() => setActiveDay(index)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeDay === index
                ? "bg-[#f5c518] text-black shadow-[0_10px_25px_rgba(245,197,24,0.35)]"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
            type="button"
          >
            <div className="flex flex-col text-left">
              <span>{day.label}</span>
              <span className="text-[11px] font-normal tracking-wide text-gray-400">{day.fullLabel}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10">{renderState()}</div>
    </section>
  );
}

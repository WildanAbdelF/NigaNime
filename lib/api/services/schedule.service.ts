import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { ScheduleResponse } from "@/types/anime";

/**
 * Schedule Service
 * Handles anime schedule/airing API calls using Jikan API
 */

// Day mapping for Jikan API
const dayMap: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export interface ScheduleParams {
  day?: string; // "monday", "tuesday", etc.
  page?: number;
  limit?: number;
}

export const scheduleService = {
  /**
   * Get anime schedule for all days
   */
  async getSchedule(params?: ScheduleParams) {
    const queryParams: Record<string, string | number> = {
      sfw: "true", // Safe for work filter
    };
    
    if (params?.day) {
      queryParams.filter = params.day;
    }
    if (params?.page) {
      queryParams.page = params.page;
    }
    if (params?.limit) {
      queryParams.limit = params.limit;
    }
    
    return fetcher<ScheduleResponse>(ENDPOINTS.SCHEDULES, queryParams);
  },

  /**
   * Get schedule for a specific day
   * @param day - Day of the week (e.g., "monday", "tuesday")
   */
  async getScheduleByDay(day: string, page?: number) {
    return fetcher<ScheduleResponse>(ENDPOINTS.SCHEDULES, { 
      filter: day.toLowerCase(),
      sfw: "true",
      page,
    });
  },

  /**
   * Get today's schedule
   */
  async getTodaySchedule() {
    const today = new Date();
    const dayName = dayMap[today.getDay()];
    return fetcher<ScheduleResponse>(ENDPOINTS.SCHEDULES, { 
      filter: dayName,
      sfw: "true",
    });
  },

  /**
   * Get schedule for a specific date
   * Converts date to day of week and fetches that day's schedule
   */
  async getScheduleByDate(date: string) {
    const dateObj = new Date(date);
    const dayName = dayMap[dateObj.getDay()];
    return fetcher<ScheduleResponse>(ENDPOINTS.SCHEDULES, { 
      filter: dayName,
      sfw: "true",
    });
  },
};


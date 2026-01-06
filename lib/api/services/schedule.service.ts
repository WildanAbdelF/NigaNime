import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { ScheduleResponse } from "@/types/anime";

/**
 * Schedule Service
 * Handles anime schedule/airing API calls using Consumet HiAnime API
 */

export interface ScheduleParams {
  date?: string; // Format: YYYY-MM-DD
}

export const scheduleService = {
  /**
   * Get anime schedule for a specific date
   * @param date - Date in YYYY-MM-DD format (e.g., "2026-01-06")
   */
  async getSchedule(date?: string) {
    return fetcher<ScheduleResponse>(ENDPOINTS.SCHEDULE, { date });
  },

  /**
   * Get today's schedule
   */
  async getTodaySchedule() {
    const today = new Date().toISOString().split("T")[0];
    return fetcher<ScheduleResponse>(ENDPOINTS.SCHEDULE, { date: today });
  },
};

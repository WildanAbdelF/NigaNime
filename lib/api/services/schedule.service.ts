import { fetcher } from "../fetcher";
import { ENDPOINTS } from "../config";
import type { Anime } from "@/types/anime";

/**
 * Schedule Service
 * Handles anime schedule/airing API calls
 */

export type DayOfWeek = 
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"
  | "unknown";

export interface ScheduleParams {
  page?: number;
  limit?: number;
  filter?: DayOfWeek;
}

export const scheduleService = {
  /**
   * Get anime schedule
   */
  async getSchedule(params?: ScheduleParams) {
    return fetcher<Anime[]>(ENDPOINTS.SCHEDULES, params);
  },

  /**
   * Get anime schedule by day
   */
  async getScheduleByDay(day: DayOfWeek, params?: Omit<ScheduleParams, "filter">) {
    return fetcher<Anime[]>(ENDPOINTS.SCHEDULES, { filter: day, ...params });
  },
};

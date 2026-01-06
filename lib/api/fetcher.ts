import { API_CONFIG } from "./config";

/**
 * Generic API response wrapper for Consumet API
 * Consumet returns data directly, not wrapped in a data property
 */
interface ConsumetPaginatedResponse<T> {
  currentPage: number;
  hasNextPage: boolean;
  totalPages?: number;
  totalResults?: number;
  results: T[];
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Main fetcher function with error handling and caching support
 * Consumet API returns data directly (not wrapped in { data: ... })
 */
export async function fetcher<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestInit
): Promise<T> {
  const url = buildUrl(endpoint, params);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      // Enable Next.js caching - revalidate every 5 minutes
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      500,
      endpoint
    );
  }
}

/**
 * Fetcher with no-cache option for real-time data
 */
export async function fetcherNoCache<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestInit
): Promise<T> {
  const url = buildUrl(endpoint, params);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      500,
      endpoint
    );
  }
}

export type { ConsumetPaginatedResponse };

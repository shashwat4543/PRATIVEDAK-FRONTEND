import {
  DebugStats,
  FlaggedProjectItem,
  MPDashboardData,
  MPListItem,
  AnomalyItem,
  PaginatedResponse,
} from '../types';

export const API_BASE_URL = 'https://mplads-fraud-detection-api.onrender.com';

let sessionFeaturedMpId: number | null = null;

/**
 * Dynamically resolves the MP ID for the featured case study (Narayan Das Ahirwar)
 * at runtime via GET /api/mps/search?q=narayan das ahirwar.
 * Caches the resolved ID for the session to prevent redundant network requests.
 * Returns null if no matching record is found or the service is unreachable.
 */
export async function resolveFeaturedMPId(): Promise<number | null> {
  if (sessionFeaturedMpId !== null) {
    return sessionFeaturedMpId;
  }

  // Check sessionStorage for cached ID in this browser session
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem('prativedak_featured_mp_id');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) {
          sessionFeaturedMpId = parsed;
          return parsed;
        }
      }
    } catch {
      // sessionStorage unavailable
    }
  }

  try {
    // Dynamic runtime lookup by name
    const data = await fetchWithColdStartCheck<MPListItem[] | PaginatedResponse<MPListItem>>(
      `${API_BASE_URL}/api/mps/search?q=${encodeURIComponent('narayan das ahirwar')}`
    );
    const results: MPListItem[] = Array.isArray(data) ? data : data?.content || data?.items || [];

    // Match Narayan Das Ahirwar
    let matched = results.find(
      (m) =>
        m.name?.toLowerCase().includes('narayan') &&
        (m.name?.toLowerCase().includes('ahirwar') || m.constituency?.toLowerCase().includes('jalaun'))
    );

    // If not matched directly, check first result if present
    if (!matched && results.length > 0) {
      matched = results[0];
    }

    // Secondary fallback search if spelling varied slightly: search "jalaun"
    if (!matched) {
      const jalaunData = await fetchWithColdStartCheck<MPListItem[] | PaginatedResponse<MPListItem>>(
        `${API_BASE_URL}/api/mps/search?q=jalaun`
      );
      const jalaunResults: MPListItem[] = Array.isArray(jalaunData) ? jalaunData : jalaunData?.content || jalaunData?.items || [];
      matched = jalaunResults.find((m) => m.constituency?.toLowerCase().includes('jalaun'));
    }

    if (matched && typeof matched.id === 'number') {
      sessionFeaturedMpId = matched.id;
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.setItem('prativedak_featured_mp_id', String(matched.id));
        } catch {
          // ignore storage quota errors
        }
      }
      return matched.id;
    }
  } catch (err) {
    console.error('Failed to dynamically resolve featured MP ID:', err);
  }

  return null;
}

type ColdStartListener = (isWakingUp: boolean) => void;
const coldStartListeners: Set<ColdStartListener> = new Set();

export function subscribeColdStart(listener: ColdStartListener): () => void {
  coldStartListeners.add(listener);
  return () => coldStartListeners.delete(listener);
}

function notifyColdStart(isWakingUp: boolean) {
  coldStartListeners.forEach((fn) => fn(isWakingUp));
}

let activeRequestsCount = 0;
let coldStartTimer: ReturnType<typeof setTimeout> | null = null;

async function fetchWithColdStartCheck<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  activeRequestsCount++;

  if (!coldStartTimer) {
    coldStartTimer = setTimeout(() => {
      if (activeRequestsCount > 0) {
        notifyColdStart(true);
      }
    }, 2800);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } finally {
    activeRequestsCount--;
    if (activeRequestsCount === 0) {
      if (coldStartTimer) {
        clearTimeout(coldStartTimer);
        coldStartTimer = null;
      }
      notifyColdStart(false);
    }
  }
}

// In-memory cache for fast responsive navigation
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T) {
  cache.set(key, { data, timestamp: Date.now() });
}

export const api = {
  async getHealth(): Promise<{ status?: string; message?: string } | string> {
    return fetchWithColdStartCheck(`${API_BASE_URL}/`);
  },

  async getDebugStats(): Promise<DebugStats> {
    const cacheKey = 'debug-stats';
    const cached = getCached<DebugStats>(cacheKey);
    if (cached) return cached;

    const data = await fetchWithColdStartCheck<DebugStats>(`${API_BASE_URL}/api/mps/debug-stats`);
    setCache(cacheKey, data);
    return data;
  },

  async searchMPs(query: string): Promise<MPListItem[]> {
    if (!query || query.trim().length < 2) return [];
    const trimmed = query.trim();
    const cacheKey = `search-${trimmed}`;
    const cached = getCached<MPListItem[]>(cacheKey);
    if (cached) return cached;

    let result: MPListItem[] = [];
    try {
      const data = await fetchWithColdStartCheck<MPListItem[] | PaginatedResponse<MPListItem>>(
        `${API_BASE_URL}/api/mps/search?q=${encodeURIComponent(trimmed)}`
      );

      // Normalize response if paginated or raw array
      result = Array.isArray(data) ? data : data.content || data.items || [];
    } catch {
      result = [];
    }

    setCache(cacheKey, result);
    return result;
  },

  async getMPs(page = 0, size = 20): Promise<{ items: MPListItem[]; totalElements: number; totalPages: number }> {
    const cacheKey = `mps-page-${page}-size-${size}`;
    const cached = getCached<{ items: MPListItem[]; totalElements: number; totalPages: number }>(cacheKey);
    if (cached) return cached;

    let items: MPListItem[] = [];
    let totalElements = 0;
    let totalPages = 1;

    try {
      const data = await fetchWithColdStartCheck<PaginatedResponse<MPListItem> | MPListItem[]>(
        `${API_BASE_URL}/api/mps?page=${page}&size=${size}`
      );

      if (Array.isArray(data)) {
        items = data;
        totalElements = data.length;
        totalPages = Math.ceil(data.length / size) || 1;
      } else if (data) {
        items = data.content || data.items || [];
        totalElements = data.totalElements ?? items.length;
        totalPages = data.totalPages ?? (Math.ceil(totalElements / size) || 1);
      }
    } catch {
      // Return empty if API failed
    }

    const formatted = { items, totalElements, totalPages };
    setCache(cacheKey, formatted);
    return formatted;
  },

  async getMPDashboard(mpId: number): Promise<MPDashboardData> {
    const cacheKey = `mp-dashboard-${mpId}`;
    const cached = getCached<MPDashboardData>(cacheKey);
    if (cached) return cached;

    const data = await fetchWithColdStartCheck<MPDashboardData>(
      `${API_BASE_URL}/api/mps/${mpId}/dashboard`
    );
    if (data && data.name) {
      setCache(cacheKey, data);
      return data;
    }

    throw new Error(`Failed to load MP Dashboard for ID #${mpId}`);
  },

  async getMPProjects(
    mpId: number,
    page = 0,
    size = 20,
    sortBy = 'id'
  ): Promise<{ items: FlaggedProjectItem[]; totalElements: number; totalPages: number }> {
    const cacheKey = `mp-projects-${mpId}-p${page}-s${size}-sort${sortBy}`;
    const cached = getCached<{ items: FlaggedProjectItem[]; totalElements: number; totalPages: number }>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchWithColdStartCheck<PaginatedResponse<FlaggedProjectItem> | FlaggedProjectItem[]>(
        `${API_BASE_URL}/api/mps/${mpId}/projects?page=${page}&size=${size}&sortBy=${sortBy}`
      );

      let items: FlaggedProjectItem[] = [];
      let totalElements = 0;
      let totalPages = 1;

      if (Array.isArray(data)) {
        items = data;
        totalElements = data.length;
        totalPages = Math.ceil(data.length / size) || 1;
      } else if (data) {
        items = data.content || data.items || [];
        totalElements = data.totalElements ?? items.length;
        totalPages = data.totalPages ?? (Math.ceil(totalElements / size) || 1);
      }

      const formatted = { items, totalElements, totalPages };
      setCache(cacheKey, formatted);
      return formatted;
    } catch {
      return { items: [], totalElements: 0, totalPages: 0 };
    }
  },

  async getMPAnomalies(mpId: number): Promise<AnomalyItem[]> {
    const cacheKey = `mp-anomalies-${mpId}`;
    const cached = getCached<AnomalyItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchWithColdStartCheck<AnomalyItem[] | PaginatedResponse<AnomalyItem>>(
        `${API_BASE_URL}/api/mps/${mpId}/anomalies`
      );

      const items = Array.isArray(data) ? data : data.content || data.items || [];
      setCache(cacheKey, items);
      return items;
    } catch {
      return [];
    }
  },

  async getGlobalAnomalies(
    page = 0,
    size = 20,
    filters?: { severity?: string; ruleCode?: string }
  ): Promise<{ items: AnomalyItem[]; totalElements: number; totalPages: number }> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));

    // Only append active, non-empty, non-default filter parameters
    if (
      filters?.severity &&
      filters.severity !== 'ALL' &&
      filters.severity !== 'all' &&
      filters.severity !== 'null' &&
      filters.severity.trim() !== ''
    ) {
      params.append('severity', filters.severity.trim());
    }

    if (
      filters?.ruleCode &&
      filters.ruleCode !== 'ALL' &&
      filters.ruleCode !== 'all' &&
      filters.ruleCode !== 'null' &&
      filters.ruleCode.trim() !== ''
    ) {
      params.append('ruleCode', filters.ruleCode.trim());
    }

    const queryString = params.toString();
    const cacheKey = `global-anomalies-${queryString}`;
    const cached = getCached<{ items: AnomalyItem[]; totalElements: number; totalPages: number }>(cacheKey);
    if (cached) return cached;

    const data = await fetchWithColdStartCheck<PaginatedResponse<AnomalyItem> | AnomalyItem[]>(
      `${API_BASE_URL}/api/mps/anomalies?${queryString}`
    );

    let items: AnomalyItem[] = [];
    let totalElements = 0;
    let totalPages = 1;

    if (Array.isArray(data)) {
      items = data;
      totalElements = data.length;
      totalPages = Math.ceil(data.length / size) || 1;
    } else if (data) {
      items = data.content || data.items || [];
      totalElements = data.totalElements ?? items.length;
      totalPages = data.totalPages ?? (Math.ceil(totalElements / size) || 1);
    }

    const formatted = { items, totalElements, totalPages };
    setCache(cacheKey, formatted);
    return formatted;
  },

  resolveFeaturedMPId,
};

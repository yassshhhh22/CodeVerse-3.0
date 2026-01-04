import { create } from "zustand";
import api from "../services/api";

interface AnalyticsLog {
  _id: string;
  venue_id: string;
  zone_id?: string;
  total_detections: number;
  avg_density: number;
  peak_density: number;
  createdAt: string;
}

interface VenueAnalytics {
  logs: AnalyticsLog[];
  summary: any;
}

interface AnalyticsState {
  venueAnalytics: VenueAnalytics | null;
  zoneAnalytics: any;
  isLoading: boolean;
  error: string | null;
  setVenueAnalytics: (analytics: VenueAnalytics | null) => void;
  setZoneAnalytics: (analytics: any) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchVenueAnalytics: (venueId: string, params?: any) => Promise<any>;
  fetchZoneAnalytics: (
    venueId: string,
    zoneId: string,
    params?: any
  ) => Promise<any>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  venueAnalytics: null,
  zoneAnalytics: null,
  isLoading: false,
  error: null,

  setVenueAnalytics: (analytics) => set({ venueAnalytics: analytics }),
  setZoneAnalytics: (analytics) => set({ zoneAnalytics: analytics }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchVenueAnalytics: async (venueId: string, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/api/venues/${venueId}/analytics?${queryString}`
        : `/api/venues/${venueId}/analytics`;
      const response = await api.get(url);
      if (response.data.success) {
        set({ venueAnalytics: response.data.data });
        return response.data;
      } else {
        set({ error: response.data.message });
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchZoneAnalytics: async (venueId: string, zoneId: string, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/api/venues/${venueId}/zones/${zoneId}/analytics?${queryString}`
        : `/api/venues/${venueId}/zones/${zoneId}/analytics`;
      const response = await api.get(url);
      if (response.data.success) {
        return response.data;
      } else {
        set({ error: response.data.message });
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },
}));

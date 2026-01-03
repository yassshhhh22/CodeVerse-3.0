import { create } from "zustand";
import api from "../services/api.js";

export const useAnalyticsStore = create((set, get) => ({
  venueAnalytics: null,
  zoneAnalytics: null,
  venueReport: null,
  isLoading: false,
  error: null,

  setVenueAnalytics: (data) => set({ venueAnalytics: data }),
  setZoneAnalytics: (data) => set({ zoneAnalytics: data }),
  setVenueReport: (data) => set({ venueReport: data }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchVenueAnalytics: async (venueId, params = {}) => {
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
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchZoneAnalytics: async (venueId, zoneId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/api/venues/${venueId}/analytics/zone/${zoneId}?${queryString}`
        : `/api/venues/${venueId}/analytics/zone/${zoneId}`;
      const response = await api.get(url);
      if (response.data.success) {
        set({ zoneAnalytics: response.data.data });
        return response.data;
      } else {
        set({ error: response.data.message });
        return response.data;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchVenueReport: async (venueId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/api/venues/${venueId}/analytics/report?${queryString}`
        : `/api/venues/${venueId}/analytics/report`;
      const response = await api.get(url);
      if (response.data.success) {
        set({ venueReport: response.data.data });
        return response.data;
      } else {
        set({ error: response.data.message });
        return response.data;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

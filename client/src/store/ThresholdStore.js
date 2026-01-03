import { create } from "zustand";
import api from "../services/api.js";

export const useThresholdStore = create((set, get) => ({
  venueThresholds: null,
  zoneThreshold: null,
  isLoading: false,
  error: null,

  setVenueThresholds: (data) => set({ venueThresholds: data }),
  setZoneThreshold: (data) => set({ zoneThreshold: data }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchVenueThresholds: async (venueId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/venues/${venueId}/thresholds/venue`);
      if (response.data.success) {
        set({ venueThresholds: response.data.data });
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

  setVenueThreshold: async (venueId, thresholdData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(
        `/api/venues/${venueId}/thresholds/venue`,
        thresholdData
      );
      if (response.data.success) {
        set({ venueThresholds: response.data.data });
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

  fetchZoneThreshold: async (venueId, zoneId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(
        `/api/venues/${venueId}/thresholds/zone/${zoneId}`
      );
      if (response.data.success) {
        set({ zoneThreshold: response.data.data });
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

  setZoneThreshold: async (venueId, zoneId, thresholdData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(
        `/api/venues/${venueId}/thresholds/zone/${zoneId}`,
        thresholdData
      );
      if (response.data.success) {
        set({ zoneThreshold: response.data.data });
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

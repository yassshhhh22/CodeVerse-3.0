import { create } from "zustand";
import api from "../services/api.js";

export const useGridStore = create((set, get) => ({
  gridDensity: null,
  zoneDensities: [],
  isLoading: false,
  error: null,

  setGridDensity: (data) => set({ gridDensity: data }),
  setZoneDensities: (data) => set({ zoneDensities: data }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchGridDensity: async (venueId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/api/venues/${venueId}/grid/density?${queryString}`
        : `/api/venues/${venueId}/grid/density`;
      const response = await api.get(url);
      if (response.data.success) {
        set({ gridDensity: response.data.data });
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

  fetchZoneDensities: async (venueId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/api/venues/${venueId}/grid/zone-densities?${queryString}`
        : `/api/venues/${venueId}/grid/zone-densities`;
      const response = await api.get(url);
      if (response.data.success) {
        set({ zoneDensities: response.data.data });
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

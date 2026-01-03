import { create } from "zustand";
import api from "../services/api.js";

export const useZoneStore = create((set, get) => ({
  zones: [],
  currentZone: null,
  isLoading: false,
  error: null,

  setZones: (zones) => set({ zones }),
  setCurrentZone: (zone) => set({ currentZone: zone }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchZonesByVenue: async (venueId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/venues/${venueId}/zones`);
      if (response.data.success) {
        set({ zones: response.data.data });
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

  fetchZoneById: async (venueId, zoneId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/venues/${venueId}/zones/${zoneId}`);
      if (response.data.success) {
        set({ currentZone: response.data.data });
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

  createZone: async (venueId, zoneData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/api/venues/${venueId}/zones`, zoneData);
      if (response.data.success) {
        const { zones } = get();
        set({ zones: [...zones, response.data.data] });
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

  updateZone: async (venueId, zoneId, zoneData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(
        `/api/venues/${venueId}/zones/${zoneId}`,
        zoneData
      );
      if (response.data.success) {
        const { zones } = get();
        set({
          zones: zones.map((z) =>
            z._id === zoneId ? response.data.data : z
          ),
          currentZone:
            get().currentZone?._id === zoneId
              ? response.data.data
              : get().currentZone,
        });
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

  deleteZone: async (venueId, zoneId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/venues/${venueId}/zones/${zoneId}`);
      if (response.data.success) {
        const { zones } = get();
        set({
          zones: zones.filter((z) => z._id !== zoneId),
          currentZone:
            get().currentZone?._id === zoneId ? null : get().currentZone,
        });
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

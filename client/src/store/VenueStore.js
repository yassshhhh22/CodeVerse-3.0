import { create } from "zustand";
import api from "../services/api.js";

export const useVenueStore = create((set, get) => ({
  venues: [],
  currentVenue: null,
  isLoading: false,
  error: null,

  setVenues: (venues) => set({ venues }),
  setCurrentVenue: (venue) => set({ currentVenue: venue }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchVenues: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/api/venues");
      if (response.data.success) {
        set({ venues: response.data.data });
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

  fetchVenueById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/venues/${id}`);
      if (response.data.success) {
        set({ currentVenue: response.data.data });
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

  createVenue: async (venueData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/venues", venueData);
      if (response.data.success) {
        const { venues } = get();
        set({ venues: [...venues, response.data.data] });
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

  updateVenue: async (id, venueData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/venues/${id}`, venueData);
      if (response.data.success) {
        const { venues } = get();
        set({
          venues: venues.map((v) =>
            v._id === id ? response.data.data : v
          ),
          currentVenue:
            get().currentVenue?._id === id
              ? response.data.data
              : get().currentVenue,
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

  deleteVenue: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/venues/${id}`);
      if (response.data.success) {
        const { venues } = get();
        set({
          venues: venues.filter((v) => v._id !== id),
          currentVenue:
            get().currentVenue?._id === id ? null : get().currentVenue,
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

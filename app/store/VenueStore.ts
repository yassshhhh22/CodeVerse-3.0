import { create } from "zustand";
import api from "../services/api";

interface Venue {
  _id: string;
  name: string;
  camera_id: string;
  status: string;
  width: number;
  height: number;
}

interface VenueState {
  venues: Venue[];
  currentVenue: Venue | null;
  isLoading: boolean;
  error: string | null;
  setVenues: (venues: Venue[]) => void;
  setCurrentVenue: (venue: Venue | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchVenues: () => Promise<any>;
  fetchVenueById: (id: string) => Promise<any>;
}

export const useVenueStore = create<VenueState>((set, get) => ({
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchVenueById: async (id: string) => {
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },
}));

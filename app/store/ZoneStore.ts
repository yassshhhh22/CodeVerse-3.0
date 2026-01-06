import { create } from "zustand";
import api from "../services/api";

interface Zone {
  _id: string;
  name: string;
  venue_id: string;
  capacity: number;
  density_threshold: number;
}

interface ZoneState {
  zones: Zone[];
  currentZone: Zone | null;
  isLoading: boolean;
  error: string | null;
  setZones: (zones: Zone[]) => void;
  setCurrentZone: (zone: Zone | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchZonesByVenue: (venueId: string) => Promise<any>;
  fetchZoneById: (id: string) => Promise<any>;
}

export const useZoneStore = create<ZoneState>((set, get) => ({
  zones: [],
  currentZone: null,
  isLoading: false,
  error: null,

  setZones: (zones) => set({ zones }),
  setCurrentZone: (zone) => set({ currentZone: zone }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchZonesByVenue: async (venueId: string) => {
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchZoneById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/zones/${id}`);
      if (response.data.success) {
        set({ currentZone: response.data.data });
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

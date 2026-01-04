import { create } from "zustand";
import api from "../services/api";

interface Alert {
  _id: string;
  venue_id: any;
  zone_id: any;
  severity: string;
  message: string;
  density_value: number;
  triggered_at: string;
  acknowledged_by: any;
}

interface AlertState {
  alerts: Alert[];
  currentAlert: Alert | null;
  isLoading: boolean;
  error: string | null;
  setAlerts: (alerts: Alert[]) => void;
  setCurrentAlert: (alert: Alert | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAlerts: (params?: any) => Promise<any>;
  fetchAlertById: (id: string) => Promise<any>;
  acknowledgeAlert: (id: string) => Promise<any>;
  clearError: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  currentAlert: null,
  isLoading: false,
  error: null,

  setAlerts: (alerts) => set({ alerts }),
  setCurrentAlert: (alert) => set({ currentAlert: alert }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchAlerts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/alerts?${queryString}` : "/api/alerts";
      const response = await api.get(url);
      if (response.data.success) {
        set({ alerts: response.data.data.alerts || response.data.data });
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

  fetchAlertById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/alerts/${id}`);
      if (response.data.success) {
        set({ currentAlert: response.data.data });
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

  acknowledgeAlert: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/alerts/${id}/acknowledge`);
      if (response.data.success) {
        const { alerts } = get();
        set({
          alerts: alerts.map((a) => (a._id === id ? response.data.data : a)),
          currentAlert:
            get().currentAlert?._id === id
              ? response.data.data
              : get().currentAlert,
        });
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

  clearError: () => set({ error: null }),
}));

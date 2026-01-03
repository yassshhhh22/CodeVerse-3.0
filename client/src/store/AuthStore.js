import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/login", credentials);
          if (response.data.success) {
            set({
              user: response.data.user,
              token: response.data.token,
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

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/register", userData);
          if (response.data.success) {
            set({
              user: response.data.user,
              token: response.data.token,
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

      fetchMe: async () => {
        const { token } = get();
        if (!token) {
          set({ error: "No token found" });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/api/auth/me");
          if (response.data.success) {
            set({ user: response.data.data });
            return response.data;
          } else {
            set({ error: response.data.message });
            return response.data;
          }
        } catch (err) {
          const errorMsg = err.response?.data?.message || err.message;
          set({ error: errorMsg });
          if (err.response?.status === 401) {
            set({ user: null, token: null });
          }
          return { success: false, message: errorMsg };
        } finally {
          set({ isLoading: false });
        }
      },

      updateDetails: async (details) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put("/api/auth/updatedetails", details);
          if (response.data.success) {
            set({ user: response.data.data });
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

      updatePassword: async (passwords) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put("/api/auth/updatepassword", passwords);
          if (response.data.success) {
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

      logout: async () => {
        set({ isLoading: true });
        try {
          // Optional: call logout endpoint if it exists
          // await api.post("/api/auth/logout");
        } catch (err) {
          console.error("Logout error:", err);
        } finally {
          set({ user: null, token: null, error: null, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

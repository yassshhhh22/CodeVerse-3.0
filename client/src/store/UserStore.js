import { create } from "zustand";
import api from "../services/api.js";

export const useUserStore = create((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,

  setUsers: (users) => set({ users }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/api/users");
      if (response.data.success) {
        set({ users: response.data.data });
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

  fetchUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/users/${id}`);
      if (response.data.success) {
        set({ currentUser: response.data.data });
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

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      if (response.data.success) {
        const { users } = get();
        set({
          users: users.map((u) =>
            u._id === id ? response.data.data : u
          ),
          currentUser:
            get().currentUser?._id === id
              ? response.data.data
              : get().currentUser,
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

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/users/${id}`);
      if (response.data.success) {
        const { users } = get();
        set({
          users: users.filter((u) => u._id !== id),
          currentUser:
            get().currentUser?._id === id ? null : get().currentUser,
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

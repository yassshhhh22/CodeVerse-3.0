import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
  }) => Promise<any>;
  fetchMe: () => Promise<any>;
  logout: () => Promise<void>;
  hydrateAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
        const { user, token } = response.data;
        await AsyncStorage.setItem("auth-token", token);
        await AsyncStorage.setItem("auth-user", JSON.stringify(user));
        set({ user, token });
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

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/auth/register", userData);
      if (response.data.success) {
        const { user, token } = response.data;
        await AsyncStorage.setItem("auth-token", token);
        await AsyncStorage.setItem("auth-user", JSON.stringify(user));
        set({ user, token });
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
        const user = response.data.data;
        await AsyncStorage.setItem("auth-user", JSON.stringify(user));
        set({ user });
        return response.data;
      } else {
        set({ error: response.data.message });
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg });
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem("auth-token");
        await AsyncStorage.removeItem("auth-user");
        set({ user: null, token: null });
      }
      return { success: false, message: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AsyncStorage.removeItem("auth-token");
      await AsyncStorage.removeItem("auth-user");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      set({ user: null, token: null, error: null, isLoading: false });
    }
  },

  hydrateAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("auth-token");
      const userString = await AsyncStorage.getItem("auth-user");
      if (token && userString) {
        const user = JSON.parse(userString);
        set({ token, user });
      }
    } catch (err) {
      console.error("Hydration error:", err);
    }
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const explicitApiUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.expoConfig?.extra?.API_URL ||
  null;

const inferLanUrl = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.hostUri ||
    (Constants as any).manifest?.hostUri ||
    "";

  if (!hostUri) return null;
  const host = hostUri.split(":");
  const hostname = Array.isArray(host) ? host[0] : null;
  return hostname ? `http://${hostname}:5000` : null;
};

const getBaseUrl = () => {
  if (explicitApiUrl) return explicitApiUrl;

  const inferred = inferLanUrl();
  if (inferred) return inferred;

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }
  return "http://localhost:5000";
};

const API_URL = getBaseUrl();

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

const api = {
  get: async (url: string) => {
    return makeRequest(url, { method: "GET" });
  },
  post: async (url: string, data?: any) => {
    return makeRequest(url, { method: "POST", body: data });
  },
  put: async (url: string, data?: any) => {
    return makeRequest(url, { method: "PUT", body: data });
  },
  delete: async (url: string) => {
    return makeRequest(url, { method: "DELETE" });
  },
};

async function makeRequest(url: string, config: RequestConfig) {
  try {
    const token = await AsyncStorage.getItem("auth-token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

    const response = await fetch(fullUrl, {
      method: config.method || "GET",
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    const data = await response.json();

    if (response.status === 401) {
      await AsyncStorage.removeItem("auth-token");
      await AsyncStorage.removeItem("auth-user");
    }

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
        message: data.message || "Request failed",
      };
    }

    return { data };
  } catch (error: any) {
    if (error.response) {
      throw error;
    }
    throw {
      response: null,
      message: error.message || "Network error",
    };
  }
}

export default api;

import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { Platform } from "react-native";

const explicitSocketUrl =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.socketUrl ||
  Constants.expoConfig?.extra?.apiUrl ||
  null;

const inferLanSocketUrl = () => {
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

const getSocketUrl = () => {
  if (explicitSocketUrl) return explicitSocketUrl;

  const inferred = inferLanSocketUrl();
  if (inferred) return inferred;

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }
  return "http://localhost:5000";
};

const SOCKET_URL = getSocketUrl();

class WebSocketService {
  socket: Socket | null = null;
  connected: boolean = false;
  reconnecting: boolean = false;
  listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: false,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    this.socket.on("connect", () => {
      this.connected = true;
      this.reconnecting = false;
      console.log("WebSocket connected:", this.socket?.id);
      this.notifyListeners("connection", {
        status: "connected",
        id: this.socket?.id,
      });
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      console.log("WebSocket disconnected:", reason);
      this.notifyListeners("connection", { status: "disconnected", reason });
    });

    this.socket.on("connect_error", (error) => {
      // Silently handle connection errors when server is unavailable
      this.notifyListeners("connection", {
        status: "error",
        error: error.message,
      });
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      this.reconnecting = true;
      console.log(`Reconnection attempt #${attemptNumber}`);
      this.notifyListeners("connection", {
        status: "reconnecting",
        attempt: attemptNumber,
      });
    });

    this.socket.on("reconnect", (attemptNumber) => {
      this.reconnecting = false;
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.notifyListeners("connection", {
        status: "reconnected",
        attempts: attemptNumber,
      });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log("WebSocket disconnected manually");
    }
  }

  subscribeToVenue(cameraId: string, user: any = null) {
    if (!this.socket?.connected) {
      console.warn("Cannot subscribe: WebSocket not connected");
      return false;
    }

    console.log(`Subscribing to venue: ${cameraId}`);
    this.socket.emit("subscribe_venue", {
      camera_id: cameraId,
      user: user || { id: "anonymous" },
    });
    return true;
  }

  unsubscribeFromVenue(cameraId: string) {
    if (!this.socket?.connected) {
      console.warn("Cannot unsubscribe: WebSocket not connected");
      return false;
    }

    console.log(`Unsubscribing from venue: ${cameraId}`);
    this.socket.emit("unsubscribe_venue", {
      camera_id: cameraId,
    });
    return true;
  }

  on(event: string, callback: Function) {
    if (!this.socket) {
      console.warn(`Cannot listen to ${event}: WebSocket not initialized`);
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    this.socket.on(event, callback as any);
  }

  off(event: string, callback: Function) {
    if (!this.socket) return;

    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks?.indexOf(callback) ?? -1;
      if (index > -1) {
        callbacks?.splice(index, 1);
      }
    }

    this.socket.off(event, callback as any);
  }

  removeAllListeners(event?: string) {
    if (!this.socket) return;

    if (event) {
      this.listeners.delete(event);
      this.socket.off(event);
    } else {
      this.listeners.clear();
      this.socket.removeAllListeners();
    }
  }

  notifyListeners(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  isReconnecting() {
    return this.reconnecting;
  }

  getSocketId() {
    return this.socket?.id || null;
  }
}

const websocketService = new WebSocketService();

export default websocketService;

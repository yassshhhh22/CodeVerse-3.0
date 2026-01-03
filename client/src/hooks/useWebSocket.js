import { useEffect, useState, useCallback, useRef } from "react";
import websocketService from "../services/websocket";

/**
 * Custom hook for WebSocket real-time updates
 * @param {string} venueId - Venue ID or camera_id to subscribe to
 * @param {object} options - Configuration options
 * @returns {object} WebSocket state and data
 */
export const useWebSocket = (venueId = null, options = {}) => {
  const {
    autoConnect = true,
    autoSubscribe = true,
    onGridUpdate = null,
    onZoneUpdate = null,
    onAlert = null,
    onConnectionChange = null,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [gridDensity, setGridDensity] = useState(null);
  const [zoneDensities, setZoneDensities] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [detections, setDetections] = useState([]);
  const [lastDataReceived, setLastDataReceived] = useState(null);
  
  const subscribedVenueRef = useRef(null);
  const handlersRegisteredRef = useRef(false);

  // Handle connection status changes
  const handleConnectionChange = useCallback((data) => {
    const { status, id } = data;
    
    setIsConnected(status === "connected" || status === "reconnected");
    setIsReconnecting(status === "reconnecting");
    
    if (status === "connected" || status === "reconnected") {
      setSocketId(id || websocketService.getSocketId());
      
      // Re-subscribe to venue after reconnection
      if (subscribedVenueRef.current) {
        websocketService.subscribeToVenue(subscribedVenueRef.current);
      }
    } else if (status === "disconnected") {
      setSocketId(null);
    }

    onConnectionChange?.(data);
  }, [onConnectionChange]);

  // Handle grid density updates
  const handleGridUpdate = useCallback((data) => {
    console.log("📊 Grid density update received:", data);
    setGridDensity(data);
    setLastDataReceived(new Date());
    
    // Extract detections from grid update
    if (data.detections && Array.isArray(data.detections)) {
      setDetections(data.detections);
    }
    
    onGridUpdate?.(data);
  }, [onGridUpdate]);

  // Handle zone density updates
  const handleZoneUpdate = useCallback((data) => {
    console.log("🎯 Zone density update received:", data);
    setZoneDensities(data.zones || []);
    onZoneUpdate?.(data);
  }, [onZoneUpdate]);

  // Handle alert triggers
  const handleAlert = useCallback((alert) => {
    console.log("🚨 Alert triggered:", alert);
    setLatestAlert(alert);
    onAlert?.(alert);
  }, [onAlert]);

  // Register event listeners
  useEffect(() => {
    if (handlersRegisteredRef.current) return;

    websocketService.on("connection", handleConnectionChange);
    websocketService.on("grid_density_update", handleGridUpdate);
    websocketService.on("zone_density_update", handleZoneUpdate);
    websocketService.on("alert_triggered", handleAlert);

    handlersRegisteredRef.current = true;

    return () => {
      websocketService.off("connection", handleConnectionChange);
      websocketService.off("grid_density_update", handleGridUpdate);
      websocketService.off("zone_density_update", handleZoneUpdate);
      websocketService.off("alert_triggered", handleAlert);
      handlersRegisteredRef.current = false;
    };
  }, [handleConnectionChange, handleGridUpdate, handleZoneUpdate, handleAlert]);

  // Connect to WebSocket
  useEffect(() => {
    if (autoConnect) {
      websocketService.connect();
      setIsConnected(websocketService.isConnected());
      setSocketId(websocketService.getSocketId());
    }

    return () => {
      // Only disconnect if explicitly requested
      if (!autoConnect) {
        websocketService.disconnect();
      }
    };
  }, [autoConnect]);

  // Subscribe to venue
  useEffect(() => {
    if (autoSubscribe && venueId && websocketService.isConnected()) {
      websocketService.subscribeToVenue(venueId);
      subscribedVenueRef.current = venueId;
    }

    return () => {
      if (venueId && subscribedVenueRef.current === venueId) {
        websocketService.unsubscribeFromVenue(venueId);
        subscribedVenueRef.current = null;
      }
    };
  }, [venueId, autoSubscribe]);

  // Manual control methods
  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const subscribeToVenue = useCallback((cameraId) => {
    const success = websocketService.subscribeToVenue(cameraId);
    if (success) {
      subscribedVenueRef.current = cameraId;
    }
    return success;
  }, []);

  const unsubscribeFromVenue = useCallback((cameraId) => {
    const success = websocketService.unsubscribeFromVenue(cameraId);
    if (success && subscribedVenueRef.current === cameraId) {
      subscribedVenueRef.current = null;
    }
    return success;
  }, []);

  const clearAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  return {
    // Connection state
    isConnected,
    isReconnecting,
    socketId,
    lastDataReceived,
    
    // Real-time data
    gridDensity,
    zoneDensities,
    latestAlert,
    detections,
    
    // Control methods
    connect,
    disconnect,
    subscribeToVenue,
    unsubscribeFromVenue,
    clearAlert,
  };
};

export default useWebSocket;

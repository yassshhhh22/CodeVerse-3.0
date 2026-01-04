import { useEffect, useState, useCallback, useRef } from "react";
import websocketService from "../services/websocket";

interface UseWebSocketOptions {
  autoConnect?: boolean;
  autoSubscribe?: boolean;
  onGridUpdate?: (data: any) => void;
  onZoneUpdate?: (data: any) => void;
  onAlert?: (alert: any) => void;
  onConnectionChange?: (data: any) => void;
}

export const useWebSocket = (
  venueId: string | null = null,
  options: UseWebSocketOptions = {}
) => {
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
  const [socketId, setSocketId] = useState<string | null>(null);
  const [gridDensity, setGridDensity] = useState<any>(null);
  const [zoneDensities, setZoneDensities] = useState<Record<string, number>>(
    {}
  );
  const [latestAlert, setLatestAlert] = useState<any>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [lastDataReceived, setLastDataReceived] = useState<Date | null>(null);

  const subscribedVenueRef = useRef<string | null>(null);
  const handlersRegisteredRef = useRef(false);

  const handleConnectionChange = useCallback(
    (data: any) => {
      const { status, id } = data;

      setIsConnected(status === "connected" || status === "reconnected");
      setIsReconnecting(status === "reconnecting");

      if (status === "connected" || status === "reconnected") {
        setSocketId(id || websocketService.getSocketId());

        if (subscribedVenueRef.current) {
          websocketService.subscribeToVenue(subscribedVenueRef.current);
        }
      } else if (status === "disconnected") {
        setSocketId(null);
      }

      onConnectionChange?.(data);
    },
    [onConnectionChange]
  );

  const handleGridUpdate = useCallback(
    (data: any) => {
      console.log("Grid density update received:", data);
      setGridDensity(data);
      setLastDataReceived(new Date());

      if (data.detections && Array.isArray(data.detections)) {
        setDetections(data.detections);
      }

      onGridUpdate?.(data);
    },
    [onGridUpdate]
  );

  const handleZoneUpdate = useCallback(
    (data: any) => {
      console.log("Zone density update received:", data);
      // Convert zones array to Record<string, number> for easy lookup by zone ID
      if (data.zones && Array.isArray(data.zones)) {
        const zonesMap: Record<string, number> = {};
        data.zones.forEach((zone: any) => {
          if (zone.zone_id && typeof zone.density === "number") {
            zonesMap[zone.zone_id] = zone.density;
          }
        });
        setZoneDensities(zonesMap);
      }
      onZoneUpdate?.(data);
    },
    [onZoneUpdate]
  );

  const handleAlert = useCallback(
    (alert: any) => {
      console.log("Alert triggered:", alert);
      setLatestAlert(alert);
      onAlert?.(alert);
    },
    [onAlert]
  );

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

  useEffect(() => {
    if (autoConnect) {
      websocketService.connect();
      setIsConnected(websocketService.isConnected() || false);
      setSocketId(websocketService.getSocketId());
    }

    return () => {
      if (!autoConnect) {
        websocketService.disconnect();
      }
    };
  }, [autoConnect]);

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

  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const subscribeToVenue = useCallback((cameraId: string) => {
    const success = websocketService.subscribeToVenue(cameraId);
    if (success) {
      subscribedVenueRef.current = cameraId;
    }
    return success;
  }, []);

  const unsubscribeFromVenue = useCallback((cameraId: string) => {
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
    isConnected,
    isReconnecting,
    socketId,
    lastDataReceived,
    gridDensity,
    zoneDensities,
    latestAlert,
    detections,
    connect,
    disconnect,
    subscribeToVenue,
    unsubscribeFromVenue,
    clearAlert,
  };
};

export default useWebSocket;

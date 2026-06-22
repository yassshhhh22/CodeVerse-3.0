import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Users,
  AlertTriangle,
  AlertCircle,
  Shield,
  Settings,
  Bell,
  Clock,
  Activity,
  Grid3x3,
  Eye,
  CheckCircle,
  XCircle,
  Check,
} from "lucide-react";
import { useVenueStore } from "../store/VenueStore";
import { useAlertStore } from "../store/AlertStore";
import { useGridStore } from "../store/GridStore";
import { useAuthStore } from "../store/AuthStore";
import { useZoneStore } from "../store/ZoneStore";
import { useWebSocket } from "../hooks/useWebSocket";
import UserMenu from "../components/UserMenu";
import AlertToast from "../components/AlertToast";
import ConnectionStatus from "../components/ConnectionStatus";

function DashboardPage() {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [systemStatus, setSystemStatus] = useState("online"); // online, delayed, offline
  const [selectedZone, setSelectedZone] = useState("stage");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastAlert, setToastAlert] = useState(null);

  // Zustand stores
  const { venues, fetchVenues } = useVenueStore();
  const { alerts, fetchAlerts, acknowledgeAlert } = useAlertStore();
  const { user, fetchMe } = useAuthStore();
  const { zones, fetchZonesByVenue } = useZoneStore();

  // Get selected venue camera_id for WebSocket subscription
  const selectedVenue =
    venues?.find((v) => v._id === selectedCamera) || venues?.[0] || null;
  const selectedCameraId = selectedVenue?.camera_id || null;

  // WebSocket hook for real-time updates
  const {
    isConnected: wsConnected,
    isReconnecting: wsReconnecting,
    gridDensity: wsGridDensity,
    zoneDensities: wsZoneDensities,
    latestAlert: wsLatestAlert,
    detections: wsDetections,
    lastDataReceived,
    clearAlert,
  } = useWebSocket(selectedCameraId, {
    autoConnect: true,
    autoSubscribe: true,
    onAlert: (alert) => {
      // Show toast notification
      setToastAlert(alert);
      setShowToast(true);

      // Play alert sound
      try {
        const audioData = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIGWi77fajUBAWXbfq66xHFQxNo+H0`;
        const audio = new Audio(audioData);
        audio.volume = 0.3;
        audio.play().catch((e) => console.log("Audio play failed:", e));
      } catch (e) {
        console.log("Audio not supported");
      }

      // Add to realtime alerts list
      setRealtimeAlerts((prev) => [alert, ...prev].slice(0, 10));

      // Also fetch updated alerts from API
      fetchAlerts({ limit: 10 });
    },
  });

  // Fetch initial data on mount
  useEffect(() => {
    fetchMe();
    fetchVenues();
    fetchAlerts({ limit: 10 }); // Fetch all recent alerts (both acknowledged and unacknowledged)
  }, []);

  // Poll alerts every 10 seconds
  useEffect(() => {
    const alertInterval = setInterval(() => {
      fetchAlerts({ limit: 10 }); // Fetch all recent alerts
    }, 10000); // 10 seconds

    return () => clearInterval(alertInterval);
  }, [fetchAlerts]);

  // Poll venues every 30 seconds to update status
  useEffect(() => {
    const venueInterval = setInterval(() => {
      fetchVenues();
    }, 30000); // 30 seconds

    return () => clearInterval(venueInterval);
  }, [fetchVenues]);

  // Debug: Log alerts when they change
  useEffect(() => {
    console.log("Dashboard alerts updated:", alerts);
  }, [alerts]);

  // Set default selected camera when venues load
  useEffect(() => {
    if (venues && venues.length > 0 && !selectedCamera) {
      setSelectedCamera(venues[0]._id);
    }
  }, [venues, selectedCamera]);

  // Fetch zones when selected camera/venue changes
  useEffect(() => {
    if (selectedCamera) {
      fetchZonesByVenue(selectedCamera);
    }
  }, [selectedCamera, fetchZonesByVenue]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in IST
  const getISTTime = () => {
    return currentTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getISTDate = () => {
    return currentTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Use real-time detections from WebSocket
  const frameDetections = wsDetections || [];

  // Get venue dimensions from selected venue or use defaults
  const VENUE_WIDTH = selectedVenue?.frame_width || 1280;
  const VENUE_HEIGHT = selectedVenue?.frame_height || 720;
  const GRID_SIZE = selectedVenue?.grid_rows || 50;
  const CELL_WIDTH = VENUE_WIDTH / GRID_SIZE;
  const CELL_HEIGHT = VENUE_HEIGHT / GRID_SIZE;

  const summaryData = {
    totalPeople: frameDetections.length,
    activeCameras: venues?.filter((v) => v.status === "active").length || 0,
    totalCameras: venues?.length || 0,
    warningZones: Array.isArray(alerts)
      ? alerts.filter((a) => a.severity === "warning" && !a.acknowledged_by)
          .length
      : 0,
    criticalZones: Array.isArray(alerts)
      ? alerts.filter((a) => a.severity === "critical" && !a.acknowledged_by)
          .length
      : 0,
  };

  // Use real grid density data from WebSocket or fallback to empty grid
  const getHeatmapGrid = () => {
    if (!wsGridDensity?.matrix?.length) {
      // Return empty grid if no data
      return Array(GRID_SIZE)
        .fill(0)
        .map(() => Array(GRID_SIZE).fill(0));
    }

    // Backend returns matrix as 2D array [rows][cols]
    return wsGridDensity.matrix;
  };

  const heatmapGrid = getHeatmapGrid();
  const maxHeat = Math.max(...heatmapGrid.flat(), 0.1);

  // Mark detections that collide (overlapping boxes)
  const getCollidingDetections = () => {
    const colliding = new Set();
    for (let i = 0; i < frameDetections.length; i++) {
      const a = frameDetections[i];
      for (let j = i + 1; j < frameDetections.length; j++) {
        const b = frameDetections[j];
        const overlapX = Math.max(
          0,
          Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x),
        );
        const overlapY = Math.max(
          0,
          Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y),
        );
        if (overlapX > 0 && overlapY > 0) {
          colliding.add(i);
          colliding.add(j);
        }
      }
    }
    return colliding;
  };

  const collidingDetections = getCollidingDetections();

  // Get smooth gradient color based on heat intensity
  const getHeatmapColor = (row, col) => {
    const heat = heatmapGrid[row][col];
    const intensity = Math.min(heat / maxHeat, 1);

    // Smooth color interpolation: green -> yellow -> orange -> red
    if (intensity < 0.1) {
      // Very low: dark green
      return `rgb(0, ${Math.floor(100 + intensity * 500)}, 0)`;
    } else if (intensity < 0.3) {
      // Low to medium: green to yellow
      const t = (intensity - 0.1) / 0.2;
      const r = Math.floor(t * 255);
      const g = Math.floor(200 + t * 55);
      return `rgb(${r}, ${g}, 0)`;
    } else if (intensity < 0.6) {
      // Medium to high: yellow to orange
      const t = (intensity - 0.3) / 0.3;
      const r = 255;
      const g = Math.floor(255 - t * 100);
      return `rgb(${r}, ${g}, 0)`;
    } else {
      // High to very high: orange to red
      const t = (intensity - 0.6) / 0.4;
      const r = 255;
      const g = Math.floor(155 * (1 - t));
      return `rgb(${r}, ${g}, 0)`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-500";
      case "delayed":
        return "text-yellow-500";
      case "offline":
        return "text-red-500";
      default:
        return "text-secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return "🟢";
      case "delayed":
        return "🟡";
      case "offline":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-text relative font-serif">
      {/* Alert Toast Notification */}
      {showToast && toastAlert && (
        <AlertToast
          alert={toastAlert}
          onClose={() => {
            setShowToast(false);
            setToastAlert(null);
          }}
        />
      )}

      {/* Background graphics */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-primary/30 via-primary/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-radial from-accent/30 via-accent/15 to-transparent rounded-full blur-3xl"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(79, 140, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 140, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* 1️⃣ Top Navigation Bar */}
      <nav className="fixed w-full top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-6">
              <Link
                to="/"
                className="text-lg sm:text-2xl font-bold text-primary flex items-center gap-2"
              >
                <Shield size={20} className="sm:w-7 sm:h-7" />
                <span className="hidden xs:inline">CrowdCrawl</span>
              </Link>
              <div className="hidden md:block h-8 w-px bg-border"></div>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-secondary text-sm">Venue:</span>
                <span
                  className="text-text font-semibold text-sm"
                  title="System is down due to low resources. Ask admin if needed."
                >
                  Main Hall
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* WebSocket Connection Status */}
              <ConnectionStatus
                wsConnected={wsConnected}
                wsReconnecting={wsReconnecting}
                venueConnected={!!selectedCameraId && wsConnected}
                lastDataReceived={lastDataReceived}
              />

              <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-background border border-border rounded-lg">
                <span className="text-xs sm:text-sm">
                  {getStatusIcon(systemStatus)} {summaryData.activeCameras}/
                  {summaryData.totalCameras} Cameras
                </span>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-16 sm:pt-20 px-3 sm:px-6 pb-4 sm:pb-6 max-w-[1920px] mx-auto">
        {/* 2️⃣ Global Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 max-w-6xl mx-auto">
          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-secondary text-sm sm:text-base">
                Total People
              </span>
              <Users size={20} className="sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
              {summaryData.totalPeople.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-secondary">
              Detected now
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-secondary text-sm sm:text-base">
                Active Cameras
              </span>
              <Camera size={20} className="sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
              {summaryData.activeCameras} / {summaryData.totalCameras}
            </div>
            <div className="text-xs sm:text-sm text-green-500">
              All systems operational
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-secondary text-sm sm:text-base">
                Live Time (IST)
              </span>
              <Clock size={20} className="sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
              {getISTTime()}
            </div>
            <div className="text-xs sm:text-sm text-secondary">
              {getISTDate()}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Heatmap and Table */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* 3️⃣ Live Crowd Heatmap */}
            <div className="bg-background/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Grid3x3 size={20} className="sm:w-6 sm:h-6 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold">
                    Live Crowd Heatmap
                  </h2>
                </div>
                {selectedVenue &&
                selectedVenue.status === "active" &&
                wsConnected &&
                lastDataReceived &&
                Date.now() - new Date(lastDataReceived).getTime() < 30000 ? (
                  <div className="flex items-center gap-2 text-xs text-green-500">
                    <Activity
                      size={12}
                      className="sm:w-3.5 sm:h-3.5 animate-pulse"
                    />
                    <span>Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <Activity size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span>Offline</span>
                  </div>
                )}
              </div>

              {/* Camera Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <label className="text-xs sm:text-sm text-secondary">
                  Select Camera:
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="flex-1 sm:flex-none bg-background border border-border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-primary focus:outline-none"
                >
                  {venues?.map((venue) => (
                    <option key={venue._id} value={venue._id}>
                      {venue.name} ({venue.status || "active"})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] sm:text-xs text-secondary sm:ml-auto flex items-center gap-1">
                  <Clock size={10} className="sm:w-3 sm:h-3 inline" />
                  Last updated:{" "}
                  {wsGridDensity?.timestamp
                    ? new Date(wsGridDensity.timestamp).toLocaleTimeString()
                    : "Just now"}
                </div>
              </div>

              {/* Venue Visualization with SVG Heatmap */}
              <div className="bg-black/50 rounded-lg p-2 sm:p-4 border border-border/50">
                <div
                  className="relative mx-auto"
                  style={{ maxWidth: "100%", aspectRatio: "16/9" }}
                >
                  <svg
                    viewBox={`0 0 ${VENUE_WIDTH} ${VENUE_HEIGHT}`}
                    className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg"
                    style={{ border: "2px solid rgba(79, 140, 255, 0.3)" }}
                  >
                    <defs>
                      <filter id="heatBlur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                      </filter>
                      {frameDetections.map((det, idx) => {
                        const isCollision = collidingDetections.has(idx);
                        const inner = isCollision
                          ? "rgba(255,80,40,0.75)"
                          : "rgba(255,215,0,0.6)";
                        const outer = isCollision
                          ? "rgba(255,80,40,0)"
                          : "rgba(255,215,0,0)";
                        return (
                          <radialGradient
                            key={`glow-grad-${idx}`}
                            id={`glow-grad-${idx}`}
                            cx="50%"
                            cy="50%"
                            r="50%"
                          >
                            <stop offset="0%" stopColor={inner} />
                            <stop offset="100%" stopColor={outer} />
                          </radialGradient>
                        );
                      })}
                    </defs>

                    {/* 50x50 Grid Heatmap with blur */}
                    <g filter="url(#heatBlur)">
                      {Array.from({ length: GRID_SIZE }).map((_, row) =>
                        Array.from({ length: GRID_SIZE }).map((_, col) => {
                          const color = getHeatmapColor(row, col);
                          return (
                            <rect
                              key={`grid-${row}-${col}`}
                              x={col * CELL_WIDTH}
                              y={row * CELL_HEIGHT}
                              width={CELL_WIDTH}
                              height={CELL_HEIGHT}
                              fill={color}
                              opacity="0.9"
                            />
                          );
                        }),
                      )}
                    </g>

                    {/* Detection-centered glows to keep points visible and scaled */}
                    <g filter="url(#heatBlur)">
                      {frameDetections.map((det, idx) => {
                        const cx = det.x + det.w / 2;
                        const cy = det.y + det.h / 2;
                        const base = Math.max(det.w, det.h);
                        const minRadius =
                          Math.min(VENUE_WIDTH, VENUE_HEIGHT) * 0.04;
                        const maxRadius =
                          Math.min(VENUE_WIDTH, VENUE_HEIGHT) * 0.18;
                        const radius = Math.max(
                          minRadius,
                          Math.min(maxRadius, base * 1.6),
                        );
                        return (
                          <circle
                            key={`glow-circle-${idx}`}
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill={`url(#glow-grad-${idx})`}
                            opacity="0.9"
                          />
                        );
                      })}
                    </g>

                    {/* Grid Lines */}
                    <g>
                      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                        <line
                          key={`vline-${i}`}
                          x1={i * CELL_WIDTH}
                          y1={0}
                          x2={i * CELL_WIDTH}
                          y2={VENUE_HEIGHT}
                          stroke="rgba(100, 140, 200, 0.25)"
                          strokeWidth="0.5"
                        />
                      ))}
                      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                        <line
                          key={`hline-${i}`}
                          x1={0}
                          y1={i * CELL_HEIGHT}
                          x2={VENUE_WIDTH}
                          y2={i * CELL_HEIGHT}
                          stroke="rgba(100, 140, 200, 0.25)"
                          strokeWidth="0.5"
                        />
                      ))}
                    </g>

                    {/* Detection Bounding Boxes */}
                    {frameDetections.map((det, idx) => (
                      <g key={`detection-${idx}`}>
                        <rect
                          x={det.x}
                          y={det.y}
                          width={det.w}
                          height={det.h}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2"
                          opacity="0.85"
                        />
                        <circle
                          cx={det.x + det.w / 2}
                          cy={det.y + det.h / 2}
                          r="3"
                          fill="#ffffff"
                          stroke="#000000"
                          strokeWidth="1"
                          opacity="1"
                        />
                        <text
                          x={det.x + 5}
                          y={det.y + 18}
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          stroke="#000000"
                          strokeWidth="0.5"
                          style={{ textShadow: "0 0 4px black" }}
                        >
                          {idx + 1}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Overlay Info */}
                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black/70 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg border border-primary/30 text-[10px] sm:text-xs">
                    <div className="text-primary font-semibold">
                      Venue: 1280x720 | Grid: 50x50
                    </div>
                    <div className="text-green-400">
                      ✓ {frameDetections.length} People Detected
                    </div>
                  </div>
                </div>

                {/* Color Scale Legend */}
                <div className="flex items-center justify-between mt-2 sm:mt-4 px-1 sm:px-2">
                  <span className="text-[10px] sm:text-xs text-secondary">
                    Low Density
                  </span>
                  <div className="flex gap-0.5 sm:gap-1">
                    <div className="w-4 sm:w-6 h-2 sm:h-3 bg-blue-500 rounded"></div>
                    <div className="w-4 sm:w-6 h-2 sm:h-3 bg-green-500 rounded"></div>
                    <div className="w-4 sm:w-6 h-2 sm:h-3 bg-yellow-500 rounded"></div>
                    <div className="w-4 sm:w-6 h-2 sm:h-3 bg-accent rounded"></div>
                    <div className="w-4 sm:w-6 h-2 sm:h-3 bg-orange-500 rounded"></div>
                    <div className="w-4 sm:w-6 h-2 sm:h-3 bg-red-500 rounded"></div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-secondary">
                    High Density
                  </span>
                </div>
              </div>
            </div>

            {/* 5️⃣ Camera / Zone Status Table */}
            <div className="bg-background/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Camera size={20} className="sm:w-6 sm:h-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold">
                  Camera / Zone Status
                </h2>
              </div>

              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 sm:py-3 px-2 text-secondary font-semibold text-[10px] sm:text-xs">
                        Camera ID
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 text-secondary font-semibold text-[10px] sm:text-xs">
                        Zone Name
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 text-secondary font-semibold text-[10px] sm:text-xs">
                        Status
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 text-secondary font-semibold text-[10px] sm:text-xs">
                        Density
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 text-secondary font-semibold text-[10px] sm:text-xs">
                        Last Update
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones && zones.length > 0 ? (
                      zones.map((zone) => {
                        const zoneDensity = wsZoneDensities?.find(
                          (zd) => zd.zone_id === zone._id,
                        );
                        const densityValue = zoneDensity?.count || 0;
                        const densityPercentage = Math.min(
                          Math.round(densityValue),
                          100,
                        );
                        const venue = venues?.find(
                          (v) => v._id === zone.venue_id,
                        );
                        const isLive =
                          venue?.status === "active" &&
                          wsConnected &&
                          lastDataReceived &&
                          Date.now() - new Date(lastDataReceived).getTime() <
                            30000;
                        const status = isLive ? "online" : "offline";

                        return (
                          <tr
                            key={zone._id}
                            className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                          >
                            <td className="py-2 sm:py-3 px-2 font-mono text-[10px] sm:text-xs">
                              {venue?.camera_id || "N/A"}
                            </td>
                            <td className="py-2 sm:py-3 px-2 text-xs sm:text-sm">
                              {zone.name}
                            </td>
                            <td className="py-2 sm:py-3 px-2">
                              <span
                                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${getStatusColor(status)}`}
                              >
                                {status === "online" && (
                                  <CheckCircle
                                    size={12}
                                    className="sm:w-3.5 sm:h-3.5"
                                  />
                                )}
                                {status === "offline" && (
                                  <XCircle
                                    size={12}
                                    className="sm:w-3.5 sm:h-3.5"
                                  />
                                )}
                                <span className="hidden sm:inline">
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </span>
                              </span>
                            </td>
                            <td className="py-2 sm:py-3 px-2">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <div className="w-12 sm:w-16 bg-border rounded-full h-1.5 sm:h-2 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      densityPercentage >= 90
                                        ? "bg-red-500"
                                        : densityPercentage >= 75
                                          ? "bg-accent"
                                          : "bg-green-500"
                                    }`}
                                    style={{ width: `${densityPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] sm:text-xs">
                                  {densityPercentage}%
                                </span>
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-2 text-[10px] sm:text-xs text-secondary">
                              {isLive && lastDataReceived
                                ? (() => {
                                    const seconds = Math.floor(
                                      (Date.now() -
                                        new Date(lastDataReceived).getTime()) /
                                        1000,
                                    );
                                    if (seconds < 5) return "Just now";
                                    if (seconds < 60) return `${seconds}s ago`;
                                    return `${Math.floor(seconds / 60)}m ago`;
                                  })()
                                : "No data"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-4 text-center text-secondary text-sm"
                        >
                          No zones configured for this venue
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Alerts and Admin */}
          <div className="space-y-6">
            {/* 4️⃣ Alerts & Events Panel */}
            <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell size={24} className="text-primary" />
                <h2 className="text-xl font-bold">Live Alerts</h2>
                <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-3">
                {alerts && alerts.length > 0 ? (
                  alerts.slice(0, 5).map((alert) => {
                    const zoneName =
                      alert.zone_id?.name ||
                      alert.venue_id?.name ||
                      "Unknown Zone";
                    const timeAgo = alert.triggered_at
                      ? new Date(alert.triggered_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A";
                    const isAcknowledged =
                      alert.acknowledged_by !== null &&
                      alert.acknowledged_by !== undefined;

                    return (
                      <div
                        key={alert._id}
                        className={`p-4 rounded-lg border ${
                          isAcknowledged
                            ? "bg-gray-500/10 border-gray-500/30 opacity-60"
                            : alert.severity === "critical"
                              ? "bg-red-500/10 border-red-500/50"
                              : "bg-accent/10 border-accent/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isAcknowledged ? (
                              <CheckCircle
                                size={18}
                                className="text-green-500"
                              />
                            ) : alert.severity === "critical" ? (
                              <AlertCircle size={18} className="text-red-500" />
                            ) : (
                              <AlertTriangle
                                size={18}
                                className="text-accent"
                              />
                            )}
                            <span className="font-semibold">{zoneName}</span>
                            {isAcknowledged && (
                              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                                Acknowledged
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-secondary">
                            {timeAgo}
                          </span>
                        </div>
                        <p className="text-sm text-secondary mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-secondary">Density:</span>
                            <span className="text-primary font-semibold">
                              {alert.density_value}%
                            </span>
                          </div>
                          {!isAcknowledged && (
                            <button
                              onClick={async () => {
                                const result = await acknowledgeAlert(
                                  alert._id,
                                );
                                if (result.success) {
                                  // Alert is already updated in store by acknowledgeAlert
                                  console.log(
                                    "Alert acknowledged successfully",
                                  );
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-medium transition-colors"
                            >
                              <Check size={14} />
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-secondary">
                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No active alerts</p>
                    <p className="text-xs mt-1">
                      All zones are operating normally
                    </p>
                  </div>
                )}
              </div>

              {/* Navigate to Historical Analysis */}
              <Link
                to="/analytics"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary/10 border border-primary/30 rounded-lg hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 group"
              >
                <Activity size={18} className="text-primary" />
                <span className="text-sm font-semibold text-primary">
                  View Historical Analysis
                </span>
                <svg
                  className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* 7️⃣ Admin Configuration Panel 
            <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings size={24} className="text-primary" />
                <h2 className="text-xl font-bold">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-secondary mb-2 block">
                    Warning Threshold
                  </label>
                  <input
                    type="number"
                    defaultValue={75}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary mb-2 block">
                    Critical Threshold
                  </label>
                  <input
                    type="number"
                    defaultValue={90}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-secondary mb-2 block">
                    Grid Size
                  </label>
                  <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none">
                    <option>10x8 (Default)</option>
                    <option>15x12 (High Detail)</option>
                    <option>8x6 (Performance)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Enable Alerts</span>
                  <button className="w-12 h-6 bg-primary rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>

                <button className="w-full py-2.5 bg-primary text-background font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(79,140,255,0.5)] transition-all duration-300">
                  Save Changes
                </button>
              </div>
            </div>
            */}
          </div>
        </div>

        {/* 8️⃣ Footer / Info Panel */}
        <div className="mt-6 bg-background/60 border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-secondary">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield size={12} />
                <span>
                  Privacy: No video storage • Metadata only • GDPR compliant
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} />
              <span>Last system sync: Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

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
} from "lucide-react";
import { useVenueStore } from "../store/VenueStore";
import { useAlertStore } from "../store/AlertStore";
import { useGridStore } from "../store/GridStore";
import { useAuthStore } from "../store/AuthStore";
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
  const { alerts, fetchAlerts } = useAlertStore();
  const { user, fetchMe } = useAuthStore();

  // Get selected venue camera_id for WebSocket subscription
  const selectedVenue = venues?.find(v => v._id === selectedCamera) || venues?.[0] || null;
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
        audio.play().catch(e => console.log("Audio play failed:", e));
      } catch (e) {
        console.log("Audio not supported");
      }
      
      // Add to realtime alerts list
      setRealtimeAlerts(prev => [alert, ...prev].slice(0, 10));
      
      // Also fetch updated alerts from API
      fetchAlerts({ limit: 10, acknowledged: "false" });
    },
  });

  // Fetch initial data on mount
  useEffect(() => {
    fetchMe();
    fetchVenues();
    fetchAlerts({ limit: 10, acknowledged: "false" });
  }, []);

  // Set default selected camera when venues load
  useEffect(() => {
    if (venues && venues.length > 0 && !selectedCamera) {
      setSelectedCamera(venues[0]._id);
    }
  }, [venues, selectedCamera]);

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
    activeCameras: venues?.filter(v => v.status === 'active').length || 0,
    totalCameras: venues?.length || 0,
    warningZones: alerts?.filter(a => a.severity === 'warning' && !a.acknowledged_by).length || 0,
    criticalZones: alerts?.filter(a => a.severity === 'critical' && !a.acknowledged_by).length || 0,
  };

  // Use real grid density data from WebSocket or fallback to empty grid
  const getHeatmapGrid = () => {
    if (!wsGridDensity?.matrix?.length) {
      // Return empty grid if no data
      return Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    }

    // Backend returns matrix as 2D array [rows][cols]
    return wsGridDensity.matrix;
  };

  const heatmapGrid = getHeatmapGrid();
  const maxHeat = Math.max(...heatmapGrid.flat(), 0.1);

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

  const mockAlerts = [
    {
      id: 1,
      zone: "Stage Area",
      severity: "critical",
      message: "Crowd density exceeded safe limit",
      action: "Pause entry",
      time: "2 mins ago",
    },
    {
      id: 2,
      zone: "Food Court",
      severity: "warning",
      message: "Density approaching threshold",
      action: "Monitor closely",
      time: "5 mins ago",
    },
    {
      id: 3,
      zone: "Exit Gate 2",
      severity: "warning",
      message: "Bottleneck detected",
      action: "Open additional exits",
      time: "8 mins ago",
    },
  ];

  const cameras = [
    {
      id: "camera-1",
      name: "Stage Area",
      status: "online",
      density: 92,
      lastUpdate: "Just now",
    },
    {
      id: "camera-2",
      name: "Food Court",
      status: "online",
      density: 78,
      lastUpdate: "2 sec ago",
    },
    {
      id: "camera-3",
      name: "Exit Gate 1",
      status: "online",
      density: 45,
      lastUpdate: "1 sec ago",
    },
    {
      id: "camera-4",
      name: "Exit Gate 2",
      status: "online",
      density: 73,
      lastUpdate: "3 sec ago",
    },
    {
      id: "camera-5",
      name: "Parking Lot",
      status: "offline",
      density: 0,
      lastUpdate: "5 mins ago",
    },
  ];

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
                <span className="text-text font-semibold text-sm">
                  CodeVerse 3.0 Main Hall
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
                  {getStatusIcon(systemStatus)} {summaryData.activeCameras}/{summaryData.totalCameras} Cameras
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
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Activity
                    size={12}
                    className="sm:w-3.5 sm:h-3.5 text-green-500 animate-pulse"
                  />
                  <span>Live</span>
                </div>
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
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.name} ({cam.status})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] sm:text-xs text-secondary sm:ml-auto flex items-center gap-1">
                  <Clock size={10} className="sm:w-3 sm:h-3 inline" />
                  Last updated: Just now
                </div>
              </div>

              {/* Venue Visualization with Fixed Dimensions */}
              <div className="bg-black/50 rounded-lg p-2 sm:p-4 border border-border/50">
                <div
                  className="relative mx-auto"
                  style={{ maxWidth: "100%", aspectRatio: "16/9" }}
                >
                  {/* SVG Canvas for Fixed 1280x720 venue */}
                  <svg
                    viewBox={`0 0 ${VENUE_WIDTH} ${VENUE_HEIGHT}`}
                    className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg"
                    style={{ border: "2px solid rgba(79, 140, 255, 0.3)" }}
                  >
                    {/* Blur filter for smooth heatmap effect */}
                    <defs>
                      <filter id="heatBlur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                      </filter>
                    </defs>

                    {/* 50x50 Grid Heatmap (blurred, smooth gradient) */}
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
                              opacity="0.85"
                            />
                          );
                        })
                      )}
                    </g>

                    {/* Grid Lines (crisp, for zone definition) */}
                    <g>
                      {/* Vertical lines */}
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
                      {/* Horizontal lines */}
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

                    {/* Detection Bounding Boxes (sharp, on top) */}
                    {frameDetections.map((det, idx) => (
                      <g key={`detection-${idx}`}>
                        {/* Bounding Box */}
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
                        {/* Center Point Marker */}
                        <circle
                          cx={det.x + det.w / 2}
                          cy={det.y + det.h / 2}
                          r="3"
                          fill="#ffffff"
                          stroke="#000000"
                          strokeWidth="1"
                          opacity="1"
                        />
                        {/* Label */}
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
                    {cameras.map((camera) => (
                      <tr
                        key={camera.id}
                        className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                      >
                        <td className="py-2 sm:py-3 px-2 font-mono text-[10px] sm:text-xs">
                          {camera.id}
                        </td>
                        <td className="py-2 sm:py-3 px-2 text-xs sm:text-sm">
                          {camera.name}
                        </td>
                        <td className="py-2 sm:py-3 px-2">
                          <span
                            className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${getStatusColor(
                              camera.status
                            )}`}
                          >
                            {camera.status === "online" && (
                              <CheckCircle
                                size={12}
                                className="sm:w-3.5 sm:h-3.5"
                              />
                            )}
                            {camera.status === "offline" && (
                              <XCircle
                                size={12}
                                className="sm:w-3.5 sm:h-3.5"
                              />
                            )}
                            <span className="hidden sm:inline">
                              {camera.status.charAt(0).toUpperCase() +
                                camera.status.slice(1)}
                            </span>
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-12 sm:w-16 bg-border rounded-full h-1.5 sm:h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  camera.density >= 90
                                    ? "bg-red-500"
                                    : camera.density >= 75
                                    ? "bg-accent"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${camera.density}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] sm:text-xs">
                              {camera.density}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 text-[10px] sm:text-xs text-secondary">
                          {camera.lastUpdate}
                        </td>
                      </tr>
                    ))}
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
                {(alerts && alerts.length > 0 ? alerts : mockAlerts).map((alert) => (
                  <div
                    key={alert.id || alert._id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === "critical"
                        ? "bg-red-500/10 border-red-500/50"
                        : "bg-accent/10 border-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {alert.severity === "critical" ? (
                          <AlertCircle size={18} className="text-red-500" />
                        ) : (
                          <AlertTriangle size={18} className="text-accent" />
                        )}
                        <span className="font-semibold">{alert.zone}</span>
                      </div>
                      <span className="text-xs text-secondary">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-secondary">Suggested action:</span>
                      <span className="text-primary font-semibold">
                        {alert.action}
                      </span>
                    </div>
                  </div>
                ))}
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

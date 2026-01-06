import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Svg, {
  Rect,
  G,
  Defs,
  Filter,
  FeGaussianBlur,
  Circle,
  Text as SvgText,
} from "react-native-svg";
import { useAuthStore } from "../store/AuthStore";
import { useVenueStore } from "../store/VenueStore";
import { useAlertStore } from "../store/AlertStore";
import { useZoneStore } from "../store/ZoneStore";
import { useWebSocket } from "../hooks/useWebSocket";

const { width: screenWidth } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const { user, fetchMe, hydrateAuth, isLoading } = useAuthStore();
  const { venues, fetchVenues } = useVenueStore();
  const { alerts, fetchAlerts, acknowledgeAlert } = useAlertStore();
  const { zones, fetchZonesByVenue } = useZoneStore();

  const selectedVenue =
    venues?.find((v) => v._id === selectedVenueId) || venues?.[0] || null;
  const selectedCameraId = selectedVenue?.camera_id || null;

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
      fetchAlerts({ limit: 10 });
    },
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      setInitializing(true);
      await hydrateAuth();
      const userResult = await fetchMe();

      if (!userResult?.success) {
        router.replace("/login");
        return;
      }

      await Promise.all([fetchVenues(), fetchAlerts({ limit: 10 })]);
      setInitializing(false);
    };

    initializeDashboard();
  }, []);

  // Auto-select first venue when venues load
  useEffect(() => {
    if (venues && venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0]._id);
    }
  }, [venues]);

  useEffect(() => {
    if (selectedVenue?._id) {
      fetchZonesByVenue(selectedVenue._id);
    }
  }, [selectedVenue?._id]);

  useEffect(() => {
    const alertInterval = setInterval(() => {
      fetchAlerts({ limit: 10 });
    }, 10000);
    return () => clearInterval(alertInterval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchVenues(),
      fetchAlerts({ limit: 10 }),
      selectedVenue?._id && fetchZonesByVenue(selectedVenue._id),
    ]);
    setRefreshing(false);
  };

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

  // Use live detections only; if none, show zero people instead of mock data
  const frameDetections =
    wsDetections && wsDetections.length > 0 ? wsDetections : [];

  const VENUE_WIDTH = 1280;
  const VENUE_HEIGHT = 720;
  const GRID_SIZE = 50;
  const CELL_WIDTH = VENUE_WIDTH / GRID_SIZE;
  const CELL_HEIGHT = VENUE_HEIGHT / GRID_SIZE;

  const summaryData = {
    totalPeople: frameDetections.length,
    activeCameras: venues?.filter((v) => v.status === "active").length || 0,
    totalCameras: venues?.length || 0,
  };

  // Calculate heatmap with useMemo
  const { heatmapGrid, maxHeat } = useMemo(() => {
    const grid = Array(GRID_SIZE)
      .fill(0)
      .map(() => Array(GRID_SIZE).fill(0));

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cellCenterX = col * CELL_WIDTH + CELL_WIDTH / 2;
        const cellCenterY = row * CELL_HEIGHT + CELL_HEIGHT / 2;

        let totalHeat = 0;

        frameDetections.forEach((det) => {
          const personX = det.x + det.w / 2;
          const personY = det.y + det.h / 2;

          const dx = cellCenterX - personX;
          const dy = cellCenterY - personY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const maxRadius = 200;
          if (distance < maxRadius) {
            const heat = Math.pow(1 - distance / maxRadius, 2);
            totalHeat += heat;
          }
        });

        grid[row][col] = totalHeat;
      }
    }

    const max = Math.max(...grid.flat(), 0.1);
    return { heatmapGrid: grid, maxHeat: max };
  }, []);

  const getHeatmapColor = (row: number, col: number) => {
    // Ensure indices are integers and within bounds
    const r = Math.floor(row);
    const c = Math.floor(col);

    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
      return "rgba(0, 0, 0, 0.6)"; // Return default color for out of bounds
    }

    const heat = heatmapGrid[r][c];
    const intensity = Math.min(heat / maxHeat, 1);

    if (intensity < 0.1) {
      return `rgba(0, ${Math.floor(100 + intensity * 500)}, 0, 0.6)`;
    } else if (intensity < 0.3) {
      const t = (intensity - 0.1) / 0.2;
      const red = Math.floor(t * 255);
      const green = Math.floor(200 + t * 55);
      return `rgba(${red}, ${green}, 0, 0.7)`;
    } else if (intensity < 0.6) {
      const t = (intensity - 0.3) / 0.3;
      const red = 255;
      const green = Math.floor(255 - t * 100);
      return `rgba(${red}, ${green}, 0, 0.8)`;
    } else {
      const t = (intensity - 0.6) / 0.4;
      const red = 255;
      const green = Math.floor(155 * (1 - t));
      return `rgba(${red}, ${green}, 0, 0.9)`;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
      </View>

      {/* Show loading spinner during initialization */}
      {initializing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F8CFF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons name="shield-checkmark" size={24} color="#4F8CFF" />
                <Text style={styles.headerTitle}>CrowdCrawl</Text>
              </View>
              <View style={styles.headerRight}>
                <View style={styles.connectionStatus}>
                  <View
                    style={[
                      styles.connectionDot,
                      {
                        backgroundColor: wsConnected
                          ? "#10b981"
                          : wsReconnecting
                          ? "#f59e0b"
                          : "#ef4444",
                      },
                    ]}
                  />
                  <Text style={styles.connectionText}>
                    {wsConnected
                      ? "Live"
                      : wsReconnecting
                      ? "Connecting"
                      : "Offline"}
                  </Text>
                </View>
                {user && (
                  <View style={styles.adminBadge}>
                    <Ionicons name="person" size={14} color="#4F8CFF" />
                    <View>
                      <Text style={styles.adminUser}>
                        {user.username || user.email || "User"}
                      </Text>
                      <Text style={styles.adminRole}>
                        {user.role || "User"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4F8CFF"
              />
            }
          >
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>Total People</Text>
                  <Ionicons name="people" size={20} color="#4F8CFF" />
                </View>
                <Text style={styles.cardValue}>{summaryData.totalPeople}</Text>
                <Text style={styles.cardSubtext}>Detected now</Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>Active Cameras</Text>
                  <Ionicons name="videocam" size={20} color="#4F8CFF" />
                </View>
                <Text style={styles.cardValue}>
                  {summaryData.activeCameras}/{summaryData.totalCameras}
                </Text>
                <Text style={[styles.cardSubtext, { color: "#10b981" }]}>
                  All operational
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>Live Time (IST)</Text>
                  <Ionicons name="time" size={20} color="#4F8CFF" />
                </View>
                <Text style={styles.cardValueTime}>{getISTTime()}</Text>
                <Text style={styles.cardSubtext}>{getISTDate()}</Text>
              </View>
            </View>

            {/* Venue Selection */}
            {venues && venues.length > 1 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="location" size={20} color="#4F8CFF" />
                    <Text style={styles.sectionTitle}>Select Venue</Text>
                  </View>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedVenueId}
                    onValueChange={(itemValue) => setSelectedVenueId(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#4F8CFF"
                  >
                    {venues.map((venue) => (
                      <Picker.Item
                        key={venue._id}
                        label={`${venue.name} (Camera: ${venue.camera_id})`}
                        value={venue._id}
                        color="#E8ECF1"
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Camera Status */}
            {selectedVenue && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="videocam" size={20} color="#4F8CFF" />
                    <Text style={styles.sectionTitle}>Camera Status</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          selectedVenue.status === "active"
                            ? "rgba(16, 185, 129, 0.2)"
                            : "rgba(239, 68, 68, 0.2)",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            selectedVenue.status === "active"
                              ? "#10b981"
                              : "#ef4444",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            selectedVenue.status === "active"
                              ? "#10b981"
                              : "#ef4444",
                        },
                      ]}
                    >
                      {selectedVenue.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </Text>
                  </View>
                </View>
                <View style={styles.cameraCard}>
                  <View style={styles.cameraRow}>
                    <View style={styles.cameraInfo}>
                      <Text style={styles.cameraLabel}>Camera ID</Text>
                      <Text style={styles.cameraValue}>
                        {selectedVenue.camera_id}
                      </Text>
                    </View>
                    <View style={styles.cameraInfo}>
                      <Text style={styles.cameraLabel}>Resolution</Text>
                      <Text style={styles.cameraValue}>
                        {selectedVenue.width && selectedVenue.height
                          ? `${selectedVenue.width}x${selectedVenue.height}`
                          : "N/A"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cameraRow}>
                    <View style={styles.cameraInfo}>
                      <Text style={styles.cameraLabel}>Detections</Text>
                      <Text style={styles.cameraValue}>
                        {frameDetections.length} people
                      </Text>
                    </View>
                    <View style={styles.cameraInfo}>
                      <Text style={styles.cameraLabel}>Connection</Text>
                      <Text
                        style={[
                          styles.cameraValue,
                          { color: wsConnected ? "#10b981" : "#ef4444" },
                        ]}
                      >
                        {wsConnected ? "Connected" : "Disconnected"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Zones Status */}
            {zones && zones.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="cube-outline" size={20} color="#4F8CFF" />
                    <Text style={styles.sectionTitle}>Zone Monitoring</Text>
                  </View>
                  <Text style={styles.zoneCount}>{zones.length} zones</Text>
                </View>
                <View style={styles.zonesContainer}>
                  {zones.map((zone) => {
                    const zoneDensity = wsZoneDensities?.[zone._id] || 0;
                    const densityPercentage =
                      zone.density_threshold > 0
                        ? (zoneDensity / zone.density_threshold) * 100
                        : 0;
                    const isWarning = densityPercentage >= 80;
                    const isDanger = densityPercentage >= 100;

                    return (
                      <View key={zone._id} style={styles.zoneCard}>
                        <View style={styles.zoneHeader}>
                          <View style={styles.zoneNameContainer}>
                            <Ionicons
                              name="cube"
                              size={16}
                              color={
                                isDanger
                                  ? "#ef4444"
                                  : isWarning
                                  ? "#f59e0b"
                                  : "#10b981"
                              }
                            />
                            <Text style={styles.zoneName}>{zone.name}</Text>
                          </View>
                          <View
                            style={[
                              styles.zoneBadge,
                              {
                                backgroundColor: isDanger
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : isWarning
                                  ? "rgba(245, 158, 11, 0.2)"
                                  : "rgba(16, 185, 129, 0.2)",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.zoneBadgeText,
                                {
                                  color: isDanger
                                    ? "#ef4444"
                                    : isWarning
                                    ? "#f59e0b"
                                    : "#10b981",
                                },
                              ]}
                            >
                              {isDanger
                                ? "Critical"
                                : isWarning
                                ? "Warning"
                                : "Safe"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.zoneMetrics}>
                          <View style={styles.zoneMetric}>
                            <Text style={styles.zoneMetricLabel}>
                              Current Density
                            </Text>
                            <Text style={styles.zoneMetricValue}>
                              {zoneDensity}
                            </Text>
                          </View>
                          <View style={styles.zoneMetric}>
                            <Text style={styles.zoneMetricLabel}>
                              Threshold
                            </Text>
                            <Text style={styles.zoneMetricValue}>
                              {zone.density_threshold}
                            </Text>
                          </View>
                          <View style={styles.zoneMetric}>
                            <Text style={styles.zoneMetricLabel}>Capacity</Text>
                            <Text style={styles.zoneMetricValue}>
                              {zone.capacity}
                            </Text>
                          </View>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressBarContainer}>
                          <View style={styles.progressBarBackground}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${Math.min(densityPercentage, 100)}%`,
                                  backgroundColor: isDanger
                                    ? "#ef4444"
                                    : isWarning
                                    ? "#f59e0b"
                                    : "#10b981",
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressBarLabel}>
                            {densityPercentage.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Heatmap */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="grid" size={20} color="#4F8CFF" />
                  <Text style={styles.sectionTitle}>Live Crowd Heatmap</Text>
                </View>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              </View>

              {/* Heatmap Visualization with Detection Boxes */}
              <View style={styles.heatmapContainer}>
                <Svg
                  width="100%"
                  height={screenWidth * 0.9 * (VENUE_HEIGHT / VENUE_WIDTH)}
                  viewBox={`0 0 ${VENUE_WIDTH} ${VENUE_HEIGHT}`}
                  style={styles.svg}
                >
                  <Defs>
                    <Filter id="heatBlur">
                      <FeGaussianBlur stdDeviation="8" />
                    </Filter>
                  </Defs>

                  {/* Heatmap background with blur */}
                  <G filter="url(#heatBlur)">
                    {Array.from({ length: GRID_SIZE }).map((_, row) =>
                      Array.from({ length: GRID_SIZE }).map((_, col) => {
                        const color = getHeatmapColor(row, col);
                        return (
                          <Rect
                            key={`grid-${row}-${col}`}
                            x={col * CELL_WIDTH}
                            y={row * CELL_HEIGHT}
                            width={CELL_WIDTH}
                            height={CELL_HEIGHT}
                            fill={color}
                            opacity="0.8"
                          />
                        );
                      })
                    )}
                  </G>

                  {/* Detection bounding boxes */}
                  {frameDetections.map((det, idx) => (
                    <G key={`detection-${idx}`}>
                      {/* White bounding box */}
                      <Rect
                        x={det.x}
                        y={det.y}
                        width={det.w}
                        height={det.h}
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        opacity="0.9"
                      />

                      {/* Center dot */}
                      <Circle
                        cx={det.x + det.w / 2}
                        cy={det.y + det.h / 2}
                        r="4"
                        fill="white"
                        opacity="0.9"
                      />

                      {/* Person number label */}
                      <SvgText
                        x={det.x + 5}
                        y={det.y + 15}
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        opacity="1"
                      >
                        {idx + 1}
                      </SvgText>
                    </G>
                  ))}

                  {/* Grid lines (optional, subtle) */}
                  <G opacity="0.1">
                    {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                      <React.Fragment key={`grid-${i}`}>
                        <Rect
                          x={i * CELL_WIDTH}
                          y={0}
                          width={1}
                          height={VENUE_HEIGHT}
                          fill="#E8ECF1"
                        />
                        <Rect
                          x={0}
                          y={i * CELL_HEIGHT}
                          width={VENUE_WIDTH}
                          height={1}
                          fill="#E8ECF1"
                        />
                      </React.Fragment>
                    ))}
                  </G>
                </Svg>

                <View style={styles.heatmapOverlay}>
                  <Text style={styles.heatmapText}>
                    Venue: 1280x720 | Grid: 50x50
                  </Text>
                  <Text style={styles.heatmapPeople}>
                    ✓ {frameDetections.length} People Detected
                  </Text>
                </View>

                {/* Color Scale Legend */}
                <View style={styles.colorLegend}>
                  <Text style={styles.legendTitle}>Density Scale</Text>
                  <View style={styles.legendBar}>
                    <View
                      style={[
                        styles.legendSegment,
                        { backgroundColor: "rgba(0, 100, 0, 0.6)" },
                      ]}
                    />
                    <View
                      style={[
                        styles.legendSegment,
                        { backgroundColor: "rgba(100, 200, 0, 0.7)" },
                      ]}
                    />
                    <View
                      style={[
                        styles.legendSegment,
                        { backgroundColor: "rgba(255, 200, 0, 0.8)" },
                      ]}
                    />
                    <View
                      style={[
                        styles.legendSegment,
                        { backgroundColor: "rgba(255, 150, 0, 0.8)" },
                      ]}
                    />
                    <View
                      style={[
                        styles.legendSegment,
                        { backgroundColor: "rgba(255, 100, 0, 0.9)" },
                      ]}
                    />
                    <View
                      style={[
                        styles.legendSegment,
                        { backgroundColor: "rgba(255, 0, 0, 0.9)" },
                      ]}
                    />
                  </View>
                  <View style={styles.legendLabels}>
                    <Text style={styles.legendLabel}>Low</Text>
                    <Text style={styles.legendLabel}>Medium</Text>
                    <Text style={styles.legendLabel}>High</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Historical Analysis Button */}
            <TouchableOpacity
              style={styles.analyticsButton}
              onPress={() => router.push("/historical-analysis")}
            >
              <Ionicons name="stats-chart" size={18} color="#4F8CFF" />
              <Text style={styles.analyticsButtonText}>
                View Historical Analysis
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#4F8CFF" />
            </TouchableOpacity>

            {/* Live Alerts */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="notifications" size={20} color="#4F8CFF" />
                  <Text style={styles.sectionTitle}>Live Alerts</Text>
                </View>
                <View style={styles.alertDot} />
              </View>

              {alerts && alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert: any) => {
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
                  const isAcknowledged = alert.acknowledged_by !== null;

                  return (
                    <View
                      key={alert._id}
                      style={[
                        styles.alertCard,
                        isAcknowledged && styles.alertAcknowledged,
                        alert.severity === "critical" &&
                          !isAcknowledged &&
                          styles.alertCritical,
                      ]}
                    >
                      <View style={styles.alertHeader}>
                        <View style={styles.alertTitleRow}>
                          <Ionicons
                            name={
                              isAcknowledged
                                ? "checkmark-circle"
                                : alert.severity === "critical"
                                ? "alert-circle"
                                : "warning"
                            }
                            size={18}
                            color={
                              isAcknowledged
                                ? "#10b981"
                                : alert.severity === "critical"
                                ? "#ef4444"
                                : "#f59e0b"
                            }
                          />
                          <Text style={styles.alertZone}>{zoneName}</Text>
                        </View>
                        <Text style={styles.alertTime}>{timeAgo}</Text>
                      </View>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                      {!isAcknowledged && (
                        <TouchableOpacity
                          onPress={async () => {
                            const result = await acknowledgeAlert(alert._id);
                            if (result.success) {
                              fetchAlerts({ limit: 10 });
                            }
                          }}
                          style={styles.acknowledgeButton}
                        >
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#4F8CFF"
                          />
                          <Text style={styles.acknowledgeButtonText}>
                            Acknowledge
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.noAlertsContainer}>
                  <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                  <Text style={styles.noAlertsText}>No active alerts</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  orb1: {
    top: 0,
    right: 0,
    width: 300,
    height: 300,
    backgroundColor: "rgba(79, 140, 255, 0.3)",
  },
  orb2: {
    bottom: 0,
    left: 0,
    width: 350,
    height: 350,
    backgroundColor: "rgba(154, 164, 178, 0.3)",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(16, 21, 30, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4F8CFF",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(79, 140, 255, 0.3)",
    borderRadius: 8,
  },
  adminUser: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E8ECF1",
  },
  adminRole: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9AA4B2",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryContainer: {
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: "#9AA4B2",
  },
  cardValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#E8ECF1",
    marginBottom: 4,
  },
  cardValueTime: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E8ECF1",
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: "#9AA4B2",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E8ECF1",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  liveText: {
    fontSize: 12,
    color: "#9AA4B2",
  },
  heatmapContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 2,
    borderColor: "rgba(79, 140, 255, 0.3)",
    borderRadius: 12,
    padding: 8,
    overflow: "hidden",
  },
  svg: {
    backgroundColor: "#000000",
    borderRadius: 8,
  },
  heatmapOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(79, 140, 255, 0.3)",
  },
  heatmapText: {
    fontSize: 11,
    color: "#9AA4B2",
    marginBottom: 2,
  },
  heatmapPeople: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  alertCard: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.5)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  alertCritical: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  alertAcknowledged: {
    backgroundColor: "rgba(154, 164, 178, 0.1)",
    borderColor: "rgba(154, 164, 178, 0.3)",
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertZone: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E8ECF1",
  },
  alertTime: {
    fontSize: 11,
    color: "#9AA4B2",
  },
  alertMessage: {
    fontSize: 13,
    color: "#9AA4B2",
    lineHeight: 18,
    marginBottom: 8,
  },
  acknowledgeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(79, 140, 255, 0.3)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  acknowledgeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F8CFF",
  },
  noAlertsContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  noAlertsText: {
    fontSize: 14,
    color: "#9AA4B2",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    color: "#E8ECF1",
    fontWeight: "500",
  },
  analyticsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(79, 140, 255, 0.3)",
    borderRadius: 12,
    marginTop: 4,
  },
  analyticsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F8CFF",
  },
  colorLegend: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 12,
    color: "#9AA4B2",
    marginBottom: 8,
    fontWeight: "500",
  },
  legendBar: {
    flexDirection: "row",
    height: 20,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  legendSegment: {
    flex: 1,
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendLabel: {
    fontSize: 10,
    color: "#9AA4B2",
  },
  pickerContainer: {
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    color: "#E8ECF1",
    backgroundColor: "transparent",
  },
  cameraCard: {
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cameraRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cameraInfo: {
    flex: 1,
  },
  cameraLabel: {
    fontSize: 12,
    color: "#9AA4B2",
    marginBottom: 4,
  },
  cameraValue: {
    fontSize: 16,
    color: "#E8ECF1",
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  zonesContainer: {
    gap: 12,
  },
  zoneCard: {
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 14,
  },
  zoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  zoneNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  zoneName: {
    fontSize: 15,
    color: "#E8ECF1",
    fontWeight: "600",
  },
  zoneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoneBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  zoneMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  zoneMetric: {
    flex: 1,
  },
  zoneMetricLabel: {
    fontSize: 11,
    color: "#9AA4B2",
    marginBottom: 4,
  },
  zoneMetricValue: {
    fontSize: 16,
    color: "#E8ECF1",
    fontWeight: "600",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressBarLabel: {
    fontSize: 12,
    color: "#9AA4B2",
    fontWeight: "600",
    minWidth: 40,
    textAlign: "right",
  },
  zoneCount: {
    fontSize: 12,
    color: "#9AA4B2",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#9AA4B2",
    marginTop: 8,
  },
});

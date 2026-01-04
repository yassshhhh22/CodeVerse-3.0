import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useAnalyticsStore } from "../store/AnalyticsStore";
import { useVenueStore } from "../store/VenueStore";

const { width: screenWidth } = Dimensions.get("window");

export default function HistoricalAnalysisScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [selectedMetric, setSelectedMetric] = useState("crowd");

  const { venues } = useVenueStore();
  const { venueAnalytics, isLoading, fetchVenueAnalytics } =
    useAnalyticsStore();

  const selectedVenue = venues?.[0];

  // Fetch analytics when component mounts or period changes
  useEffect(() => {
    if (selectedVenue?._id) {
      const params: any = {};

      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();

      switch (selectedPeriod) {
        case "24hours":
          startDate.setHours(startDate.getHours() - 24);
          break;
        case "7days":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      params.startDate = startDate.toISOString();
      params.endDate = endDate.toISOString();

      fetchVenueAnalytics(selectedVenue._id, params);
    }
  }, [selectedVenue?._id, selectedPeriod]);

  // Process analytics data for display
  const processedData = useMemo(() => {
    if (!venueAnalytics?.logs || venueAnalytics.logs.length === 0) {
      return {
        daily: [],
        hourly: [],
        zones: [] as Array<{ name: string; count: number; percentage: number }>,
        stats: {
          totalVisitors: 0,
          avgPerDay: 0,
          peakHour: "N/A",
          peakDay: "N/A",
          avgDuration: "N/A",
          returnRate: "N/A",
        },
      };
    }

    const logs = venueAnalytics.logs;

    // Group by date for daily trends
    const dailyMap = new Map<
      string,
      { total: number; peak: number; count: number }
    >();
    const hourlyMap = new Map<number, number>();

    logs.forEach((log) => {
      const date = new Date(log.createdAt);
      const dateKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const hour = date.getHours();

      // Daily aggregation
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { total: 0, peak: 0, count: 0 });
      }
      const dayData = dailyMap.get(dateKey)!;
      dayData.total += log.total_detections;
      dayData.peak = Math.max(dayData.peak, log.peak_density);
      dayData.count++;

      // Hourly aggregation
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + log.total_detections);
    });

    // Convert to arrays
    const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      count: Math.round(data.total / data.count),
      peak: data.peak,
      avg: Math.round(data.total / data.count),
    }));

    const hourly = Array.from(hourlyMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([hour, count]) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        count,
      }));

    // Calculate stats
    const totalVisitors = logs.reduce(
      (sum, log) => sum + log.total_detections,
      0
    );
    const avgPerDay =
      daily.length > 0 ? Math.round(totalVisitors / daily.length) : 0;
    const peakHourEntry = Array.from(hourlyMap.entries()).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      [0, 0]
    );
    const peakHour = `${peakHourEntry[0].toString().padStart(2, "0")}:00 - ${(
      (peakHourEntry[0] + 1) %
      24
    )
      .toString()
      .padStart(2, "0")}:00`;

    return {
      daily,
      hourly,
      zones: [], // Zone distribution not in current API response
      stats: {
        totalVisitors,
        avgPerDay,
        peakHour,
        peakDay: "N/A",
        avgDuration: "N/A",
        returnRate: "N/A",
      },
    };
  }, [venueAnalytics]);

  const { daily, hourly, zones, stats } = processedData;

  const maxDaily = daily.length > 0 ? Math.max(...daily.map((d) => d.peak)) : 1;
  const maxHourly =
    hourly.length > 0 ? Math.max(...hourly.map((h) => h.count)) : 1;

  const peakHourText =
    stats.peakHour && stats.peakHour !== "N/A" ? stats.peakHour : "No data";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#4F8CFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historical Analysis</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#4F8CFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F8CFF" />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : daily.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="analytics-outline" size={48} color="#9AA4B2" />
            <Text style={styles.emptyText}>No analytics data available</Text>
            <Text style={styles.emptySubtext}>
              Data will appear once crowd monitoring begins
            </Text>
          </View>
        ) : (
          <>
            {/* Filters */}
            <View style={styles.filtersContainer}>
              <View style={styles.filterCard}>
                <Text style={styles.filterLabel}>Time Period</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedPeriod}
                    onValueChange={(value) => setSelectedPeriod(value)}
                    style={styles.picker}
                    dropdownIconColor="#4F8CFF"
                  >
                    <Picker.Item label="Last 24 Hours" value="24hours" />
                    <Picker.Item label="Last 7 Days" value="7days" />
                    <Picker.Item label="Last 30 Days" value="30days" />
                    <Picker.Item label="Last 90 Days" value="90days" />
                    <Picker.Item label="Custom Range" value="custom" />
                  </Picker>
                </View>
              </View>

              <View style={styles.filterCard}>
                <Text style={styles.filterLabel}>Metric Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedMetric}
                    onValueChange={(value) => setSelectedMetric(value)}
                    style={styles.picker}
                    dropdownIconColor="#4F8CFF"
                  >
                    <Picker.Item label="Crowd Density" value="crowd" />
                    <Picker.Item label="Movement Patterns" value="movement" />
                    <Picker.Item label="Average Duration" value="duration" />
                    <Picker.Item label="Zone Analytics" value="zones" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Statistics Cards - 6 in grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="people" size={16} color="#4F8CFF" />
                  <Text style={styles.statLabel}>Total Visitors</Text>
                </View>
                <Text style={styles.statValue}>
                  {stats.totalVisitors.toLocaleString()}
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="trending-up" size={16} color="#10b981" />
                  <Text style={styles.statLabel}>Avg Per Day</Text>
                </View>
                <Text style={styles.statValue}>{stats.avgPerDay}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="time" size={16} color="#f59e0b" />
                  <Text style={styles.statLabel}>Peak Hour</Text>
                </View>
                <Text style={styles.statValueSmall}>{stats.peakHour}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="calendar" size={16} color="#8b5cf6" />
                  <Text style={styles.statLabel}>Peak Day</Text>
                </View>
                <Text style={styles.statValueSmall}>{stats.peakDay}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="pulse" size={16} color="#ec4899" />
                  <Text style={styles.statLabel}>Avg Duration</Text>
                </View>
                <Text style={styles.statValueSmall}>{stats.avgDuration}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="bar-chart" size={16} color="#4F8CFF" />
                  <Text style={styles.statLabel}>Return Rate</Text>
                </View>
                <Text style={styles.statValueSmall}>{stats.returnRate}</Text>
              </View>
            </View>

            {/* Daily Trend Chart */}
            <View style={styles.section}>
              <View style={styles.chartHeader}>
                <Text style={styles.sectionTitle}>Daily Crowd Trend</Text>
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#4F8CFF" }]}
                    />
                    <Text style={styles.legendText}>Peak</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#f59e0b" }]}
                    />
                    <Text style={styles.legendText}>Average</Text>
                  </View>
                </View>
              </View>

              <View style={styles.chartCard}>
                {daily.map((day, index) => (
                  <View key={index} style={styles.dailyRowContainer}>
                    <Text style={styles.dailyDate}>{day.date}</Text>
                    <View style={styles.dailyBarsColumn}>
                      <View style={styles.dailyBarRow}>
                        <View style={styles.dailyBarTrack}>
                          <View
                            style={[
                              styles.dailyBarPeak,
                              {
                                width: `${Math.min(
                                  (day.peak / Math.max(maxDaily, 1)) * 100,
                                  100
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.dailyValuePeak}>{day.peak}</Text>
                      </View>
                      <View style={styles.dailyBarRow}>
                        <View style={styles.dailyBarTrack}>
                          <View
                            style={[
                              styles.dailyBarAvg,
                              {
                                width: `${Math.min(
                                  (day.avg / Math.max(maxDaily, 1)) * 100,
                                  100
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.dailyValueAvg}>{day.avg}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Hourly Pattern Chart */}
            <View style={styles.section}>
              <View style={styles.chartHeader}>
                <Text style={styles.sectionTitle}>Hourly Pattern (Today)</Text>
                <Text style={styles.chartSubtitle}>
                  {hourly.length > 0 ? `Peak: ${peakHourText}` : "No data"}
                </Text>
              </View>

              {hourly.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="time-outline" size={40} color="#9AA4B2" />
                  <Text style={styles.emptyText}>No hourly data available</Text>
                  <Text style={styles.emptySubtext}>
                    Hourly pattern appears after data is received.
                  </Text>
                </View>
              ) : (
                <View style={styles.hourlyChartCard}>
                  <View style={styles.hourlyChart}>
                    {hourly.map((hour, index) => {
                      const barHeight = (hour.count / maxHourly) * 180;
                      return (
                        <View key={index} style={styles.hourlyBarContainer}>
                          <View style={styles.hourlyBarWrapper}>
                            <View
                              style={[
                                styles.hourlyBar,
                                {
                                  height: barHeight,
                                  backgroundColor:
                                    hour.count > 150
                                      ? "#4F8CFF"
                                      : hour.count > 100
                                      ? "#10b981"
                                      : "#9AA4B2",
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.hourlyLabel}>{hour.hour}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Zone Distribution */}
            {zones.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Zone-wise Distribution
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Total: {stats.totalVisitors.toLocaleString()} visitors
                  </Text>
                </View>

                {zones.map((zone, index) => {
                  const colors = [
                    "#4F8CFF",
                    "#f59e0b",
                    "#10b981",
                    "#fbbf24",
                    "#8b5cf6",
                    "#9AA4B2",
                  ];
                  return (
                    <View key={index} style={styles.zoneCard}>
                      <View style={styles.zoneHeader}>
                        <View style={styles.zoneNameRow}>
                          <View
                            style={[
                              styles.zoneDot,
                              { backgroundColor: colors[index] },
                            ]}
                          />
                          <Text style={styles.zoneName}>{zone.name}</Text>
                        </View>
                        <Text style={styles.zoneCount}>
                          {zone.count.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.zoneBarContainer}>
                        <View
                          style={[
                            styles.zoneBar,
                            {
                              width: `${zone.percentage}%`,
                              backgroundColor: colors[index],
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.zonePercentage}>
                        {zone.percentage}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    fontSize: 16,
    color: "#4F8CFF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E8ECF1",
  },
  exportButton: {
    padding: 8,
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(79, 140, 255, 0.3)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  filtersContainer: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 20,
  },
  filterCard: {
    flex: 1,
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: "#9AA4B2",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    color: "#E8ECF1",
    height: 50,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 12,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    color: "#9AA4B2",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E8ECF1",
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E8ECF1",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E8ECF1",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#9AA4B2",
  },
  chartHeader: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 12,
  },
  chartSubtitle: {
    fontSize: 11,
    color: "#9AA4B2",
  },
  legendContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#9AA4B2",
  },
  chartCard: {
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  dailyRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dailyDate: {
    fontSize: 13,
    color: "#9AA4B2",
    width: 50,
    fontWeight: "600",
  },
  dailyBarsColumn: {
    flex: 1,
    gap: 6,
  },
  dailyBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 20,
  },
  dailyBarTrack: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(31, 41, 55, 0.4)",
    borderRadius: 4,
    overflow: "hidden",
  },
  dailyBarPeak: {
    height: "100%",
    backgroundColor: "#4F8CFF",
    borderRadius: 4,
    minWidth: 4,
  },
  dailyBarAvg: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 4,
    minWidth: 4,
  },
  dailyValues: {
    flexDirection: "row",
    gap: 8,
    width: 80,
    justifyContent: "flex-end",
  },
  dailyValuePeak: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F8CFF",
    minWidth: 30,
  },
  dailyValueAvg: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f59e0b",
    minWidth: 30,
  },
  hourlyChartCard: {
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  hourlyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
  },
  hourlyBarContainer: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  hourlyBarWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  hourlyBar: {
    width: 18,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  hourlyLabel: {
    fontSize: 9,
    color: "#9AA4B2",
    fontWeight: "500",
    transform: [{ rotate: "45deg" }],
  },
  zoneCard: {
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  zoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  zoneNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E8ECF1",
  },
  zoneCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4F8CFF",
  },
  zoneBarContainer: {
    height: 8,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  zoneBar: {
    height: "100%",
    borderRadius: 4,
  },
  zonePercentage: {
    fontSize: 12,
    color: "#9AA4B2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: "#9AA4B2",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#E8ECF1",
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9AA4B2",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

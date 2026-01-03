import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Activity,
  Download,
  Filter,
  Camera,
} from "lucide-react";
import { useAnalyticsStore } from "../store/AnalyticsStore";
import { useVenueStore } from "../store/VenueStore";
import { useZoneStore } from "../store/ZoneStore";

function HistoricalAnalysisPage() {
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [zoneData, setZoneData] = useState([]);

  // Zustand stores
  const { venueAnalytics, fetchVenueAnalytics, fetchZoneAnalytics, isLoading } = useAnalyticsStore();
  const { venues, fetchVenues } = useVenueStore();
  const { zones, fetchZonesByVenue } = useZoneStore();

  // Fetch data on mount
  useEffect(() => {
    fetchVenues();
  }, []);

  // Set first venue as default
  useEffect(() => {
    if (venues && venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0]._id);
    }
  }, [venues]);

  // Fetch zones when venue changes
  useEffect(() => {
    if (selectedVenueId) {
      fetchZonesByVenue(selectedVenueId);
    }
  }, [selectedVenueId]);

  // Fetch analytics when venue or period changes
  useEffect(() => {
    if (selectedVenueId) {
      const params = {};
      
      if (selectedPeriod === "custom" && startDate && endDate) {
        params.start_date = new Date(startDate).toISOString();
        params.end_date = new Date(endDate).toISOString();
      } else {
        const end = new Date();
        const start = new Date();
        
        switch (selectedPeriod) {
          case "24hours":
            start.setHours(start.getHours() - 24);
            break;
          case "7days":
            start.setDate(start.getDate() - 7);
            break;
          case "30days":
            start.setDate(start.getDate() - 30);
            break;
          case "90days":
            start.setDate(start.getDate() - 90);
            break;
        }
        
        params.start_date = start.toISOString();
        params.end_date = end.toISOString();
      }
      
      fetchVenueAnalytics(selectedVenueId, params);
      
      // Fetch zone analytics for each zone
      if (zones && zones.length > 0) {
        fetchZoneData(selectedVenueId, zones, params);
      }
    }
  }, [selectedVenueId, selectedPeriod, startDate, endDate, zones]);

  // Fetch zone data for all zones
  const fetchZoneData = async (venueId, zonesArray, params) => {
    try {
      const zonePromises = zonesArray.map(zone => 
        fetchZoneAnalytics(venueId, zone._id, params)
      );
      
      const zoneResults = await Promise.all(zonePromises);
      
      const totalVisitors = logs.reduce((sum, log) => sum + (log.total_detections || 0), 0);
      
      const processedZones = zoneResults.map((result, index) => {
        if (result.success && result.data) {
          const zoneLogs = result.data.logs || [];
          const zoneCount = zoneLogs.reduce((sum, log) => sum + (log.total_detections || 0), 0);
          const percentage = totalVisitors > 0 ? Math.round((zoneCount / totalVisitors) * 100) : 0;
          
          return {
            name: zonesArray[index].name,
            count: zoneCount,
            percentage: percentage
          };
        }
        return {
          name: zonesArray[index].name,
          count: 0,
          percentage: 0
        };
      });
      
      setZoneData(processedZones);
    } catch (err) {
      console.error("Error fetching zone data:", err);
      setZoneData([]);
    }
  };

  // Process real analytics data
  const selectedVenue = venues?.find(v => v._id === selectedVenueId);
  const logs = venueAnalytics?.logs || [];
  
  // Helper functions to process data
  function groupByDay(logs) {
    const dayMap = {};
    logs.forEach(log => {
      const dateKey = new Date(log.createdAt).toISOString().split('T')[0];
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { date: dateKey, peak: 0, avg: 0, total: 0, records: 0 };
      }
      dayMap[dateKey].peak = Math.max(dayMap[dateKey].peak, log.peak_density || 0);
      dayMap[dateKey].total += log.avg_density || 0;
      dayMap[dateKey].records++;
    });
    
    return Object.values(dayMap).map(day => ({
      ...day,
      avg: day.records > 0 ? Math.round(day.total / day.records) : 0
    })).slice(-7);
  }

  function groupByHour(logs) {
    const hourMap = {};
    for (let i = 0; i < 24; i += 2) {
      hourMap[i] = { hour: `${i.toString().padStart(2, '0')}:00`, count: 0 };
    }
    
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const hour = Math.floor(date.getHours() / 2) * 2;
      if (hourMap[hour]) {
        hourMap[hour].count += log.avg_density || 0;
      }
    });
    
    return Object.values(hourMap);
  }

  function getDayCount(logs) {
    if (logs.length === 0) return 1;
    const dates = new Set(logs.map(log => new Date(log.createdAt).toDateString()));
    return dates.size || 1;
  }

  function findPeakHour(logs) {
    if (logs.length === 0) return "N/A";
    const hourCounts = {};
    logs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + (log.peak_density || 0);
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    return peakHour ? `${peakHour[0].toString().padStart(2, '0')}:00` : "N/A";
  }

  function findPeakDay(logs) {
    if (logs.length === 0) return "N/A";
    const dayCounts = {};
    logs.forEach(log => {
      const date = new Date(log.createdAt).toISOString().split('T')[0];
      dayCounts[date] = (dayCounts[date] || 0) + (log.peak_density || 0);
    });
    const peakDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    return peakDay ? new Date(peakDay[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A";
  }
  
  // Group logs by date and hour
  const processedData = {
    daily: groupByDay(logs),
    hourly: groupByHour(logs),
    zones: zoneData.length > 0 ? zoneData : [],
  };

  // Calculate statistics from real data
  const stats = {
    totalVisitors: logs.reduce((sum, log) => sum + (log.total_detections || 0), 0),
    avgPerDay: logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + (log.avg_density || 0), 0) / Math.max(1, getDayCount(logs))) : 0,
    peakHour: findPeakHour(logs),
    peakDay: findPeakDay(logs),
    avgDuration: "N/A",
    returnRate: "N/A",
  };

  // Get max value for bar chart scaling
  const maxDaily = processedData.daily.length > 0 ? Math.max(...processedData.daily.map((d) => d.peak)) : 100;
  const maxHourly = processedData.hourly.length > 0 ? Math.max(...processedData.hourly.map((d) => d.count)) : 100;

  const historicalData = processedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-text">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-border"></div>
              <h1 className="text-lg sm:text-xl font-bold">
                Historical Analysis
              </h1>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg hover:bg-primary/20 transition-all">
              <Download size={16} />
              <span className="hidden sm:inline text-sm">Export Report</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-20 sm:pt-24 px-4 sm:px-6 pb-6 max-w-[1920px] mx-auto">
        {/* Venue Selector */}
        <div className="mb-6 bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
          <label className="text-sm text-secondary mb-2 block">
            <Camera size={16} className="inline mr-2" />
            Select Venue
          </label>
          <select
            value={selectedVenueId || ""}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {venues && venues.length > 0 ? (
              venues.map(venue => (
                <option key={venue._id} value={venue._id}>
                  {venue.name} ({venue.camera_id})
                </option>
              ))
            ) : (
              <option value="">Loading venues...</option>
            )}
          </select>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
            <label className="text-sm text-secondary mb-2 block">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {selectedPeriod === "custom" && (
            <>
              <div className="flex-1 bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
                <label className="text-sm text-secondary mb-2 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex-1 bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
                <label className="text-sm text-secondary mb-2 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-secondary mt-4">Loading analytics data...</p>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && (!logs || logs.length === 0) && (
          <div className="text-center py-12 bg-background/80 backdrop-blur-xl border border-border rounded-xl">
            <BarChart3 size={48} className="mx-auto text-secondary mb-4" />
            <p className="text-secondary text-lg">No analytics data available for this period</p>
            <p className="text-secondary text-sm mt-2">Try selecting a different time range or ensure the CV system is running</p>
          </div>
        )}

        {/* Analytics Display */}
        {!isLoading && logs && logs.length > 0 && (
          <>
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-primary" />
              <span className="text-xs text-secondary">Total Visitors</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.totalVisitors.toLocaleString()}
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-xs text-secondary">Avg Per Day</span>
            </div>
            <div className="text-2xl font-bold">{stats.avgPerDay}</div>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-primary" />
              <span className="text-xs text-secondary">Peak Hour</span>
            </div>
            <div className="text-lg font-bold">{stats.peakHour}</div>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-primary" />
              <span className="text-xs text-secondary">Peak Day</span>
            </div>
            <div className="text-lg font-bold">{stats.peakDay}</div>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-primary" />
              <span className="text-xs text-secondary">Avg Duration</span>
            </div>
            <div className="text-lg font-bold">{stats.avgDuration}</div>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-primary" />
              <span className="text-xs text-secondary">Return Rate</span>
            </div>
            <div className="text-lg font-bold">{stats.returnRate}</div>
          </div>
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Trend Chart */}
          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Daily Crowd Trend</h2>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-secondary">Peak</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span className="text-secondary">Average</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {historicalData.daily.map((day) => (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary w-16">{day.date}</span>
                    <div className="flex gap-4">
                      <span className="text-primary font-semibold">
                        {day.peak}
                      </span>
                      <span className="text-accent font-semibold">
                        {day.avg}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-8">
                    <div
                      className="bg-primary/30 rounded"
                      style={{ width: `${(day.peak / maxDaily) * 100}%` }}
                    ></div>
                    <div
                      className="bg-accent/30 rounded"
                      style={{ width: `${(day.avg / maxDaily) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Pattern Chart */}
          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Hourly Pattern (Today)</h2>
              <span className="text-xs text-secondary">Peak: 203 at 18:00</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-64">
              {historicalData.hourly.map((hour) => (
                <div
                  key={hour.hour}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="flex-1 w-full flex flex-col justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t hover:from-primary/80 hover:to-primary/30 transition-all cursor-pointer group relative"
                      style={{
                        height: `${(hour.count / maxHourly) * 100}%`,
                      }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {hour.count}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-secondary rotate-45 origin-left whitespace-nowrap">
                    {hour.hour}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Analytics Table */}
        <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Zone-wise Distribution</h2>
            <span className="text-sm text-secondary">
              Total: {stats.totalVisitors.toLocaleString()} visitors
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                    Zone Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary">
                    Visitor Count
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary">
                    Percentage
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {historicalData.zones.map((zone, index) => (
                  <tr
                    key={zone.name}
                    className="border-b border-border/50 hover:bg-background/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            index === 0
                              ? "bg-primary"
                              : index === 1
                              ? "bg-accent"
                              : index === 2
                              ? "bg-green-500"
                              : index === 3
                              ? "bg-yellow-500"
                              : index === 4
                              ? "bg-purple-500"
                              : "bg-gray-500"
                          }`}
                        ></div>
                        <span className="font-medium">{zone.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      {zone.count.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-primary font-semibold">
                      {zone.percentage}%
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              index === 0
                                ? "bg-primary"
                                : index === 1
                                ? "bg-accent"
                                : index === 2
                                ? "bg-green-500"
                                : index === 3
                                ? "bg-yellow-500"
                                : index === 4
                                ? "bg-purple-500"
                                : "bg-gray-500"
                            }`}
                            style={{ width: `${zone.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Key Insights</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-semibold">Peak Traffic Time</p>
                  <p className="text-xs text-secondary">
                    Evening hours (6 PM - 8 PM) show highest crowd density with
                    average 180+ visitors
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-semibold">Weekend Surge</p>
                  <p className="text-xs text-secondary">
                    Saturdays show 34% increase in footfall compared to weekdays
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-semibold">Zone Popularity</p>
                  <p className="text-xs text-secondary">
                    Main Entrance and Stage Area account for 52% of total
                    traffic
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-semibold">Average Duration</p>
                  <p className="text-xs text-secondary">
                    Visitors spend average 2h 34m, with longest stays in Food
                    Court
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                <div>
                  <p className="text-sm font-semibold">Staff Allocation</p>
                  <p className="text-xs text-secondary">
                    Increase security personnel during peak hours (6-8 PM) in
                    Main Entrance
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-1.5"></div>
                <div>
                  <p className="text-sm font-semibold">Crowd Management</p>
                  <p className="text-xs text-secondary">
                    Implement queue management systems in high-traffic zones
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-semibold">Resource Planning</p>
                  <p className="text-xs text-secondary">
                    Optimize Food Court capacity during weekend peaks
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-semibold">Camera Coverage</p>
                  <p className="text-xs text-secondary">
                    Consider additional cameras in Exhibition Hall for better
                    monitoring
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default HistoricalAnalysisPage;

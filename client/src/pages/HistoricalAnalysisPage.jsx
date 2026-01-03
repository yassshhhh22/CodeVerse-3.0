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
} from "lucide-react";
import { useAnalyticsStore } from "../store/AnalyticsStore";
import { useVenueStore } from "../store/VenueStore";

function HistoricalAnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [selectedMetric, setSelectedMetric] = useState("crowd");

  // Zustand stores
  const { venueAnalytics, fetchVenueAnalytics, isLoading } = useAnalyticsStore();
  const { venues, currentVenue, fetchVenues } = useVenueStore();

  // Fetch data on mount
  useEffect(() => {
    fetchVenues();
  }, []);

  // Fetch analytics when venue or period changes
  useEffect(() => {
    if (currentVenue?._id) {
      fetchVenueAnalytics(currentVenue._id, {
        period: selectedPeriod,
        metric: selectedMetric,
      });
    }
  }, [currentVenue?._id, selectedPeriod, selectedMetric]);

  // Sample historical data
  const historicalData = {
    daily: [
      { date: "Jan 27", count: 156, peak: 189, avg: 142 },
      { date: "Jan 28", count: 178, peak: 203, avg: 165 },
      { date: "Jan 29", count: 145, peak: 172, avg: 138 },
      { date: "Jan 30", count: 192, peak: 218, avg: 181 },
      { date: "Jan 31", count: 167, peak: 195, avg: 159 },
      { date: "Feb 01", count: 201, peak: 234, avg: 189 },
      { date: "Feb 02", count: 183, peak: 208, avg: 174 },
    ],
    hourly: [
      { hour: "00:00", count: 12 },
      { hour: "02:00", count: 8 },
      { hour: "04:00", count: 5 },
      { hour: "06:00", count: 15 },
      { hour: "08:00", count: 45 },
      { hour: "10:00", count: 89 },
      { hour: "12:00", count: 134 },
      { hour: "14:00", count: 156 },
      { hour: "16:00", count: 178 },
      { hour: "18:00", count: 203 },
      { hour: "20:00", count: 165 },
      { hour: "22:00", count: 87 },
    ],
    zones: [
      { name: "Main Entrance", count: 3421, percentage: 28 },
      { name: "Stage Area", count: 2987, percentage: 24 },
      { name: "Food Court", count: 2156, percentage: 18 },
      { name: "Exhibition Hall", count: 1897, percentage: 16 },
      { name: "Parking", count: 1089, percentage: 9 },
      { name: "Others", count: 623, percentage: 5 },
    ],
  };

  // Statistics
  const stats = {
    totalVisitors: 12173,
    avgPerDay: 1739,
    peakHour: "18:00 - 19:00",
    peakDay: "Saturday",
    avgDuration: "2h 34m",
    returnRate: "34%",
  };

  // Get max value for bar chart scaling
  const maxDaily = Math.max(...historicalData.daily.map((d) => d.peak));
  const maxHourly = Math.max(...historicalData.hourly.map((h) => h.count));

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

          <div className="flex-1 bg-background/80 backdrop-blur-xl border border-border rounded-xl p-4">
            <label className="text-sm text-secondary mb-2 block">
              Metric Type
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="crowd">Crowd Density</option>
              <option value="movement">Movement Patterns</option>
              <option value="duration">Average Duration</option>
              <option value="zones">Zone Analytics</option>
            </select>
          </div>
        </div>

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
      </div>
    </div>
  );
}

export default HistoricalAnalysisPage;

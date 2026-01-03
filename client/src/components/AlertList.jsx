import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Check, Filter, X, Calendar } from "lucide-react";
import { useAlertStore } from "../store/AlertStore";

function AlertList({ venueId }) {
  const [filterSeverity, setFilterSeverity] = useState("all"); // all, warning, critical
  const [filterStatus, setFilterStatus] = useState("unacknowledged"); // all, acknowledged, unacknowledged
  const [showFilters, setShowFilters] = useState(false);

  const { alerts, fetchAlerts, acknowledgeAlert, isLoading } = useAlertStore();

  useEffect(() => {
    loadAlerts();
  }, [venueId, filterSeverity, filterStatus]);

  const loadAlerts = () => {
    const params = { limit: 50 };
    
    if (venueId) {
      params.venue_id = venueId;
    }
    
    if (filterSeverity !== "all") {
      params.severity = filterSeverity;
    }
    
    if (filterStatus === "acknowledged") {
      params.acknowledged = "true";
    } else if (filterStatus === "unacknowledged") {
      params.acknowledged = "false";
    }
    
    fetchAlerts(params);
  };

  const handleAcknowledge = async (alertId) => {
    const result = await acknowledgeAlert(alertId);
    if (result.success) {
      loadAlerts();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getSeverityIcon = (severity) => {
    return severity === "critical" ? (
      <AlertCircle className="text-red-500" size={18} />
    ) : (
      <AlertTriangle className="text-yellow-500" size={18} />
    );
  };

  const getSeverityColor = (severity) => {
    return severity === "critical"
      ? "border-red-500/30 bg-red-500/5"
      : "border-yellow-500/30 bg-yellow-500/5";
  };

  const filteredAlerts = alerts || [];

  return (
    <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Alert History</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">
            {filteredAlerts.length} alerts
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-primary/10 border-primary/30"
                : "bg-background border-border hover:bg-background/50"
            }`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-background border border-border rounded-lg space-y-3">
          <div>
            <label className="text-sm text-secondary mb-2 block">Severity</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterSeverity("all")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterSeverity === "all"
                    ? "bg-primary text-background"
                    : "bg-background border border-border hover:bg-background/50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSeverity("warning")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterSeverity === "warning"
                    ? "bg-yellow-500 text-background"
                    : "bg-background border border-border hover:bg-background/50"
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setFilterSeverity("critical")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterSeverity === "critical"
                    ? "bg-red-500 text-background"
                    : "bg-background border border-border hover:bg-background/50"
                }`}
              >
                Critical
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterStatus === "all"
                    ? "bg-primary text-background"
                    : "bg-background border border-border hover:bg-background/50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("unacknowledged")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterStatus === "unacknowledged"
                    ? "bg-primary text-background"
                    : "bg-background border border-border hover:bg-background/50"
                }`}
              >
                Unacknowledged
              </button>
              <button
                onClick={() => setFilterStatus("acknowledged")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterStatus === "acknowledged"
                    ? "bg-primary text-background"
                    : "bg-background border border-border hover:bg-background/50"
                }`}
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-secondary text-sm mt-2">Loading alerts...</p>
        </div>
      )}

      {/* Alert List */}
      {!isLoading && filteredAlerts.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle size={48} className="mx-auto text-secondary/50 mb-3" />
          <p className="text-secondary">No alerts found</p>
        </div>
      )}

      {!isLoading && filteredAlerts.length > 0 && (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              className={`border rounded-lg p-4 transition-all ${getSeverityColor(
                alert.severity
              )}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {alert.zone_id?.name || alert.venue_id?.name || "Unknown"}
                    </span>
                    {alert.acknowledged_by && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                        <Check size={12} />
                        Acknowledged
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-secondary mb-2">{alert.message}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-secondary">
                      <Calendar size={12} />
                      <span>{formatDate(alert.triggered_at || alert.createdAt)}</span>
                    </div>

                    {!alert.acknowledged_by && (
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs rounded-lg transition-colors"
                      >
                        <Check size={12} />
                        Acknowledge
                      </button>
                    )}
                  </div>

                  {alert.acknowledged_by && (
                    <p className="text-xs text-secondary mt-2">
                      Acknowledged by {alert.acknowledged_by.name || "User"}{" "}
                      {formatDate(alert.acknowledged_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertList;

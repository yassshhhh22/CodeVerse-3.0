import { useState, useEffect } from "react";
import { X, AlertTriangle, AlertCircle, Bell, Check } from "lucide-react";
import { useAlertStore } from "../store/AlertStore";

function AlertToast({ alert, onClose, duration = 10000, onAcknowledge }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const { acknowledgeAlert } = useAlertStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAcknowledge = async () => {
    if (!alert._id) return;
    
    setIsAcknowledging(true);
    try {
      const result = await acknowledgeAlert(alert._id);
      if (result.success) {
        if (onAcknowledge) {
          onAcknowledge(alert._id);
        }
        // Close after acknowledging
        setTimeout(() => handleClose(), 500);
      }
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const getSeverityColor = () => {
    return alert.severity === "critical"
      ? "border-red-500 bg-red-500/10"
      : "border-yellow-500 bg-yellow-500/10";
  };

  const getSeverityIcon = () => {
    return alert.severity === "critical" ? (
      <AlertCircle className="text-red-500" size={24} />
    ) : (
      <AlertTriangle className="text-yellow-500" size={24} />
    );
  };

  return (
    <div
      className={`
        fixed top-20 right-4 z-[100] w-96 max-w-[calc(100vw-2rem)]
        border-2 rounded-lg shadow-2xl backdrop-blur-xl
        transform transition-all duration-300
        ${getSeverityColor()}
        ${isExiting ? "translate-x-[120%] opacity-0" : "translate-x-0 opacity-100"}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getSeverityIcon()}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">
                {alert.severity === "critical" ? "🚨 Critical Alert" : "⚠️ Warning"}
              </h3>
            </div>
            
            <p className="text-sm font-semibold mb-1">
              {alert.zone_id?.name || alert.venue_id?.name || "Unknown Location"}
            </p>
            
            <p className="text-sm text-secondary mb-2">
              {alert.message || `Density at ${alert.density_value}%`}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-secondary">
              <Bell size={12} />
              <span>Just now</span>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-background/50 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Acknowledge Button */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAcknowledge}
            disabled={isAcknowledging}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              font-semibold text-sm transition-all
              ${alert.severity === "critical"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-yellow-500 hover:bg-yellow-600 text-background"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isAcknowledging ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Check size={16} />
            )}
            <span>{isAcknowledging ? "Acknowledging..." : "Acknowledge"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertToast;

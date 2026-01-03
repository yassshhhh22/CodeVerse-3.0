import { Activity, Wifi, WifiOff, Video, VideoOff, AlertCircle } from "lucide-react";

function ConnectionStatus({ 
  wsConnected, 
  wsReconnecting, 
  venueConnected = false,
  lastDataReceived = null 
}) {
  const getConnectionStatus = () => {
    if (!wsConnected && !wsReconnecting) {
      return {
        icon: <WifiOff size={16} className="text-red-500" />,
        text: "Offline",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/50",
      };
    }
    
    if (wsReconnecting) {
      return {
        icon: <Activity size={16} className="text-yellow-500 animate-pulse" />,
        text: "Reconnecting...",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/50",
      };
    }
    
    if (wsConnected && !venueConnected) {
      return {
        icon: <VideoOff size={16} className="text-yellow-500" />,
        text: "No Camera",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/50",
      };
    }
    
    return {
      icon: <Video size={16} className="text-green-500" />,
      text: "Live",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/50",
    };
  };

  const status = getConnectionStatus();
  
  const getTimeAgo = () => {
    if (!lastDataReceived) return null;
    
    const seconds = Math.floor((Date.now() - new Date(lastDataReceived).getTime()) / 1000);
    
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
      {status.icon}
      <div className="flex flex-col">
        <span className={`text-xs font-semibold ${status.color}`}>
          {status.text}
        </span>
        {lastDataReceived && wsConnected && (
          <span className="text-[10px] text-secondary">
            {getTimeAgo()}
          </span>
        )}
      </div>
    </div>
  );
}

export default ConnectionStatus;

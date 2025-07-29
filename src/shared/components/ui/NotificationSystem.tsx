import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useUI } from "@/shared/stores";

const NotificationSystem = () => {
  const { notifications, removeNotification } = useUI();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "error":
        return <AlertCircle size={20} className="text-red-600" />;
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case "info":
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getStyles(notification.type)}
            border rounded-lg p-4 shadow-lg backdrop-blur-sm
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;

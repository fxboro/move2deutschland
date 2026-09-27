import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Volume2, VolumeX, ExternalLink, MessageSquare, FileText, UserPlus, Info } from "lucide-react";
import { AdminNotification } from "../../services/adminService";

interface NotificationCenterProps {
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateTab: (tab: AdminNotification["linkTab"], targetId?: string) => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateTab,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("m2d_admin_sound") !== "false";
  });
  const [activeFilter, setActiveFilter] = useState<"all" | "application" | "inquiry">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Persist sound settings
  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem("m2d_admin_sound", String(nextVal));
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  const getIcon = (type: AdminNotification["type"]) => {
    switch (type) {
      case "application":
        return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "inquiry":
        return <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "document":
        return <UserPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#003153]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden transform transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#003153] dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={toggleSound}
                title={soundEnabled ? "Mute alert chimes" : "Enable alert chimes"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  title="Clear all notifications"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 py-2 space-x-2 text-xs bg-white dark:bg-slate-900">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-[#003153] text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("application")}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeFilter === "application"
                  ? "bg-[#003153] text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => setActiveFilter("inquiry")}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeFilter === "inquiry"
                  ? "bg-[#003153] text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Inquiries
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications in this view.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    onNavigateTab(notif.linkTab, notif.targetId);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                    notif.read
                      ? "hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-70"
                      : "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1">
              <span>Real-time live synchronization active</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-1" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

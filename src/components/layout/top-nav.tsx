"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  Check,
  Menu,
} from "lucide-react";
import { useShell } from "./dashboard-shell";

interface TopNavProps {
  user: {
    name: string;
    email: string;
    role: string;
    studentIdNumber?: string;
    facultyIdNumber?: string;
  };
}

export function TopNav({ user }: TopNavProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toggleMobile } = useShell();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000); // refresh every 25s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      router.push("/login");
    }
  };

  return (
    <header className="h-16 border-b border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA]/95 dark:bg-[#202020]/95 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between transition-colors duration-150">
      {/* Left side: Mobile Hamburger & Academic badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="p-2 rounded-xl text-[#626262] dark:text-[#A6A6A6] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] lg:hidden transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0F0F0] text-[#252525] border border-[#E0E0E0] dark:bg-[#252525] dark:text-[#F5F5F5] dark:border-[#454545]">
          A.Y. 2024–2025
        </span>
        <span className="hidden sm:inline-block text-xs text-[#858585]">|</span>
        <span className="hidden sm:inline-block text-xs font-medium text-[#626262] dark:text-[#A6A6A6]">
          Philippine Standard Time (UTC+8)
        </span>
      </div>

      {/* Right side: Actions & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light mode toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-[#626262] dark:text-[#A6A6A6] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#F5F5F5]" />
            ) : (
              <Moon className="w-4 h-4 text-[#252525]" />
            )}
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-[#626262] dark:text-[#A6A6A6] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#762D3D] ring-2 ring-[#FAFAFA] dark:ring-[#202020]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#454545] shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-[#E0E0E0] dark:border-[#383838] flex items-center justify-between">
                <span className="text-xs font-bold text-[#252525] dark:text-[#F5F5F5] uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-[#762D3D] dark:text-[#E6B5C2] hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#EAEAEA] dark:divide-[#333333]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#626262] dark:text-[#A6A6A6]">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors ${
                        !n.isRead
                          ? "bg-[#F8EAEF]/60 dark:bg-[#352329]/50 font-medium"
                          : "text-[#626262] dark:text-[#A6A6A6]"
                      }`}
                    >
                      <p className="font-semibold text-[#252525] dark:text-[#F5F5F5]">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[#626262] dark:text-[#A6A6A6]">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-[#858585] mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#383838] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors"
          >
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-[#252525] dark:text-[#F5F5F5] truncate max-w-[130px]">
                {user.name}
              </p>
              <p className="text-[10px] font-semibold text-[#762D3D] dark:text-[#E6B5C2] uppercase tracking-wider">
                {user.role}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#762D3D] text-[#F5F5F5] flex items-center justify-center font-bold text-xs shadow-sm">
              {user.name[0]}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#454545] shadow-xl overflow-hidden z-50 p-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#E0E0E0] dark:border-[#383838]">
                <p className="text-xs font-semibold text-[#252525] dark:text-[#F5F5F5] truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#626262] dark:text-[#A6A6A6] truncate">{user.email}</p>
                {(user.studentIdNumber || user.facultyIdNumber) && (
                  <p className="text-[10px] font-mono text-[#858585] mt-1">
                    ID: {user.studentIdNumber || user.facultyIdNumber}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#C05656] hover:bg-[#FDF0F0] dark:hover:bg-[#4A2020]/40 rounded-xl transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

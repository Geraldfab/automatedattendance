"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding your attendance submissions, session alerts, and policy notices
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications available.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 transition-colors ${
                !n.isRead
                  ? "bg-maroon-50/40 dark:bg-maroon-950/20"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {formatDateTime(n.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

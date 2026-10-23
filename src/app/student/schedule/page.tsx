"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/student/dashboard");
      if (res.ok) {
        const d = await res.json();
        setSchedules(d.schedules || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Class Timetable & Schedule
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Weekly class schedules, room assignments, and assigned faculty instructors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const dayClasses = schedules.filter((s) => s.dayOfWeek.toLowerCase() === day.toLowerCase());
          return (
            <div
              key={day}
              className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{day}</h3>
                <span className="text-[10px] font-semibold text-slate-400">
                  {dayClasses.length} {dayClasses.length === 1 ? "Class" : "Classes"}
                </span>
              </div>

              {dayClasses.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No scheduled classes</p>
              ) : (
                dayClasses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {c.subject.code}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-maroon-700 dark:text-maroon-400">
                        {c.startTime} – {c.endTime}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {c.subject.name}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{c.faculty.user.name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{c.room}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

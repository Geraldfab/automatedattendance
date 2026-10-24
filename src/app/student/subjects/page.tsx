"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Percent, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/student/dashboard", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setSubjects(d.subjectBreakdown || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Enrolled BSIT Subjects
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Subject attendance breakdown, minimum threshold compliance, and historical tallies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub) => (
          <div
            key={sub.subjectId}
            className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-maroon-700 dark:text-maroon-400 bg-maroon-50 dark:bg-maroon-950/40 px-2.5 py-1 rounded-xl">
                {sub.subjectCode}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{sub.units} Academic Units</span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {sub.subjectName}
              </h3>
              <div className="mt-2 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Attendance Turnout:</span>
                <span
                  className={`text-lg font-bold ${
                    sub.attendanceRate < 80 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {sub.attendanceRate}%
                </span>
              </div>
            </div>

            {/* Mini progress bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  sub.attendanceRate < 80 ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, sub.attendanceRate)}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] text-slate-400">Present</p>
                <p className="font-bold text-emerald-600 mt-0.5">{sub.present}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] text-slate-400">Late</p>
                <p className="font-bold text-amber-600 mt-0.5">{sub.late}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] text-slate-400">Absent</p>
                <p className="font-bold text-rose-600 mt-0.5">{sub.absent}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <p className="text-[10px] text-slate-400">Total</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{sub.totalSessions}</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/student/history?subjectId=${sub.subjectId}`}
                className="w-full py-2 text-center text-xs font-semibold text-maroon-700 dark:text-maroon-400 hover:underline block"
              >
                View Attendance Log for {sub.subjectCode} &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

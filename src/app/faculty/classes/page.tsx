"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, QrCode, ArrowRight } from "lucide-react";

export default function FacultyClassesPage() {
  const [classStats, setClassStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/faculty/stats");
      if (res.ok) {
        const d = await res.json();
        setClassStats(d.classStats || []);
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
          My Teaching Assignments
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Assigned BSIT subjects, sections, and cumulative attendance records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classStats.map((c) => {
          const [subjectId, sectionId] = c.id.split("-");
          return (
            <div
              key={c.id}
              className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-sm text-maroon-700 dark:text-maroon-400 bg-maroon-50 dark:bg-maroon-950/40 px-2.5 py-1 rounded-xl">
                    {c.subjectCode}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    {c.sectionName}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {c.subjectName}
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Turnout Rate</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {c.attendanceRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Total Sessions</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {c.totalSessions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Link
                  href={`/faculty/session/create?subjectId=${subjectId}&sectionId=${sectionId}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Start Attendance</span>
                </Link>
                <Link
                  href={`/faculty/records?subjectId=${subjectId}&sectionId=${sectionId}`}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Records
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
        <h1 className="text-2xl font-bold tracking-tight text-[#252525] dark:text-[#F5F5F5]">
          Enrolled BSIT Subjects
        </h1>
        <p className="text-xs text-[#626262] dark:text-[#A6A6A6] mt-1">
          Subject attendance breakdown, minimum threshold compliance, and historical tallies
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-[#FAFAFA] dark:bg-[#202020] border border-[#E0E0E0] dark:border-[#383838]"
            />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-12 text-center bg-[#FAFAFA] dark:bg-[#202020] rounded-3xl border border-[#E0E0E0] dark:border-[#383838] space-y-3">
          <BookOpen className="w-10 h-10 text-[#858585] mx-auto opacity-40" />
          <h4 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5]">
            No Subjects Enrolled
          </h4>
          <p className="text-xs text-[#626262] dark:text-[#A6A6A6] max-w-sm mx-auto">
            You are not currently enrolled in any subjects for this academic term. Contact your department administrator if your section schedules are not appearing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.subjectId}
              className="p-6 rounded-3xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#762D3D] dark:text-[#E6B5C2] bg-[#352329] px-2.5 py-1 rounded-xl border border-[#762D3D]/30">
                  {sub.subjectCode}
                </span>
                <span className="text-xs text-[#858585] font-semibold">{sub.units} Academic Units</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#252525] dark:text-[#F5F5F5]">
                  {sub.subjectName}
                </h3>
                <div className="mt-2 flex items-baseline justify-between text-xs">
                  <span className="text-[#626262] dark:text-[#A6A6A6]">Attendance Turnout:</span>
                  <span
                    className={`text-lg font-bold ${
                      sub.totalSessions === 0
                        ? "text-[#858585]"
                        : sub.attendanceRate < 80
                        ? "text-[#C05656]"
                        : "text-[#2F855A]"
                    }`}
                  >
                    {sub.totalSessions === 0 ? "No Sessions Yet" : `${sub.attendanceRate}%`}
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-2.5 bg-[#EAEAEA] dark:bg-[#2e2e2e] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sub.totalSessions === 0
                      ? "bg-[#858585]/40"
                      : sub.attendanceRate < 80
                      ? "bg-[#C05656]"
                      : "bg-[#2F855A]"
                  }`}
                  style={{ width: `${sub.totalSessions === 0 ? 0 : Math.min(100, sub.attendanceRate)}%` }}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#F0F0F0] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#383838]">
                  <p className="text-[10px] text-[#858585]">Present</p>
                  <p className="font-bold text-[#2F855A] mt-0.5">{sub.present}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#F0F0F0] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#383838]">
                  <p className="text-[10px] text-[#858585]">Late</p>
                  <p className="font-bold text-[#B7791F] mt-0.5">{sub.late}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#F0F0F0] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#383838]">
                  <p className="text-[10px] text-[#858585]">Absent</p>
                  <p className="font-bold text-[#C05656] mt-0.5">{sub.absent}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#F0F0F0] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#383838]">
                  <p className="text-[10px] text-[#858585]">Total</p>
                  <p className="font-bold text-[#252525] dark:text-[#F5F5F5] mt-0.5">{sub.totalSessions}</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/student/history?subjectId=${sub.subjectId}`}
                  className="w-full py-2 text-center text-xs font-semibold text-[#762D3D] dark:text-[#E6B5C2] hover:underline block"
                >
                  View Attendance Log for {sub.subjectCode} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

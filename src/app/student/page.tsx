"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Percent,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/student/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { student, overallStats, subjectBreakdown, activeSessions, recentRecords } = data;
  const isAtRisk = overallStats.isAtRisk;

  return (
    <div className="space-y-8">
      {/* Student Profile Header & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-maroon-700 dark:text-maroon-400">
              BSIT Student Portal
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="font-mono text-xs font-semibold text-slate-500">
              {student.studentIdNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hello, {student.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enrolled in {student.program} &bull; Year {student.yearLevel} &bull; Section {student.sectionName}
          </p>
        </div>

        <Link
          href="/student/scan"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold transition-all shadow-lg shadow-maroon-900/20 active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Live Attendance QR</span>
        </Link>
      </div>

      {/* Active Session Notification Banner (If teacher has open session!) */}
      {activeSessions?.length > 0 && (
        <div className="space-y-3">
          {activeSessions.map((session: any) => (
            <div
              key={session.id}
              className={`p-5 rounded-3xl border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                session.hasCheckedIn
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50"
                  : "bg-maroon-50/80 dark:bg-maroon-950/40 border-maroon-200 dark:border-maroon-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    session.hasCheckedIn ? "bg-emerald-500" : "bg-rose-500 animate-ping"
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {session.subject.code}
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      {session.subject.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Faculty: {session.faculty.user.name} &bull; Section {session.section.name}
                  </p>
                </div>
              </div>

              <div>
                {session.hasCheckedIn ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                  </span>
                ) : (
                  <Link
                    href="/student/scan"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan Now</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* At-Risk Warning Callout (if below 80%) */}
      {isAtRisk && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900 dark:text-rose-200">
              Attendance Advisory Notice
            </h4>
            <p className="mt-0.5 leading-relaxed text-rose-700 dark:text-rose-300">
              Your overall attendance rate is currently {overallStats.attendanceRate}%, which falls below the Torres Capitol College Inc. 80% attendance policy requirement. Please ensure you attend all upcoming sessions to avoid academic sanction.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Overall Attendance"
          value={`${overallStats.attendanceRate}%`}
          subtitle={`${overallStats.total} total sessions held`}
          icon={Percent}
          colorScheme={isAtRisk ? "rose" : "maroon"}
          index={0}
        />
        <StatCard
          title="Present Check-ins"
          value={overallStats.present}
          subtitle="On-time arrivals"
          icon={CheckCircle2}
          colorScheme="emerald"
          index={1}
        />
        <StatCard
          title="Late Arrivals"
          value={overallStats.late}
          subtitle="Within late cutoff"
          icon={Clock}
          colorScheme="amber"
          index={2}
        />
        <StatCard
          title="Absences Recorded"
          value={overallStats.absent}
          subtitle="Unexcused missed classes"
          icon={XCircle}
          colorScheme="rose"
          index={3}
        />
      </div>

      {/* Subject Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Breakdown Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-maroon-700 dark:text-maroon-400" />
              <span>Enrolled Subjects Attendance</span>
            </h3>
            <span className="text-xs text-slate-400">
              Required: 80% Minimum
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {subjectBreakdown.map((sub: any) => (
              <div key={sub.subjectId} className="py-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {sub.subjectCode}
                    </span>
                    <span className="text-slate-400 mx-2">&bull;</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {sub.subjectName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-sm ${
                        sub.attendanceRate < 80 ? "text-rose-600" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {sub.attendanceRate}%
                    </span>
                    {sub.attendanceRate < 80 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        At-Risk
                      </span>
                    )}
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sub.attendanceRate < 80 ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, sub.attendanceRate)}%` }}
                  />
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Present: {sub.present}</span>
                  <span>Late: {sub.late}</span>
                  <span>Absent: {sub.absent}</span>
                  <span>Excused: {sub.excused}</span>
                  <span className="ml-auto text-slate-500">{sub.units} Units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance Activity Stream */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <Link
              href="/student/history"
              className="text-xs font-semibold text-maroon-700 dark:text-maroon-400 hover:underline flex items-center gap-1"
            >
              <span>History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentRecords?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No recent attendance records recorded.
              </div>
            ) : (
              recentRecords.map((r: any) => (
                <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {r.session.subject.code}
                      </span>
                      <StatusBadge status={r.status} size="sm" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatDate(r.session.sessionDate)} &bull; {r.session.section.name}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {r.checkInTime ? formatTime(r.checkInTime) : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

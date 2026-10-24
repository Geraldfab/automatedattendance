"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  QrCode,
  Percent,
  CheckCircle2,
  Clock,
  XCircle,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh every 6 seconds so active sessions appear and disappear in real time
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async (isBackground = false) => {
    try {
      const res = await fetch("/api/student/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-[#FAFAFA] dark:bg-[#202020] rounded-3xl border border-[#E0E0E0] dark:border-[#383838]" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838]" />
          ))}
        </div>
      </div>
    );
  }

  const { student, overallStats, subjectBreakdown, activeSessions, recentRecords } = data;
  const isAtRisk = overallStats.isAtRisk;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Student Profile Header & Welcome */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E0E0E0] dark:border-[#383838] bg-[#202020] text-[#F5F5F5] shadow-sm">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tcc-admin-bldg.jpg"
            alt="Torres Capitol College Campus"
            fill
            priority
            className="object-cover object-center filter brightness-[0.22] contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#202020] via-[#202020]/90 to-transparent" />
        </div>
        <div className="relative z-10 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl bg-[#171717] border border-[#454545] p-1.5 shrink-0 shadow-sm hidden sm:flex items-center justify-center">
              <Image
                src="/images/tcc-logo.png"
                alt="TCC Logo"
                width={42}
                height={42}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A6A6A6]">
                  BSIT Student Portal
                </span>
                <span className="text-[#858585]">&bull;</span>
                <span className="font-mono text-xs font-semibold text-[#F5F5F5] bg-[#252525] px-2 py-0.5 rounded border border-[#454545]">
                  {student.studentIdNumber}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5]">
                Hello, {student.name}
              </h1>
              <p className="text-xs text-[#A6A6A6] mt-0.5">
                Enrolled in {student.program} &bull; Year {student.yearLevel} &bull; Section {student.sectionName}
              </p>
            </div>
          </div>

          <Link
            href="/student/scan"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-[#F5F5F5] text-xs font-semibold transition-colors shadow-sm active:scale-98 shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Live Attendance QR</span>
          </Link>
        </div>
      </div>

      {/* Active Session Notification Banner */}
      {activeSessions?.length > 0 && (
        <div className="space-y-3">
          {activeSessions.map((session: any) => (
            <div
              key={session.id}
              className={`p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                session.hasCheckedIn
                  ? "bg-[#FFFFFF] dark:bg-[#202020] border-l-4 border-l-[#2F855A] border-[#E0E0E0] dark:border-[#383838]"
                  : "bg-[#FFFFFF] dark:bg-[#202020] border-l-4 border-l-[#762D3D] border-[#E0E0E0] dark:border-[#383838] shadow-md shadow-[#762D3D]/5"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {session.hasCheckedIn ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EBF5EE] dark:bg-[#1C3E2B] text-[#2F855A] dark:text-[#72C899] border border-[#2F855A]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F855A]" />
                      Attendance Recorded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F8EAEF] dark:bg-[#352329] text-[#762D3D] dark:text-[#E6B5C2] border border-[#762D3D]/30">
                      <span className="w-2 h-2 rounded-full bg-[#762D3D] animate-ping" />
                      Live Attendance Active
                    </span>
                  )}
                  <span className="text-[11px] text-[#626262] dark:text-[#A6A6A6]">
                    Active until {new Date(session.endTime).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-[#762D3D] text-[#FFFFFF] shadow-sm">
                    {session.subject.code}
                  </span>
                  <span className="font-bold text-sm sm:text-base text-[#171717] dark:text-[#F5F5F5]">
                    {session.subject.name}
                  </span>
                </div>

                <p className="text-xs text-[#454545] dark:text-[#CCCCCC] font-medium flex items-center gap-2 flex-wrap">
                  <span>Instructor: <strong className="text-[#171717] dark:text-[#F5F5F5]">{session.faculty.user.name}</strong></span>
                  <span className="text-[#858585]">&bull;</span>
                  <span>Section: <strong className="text-[#171717] dark:text-[#F5F5F5]">{session.section.name}</strong></span>
                </p>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                {session.hasCheckedIn ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EBF5EE] dark:bg-[#1C3E2B]/50 text-[#2F855A] dark:text-[#72C899] text-xs font-bold border border-[#2F855A]/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Checked In ({session.checkInStatus || "PRESENT"})</span>
                  </div>
                ) : (
                  <Link
                    href="/student/scan"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-[#FFFFFF] font-bold text-xs rounded-xl shadow-md shadow-[#762D3D]/25 transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <QrCode className="w-4 h-4" />
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
        <div className="p-4 rounded-2xl bg-[#FDF0F0] dark:bg-[#4A2020]/40 border border-[#C05656]/40 text-xs text-[#C05656] dark:text-[#F19393] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[#C05656] dark:text-[#F19393]">
              Attendance Advisory Notice
            </h4>
            <p className="mt-0.5 leading-relaxed text-[#626262] dark:text-[#A6A6A6]">
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
          subtitle={`${overallStats.total} total sessions`}
          icon={Percent}
          colorScheme={isAtRisk ? "rose" : "burgundy"}
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
          subtitle="Unexcused missed"
          icon={XCircle}
          colorScheme="rose"
          index={3}
        />
      </div>

      {/* Subject Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Breakdown Table */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#762D3D] dark:text-[#E6B5C2]" />
              <span>Enrolled Subjects Attendance</span>
            </h3>
            <span className="text-xs text-[#858585]">
              Required: 80% Minimum
            </span>
          </div>

          <div className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
            {subjectBreakdown.map((sub: any) => (
              <div key={sub.subjectId} className="py-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#252525] dark:text-[#F5F5F5]">
                      {sub.subjectCode}
                    </span>
                    <span className="text-[#858585] mx-2">&bull;</span>
                    <span className="font-medium text-[#626262] dark:text-[#A6A6A6]">
                      {sub.subjectName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-sm ${
                        sub.attendanceRate < 80 ? "text-[#C05656]" : "text-[#252525] dark:text-[#F5F5F5]"
                      }`}
                    >
                      {sub.attendanceRate}%
                    </span>
                    {sub.attendanceRate < 80 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FDF0F0] text-[#C05656] dark:bg-[#4A2020]/60 dark:text-[#F19393] border border-[#C05656]/30">
                        At-Risk
                      </span>
                    )}
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="w-full h-1.5 bg-[#EAEAEA] dark:bg-[#252525] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      sub.attendanceRate < 80 ? "bg-[#C05656]" : "bg-[#2F855A]"
                    }`}
                    style={{ width: `${Math.min(100, sub.attendanceRate)}%` }}
                  />
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#858585]">
                  <span>Present: {sub.present}</span>
                  <span>Late: {sub.late}</span>
                  <span>Absent: {sub.absent}</span>
                  <span>Excused: {sub.excused}</span>
                  <span className="ml-auto text-[#626262] dark:text-[#A6A6A6]">{sub.units} Units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance Activity Stream */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5]">
              Recent Activity
            </h3>
            <Link
              href="/student/history"
              className="text-xs font-semibold text-[#762D3D] dark:text-[#E6B5C2] hover:underline flex items-center gap-1"
            >
              <span>History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
            {recentRecords?.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#858585]">
                No recent attendance records recorded.
              </div>
            ) : (
              recentRecords.map((r: any) => (
                <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#252525] dark:text-[#F5F5F5]">
                        {r.session.subject.code}
                      </span>
                      <StatusBadge status={r.status} size="sm" />
                    </div>
                    <p className="text-[10px] text-[#858585] mt-0.5">
                      {formatDate(r.session.sessionDate)} &bull; {r.session.section.name}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-[#858585]">
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

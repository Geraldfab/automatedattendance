"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  QrCode,
  Users,
  Percent,
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  PlayCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatTime } from "@/lib/utils";

export default function FacultyDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/faculty/stats");
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.summary || {};
  const activeSession = data?.activeSession;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Faculty Instructor Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            BSIT Attendance Management & Class Session Controls
          </p>
        </div>

        <Link
          href="/faculty/session/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold transition-all shadow-md shadow-maroon-900/20"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch New Attendance Session</span>
        </Link>
      </div>

      {/* Active Session Alert Banner (if running right now!) */}
      {activeSession && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-maroon-900 to-maroon-950 text-white border border-maroon-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-rose-300">
                  Active Attendance Session
                </span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-mono">
                  {activeSession.subject.code}
                </span>
              </div>
              <p className="font-semibold text-sm mt-0.5">
                {activeSession.subject.name} &bull; {activeSession.section.name}
              </p>
            </div>
          </div>

          <Link
            href={`/faculty/session/${activeSession.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-maroon-950 font-bold text-xs rounded-xl shadow hover:bg-rose-50 transition-colors"
          >
            <span>Open Live QR Monitor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Class Attendance Rate"
          value={`${s.overallAttendanceRate || 0}%`}
          subtitle={`Present: ${s.presentCount || 0} | Late: ${s.lateCount || 0}`}
          icon={Percent}
          colorScheme="maroon"
          trend="+1.8% average"
          trendPositive={true}
          index={0}
        />
        <StatCard
          title="Assigned BSIT Classes"
          value={s.totalClasses || 0}
          subtitle={`Total conducted sessions: ${s.totalSessions || 0}`}
          icon={BookOpen}
          colorScheme="blue"
          index={1}
        />
        <StatCard
          title="At-Risk Students (< 80%)"
          value={s.atRiskCount || 0}
          subtitle="Requires academic attendance advisory"
          icon={AlertTriangle}
          colorScheme="rose"
          index={2}
        />
      </div>

      {/* Class Statistics & Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Attendance Summary List */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              My Class Attendance Rates
            </h3>
            <Link
              href="/faculty/classes"
              className="text-xs font-semibold text-maroon-700 dark:text-maroon-400 hover:underline flex items-center gap-1"
            >
              <span>View All Classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data?.classStats?.map((c: any) => (
              <div key={c.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {c.subjectCode}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {c.sectionName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.subjectName}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {c.attendanceRate}%
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {c.totalSessions} Sessions
                    </p>
                  </div>
                  <Link
                    href={`/faculty/session/create?subjectId=${c.id.split("-")[0]}&sectionId=${c.id.split("-")[1]}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    title="Launch Session"
                  >
                    <PlayCircle className="w-4 h-4 text-maroon-700 dark:text-maroon-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Class Schedules */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-maroon-700 dark:text-maroon-400" />
            <span>Assigned Schedule</span>
          </h3>

          <div className="space-y-3">
            {data?.schedules?.map((sched: any) => (
              <div
                key={sched.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {sched.subject.code}
                  </span>
                  <span className="text-[11px] font-semibold text-maroon-700 dark:text-maroon-400">
                    {sched.dayOfWeek}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>{sched.section.name}</span>
                  <span className="font-mono">{sched.startTime} – {sched.endTime}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span>{sched.room}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Students Table */}
      {data?.atRiskList?.length > 0 && (
        <div className="p-6 rounded-3xl border border-rose-200/80 dark:border-rose-950/40 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Students At Risk of Failing Attendance Policy (&lt; 80%)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {data.atRiskList.length} Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">ID Number</th>
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.atRiskList.map((st: any, idx: number) => (
                  <tr key={idx} className="hover:bg-rose-50/20">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {st.studentName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {st.studentIdNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {st.sectionName}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {st.subjectCode}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                      {st.attendanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

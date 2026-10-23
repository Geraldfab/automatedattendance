"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  ClipboardCheck,
  Percent,
  AlertTriangle,
  History,
  TrendingUp,
  ArrowRight,
  Download,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { AttendanceChart } from "@/components/charts/attendance-chart";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatDate, downloadCSV } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.recentSessions) return;
    const rows = data.recentSessions.map((s: any) => ({
      SessionID: s.id,
      SubjectCode: s.subject.code,
      SubjectName: s.subject.name,
      Section: s.section.name,
      Faculty: s.faculty.user.name,
      Status: s.status,
      Date: formatDate(s.sessionDate),
      Attendees: s._count.records,
    }));
    downloadCSV("TCCI_Admin_Attendance_Sessions.csv", rows);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.summary || {};

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Administration Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics and attendance governance for Torres Capitol College Inc. BSIT Department
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sessions CSV</span>
          </button>
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold transition-colors shadow-sm shadow-maroon-900/10"
          >
            <span>Detailed Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance Rate"
          value={`${s.attendanceRate || 0}%`}
          subtitle={`Present: ${s.presentCount || 0} | Late: ${s.lateCount || 0}`}
          icon={Percent}
          colorScheme="maroon"
          trend="+2.4% vs last term"
          trendPositive={true}
          index={0}
        />
        <StatCard
          title="Enrolled BSIT Students"
          value={s.totalStudents || 0}
          subtitle={`Across ${s.totalSections || 0} class sections`}
          icon={Users}
          colorScheme="blue"
          index={1}
        />
        <StatCard
          title="Active BSIT Faculty"
          value={s.totalFaculty || 0}
          subtitle={`Handling ${s.totalSubjects || 0} core IT subjects`}
          icon={GraduationCap}
          colorScheme="emerald"
          index={2}
        />
        <StatCard
          title="Sessions Conducted"
          value={s.totalSessions || 0}
          subtitle={`Absences recorded: ${s.absentCount || 0}`}
          icon={ClipboardCheck}
          colorScheme="slate"
          index={3}
        />
      </div>

      {/* Charts & At-Risk Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Attendance Trends (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400">
                Daily breakdown of Present, Late, and Absent check-ins
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> Stable Turnout
            </span>
          </div>

          <AttendanceChart data={data?.trends || []} />
        </div>

        {/* At-Risk Students Card (< 80%) */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>At-Risk Students (&lt; 80%)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {data?.atRiskStudents?.length || 0} Flagged
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Students subject to institutional advisory due to falling below the 80% attendance policy threshold.
            </p>

            <div className="space-y-2.5 overflow-y-auto max-h-56">
              {data?.atRiskStudents?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No students currently flagged below 80%.
                </div>
              ) : (
                data?.atRiskStudents?.map((st: any) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {st.user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {st.studentIdNumber} &bull; {st.section?.name || "BSIT"}
                      </p>
                    </div>
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-xs">
                      Requires Notice
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/records?status=ABSENT"
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Review Attendance Records
          </Link>
        </div>
      </div>

      {/* Recent Sessions & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance Sessions */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recent Attendance Sessions
            </h3>
            <Link
              href="/admin/records"
              className="text-xs font-semibold text-maroon-700 dark:text-maroon-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data?.recentSessions?.map((sess: any) => (
              <div key={sess.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sess.subject.code}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {sess.section.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Faculty: {sess.faculty.user.name} &bull; {formatDate(sess.sessionDate)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sess.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {sess.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {sess._count.records} attendees
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Trail Logs */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-maroon-700 dark:text-maroon-400" />
              <span>System Audit Trail</span>
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-maroon-700 dark:text-maroon-400 hover:underline flex items-center gap-1"
            >
              <span>Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data?.auditLogs?.map((log: any) => (
              <div key={log.id} className="py-2.5 text-xs flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    By {log.actorName} ({log.actorRole})
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

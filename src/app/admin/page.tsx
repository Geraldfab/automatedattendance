"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Percent,
  AlertTriangle,
  History,
  TrendingUp,
  ArrowRight,
  Download,
  BarChart3,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { AttendanceChart } from "@/components/charts/attendance-chart";
import { formatDateTime, formatDate, downloadCSV } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
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

  const handleExportCSV = () => {
    if (!data?.recentSessions) return;
    const rows = data.recentSessions.map((s: any) => ({
      SubjectCode: s.subject.code,
      SubjectName: s.subject.name,
      Section: s.section.name,
      Faculty: s.faculty.user.name,
      Date: formatDate(s.sessionDate),
      Status: s.status,
      AttendeesCount: s._count.records,
    }));
    downloadCSV("TCCI_Admin_Attendance_Sessions.csv", rows);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-[#FAFAFA] dark:bg-[#202020] rounded-3xl border border-[#E0E0E0] dark:border-[#383838]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838]" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.summary || {};

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Institutional Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E0E0E0] dark:border-[#383838] bg-[#202020] text-[#F5F5F5] shadow-sm">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tcc-building.jpg"
            alt="Torres Capitol College"
            fill
            priority
            className="object-cover object-center filter brightness-[0.22] contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#202020] via-[#202020]/90 to-transparent" />
        </div>
        <div className="relative z-10 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#252525]/80 border border-[#454545] text-[10px] font-semibold tracking-wider text-[#A6A6A6] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#2F855A] animate-pulse" />
              <span>OFFICIAL TCC INSTITUTIONAL SYSTEM &bull; DOMINE DIRIGE NOS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5]">
              Torres Capitol College Inc.
            </h1>
            <p className="text-xs text-[#A6A6A6] mt-1 leading-relaxed">
              BSIT Automated Attendance Verification & Institutional Governance System &bull; Academic Year 2024–2025
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#454545] bg-[#252525] hover:bg-[#303030] text-xs font-semibold text-[#F5F5F5] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/admin/reports"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-xs font-semibold text-[#F5F5F5] transition-colors shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Audit Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance Rate"
          value={`${s.attendanceRate || 0}%`}
          subtitle={`Present: ${s.presentCount || 0} | Late: ${s.lateCount || 0}`}
          icon={Percent}
          colorScheme="burgundy"
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
          colorScheme="charcoal"
          index={3}
        />
      </div>

      {/* Charts & At-Risk Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5]">
                Attendance Trends (Last 7 Days)
              </h3>
              <p className="text-xs text-[#626262] dark:text-[#A6A6A6]">
                Daily distribution of Present, Late, and Absent check-ins
              </p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2F855A] bg-[#EBF5EE] dark:bg-[#1C3E2B]/50 dark:text-[#72C899] px-2.5 py-1 rounded-full border border-[#2F855A]/30">
              <TrendingUp className="w-3.5 h-3.5" /> Stable Turnout
            </span>
          </div>

          <AttendanceChart data={data?.trends || []} />
        </div>

        {/* At-Risk Students Card (< 80%) */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
                <span>At-Risk Students (&lt; 80%)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF0F0] text-[#C05656] dark:bg-[#4A2020]/60 dark:text-[#F19393] border border-[#C05656]/30">
                {data?.atRiskStudents?.length || 0} Flagged
              </span>
            </div>
            <p className="text-xs text-[#626262] dark:text-[#A6A6A6] mb-4">
              Students subject to institutional advisory due to falling below the 80% attendance policy threshold.
            </p>

            <div className="space-y-2 overflow-y-auto max-h-56">
              {data?.atRiskStudents?.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#626262] dark:text-[#A6A6A6]">
                  No students currently flagged below 80%.
                </div>
              ) : (
                data?.atRiskStudents?.map((st: any) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl bg-[#F0F0F0] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#383838] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#252525] dark:text-[#F5F5F5]">
                        {st.user.name}
                      </p>
                      <p className="text-[10px] text-[#626262] dark:text-[#A6A6A6] font-mono">
                        {st.studentIdNumber} &bull; {st.section?.name || "BSIT"}
                      </p>
                    </div>
                    <span className="text-[#C05656] dark:text-[#F19393] font-bold text-xs">
                      Requires Notice
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/records?status=ABSENT"
            className="w-full py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#454545] text-center text-xs font-semibold text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors"
          >
            Review Attendance Records
          </Link>
        </div>
      </div>

      {/* Recent Sessions & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance Sessions */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5]">
              Recent Attendance Sessions
            </h3>
            <Link
              href="/admin/records"
              className="text-xs font-semibold text-[#762D3D] dark:text-[#E6B5C2] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
            {data?.recentSessions?.map((sess: any) => (
              <div key={sess.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#252525] dark:text-[#F5F5F5]">
                      {sess.subject.code}
                    </span>
                    <span className="text-[#858585]">&bull;</span>
                    <span className="text-[#626262] dark:text-[#A6A6A6]">
                      {sess.section.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#858585] mt-0.5">
                    Faculty: {sess.faculty.user.name} &bull; {formatDate(sess.sessionDate)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sess.status === "ACTIVE"
                        ? "bg-[#EBF5EE] text-[#2F855A] dark:bg-[#1C3E2B]/60 dark:text-[#72C899]"
                        : "bg-[#F0F0F0] text-[#626262] dark:bg-[#252525] dark:text-[#A6A6A6]"
                    }`}
                  >
                    {sess.status}
                  </span>
                  <p className="text-[10px] text-[#858585] mt-1">
                    {sess._count.records} attendees
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Trail Logs */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5] flex items-center gap-2">
              <History className="w-4 h-4 text-[#762D3D] dark:text-[#E6B5C2]" />
              <span>System Audit Trail</span>
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-[#762D3D] dark:text-[#E6B5C2] hover:underline flex items-center gap-1"
            >
              <span>Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
            {data?.auditLogs?.map((log: any) => (
              <div key={log.id} className="py-2.5 text-xs flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#252525] dark:text-[#F5F5F5]">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-[#858585]">
                    By {log.actorName} ({log.actorRole})
                  </p>
                </div>
                <span className="text-[10px] text-[#858585] font-mono">
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

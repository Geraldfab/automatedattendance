"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  QrCode,
  Percent,
  AlertTriangle,
  ArrowRight,
  MapPin,
  PlayCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export default function FacultyDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/faculty/dashboard");
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
        <div className="h-36 bg-[#FAFAFA] dark:bg-[#202020] rounded-3xl border border-[#E0E0E0] dark:border-[#383838]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838]" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.summary || {};
  const activeSession = data?.activeSession;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Faculty Institutional Header */}
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
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#252525]/80 border border-[#454545] text-[10px] font-semibold tracking-wider text-[#A6A6A6] mb-1.5">
                <span>TORRES CAPITOL COLLEGE &bull; FACULTY PORTAL</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5]">
                Faculty Instructor Dashboard
              </h1>
              <p className="text-xs text-[#A6A6A6] mt-0.5">
                BSIT Attendance Management, Dynamic QR Generation & Class Session Controls
              </p>
            </div>
          </div>

          <Link
            href="/faculty/session/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-xs font-semibold text-[#F5F5F5] transition-colors shadow-sm shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch New Attendance Session</span>
          </Link>
        </div>
      </div>

      {/* Active Session Alert Banner (if running right now!) */}
      {activeSession && (
        <div className="p-5 rounded-2xl bg-[#352329] text-[#F5F5F5] border border-[#762D3D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#2F855A] animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-[#E6B5C2]">
                  Active Attendance Session
                </span>
                <span className="text-xs bg-[#252525] px-2 py-0.5 rounded-full font-mono text-[#F5F5F5] border border-[#5a2531]">
                  {activeSession.subject.code}
                </span>
              </div>
              <p className="font-semibold text-sm mt-0.5 text-[#F5F5F5]">
                {activeSession.subject.name} &bull; {activeSession.section.name}
              </p>
            </div>
          </div>

          <Link
            href={`/faculty/session/${activeSession.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#762D3D] hover:bg-[#8A394B] text-[#F5F5F5] font-semibold text-xs rounded-xl shadow-sm transition-colors"
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
          colorScheme="burgundy"
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
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5]">
              My Class Attendance Rates
            </h3>
            <Link
              href="/faculty/classes"
              className="text-xs font-semibold text-[#762D3D] dark:text-[#E6B5C2] hover:underline flex items-center gap-1"
            >
              <span>View All Classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
            {data?.classStats?.map((c: any) => (
              <div key={c.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#252525] dark:text-[#F5F5F5]">
                      {c.subjectCode}
                    </span>
                    <span className="text-[#858585]">&bull;</span>
                    <span className="font-semibold text-[#626262] dark:text-[#A6A6A6]">
                      {c.sectionName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#858585] mt-0.5">{c.subjectName}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-[#252525] dark:text-[#F5F5F5] text-sm">
                      {c.attendanceRate}%
                    </p>
                    <p className="text-[10px] text-[#858585]">
                      {c.totalSessions} Sessions
                    </p>
                  </div>
                  <Link
                    href={`/faculty/session/create?subjectId=${c.id.split("-")[0]}&sectionId=${c.id.split("-")[1]}`}
                    className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#EAEAEA] dark:bg-[#252525] dark:hover:bg-[#303030] text-[#762D3D] dark:text-[#E6B5C2] transition-colors"
                    title="Launch Session"
                  >
                    <PlayCircle className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Class Schedules */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#762D3D] dark:text-[#E6B5C2]" />
            <span>Assigned Schedule</span>
          </h3>

          <div className="space-y-2.5">
            {data?.schedules?.map((sched: any) => (
              <div
                key={sched.id}
                className="p-3 rounded-xl bg-[#F0F0F0] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#383838] text-xs space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#252525] dark:text-[#F5F5F5] font-mono">
                    {sched.subject.code}
                  </span>
                  <span className="text-[11px] font-semibold text-[#762D3D] dark:text-[#E6B5C2]">
                    {sched.dayOfWeek}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#626262] dark:text-[#A6A6A6] text-[11px]">
                  <span>{sched.section.name}</span>
                  <span className="font-mono">{sched.startTime} – {sched.endTime}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#858585]">
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
        <div className="p-5 sm:p-6 rounded-2xl border border-[#C05656]/30 dark:border-[#C05656]/40 bg-[#FAFAFA] dark:bg-[#202020] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#C05656] dark:text-[#F19393] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Students At Risk of Failing Attendance Policy (&lt; 80%)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF0F0] text-[#C05656] dark:bg-[#4A2020]/60 dark:text-[#F19393] border border-[#C05656]/30">
              {data.atRiskList.length} Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E0E0E0] dark:border-[#383838] bg-[#F0F0F0] dark:bg-[#252525] text-[#626262] dark:text-[#A6A6A6] font-semibold uppercase">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">ID Number</th>
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
                {data.atRiskList.map((st: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#FDF0F0]/40 dark:hover:bg-[#4A2020]/20">
                    <td className="py-2.5 px-3 font-semibold text-[#252525] dark:text-[#F5F5F5]">
                      {st.studentName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#858585]">
                      {st.studentIdNumber}
                    </td>
                    <td className="py-2.5 px-3 text-[#626262] dark:text-[#A6A6A6]">
                      {st.sectionName}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#252525] dark:text-[#F5F5F5]">
                      {st.subjectCode}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#C05656] dark:text-[#F19393]">
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

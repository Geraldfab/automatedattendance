"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Download, Printer, AlertTriangle } from "lucide-react";
import { downloadCSV } from "@/lib/utils";

export default function FacultyReportsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/faculty/stats", { cache: "no-store" });
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
    if (!data?.classStats) return;
    const rows = data.classStats.map((c: any) => ({
      Subject: c.subjectCode,
      SubjectName: c.subjectName,
      Section: c.sectionName,
      AttendanceRate: `${c.attendanceRate}%`,
      TotalSessions: c.totalSessions,
      Present: c.present,
      Late: c.late,
      Absent: c.absent,
      Excused: c.excused,
    }));
    downloadCSV("TCCI_Faculty_Class_Summaries.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Class Attendance Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated attendance rates, participation summaries, and compliance benchmarks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FAFAFA] dark:bg-[#202020] text-xs font-semibold text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-[#F5F5F5] text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Printable Institutional Header */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <img
            src="/images/tcc-logo.png"
            alt="Torres Capitol College Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
        <div className="text-center flex-1 px-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">TORRES CAPITOL COLLEGE INC.</h2>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-600">Domine Dirige Nos</p>
          <p className="text-xs font-semibold text-slate-800 mt-0.5">COLLEGE OF COMPUTER STUDIES &bull; BSIT DEPARTMENT</p>
          <p className="text-xs text-slate-700 mt-1 font-mono font-medium">FACULTY CLASS TURNOUT REPORT</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Generated on {new Date().toLocaleDateString("en-PH")} &bull; Academic Year 2024–2025
          </p>
        </div>
        <div className="w-16 h-16 relative flex items-center justify-center">
          <img
            src="/images/bsit-logo.png"
            alt="BSIT Department Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>

      {/* Class Turnout Table */}
      <div className="bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E0E0E0] dark:border-[#383838]">
          <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5]">
            Class Turnout Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] dark:border-[#383838] bg-[#F0F0F0] dark:bg-[#252525] text-[#626262] dark:text-[#A6A6A6] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-center">Sessions</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Late</th>
                <th className="py-3 px-4 text-center">Absent</th>
                <th className="py-3 px-4 text-right">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
              {data?.classStats?.map((c: any) => (
                <tr key={c.id} className="hover:bg-[#F5F5F5] dark:hover:bg-[#252525]/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#252525] dark:text-[#F5F5F5]">
                      {c.subjectCode}
                    </span>
                    <p className="text-[11px] text-[#858585]">{c.subjectName}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#626262] dark:text-[#A6A6A6]">
                    {c.sectionName}
                  </td>
                  <td className="py-3 px-4 text-center text-[#858585]">{c.totalSessions}</td>
                  <td className="py-3 px-4 text-center font-semibold text-[#2F855A]">{c.present}</td>
                  <td className="py-3 px-4 text-center font-semibold text-[#B7791F]">{c.late}</td>
                  <td className="py-3 px-4 text-center font-semibold text-[#C05656]">{c.absent}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#252525] dark:text-[#F5F5F5] text-sm">
                    {c.attendanceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

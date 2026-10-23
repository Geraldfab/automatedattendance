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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Class Turnout Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Class Turnout Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-center">Sessions</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Late</th>
                <th className="py-3 px-4 text-center">Absent</th>
                <th className="py-3 px-4 text-right">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.classStats?.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {c.subjectCode}
                    </span>
                    <p className="text-[11px] text-slate-400">{c.subjectName}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {c.sectionName}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">{c.totalSessions}</td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-600">{c.present}</td>
                  <td className="py-3 px-4 text-center font-semibold text-amber-600">{c.late}</td>
                  <td className="py-3 px-4 text-center font-semibold text-rose-600">{c.absent}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white text-sm">
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

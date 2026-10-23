"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, downloadCSV } from "@/lib/utils";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<"THRESHOLD" | "SECTION" | "SUBJECT">("THRESHOLD");
  const [threshold, setThreshold] = useState(80.0);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [records, setRecords] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [resSec, resSub, resRec, resStud] = await Promise.all([
        fetch("/api/admin/sections"),
        fetch("/api/admin/subjects"),
        fetch("/api/attendance/records?limit=500"),
        fetch("/api/admin/students"),
      ]);

      if (resSec.ok) {
        const d = await resSec.json();
        setSections(d.sections || []);
        if (d.sections?.[0]) setSelectedSection(d.sections[0].id);
      }
      if (resSub.ok) {
        const d = await resSub.json();
        setSubjects(d.subjects || []);
        if (d.subjects?.[0]) setSelectedSubject(d.subjects[0].id);
      }
      if (resRec.ok) {
        const d = await resRec.json();
        setRecords(d.records || []);
      }
      if (resStud.ok) {
        const d = await resStud.json();
        setStudents(d.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute student stats
  const studentStats = students.map((st) => {
    const stRecords = records.filter((r) => r.studentId === st.id);
    const total = stRecords.length;
    const present = stRecords.filter((r) => r.status === "PRESENT").length;
    const late = stRecords.filter((r) => r.status === "LATE").length;
    const absent = stRecords.filter((r) => r.status === "ABSENT").length;
    const excused = stRecords.filter((r) => r.status === "EXCUSED").length;
    const rate = total > 0 ? Math.round(((present + late * 0.75 + excused) / total) * 100 * 10) / 10 : 100;

    return {
      studentId: st.studentIdNumber,
      name: st.user.name,
      email: st.user.email,
      sectionId: st.sectionId,
      sectionName: st.section?.name || "Unassigned",
      totalSessions: total,
      present,
      late,
      absent,
      excused,
      attendanceRate: rate,
      isBelowThreshold: rate < threshold && total >= 2,
    };
  });

  // Filtered rows according to active report
  let displayRows = studentStats;
  if (reportType === "THRESHOLD") {
    displayRows = studentStats.filter((s) => s.isBelowThreshold);
  } else if (reportType === "SECTION") {
    displayRows = studentStats.filter((s) => !selectedSection || s.sectionId === selectedSection);
  }

  const handleExportCSV = () => {
    const exportData = displayRows.map((r) => ({
      StudentID: r.studentId,
      Name: r.name,
      Section: r.sectionName,
      TotalSessions: r.totalSessions,
      Present: r.present,
      Late: r.late,
      Absent: r.absent,
      Excused: r.excused,
      AttendanceRate: `${r.attendanceRate}%`,
      ComplianceStatus: r.attendanceRate >= threshold ? "Compliant" : "At-Risk",
    }));
    downloadCSV(`TCCI_Attendance_Report_${reportType}.csv`, exportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Institutional Attendance Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate compliance audits, at-risk rosters, and departmental summaries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold transition-colors shadow-sm shadow-maroon-900/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Printable Institutional Report Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold">TORRES CAPITOL COLLEGE INC.</h2>
        <p className="text-sm font-semibold">COLLEGE OF COMPUTER STUDIES — BSIT DEPARTMENT</p>
        <p className="text-xs text-slate-600 mt-1 font-mono">
          REPORT TYPE: {reportType === "THRESHOLD" ? `STUDENTS BELOW ${threshold}% ATTENDANCE THRESHOLD` : "CLASS ATTENDANCE AUDIT"}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          Generated on: {new Date().toLocaleString("en-PH")} &bull; Verified by System Administrator
        </p>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl no-print">
        <button
          onClick={() => setReportType("THRESHOLD")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            reportType === "THRESHOLD"
              ? "bg-white dark:bg-slate-900 text-maroon-700 dark:text-maroon-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Students Below Attendance Threshold (&lt; {threshold}%)
        </button>

        <button
          onClick={() => setReportType("SECTION")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            reportType === "SECTION"
              ? "bg-white dark:bg-slate-900 text-maroon-700 dark:text-maroon-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Attendance Summary Per Section
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4 no-print">
        {reportType === "THRESHOLD" ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Configured Institutional Policy Threshold:
            </span>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min={50}
              max={100}
              className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
            <span className="text-slate-400">%</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Select Section:
            </span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} (Year {sec.yearLevel})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{displayRows.length}</span> students
        </div>
      </div>

      {/* Printable / Viewable Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4 text-center">Sessions</th>
                <th className="py-3.5 px-4 text-center">Present</th>
                <th className="py-3.5 px-4 text-center">Late</th>
                <th className="py-3.5 px-4 text-center">Absent</th>
                <th className="py-3.5 px-4 text-center">Excused</th>
                <th className="py-3.5 px-4 text-right">Attendance Rate</th>
                <th className="py-3.5 px-4 text-right">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No students fall below the specified threshold. All students compliant!
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {row.studentId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {row.sectionName}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">{row.totalSessions}</td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-600">{row.present}</td>
                    <td className="py-3 px-4 text-center font-semibold text-amber-600">{row.late}</td>
                    <td className="py-3 px-4 text-center font-semibold text-rose-600">{row.absent}</td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-600">{row.excused}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {row.attendanceRate}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      {row.attendanceRate >= threshold ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Compliant
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          At-Risk (&lt;{threshold}%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

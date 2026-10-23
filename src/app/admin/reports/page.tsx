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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FAFAFA] dark:bg-[#202020] text-xs font-semibold text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Report</span>
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

      {/* Printable Institutional Report Header */}
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
          <p className="text-xs text-slate-700 mt-1 font-mono font-medium">
            REPORT TYPE: {reportType === "THRESHOLD" ? `STUDENTS BELOW ${threshold}% ATTENDANCE THRESHOLD` : "CLASS ATTENDANCE AUDIT"}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Generated on: {new Date().toLocaleString("en-PH")} &bull; Verified by System Administrator
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

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#EAEAEA] dark:bg-[#252525] p-1.5 rounded-2xl no-print border border-[#E0E0E0] dark:border-[#383838]">
        <button
          onClick={() => setReportType("THRESHOLD")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            reportType === "THRESHOLD"
              ? "bg-[#FAFAFA] dark:bg-[#202020] text-[#762D3D] dark:text-[#E6B5C2] shadow-sm font-bold"
              : "text-[#626262] dark:text-[#A6A6A6] hover:text-[#252525] dark:hover:text-[#F5F5F5]"
          }`}
        >
          Students Below Attendance Threshold (&lt; {threshold}%)
        </button>

        <button
          onClick={() => setReportType("SECTION")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            reportType === "SECTION"
              ? "bg-[#FAFAFA] dark:bg-[#202020] text-[#762D3D] dark:text-[#E6B5C2] shadow-sm font-bold"
              : "text-[#626262] dark:text-[#A6A6A6] hover:text-[#252525] dark:hover:text-[#F5F5F5]"
          }`}
        >
          Attendance Summary Per Section
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm flex items-center justify-between flex-wrap gap-4 no-print">
        {reportType === "THRESHOLD" ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-[#626262] dark:text-[#A6A6A6]">
              Configured Institutional Policy Threshold:
            </span>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min={50}
              max={100}
              className="w-20 px-2.5 py-1.5 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
            />
            <span className="text-[#858585]">%</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-[#626262] dark:text-[#A6A6A6]">
              Select Section:
            </span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
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

        <div className="text-xs text-[#626262] dark:text-[#A6A6A6] font-medium">
          Showing <span className="font-bold text-[#252525] dark:text-[#F5F5F5]">{displayRows.length}</span> students
        </div>
      </div>

      {/* Printable / Viewable Table */}
      <div className="bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] dark:border-[#383838] bg-[#F0F0F0] dark:bg-[#252525] text-[#626262] dark:text-[#A6A6A6] font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#858585]">
                    No students fall below the specified threshold. All students compliant!
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-[#F5F5F5] dark:hover:bg-[#252525]/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#252525] dark:text-[#F5F5F5]">
                      {row.studentId}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#252525] dark:text-[#F5F5F5]">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-[#626262] dark:text-[#A6A6A6]">
                      {row.sectionName}
                    </td>
                    <td className="py-3 px-4 text-center text-[#858585]">{row.totalSessions}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#2F855A]">{row.present}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#B7791F]">{row.late}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#C05656]">{row.absent}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#4A78A8]">{row.excused}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#252525] dark:text-[#F5F5F5]">
                      {row.attendanceRate}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      {row.attendanceRate >= threshold ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF5EE] text-[#2F855A] dark:bg-[#1C3E2B]/50 dark:text-[#72C899] border border-[#2F855A]/30">
                          Compliant
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDF0F0] text-[#C05656] dark:bg-[#4A2020]/60 dark:text-[#F19393] border border-[#C05656]/30">
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

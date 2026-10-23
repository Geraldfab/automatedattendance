"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Search,
  Filter,
  Download,
  Printer,
  Edit3,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CorrectionModal } from "@/components/ui/correction-modal";
import { formatDateTime, formatDate, downloadCSV } from "@/lib/utils";

export default function AdminAttendanceRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedSubject, selectedSection, selectedStatus]);

  const fetchMetadata = async () => {
    try {
      const [resSub, resSec] = await Promise.all([
        fetch("/api/admin/subjects"),
        fetch("/api/admin/sections"),
      ]);
      if (resSub.ok) {
        const d = await resSub.json();
        setSubjects(d.subjects || []);
      }
      if (resSec.ok) {
        const d = await resSec.json();
        setSections(d.sections || []);
      }
    } catch (e) {}
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedSubject) q.set("subjectId", selectedSubject);
      if (selectedSection) q.set("sectionId", selectedSection);
      if (selectedStatus && selectedStatus !== "ALL") q.set("status", selectedStatus);

      const res = await fetch(`/api/attendance/records?${q.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setRecords(d.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.student.user.name.toLowerCase().includes(s) ||
      r.student.studentIdNumber.toLowerCase().includes(s) ||
      r.session.subject.code.toLowerCase().includes(s)
    );
  });

  const handleExportCSV = () => {
    const rows = filteredRecords.map((r) => ({
      AttendanceID: r.id,
      StudentID: r.student.studentIdNumber,
      StudentName: r.student.user.name,
      Subject: r.session.subject.code,
      SubjectName: r.session.subject.name,
      Section: r.session.section.name,
      Status: r.status,
      CheckInTime: r.checkInTime ? formatDateTime(r.checkInTime) : "N/A",
      Method: r.submissionMethod,
      ModifiedBy: r.lastModifiedByUser?.name || "System / QR Scan",
      CorrectionReason: r.correctionReason || "",
    }));
    downloadCSV("TCCI_BSIT_Attendance_Records.csv", rows);
  };

  const handlePrint = () => {
    window.print();
  };

  const openCorrection = (record: any) => {
    setCorrectionTarget({
      id: record.id,
      studentName: record.student.user.name,
      studentIdNumber: record.student.studentIdNumber,
      currentStatus: record.status,
      subjectCode: record.session.subject.code,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance Records & Audits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional attendance repository with server-verified timestamps and audit trails
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
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

      {/* Printable Institutional Header (visible only when printing) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold">TORRES CAPITOL COLLEGE INC.</h2>
        <p className="text-sm font-medium">College of Computer Studies — BSIT Department</p>
        <p className="text-xs text-slate-600 mt-1">Official Attendance Master Records Report</p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Generated on {new Date().toLocaleDateString("en-PH")} &bull; Academic Year 2024–2025
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3 no-print">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, student ID, or subject..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-full sm:w-44"
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.code}
            </option>
          ))}
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-full sm:w-40"
        >
          <option value="">All Sections</option>
          {sections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-full sm:w-36 font-semibold"
        >
          <option value="ALL">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="ABSENT">Absent</option>
          <option value="EXCUSED">Excused</option>
        </select>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Subject & Section</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-in Time</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Correction Notes</th>
                <th className="py-3.5 px-4 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No attendance records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {r.student.user.name}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400">
                        {r.student.studentIdNumber}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {r.session.subject.code}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {r.session.section.name} &bull; {formatDate(r.session.sessionDate)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {r.checkInTime ? formatDateTime(r.checkInTime) : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {r.submissionMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-500">
                      {r.correctionReason ? (
                        <span title={r.correctionReason} className="italic text-amber-700 dark:text-amber-400">
                          {r.correctionReason}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right no-print">
                      <button
                        onClick={() => openCorrection(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-maroon-700 dark:text-maroon-400" />
                        <span>Correct</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Correction Dialog */}
      <CorrectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={correctionTarget}
        onSuccess={fetchRecords}
      />
    </div>
  );
}

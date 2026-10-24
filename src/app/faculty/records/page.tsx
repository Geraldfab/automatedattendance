"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Search,
  Download,
  Printer,
  Edit3,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CorrectionModal } from "@/components/ui/correction-modal";
import { formatDateTime, formatDate, downloadCSV } from "@/lib/utils";

export default function FacultyRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [selectedStatus]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "ALL") q.set("status", selectedStatus);

      const res = await fetch(`/api/attendance/records?${q.toString()}`, { cache: "no-store" });
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

  const filtered = records.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.student.user.name.toLowerCase().includes(s) ||
      r.student.studentIdNumber.toLowerCase().includes(s) ||
      r.session.subject.code.toLowerCase().includes(s)
    );
  });

  const handleExportCSV = () => {
    const rows = filtered.map((r) => ({
      StudentID: r.student.studentIdNumber,
      StudentName: r.student.user.name,
      Subject: r.session.subject.code,
      Section: r.session.section.name,
      Status: r.status,
      CheckInTime: r.checkInTime ? formatDateTime(r.checkInTime) : "N/A",
      Method: r.submissionMethod,
      Reason: r.correctionReason || "",
    }));
    downloadCSV("TCCI_Faculty_Class_Records.csv", rows);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#252525] dark:text-[#F5F5F5]">
            Class Attendance Records
          </h1>
          <p className="text-xs text-[#626262] dark:text-[#A6A6A6] mt-1">
            Review and audit student attendance submissions across your assigned classes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FAFAFA] dark:bg-[#202020] text-xs font-semibold text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-[#F5F5F5] text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Printable Institutional Letterhead */}
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
          <p className="text-xs text-slate-700 mt-1 font-mono font-medium">FACULTY CLASS ATTENDANCE ROSTER</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Printed via Automated Attendance System &bull; PST (UTC+8)
          </p>
        </div>
        <div className="w-16 h-16 relative flex items-center justify-center">
          <img
            src="/images/bsit-logo.png"
            alt="BSIT Department Seal"
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3 no-print">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, ID number, or subject..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
        >
          <option value="ALL">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="ABSENT">Absent</option>
          <option value="EXCUSED">Excused</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Subject & Section</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-in Time</th>
                <th className="py-3.5 px-4">Submission Method</th>
                <th className="py-3.5 px-4 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {r.student.user.name}
                    </p>
                    <p className="font-mono text-[11px] text-slate-400">
                      {r.student.studentIdNumber}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {r.session.subject.code}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {r.session.section.name} &bull; {formatDate(r.session.sessionDate)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {r.checkInTime ? formatDateTime(r.checkInTime) : "—"}
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-[10px] text-slate-400">
                    {r.submissionMethod}
                  </td>
                  <td className="py-3 px-4 text-right no-print">
                    <button
                      onClick={() => openCorrection(r)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="w-3 h-3 text-maroon-700" />
                      <span>Correct</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CorrectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={correctionTarget}
        onSuccess={fetchRecords}
      />
    </div>
  );
}

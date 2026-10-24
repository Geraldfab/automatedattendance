"use client";

import React, { useState, useEffect } from "react";
import { Clock, Search, Download, Printer } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, downloadCSV } from "@/lib/utils";

export default function StudentHistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

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
      r.session.subject.code.toLowerCase().includes(s) ||
      r.session.subject.name.toLowerCase().includes(s)
    );
  });

  const handleExportCSV = () => {
    const rows = filtered.map((r) => ({
      Subject: r.session.subject.code,
      SubjectName: r.session.subject.name,
      Date: formatDate(r.session.sessionDate),
      CheckInTime: r.checkInTime ? formatDateTime(r.checkInTime) : "N/A",
      Status: r.status,
      Method: r.submissionMethod,
      Notes: r.correctionReason || "",
    }));
    downloadCSV("My_TCCI_Attendance_History.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Attendance History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal historical log of all recorded attendance events and verified timestamps
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FAFAFA] dark:bg-[#202020] text-xs font-semibold text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Log</span>
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
          <p className="text-xs text-slate-700 mt-1 font-mono font-medium">OFFICIAL STUDENT ATTENDANCE LOG TRANSCRIPT</p>
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

      {/* Filter toolbar */}
      <div className="p-4 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm flex flex-col sm:flex-row items-center gap-3 no-print">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject code or title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] font-semibold focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
        >
          <option value="ALL">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="ABSENT">Absent</option>
          <option value="EXCUSED">Excused</option>
        </select>
      </div>

      {/* Records Table */}
      <div className="bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] dark:border-[#383838] bg-[#F0F0F0] dark:bg-[#252525] text-[#626262] dark:text-[#A6A6A6] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Session Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-in Time</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#858585]">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F5F5F5] dark:hover:bg-[#252525]/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#252525] dark:text-[#F5F5F5]">
                        {r.session.subject.code}
                      </span>
                      <p className="text-[11px] text-[#858585]">{r.session.subject.name}</p>
                    </td>
                    <td className="py-3 px-4 text-[#626262] dark:text-[#A6A6A6]">
                      {formatDate(r.session.sessionDate)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[#858585]">
                      {r.checkInTime ? formatDateTime(r.checkInTime) : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono uppercase text-[10px] text-[#858585]">
                      <span className="px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#383838]">
                        {r.submissionMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#858585] italic max-w-xs truncate">
                      {r.correctionReason || "—"}
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

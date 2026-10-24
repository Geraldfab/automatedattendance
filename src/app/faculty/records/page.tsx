"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Search,
  Download,
  Printer,
  Edit3,
  BookOpen,
  Layers,
  Filter,
  Info,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CorrectionModal } from "@/components/ui/correction-modal";
import { formatDateTime, formatDate, downloadCSV } from "@/lib/utils";

export default function FacultyRecordsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSubject = searchParams.get("subjectId") || "ALL";
  const initialSection = searchParams.get("sectionId") || "ALL";

  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Teaching assignments for filter dropdowns
  const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [uniqueSubjects, setUniqueSubjects] = useState<any[]>([]);
  const [uniqueSections, setUniqueSections] = useState<any[]>([]);

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state if URL search parameters change
  useEffect(() => {
    const sub = searchParams.get("subjectId");
    const sec = searchParams.get("sectionId");
    if (sub) setSelectedSubject(sub);
    if (sec) setSelectedSection(sec);
  }, [searchParams]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedSubject, selectedSection, selectedStatus]);

  const fetchMetadata = async () => {
    try {
      const res = await fetch("/api/faculty/stats", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        const classes = d.classStats || [];
        setAssignedClasses(classes);

        // Extract unique subjects
        const subMap = new Map();
        const secMap = new Map();
        classes.forEach((c: any) => {
          const [subId, secId] = c.id.split("-");
          if (!subMap.has(subId)) {
            subMap.set(subId, { id: subId, code: c.subjectCode, name: c.subjectName });
          }
          if (!secMap.has(secId)) {
            secMap.set(secId, { id: secId, name: c.sectionName });
          }
        });

        // Also add from schedules if available
        (d.schedules || []).forEach((s: any) => {
          if (!subMap.has(s.subjectId)) {
            subMap.set(s.subjectId, { id: s.subjectId, code: s.subject.code, name: s.subject.name });
          }
          if (!secMap.has(s.sectionId)) {
            secMap.set(s.sectionId, { id: s.sectionId, name: s.section.name });
          }
        });

        setUniqueSubjects(Array.from(subMap.values()));
        setUniqueSections(Array.from(secMap.values()));
      }
    } catch (e) {
      console.error("Failed to fetch faculty metadata", e);
    }
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedSubject && selectedSubject !== "ALL") q.set("subjectId", selectedSubject);
      if (selectedSection && selectedSection !== "ALL") q.set("sectionId", selectedSection);
      if (selectedStatus && selectedStatus !== "ALL") q.set("status", selectedStatus);

      const res = await fetch(`/api/attendance/records?${q.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setRecords(d.records || []);
      }
    } catch (e) {
      console.error("Failed to fetch records", e);
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
      r.session.subject.code.toLowerCase().includes(s) ||
      r.session.section.name.toLowerCase().includes(s)
    );
  });

  const handleExportCSV = () => {
    const rows = filtered.map((r) => ({
      StudentID: r.student.studentIdNumber,
      StudentName: r.student.user.name,
      Subject: r.session.subject.code,
      SubjectName: r.session.subject.name,
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

  // Find readable label for active filter
  const activeSubjectObj = uniqueSubjects.find((s) => s.id === selectedSubject);
  const activeSectionObj = uniqueSections.find((s) => s.id === selectedSection);

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

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#858585] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] font-semibold focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
            >
              <option value="ALL">All Subjects</option>
              {uniqueSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] font-semibold focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
            >
              <option value="ALL">All Sections</option>
              {uniqueSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] font-semibold focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pill Indicators */}
        {(selectedSubject !== "ALL" || selectedSection !== "ALL" || selectedStatus !== "ALL") && (
          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#858585] flex-wrap">
            <span className="font-semibold text-[#252525] dark:text-[#F5F5F5]">Active Filters:</span>
            {activeSubjectObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#352329] text-[#E6B5C2] border border-[#762D3D]/40 font-mono">
                {activeSubjectObj.code}
              </span>
            )}
            {activeSectionObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#252525] text-[#F5F5F5] border border-[#454545]">
                {activeSectionObj.name}
              </span>
            )}
            {selectedStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#252525] text-[#F5F5F5] border border-[#454545]">
                Status: {selectedStatus}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedSubject("ALL");
                setSelectedSection("ALL");
                setSelectedStatus("ALL");
              }}
              className="text-[#762D3D] dark:text-[#E6B5C2] hover:underline font-semibold ml-2"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-[#FAFAFA] dark:bg-[#202020] rounded-3xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#858585] animate-pulse">
            Loading class attendance records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ClipboardCheck className="w-10 h-10 text-[#858585] mx-auto opacity-40" />
            <h4 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5]">
              No Attendance Records Found
            </h4>
            <p className="text-xs text-[#626262] dark:text-[#A6A6A6] max-w-md mx-auto leading-relaxed">
              {selectedSubject !== "ALL" || selectedSection !== "ALL"
                ? `No attendance submissions recorded yet for ${activeSubjectObj?.code || "selected subject"} (${activeSectionObj?.name || "selected section"}). Records will appear here once attendance sessions are launched and submitted.`
                : "No student records match the active search and filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E0E0E0] dark:border-[#383838] bg-[#F0F0F0] dark:bg-[#252525] text-[#626262] dark:text-[#A6A6A6] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Subject & Section</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Check-in Time</th>
                  <th className="py-3.5 px-4">Submission Method</th>
                  <th className="py-3.5 px-4 text-right no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#EAEAEA]/50 dark:hover:bg-[#252525]/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#252525] dark:text-[#F5F5F5]">
                        {r.student.user.name}
                      </p>
                      <p className="font-mono text-[11px] text-[#858585]">
                        {r.student.studentIdNumber}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#252525] dark:text-[#F5F5F5]">
                        {r.session.subject.code}
                      </p>
                      <p className="text-[11px] text-[#858585]">
                        {r.session.section.name} &bull; {formatDate(r.session.sessionDate)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[#626262] dark:text-[#A6A6A6]">
                      {r.checkInTime ? formatDateTime(r.checkInTime) : "—"}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[10px] text-[#858585]">
                      {r.submissionMethod}
                    </td>
                    <td className="py-3 px-4 text-right no-print">
                      <button
                        onClick={() => openCorrection(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E0E0E0] dark:border-[#454545] text-[11px] font-semibold text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-[#762D3D] dark:text-[#E6B5C2]" />
                        <span>Correct</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

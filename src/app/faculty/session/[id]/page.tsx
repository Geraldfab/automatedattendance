"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  StopCircle,
  RefreshCw,
  Plus,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { QRDisplay } from "@/components/qr/qr-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { CorrectionModal } from "@/components/ui/correction-modal";
import { formatTime, formatDateTime } from "@/lib/utils";

export default function LiveSessionMonitorPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const sessionId = params.id;

  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Manual Check-in / Correction Modal State
  const [modalTarget, setModalTarget] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSession();
    // Auto-poll attendee updates every 5 seconds
    const interval = setInterval(fetchSession, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/attendance/session/${sessionId}`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setSessionData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSession = async () => {
    const confirmClose = window.confirm(
      "Are you sure you want to close this attendance session? All unrecorded enrolled students will automatically be marked as ABSENT."
    );
    if (!confirmClose) return;

    setIsClosing(true);
    try {
      const res = await fetch(`/api/attendance/session/${sessionId}/close`, {
        method: "POST",
      });
      if (res.ok) {
        fetchSession();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsClosing(false);
    }
  };

  const openManualCheckIn = (enrollment: any) => {
    // Check if student already has a record
    const existing = sessionData.session.records.find(
      (r: any) => r.studentId === enrollment.student.id
    );

    setModalTarget({
      id: existing?.id,
      sessionId,
      studentId: enrollment.student.id,
      studentName: enrollment.student.user.name,
      studentIdNumber: enrollment.student.studentIdNumber,
      currentStatus: existing ? existing.status : "UNRECORDED",
      subjectCode: sessionData.session.subject.code,
    });
    setIsModalOpen(true);
  };

  if (isLoading || !sessionData) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
        Connecting to live attendance session stream...
      </div>
    );
  }

  const { session, stats, enrollments } = sessionData;
  const isClosed = session.status !== "ACTIVE";

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/faculty"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[#762D3D] dark:text-[#E6B5C2] bg-[#F8EAEF] dark:bg-[#352329] px-2.5 py-0.5 rounded-lg border border-[#762D3D]/30">
                {session.subject.code}
              </span>
              <span className="font-bold text-[#252525] dark:text-[#F5F5F5]">
                {session.section.name}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  !isClosed
                    ? "bg-[#EBF5EE] text-[#2F855A] dark:bg-[#1C3E2B] dark:text-[#72C899]"
                    : "bg-[#F0F0F0] text-[#626262] dark:bg-[#252525] dark:text-[#A6A6A6]"
                }`}
              >
                {session.status}
              </span>
            </div>
            <p className="text-xs text-[#858585] mt-0.5">{session.subject.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <button
              onClick={handleCloseSession}
              disabled={isClosing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C05656] hover:bg-[#8A394B] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <StopCircle className="w-4 h-4" />
              <span>{isClosing ? "Closing Session..." : "Close & Finalize Absences"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: QR Code Projection Column & Live Roster Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dynamic Rotating QR Display (Projector Screen View) */}
        <div className="lg:col-span-5 space-y-4">
          <QRDisplay
            sessionId={session.id}
            initialQrDataUrl={sessionData.qrDataUrl}
            initialToken={sessionData.qrToken}
            sessionEndTime={session.endTime}
            rotationIntervalSeconds={20}
          />

          {/* Live Summary Counter Card */}
          <div className="p-5 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-[#252525] dark:text-[#F5F5F5] uppercase tracking-wider text-[11px]">
              Classroom Attendance Count
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#EBF5EE] dark:bg-[#1C3E2B]/50 border border-[#2F855A]/30">
                <p className="text-[10px] uppercase font-bold text-[#2F855A] dark:text-[#72C899]">Present</p>
                <p className="text-xl font-bold text-[#2F855A] dark:text-[#72C899] mt-0.5">{stats.present}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FEF7E6] dark:bg-[#483212]/50 border border-[#B7791F]/30">
                <p className="text-[10px] uppercase font-bold text-[#B7791F] dark:text-[#E7B567]">Late</p>
                <p className="text-xl font-bold text-[#B7791F] dark:text-[#E7B567] mt-0.5">{stats.late}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDF0F0] dark:bg-[#4A2020]/50 border border-[#C05656]/30">
                <p className="text-[10px] uppercase font-bold text-[#C05656] dark:text-[#F19393]">Absent</p>
                <p className="text-xl font-bold text-[#C05656] dark:text-[#F19393] mt-0.5">{stats.absent}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F0F0F0] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#454545]">
                <p className="text-[10px] uppercase font-bold text-[#626262] dark:text-[#A6A6A6]">Unrecorded</p>
                <p className="text-xl font-bold text-[#252525] dark:text-[#F5F5F5] mt-0.5">{stats.remainingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Enrolled Student Roster Table */}
        <div className="lg:col-span-7 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E0E0E0] dark:border-[#383838] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#252525] dark:text-[#F5F5F5] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#762D3D] dark:text-[#E6B5C2]" />
                <span>Class Roster ({enrollments.length} Enrolled)</span>
              </h3>
              <p className="text-[11px] text-[#858585] mt-0.5">
                Real-time updates as students scan QR codes in class
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-[#858585]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#762D3D]" /> Live Sync
            </span>
          </div>

          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#F0F0F0] dark:bg-[#252525] backdrop-blur-md z-10">
                <tr className="border-b border-[#E0E0E0] dark:border-[#383838] text-[#626262] dark:text-[#A6A6A6] font-semibold uppercase">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4 text-right">Assistance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
                {enrollments.map((enr: any) => {
                  const record = session.records.find(
                    (r: any) => r.studentId === enr.student.id
                  );
                  return (
                    <tr
                      key={enr.id}
                      className="hover:bg-[#F5F5F5] dark:hover:bg-[#252525]/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#252525] dark:text-[#F5F5F5]">
                          {enr.student.user.name}
                        </p>
                        <p className="text-[10px] font-mono text-[#858585]">
                          {enr.student.studentIdNumber}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {record ? (
                          <StatusBadge status={record.status} size="sm" />
                        ) : (
                          <span className="text-[11px] text-[#858585] italic">
                            Waiting for scan...
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#858585]">
                        {record?.checkInTime ? formatTime(record.checkInTime) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openManualCheckIn(enr)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] rounded-lg border border-[#E0E0E0] dark:border-[#454545] transition-colors"
                          title="Manual Attendance Correction"
                        >
                          {record ? "Edit" : "Manual Check-in"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Correction Dialog */}
      <CorrectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={modalTarget}
        onSuccess={fetchSession}
      />
    </div>
  );
}

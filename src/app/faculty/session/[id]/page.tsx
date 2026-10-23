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
      const res = await fetch(`/api/attendance/session/${sessionId}`);
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
              <span className="font-mono font-bold text-sm text-maroon-700 dark:text-maroon-400 bg-maroon-50 dark:bg-maroon-950 px-2.5 py-0.5 rounded-lg">
                {session.subject.code}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {session.section.name}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  !isClosed
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {session.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{session.subject.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <button
              onClick={handleCloseSession}
              disabled={isClosing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
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
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Classroom Attendance Count
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Present</p>
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">{stats.present}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Late</p>
                <p className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-0.5">{stats.late}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40">
                <p className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">Absent</p>
                <p className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-0.5">{stats.absent}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Unrecorded</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-0.5">{stats.remainingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Enrolled Student Roster Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-maroon-700 dark:text-maroon-400" />
                <span>Class Roster ({enrollments.length} Enrolled)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time updates as students scan QR codes in class
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Live Sync
            </span>
          </div>

          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-md z-10">
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4 text-right">Assistance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {enrollments.map((enr: any) => {
                  const record = session.records.find(
                    (r: any) => r.studentId === enr.student.id
                  );
                  return (
                    <tr
                      key={enr.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {enr.student.user.name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {enr.student.studentIdNumber}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {record ? (
                          <StatusBadge status={record.status} size="sm" />
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Waiting for scan...
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {record?.checkInTime ? formatTime(record.checkInTime) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openManualCheckIn(enr)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
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

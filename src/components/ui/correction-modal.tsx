"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, ShieldAlert } from "lucide-react";
import { StatusBadge } from "./status-badge";

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: {
    id?: string;
    studentName: string;
    studentIdNumber: string;
    currentStatus: string;
    subjectCode?: string;
    sessionId?: string;
    studentId?: string;
  } | null;
  onSuccess: () => void;
}

export function CorrectionModal({
  isOpen,
  onClose,
  record,
  onSuccess,
}: CorrectionModalProps) {
  const [newStatus, setNewStatus] = useState<"PRESENT" | "LATE" | "ABSENT" | "EXCUSED">("PRESENT");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reason.trim().length < 5) {
      setError("Please provide a descriptive reason (at least 5 characters) for audit trail compliance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/attendance/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: record.id,
          sessionId: record.sessionId,
          studentId: record.studentId,
          status: newStatus,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update attendance");
      }

      setReason("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Manual Attendance Correction
                </h3>
                <p className="text-xs text-slate-500">All modifications are permanently logged in audit logs</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Student:</span>
                <span className="font-medium text-slate-900 dark:text-white">{record.studentName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Student ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{record.studentIdNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Current Status:</span>
                <StatusBadge status={record.currentStatus} size="sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                New Attendance Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["PRESENT", "LATE", "ABSENT", "EXCUSED"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewStatus(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-colors ${
                      newStatus === s
                        ? "border-maroon-700 bg-maroon-50 text-maroon-800 dark:bg-maroon-950/40 dark:border-maroon-600 dark:text-maroon-200 font-semibold"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{s}</span>
                    {newStatus === s && <Check className="w-3.5 h-3.5 text-maroon-700 dark:text-maroon-300" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                Reason for Correction <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Student presented valid medical certificate; Student had verified mobile camera malfunction during scan."
                rows={3}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-700"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-maroon-700 hover:bg-maroon-800 dark:bg-maroon-800 dark:hover:bg-maroon-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Saving Audit Entry..." : "Save Correction"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

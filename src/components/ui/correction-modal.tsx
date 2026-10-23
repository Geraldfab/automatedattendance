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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#454545] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E0E0E0] dark:border-[#383838] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FEF7E6] dark:bg-[#483212]/60 text-[#B7791F] dark:text-[#E7B567] rounded-xl border border-[#B7791F]/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#252525] dark:text-[#F5F5F5]">
                  Manual Attendance Correction
                </h3>
                <p className="text-xs text-[#626262] dark:text-[#A6A6A6]">All modifications are permanently logged in audit logs</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#858585] hover:text-[#252525] dark:hover:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-[#FDF0F0] dark:bg-[#4A2020]/60 border border-[#C05656]/50 text-[#C05656] dark:text-[#F19393] rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-[#F0F0F0] dark:bg-[#252525] p-3.5 rounded-xl border border-[#E0E0E0] dark:border-[#383838] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#626262] dark:text-[#A6A6A6]">Student:</span>
                <span className="font-medium text-[#252525] dark:text-[#F5F5F5]">{record.studentName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#626262] dark:text-[#A6A6A6]">Student ID:</span>
                <span className="font-mono text-[#252525] dark:text-[#F5F5F5]">{record.studentIdNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#626262] dark:text-[#A6A6A6]">Current Status:</span>
                <StatusBadge status={record.currentStatus} size="sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#626262] dark:text-[#A6A6A6] mb-1.5">
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
                        ? "border-[#762D3D] bg-[#F8EAEF] text-[#762D3D] dark:bg-[#352329] dark:border-[#762D3D] dark:text-[#F5F5F5] font-semibold"
                        : "border-[#E0E0E0] dark:border-[#454545] hover:bg-[#F0F0F0] dark:hover:bg-[#252525] text-[#252525] dark:text-[#A6A6A6]"
                    }`}
                  >
                    <span>{s}</span>
                    {newStatus === s && <Check className="w-3.5 h-3.5 text-[#762D3D] dark:text-[#E6B5C2]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#626262] dark:text-[#A6A6A6] mb-1.5">
                Reason for Correction <span className="text-[#C05656]">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Student presented valid medical certificate; Student had verified mobile camera malfunction during scan."
                rows={3}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#626262] dark:text-[#A6A6A6] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-[#F5F5F5] bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] rounded-xl disabled:opacity-50 transition-colors shadow-sm"
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

"use client";

import React from "react";
import { QRScanner } from "@/components/qr/qr-scanner";
import { ShieldCheck, Info } from "lucide-react";

export default function StudentScanPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Class Attendance Scanner
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Scan the dynamic rotating QR code projected in your classroom to confirm your attendance.
        </p>
      </div>

      <QRScanner />

      {/* Security Disclaimer Note (Section 4 & 11) */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Attendance Policy & System Verification Notice</span>
        </div>
        <p className="leading-relaxed">
          QR code tokens dynamically refresh every 20 seconds. Submissions are cryptographically checked against active class schedules, subject enrollments, and server timestamps. Under the Philippine Data Privacy Act of 2012 (RA 10173), attendance records are confidential institutional academic data.
        </p>
      </div>
    </div>
  );
}

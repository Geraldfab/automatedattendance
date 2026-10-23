"use client";

import React from "react";
import Image from "next/image";
import { QRScanner } from "@/components/qr/qr-scanner";
import { ShieldCheck } from "lucide-react";

export default function StudentScanPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#171717] border border-[#454545] shadow-md mb-3">
          <Image
            src="/images/tcc-logo.png"
            alt="Torres Capitol College Crest"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252525] dark:text-[#F5F5F5]">
          Class Attendance Scanner
        </h1>
        <p className="text-xs text-[#626262] dark:text-[#A6A6A6] mt-1 max-w-sm mx-auto">
          Scan the dynamic rotating QR code projected in your classroom to confirm your attendance.
        </p>
      </div>

      <QRScanner />

      {/* Security Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-[#202020] border border-[#E0E0E0] dark:border-[#383838] text-[11px] text-[#626262] dark:text-[#A6A6A6] space-y-1.5 shadow-sm">
        <div className="flex items-center gap-1.5 font-semibold text-[#252525] dark:text-[#F5F5F5]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F855A]" />
          <span>Attendance Policy & System Verification Notice</span>
        </div>
        <p className="leading-relaxed">
          QR code tokens dynamically refresh every 20 seconds. Submissions are cryptographically checked against active class schedules, subject enrollments, and server timestamps. Under the Philippine Data Privacy Act of 2012 (RA 10173), attendance records are confidential institutional academic data.
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Copy, Check, Clock, ShieldCheck, AlertCircle } from "lucide-react";

interface QRDisplayProps {
  sessionId: string;
  initialQrDataUrl: string;
  initialToken: string;
  sessionEndTime: string;
  rotationIntervalSeconds?: number;
}

export function QRDisplay({
  sessionId,
  initialQrDataUrl,
  initialToken,
  sessionEndTime,
  rotationIntervalSeconds = 20,
}: QRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState(initialQrDataUrl);
  const [currentToken, setCurrentToken] = useState(initialToken);
  const [countdown, setCountdown] = useState(rotationIntervalSeconds);
  const [isRotating, setIsRotating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Check overall session expiry
  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date().getTime();
      const end = new Date(sessionEndTime).getTime();
      if (now >= end) setIsExpired(true);
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [sessionEndTime]);

  // Countdown timer for rolling token rotation
  useEffect(() => {
    if (isExpired) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerRotate();
          return rotationIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, isExpired, rotationIntervalSeconds]);

  const triggerRotate = async () => {
    if (isRotating || isExpired) return;
    setIsRotating(true);
    try {
      const res = await fetch(`/api/attendance/session/${sessionId}/rotate-qr`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setQrDataUrl(data.qrDataUrl);
        setCurrentToken(data.qrToken);
        setCountdown(rotationIntervalSeconds);
      }
    } catch (e) {
      console.error("Failed to rotate token:", e);
    } finally {
      setIsRotating(false);
    }
  };

  const handleCopy = () => {
    // Format formatted payload for manual testing or student fallback
    const payload = JSON.stringify({
      prefix: "TCCI_ATTEND",
      sid: sessionId,
      t: currentToken,
      ts: Date.now(),
    });
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm mx-auto text-center relative overflow-hidden">
      {/* Expiry Banner */}
      {isExpired && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-white">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-2" />
          <h4 className="font-bold text-lg">Session Closed / Expired</h4>
          <p className="text-xs text-slate-300 mt-1">This session is no longer accepting attendance scans.</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
          Live Attendance QR
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Scan using the student mobile dashboard. QR code rotates dynamically for security.
      </p>

      {/* QR Code Frame with animated border */}
      <div className="relative p-3.5 rounded-2xl border-2 border-dashed border-[#5a2531] dark:border-[#762D3D]/60 bg-[#FAFAFA] dark:bg-[#171717] shadow-inner">
        <motion.img
          key={currentToken}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={qrDataUrl}
          alt="Class Attendance QR Code"
          className="w-64 h-64 rounded-xl object-contain shadow-sm bg-white p-2"
        />

        {/* Security badge on QR corner */}
        <div className="absolute bottom-5 right-5 bg-[#762D3D] text-[#F5F5F5] px-1.5 py-0.5 rounded-md shadow-md text-[10px] font-bold tracking-wider">
          TCCI
        </div>
      </div>

      {/* Rotation Countdown Bar */}
      <div className="w-full mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#626262] dark:text-[#A6A6A6]">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#762D3D] dark:text-[#E6B5C2]" /> Rotating in:
          </span>
          <span className="font-bold font-mono text-[#252525] dark:text-[#F5F5F5]">
            {countdown}s
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#EAEAEA] dark:bg-[#252525] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#762D3D]"
            style={{ width: `${(countdown / rotationIntervalSeconds) * 100}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-center gap-2">
        <button
          onClick={triggerRotate}
          disabled={isRotating || isExpired}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} />
          <span>Refresh Token</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Copy QR payload for device fallback"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Payload"}</span>
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>Rotating Token prevents screenshot impersonation</span>
      </div>
    </div>
  );
}

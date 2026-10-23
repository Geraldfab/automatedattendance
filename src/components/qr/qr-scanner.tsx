"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Keyboard,
  Info,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export function QRScanner() {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    status?: string;
    message?: string;
    subject?: string;
    subjectName?: string;
    section?: string;
    checkInTime?: string;
    error?: string;
  } | null>(null);

  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera stream
  useEffect(() => {
    if (activeTab === "camera" && !scanResult) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, scanResult]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported on this browser or context. Please use manual code entry.");
        setActiveTab("manual");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access denied or unavailable:", err);
      setCameraError("Camera access was blocked or is unavailable. You can enter the session code directly below.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const submitAttendancePayload = async (payloadString: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/attendance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: payloadString }),
      });

      const data = await res.json();
      if (!res.ok) {
        setScanResult({
          success: false,
          error: data.error || "Failed to process attendance submission.",
        });
      } else {
        setScanResult({
          success: true,
          status: data.status,
          message: data.message,
          subject: data.subject,
          subjectName: data.subjectName,
          section: data.section,
          checkInTime: data.checkInTime,
        });
      }
    } catch (e: any) {
      setScanResult({
        success: false,
        error: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    submitAttendancePayload(manualCode.trim());
  };

  const handleReset = () => {
    setScanResult(null);
    setManualCode("");
    if (activeTab === "camera") {
      startCamera();
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Tab Switcher: Camera vs Manual Code */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => {
            setActiveTab("camera");
            setScanResult(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "camera"
              ? "bg-white dark:bg-slate-900 text-maroon-700 dark:text-maroon-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Camera Scanner</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("manual");
            setScanResult(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "manual"
              ? "bg-white dark:bg-slate-900 text-maroon-700 dark:text-maroon-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Manual Code Entry</span>
        </button>
      </div>

      {/* Main View Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 relative">
        <AnimatePresence mode="wait">
          {/* Result Card */}
          {scanResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-4 text-center space-y-4"
            >
              {scanResult.success ? (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Attendance Confirmed!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {scanResult.message}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-left text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Subject:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {scanResult.subject} — {scanResult.subjectName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Section:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {scanResult.section}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status:</span>
                      <StatusBadge status={scanResult.status || "PRESENT"} size="sm" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Check-in Time:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {scanResult.checkInTime ? new Date(scanResult.checkInTime).toLocaleTimeString("en-PH") : "Recorded"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Scan Another Class
                    </button>
                    <Link
                      href="/student"
                      className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <XCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Submission Not Recorded
                    </h3>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 px-2 leading-relaxed font-medium">
                      {scanResult.error}
                    </p>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Try Again
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : activeTab === "camera" ? (
            /* Camera Viewport */
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {cameraError ? (
                <div className="py-8 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 px-4">
                    {cameraError}
                  </p>
                  <button
                    onClick={() => setActiveTab("manual")}
                    className="px-4 py-2 bg-maroon-700 text-white rounded-xl text-xs font-semibold hover:bg-maroon-800 transition-colors"
                  >
                    Switch to Manual Code Entry
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Viewfinder Overlay */}
                  <div className="absolute inset-0 border-2 border-white/20 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-dashed border-maroon-500 rounded-2xl relative">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />

                      {/* Moving laser scan line */}
                      <motion.div
                        className="w-full h-0.5 bg-maroon-500 shadow-md shadow-maroon-500"
                        animate={{ y: [0, 220, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>

                  <div className="absolute bottom-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[11px] font-medium text-white/90">
                    Align QR code within the frame
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-600 dark:text-slate-400 text-xs">
                <Info className="w-4 h-4 shrink-0 text-maroon-700 dark:text-maroon-400 mt-0.5" />
                <span>
                  Point camera at the live attendance QR displayed by your instructor. Server verifies enrollment and timestamp automatically.
                </span>
              </div>
            </motion.div>
          ) : (
            /* Manual Input Form */
            <motion.div
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-center pb-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Manual Attendance Token Submission
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the live session token or payload provided on the classroom display.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1.5">
                    Session Token / Payload
                  </label>
                  <textarea
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder='Paste payload (e.g. {"prefix":"TCCI_ATTEND",...}) or "sessionId:token"'
                    rows={4}
                    required
                    className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !manualCode.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-semibold text-xs disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting ? "Verifying Attendance..." : "Submit Attendance Record"}
                </button>
              </form>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                Notice: All check-ins are logged with server timestamps. Submissions past the cutoff will be marked as Late or Absent.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

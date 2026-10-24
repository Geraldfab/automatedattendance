"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsQR from "jsqr";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Keyboard,
  Info,
  FlipHorizontal,
  Upload,
  Loader2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

// Audio feedback helper
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Quick two-tone upbeat chirp: 587Hz (D5) -> 880Hz (A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // AudioContext blocked or unavailable
  }
}

export function QRScanner() {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if multiple cameras are available
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Frame scanner loop
  const scanFrame = useCallback(() => {
    if (!isScanningRef.current || !videoRef.current) return;

    const video = videoRef.current;

    // Check if video is loaded and has dimensions
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;

      // Limit scanning resolution to max 640px for ultra-fast, smooth decoding
      const maxDim = 640;
      let width = video.videoWidth;
      let height = video.videoHeight;
      if (width > maxDim || height > maxDim) {
        const scale = Math.min(maxDim / width, maxDim / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        // Run jsQR decoder
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data && code.data.trim().length > 0) {
          // QR code successfully decoded from live camera feed!
          isScanningRef.current = false;
          setDetectedCode(code.data);
          playChime();
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            try {
              navigator.vibrate(100);
            } catch {}
          }
          submitAttendancePayload(code.data.trim());
          return;
        }
      }
    }

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setDetectedCode(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported on this device/browser. Please use manual code entry.");
        setActiveTab("manual");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();

        isScanningRef.current = true;
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      console.warn("Camera access error:", err);
      setCameraError(
        "Camera access was denied, blocked by permissions, or is in use by another app. You can switch to manual entry or upload a photo."
      );
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Manage camera lifecycle based on activeTab & scanResult
  useEffect(() => {
    if (activeTab === "camera" && !scanResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, scanResult, startCamera, stopCamera]);

  // Submit QR code payload to server
  const submitAttendancePayload = async (payloadString: string) => {
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
        stopCamera();
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
    } catch {
      setScanResult({
        success: false,
        error: "Network error occurred while submitting attendance. Check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
      setDetectedCode(null);
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
    setDetectedCode(null);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Image upload decoding fallback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          if (code && code.data) {
            playChime();
            submitAttendancePayload(code.data.trim());
          } else {
            setScanResult({
              success: false,
              error: "No readable QR code found in the selected image. Please ensure the QR code is clear and in focus.",
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Hidden file input for QR image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Tab Switcher: Live Camera vs Manual Code */}
      <div className="flex bg-[#EAEAEA] dark:bg-[#252525] p-1 rounded-2xl mb-4 border border-[#E0E0E0] dark:border-[#383838]">
        <button
          onClick={() => {
            setActiveTab("camera");
            setScanResult(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "camera"
              ? "bg-[#FAFAFA] dark:bg-[#202020] text-[#762D3D] dark:text-[#E6B5C2] shadow-sm font-bold"
              : "text-[#626262] dark:text-[#A6A6A6] hover:text-[#252525] dark:hover:text-[#F5F5F5]"
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
              ? "bg-[#FAFAFA] dark:bg-[#202020] text-[#762D3D] dark:text-[#E6B5C2] shadow-sm font-bold"
              : "text-[#626262] dark:text-[#A6A6A6] hover:text-[#252525] dark:hover:text-[#F5F5F5]"
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Manual Code Entry</span>
        </button>
      </div>

      {/* Main View Area */}
      <div className="bg-[#FAFAFA] dark:bg-[#202020] rounded-3xl border border-[#E0E0E0] dark:border-[#383838] shadow-xl overflow-hidden p-6 relative">
        <AnimatePresence mode="wait">
          {/* Result View (Success or Failure) */}
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
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-[#2F855A] dark:bg-[#1C3E2B] dark:text-[#72C899] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#252525] dark:text-[#F5F5F5]">
                      Attendance Confirmed!
                    </h3>
                    <p className="text-xs text-[#626262] dark:text-[#A6A6A6] mt-1">
                      {scanResult.message}
                    </p>
                  </div>

                  <div className="bg-[#F0F0F0] dark:bg-[#252525] rounded-2xl p-4 border border-[#E0E0E0] dark:border-[#383838] space-y-2 text-left text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#626262] dark:text-[#A6A6A6]">Subject:</span>
                      <span className="font-bold text-[#252525] dark:text-[#F5F5F5]">
                        {scanResult.subject} — {scanResult.subjectName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#626262] dark:text-[#A6A6A6]">Section:</span>
                      <span className="font-semibold text-[#252525] dark:text-[#F5F5F5]">
                        {scanResult.section}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#626262] dark:text-[#A6A6A6]">Status:</span>
                      <StatusBadge status={scanResult.status || "PRESENT"} size="sm" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#626262] dark:text-[#A6A6A6]">Check-in Time:</span>
                      <span className="font-mono text-[#252525] dark:text-[#F5F5F5]">
                        {scanResult.checkInTime ? new Date(scanResult.checkInTime).toLocaleTimeString("en-PH") : "Recorded"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-[#E0E0E0] dark:border-[#454545] text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Scan Another Class
                    </button>
                    <Link
                      href="/student"
                      className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#762D3D] hover:bg-[#8A394B] text-[#F5F5F5] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#FDF0F0] text-[#C05656] dark:bg-[#4A2020]/60 dark:text-[#F19393] flex items-center justify-center shadow-lg shadow-rose-500/10">
                    <XCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#252525] dark:text-[#F5F5F5]">
                      Submission Not Recorded
                    </h3>
                    <p className="text-xs text-[#C05656] dark:text-[#F19393] mt-2 px-2 leading-relaxed font-medium">
                      {scanResult.error}
                    </p>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#762D3D] hover:bg-[#8A394B] text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Try Scanning Again
                    </button>
                    <button
                      onClick={() => {
                        setScanResult(null);
                        setActiveTab("manual");
                      }}
                      className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-[#E0E0E0] dark:border-[#454545] text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] transition-colors"
                    >
                      Enter Code Manually
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : activeTab === "camera" ? (
            /* Active Camera Viewport */
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {cameraError ? (
                <div className="py-8 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-[#B7791F] mx-auto" />
                  <p className="text-xs text-[#626262] dark:text-[#A6A6A6] px-4 leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#FAFAFA] dark:bg-[#252525] border border-[#E0E0E0] dark:border-[#454545] text-[#252525] dark:text-[#F5F5F5] rounded-xl text-xs font-semibold hover:bg-[#EAEAEA] dark:hover:bg-[#303030] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload QR Code Image</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("manual")}
                      className="px-4 py-2 bg-[#762D3D] text-[#F5F5F5] rounded-xl text-xs font-semibold hover:bg-[#8A394B] transition-colors"
                    >
                      Switch to Manual Code Entry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-[#383838]">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />

                  {/* Viewfinder Target Overlay */}
                  <div className="absolute inset-0 border-2 border-white/20 pointer-events-none flex items-center justify-center">
                    <div className="w-60 h-60 border-2 border-dashed border-[#762D3D] rounded-2xl relative">
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-white rounded-tl-sm" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-white rounded-tr-sm" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-white rounded-bl-sm" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-white rounded-br-sm" />

                      {/* Animated laser line */}
                      {!isSubmitting && (
                        <motion.div
                          className="w-full h-0.5 bg-[#2F855A] shadow-md shadow-[#2F855A]"
                          animate={{ y: [0, 235, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Top Action Bar (Flip Camera & Upload Image) */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload QR Image"
                      className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 border border-white/10 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>

                    {hasMultipleCameras && (
                      <button
                        onClick={toggleCameraFacing}
                        title="Flip Camera"
                        className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-colors"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Bottom Status Pill */}
                  <div className="absolute bottom-3 px-4 py-1.5 bg-black/75 backdrop-blur-md rounded-full text-[11px] font-medium text-white/95 border border-white/10 flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#72C899]" />
                        <span>Verifying QR Code...</span>
                      </>
                    ) : detectedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#72C899]" />
                        <span>QR Code Detected!</span>
                      </>
                    ) : (
                      <span>Point camera directly at classroom QR code</span>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="flex items-start gap-2 p-3 bg-[#F0F0F0] dark:bg-[#252525] rounded-xl text-[#626262] dark:text-[#A6A6A6] text-xs border border-[#E0E0E0] dark:border-[#383838]">
                <Info className="w-4 h-4 shrink-0 text-[#762D3D] dark:text-[#E6B5C2] mt-0.5" />
                <span className="leading-relaxed">
                  Hold your camera steady over the dynamic QR code projected in class. The scanner will automatically detect and verify your attendance.
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
                <h4 className="text-sm font-semibold text-[#252525] dark:text-[#F5F5F5]">
                  Manual Attendance Token Submission
                </h4>
                <p className="text-xs text-[#626262] dark:text-[#A6A6A6] mt-1">
                  Enter the live session token or payload provided on the classroom display.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#626262] dark:text-[#A6A6A6] mb-1.5">
                    Session Token / Payload
                  </label>
                  <textarea
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder='Paste payload (e.g. {"prefix":"TCCI_ATTEND",...}) or "sessionId:token"'
                    rows={4}
                    required
                    className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !manualCode.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-[#F5F5F5] font-semibold text-xs disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Attendance...</span>
                    </>
                  ) : (
                    <span>Submit Attendance Record</span>
                  )}
                </button>
              </form>

              <div className="p-3 bg-[#FEF7E6] dark:bg-[#483212]/40 rounded-xl border border-[#B7791F]/30 text-[11px] text-[#B7791F] dark:text-[#E7B567]">
                Notice: All check-ins are logged with server timestamps. Submissions past the cutoff will be marked as Late or Absent.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

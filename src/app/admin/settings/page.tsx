"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle, Clock, ShieldCheck, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [gracePeriod, setGracePeriod] = useState(15);
  const [lateCutoff, setLateCutoff] = useState(45);
  const [threshold, setThreshold] = useState(80.0);
  const [qrRotation, setQrRotation] = useState(20);
  const [timeZone, setTimeZone] = useState("Asia/Manila");

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const d = await res.json();
      if (d.settings) {
        setSettings(d.settings);
        setGracePeriod(d.settings.defaultGracePeriodMinutes);
        setLateCutoff(d.settings.defaultLateCutoffMinutes);
        setThreshold(d.settings.minimumAttendanceThreshold);
        setQrRotation(d.settings.qrRotationIntervalSeconds);
        setTimeZone(d.settings.timeZone);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: "Torres Capitol College Inc.",
          departmentName: "Bachelor of Science in Information Technology",
          defaultGracePeriodMinutes: Number(gracePeriod),
          defaultLateCutoffMinutes: Number(lateCutoff),
          minimumAttendanceThreshold: Number(threshold),
          qrRotationIntervalSeconds: Number(qrRotation),
          timeZone,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Attendance Policy & System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure rule calculations, grace periods, rotation frequencies, and institutional thresholds
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Policy and system configuration updated and recorded in audit trail.</span>
          </div>
        )}

        {/* Attendance Window Rules */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-maroon-700 dark:text-maroon-400" />
            <span>Attendance Processing Rules Engine</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                On-Time Grace Period (Minutes)
              </label>
              <input
                type="number"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                min={1}
                max={60}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Check-ins within this period from class start are marked <strong>PRESENT</strong>.
              </p>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                Late Cut-off Window (Minutes)
              </label>
              <input
                type="number"
                value={lateCutoff}
                onChange={(e) => setLateCutoff(Number(e.target.value))}
                min={5}
                max={180}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Check-ins after grace period but before this cut-off are marked <strong>LATE</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Anti-Impersonation Rules */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Impersonation & Security Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                Dynamic QR Token Rotation (Seconds)
              </label>
              <input
                type="number"
                value={qrRotation}
                onChange={(e) => setQrRotation(Number(e.target.value))}
                min={10}
                max={120}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                QR tokens automatically rotate on classroom screens to prevent screenshot sharing.
              </p>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                Minimum Attendance Rate Threshold (%)
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                min={50}
                max={100}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                College policy threshold below which students are flagged as At-Risk (Standard: 80%).
              </p>
            </div>
          </div>
        </div>

        {/* Time Zone */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Time Zone & Philippine Localization</span>
          </h3>

          <div className="text-xs">
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Institutional Time Zone
            </label>
            <input
              type="text"
              value={timeZone}
              disabled
              className="w-full sm:w-80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Synchronized to Philippine Standard Time (PST / Asia/Manila, UTC+8).
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold shadow-md shadow-maroon-900/10 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving Settings..." : "Save System Settings"}</span>
        </button>
      </form>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, PlayCircle, Clock, ShieldCheck, AlertCircle, Calendar, BookOpen } from "lucide-react";

export default function CreateSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get("subjectId") || "");
  const [selectedSectionId, setSelectedSectionId] = useState(searchParams.get("sectionId") || "");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [presentCutoff, setPresentCutoff] = useState(15);
  const [lateCutoff, setLateCutoff] = useState(45);
  const [notes, setNotes] = useState("Regular Lecture & Laboratory Session");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    try {
      const [resSub, resSec, resStats] = await Promise.all([
        fetch("/api/admin/subjects", { cache: "no-store" }),
        fetch("/api/admin/sections", { cache: "no-store" }),
        fetch("/api/faculty/stats", { cache: "no-store" }),
      ]);

      const subIdFromUrl = searchParams.get("subjectId");
      const secIdFromUrl = searchParams.get("sectionId");

      let loadedSchedules: any[] = [];
      if (resStats.ok) {
        const d = await resStats.json();
        loadedSchedules = d.schedules || [];
        setSchedules(loadedSchedules);
      }

      if (resSub.ok) {
        const d = await resSub.json();
        setSubjects(d.subjects || []);
      }

      if (resSec.ok) {
        const d = await resSec.json();
        setSections(d.sections || []);
      }

      // If URL had params, match to schedule
      if (subIdFromUrl && secIdFromUrl) {
        setSelectedSubjectId(subIdFromUrl);
        setSelectedSectionId(secIdFromUrl);
        const match = loadedSchedules.find(
          (s) => s.subjectId === subIdFromUrl && s.sectionId === secIdFromUrl
        );
        if (match) setSelectedScheduleId(match.id);
      } else if (loadedSchedules.length > 0) {
        // Pre-select first scheduled class
        const first = loadedSchedules[0];
        setSelectedScheduleId(first.id);
        setSelectedSubjectId(first.subjectId);
        setSelectedSectionId(first.sectionId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSchedule = (schedId: string) => {
    setSelectedScheduleId(schedId);
    if (!schedId) return;
    const sched = schedules.find((s) => s.id === schedId);
    if (sched) {
      setSelectedSubjectId(sched.subjectId);
      setSelectedSectionId(sched.sectionId);
    }
  };

  const handleSubjectChange = (subId: string) => {
    setSelectedSubjectId(subId);
    // Find matching schedule for this subject if available
    const match = schedules.find((s) => s.subjectId === subId);
    if (match) {
      setSelectedSectionId(match.sectionId);
      setSelectedScheduleId(match.id);
    } else {
      setSelectedScheduleId("");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/attendance/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: selectedScheduleId || null,
          subjectId: selectedSubjectId,
          sectionId: selectedSectionId,
          durationMinutes: Number(durationMinutes),
          presentCutoffMinutes: Number(presentCutoff),
          lateCutoffMinutes: Number(lateCutoff),
          notes,
        }),
      });

      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create attendance session");

      // Redirect immediately to live QR display
      router.push(`/faculty/session/${d.session.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#252525] dark:text-[#F5F5F5]">
          Launch Live Attendance Session
        </h1>
        <p className="text-xs text-[#626262] dark:text-[#A6A6A6] mt-1">
          Generate an encrypted dynamic QR code for your scheduled class session
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="p-6 bg-[#FAFAFA] dark:bg-[#202020] rounded-2xl border border-[#E0E0E0] dark:border-[#383838] shadow-sm space-y-5 text-xs"
      >
        {error && (
          <div className="p-3.5 bg-[#FDF0F0] dark:bg-[#4A2020]/60 border border-[#C05656]/50 text-[#C05656] dark:text-[#F19393] rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Select from Assigned Teaching Schedule */}
        {schedules.length > 0 && (
          <div className="p-4 bg-[#F0F0F0] dark:bg-[#252525] rounded-xl border border-[#E0E0E0] dark:border-[#383838] space-y-2.5">
            <label className="block font-semibold uppercase text-[#626262] dark:text-[#A6A6A6] text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#762D3D] dark:text-[#E6B5C2]" />
              <span>Select from Assigned Teaching Schedule</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {schedules.map((s) => {
                const isSelected =
                  selectedSubjectId === s.subjectId && selectedSectionId === s.sectionId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSchedule(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#352329] border-[#762D3D] text-[#F5F5F5] ring-2 ring-[#762D3D]"
                        : "bg-[#FAFAFA] dark:bg-[#202020] border-[#E0E0E0] dark:border-[#454545] text-[#252525] dark:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#2e2e2e]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs">{s.subject.code}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#252525] text-[#F5F5F5] border border-[#454545]">
                        {s.section.name}
                      </span>
                    </div>
                    <p className="text-[11px] truncate mt-1 opacity-90">{s.subject.name}</p>
                    <div className="mt-2 text-[10px] opacity-75 font-mono">
                      {s.dayOfWeek} &bull; {s.startTime}–{s.endTime}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Subject & Section Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold uppercase text-[#626262] dark:text-[#A6A6A6] mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] font-medium focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
            >
              <option value="" disabled>Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#626262] dark:text-[#A6A6A6] mb-1.5">
              Class Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                setSelectedScheduleId("");
              }}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] font-medium focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
            >
              <option value="" disabled>Select Section</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} (Year {sec.yearLevel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Session Timing & Windows */}
        <div className="p-4 bg-[#F0F0F0] dark:bg-[#252525] rounded-xl border border-[#E0E0E0] dark:border-[#383838] space-y-3">
          <div className="flex items-center gap-2 font-semibold text-[#252525] dark:text-[#F5F5F5]">
            <Clock className="w-4 h-4 text-[#762D3D] dark:text-[#E6B5C2]" />
            <span>Attendance Cutoff Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#626262] dark:text-[#A6A6A6] mb-1">
                Session Active Time (Mins)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={10}
                max={360}
                className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#202020] text-[#252525] dark:text-[#F5F5F5] font-mono focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#626262] dark:text-[#A6A6A6] mb-1">
                Present Grace Period (Mins)
              </label>
              <input
                type="number"
                value={presentCutoff}
                onChange={(e) => setPresentCutoff(Number(e.target.value))}
                min={1}
                max={60}
                className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#202020] text-[#252525] dark:text-[#F5F5F5] font-mono focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#626262] dark:text-[#A6A6A6] mb-1">
                Late Cut-off (Mins)
              </label>
              <input
                type="number"
                value={lateCutoff}
                onChange={(e) => setLateCutoff(Number(e.target.value))}
                min={5}
                max={180}
                className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#202020] text-[#252525] dark:text-[#F5F5F5] font-mono focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold uppercase text-[#626262] dark:text-[#A6A6A6] mb-1.5">
            Session Description / Topic Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Chapter 4: Relational Algebra & SQL Joins"
            className="w-full px-3 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#454545] bg-[#FFFFFF] dark:bg-[#252525] text-[#252525] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#762D3D]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-[#F5F5F5] font-semibold text-xs shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{isLoading ? "Starting Session..." : "Generate Dynamic QR Code"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

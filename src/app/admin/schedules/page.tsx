"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, X, Clock, MapPin, Trash2 } from "lucide-react";

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [subjectId, setSubjectId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("11:30");
  const [room, setRoom] = useState("ComLab 3");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resSched, resSub, resSec, resFac, resTerms] = await Promise.all([
        fetch("/api/admin/schedules", { cache: "no-store" }),
        fetch("/api/admin/subjects", { cache: "no-store" }),
        fetch("/api/admin/sections", { cache: "no-store" }),
        fetch("/api/admin/faculty", { cache: "no-store" }),
        fetch("/api/admin/terms", { cache: "no-store" }),
      ]);
      if (resSched.ok) {
        const d = await resSched.json();
        setSchedules(d.schedules || []);
      }
      if (resSub.ok) {
        const d = await resSub.json();
        setSubjects(d.subjects || []);
        if (d.subjects?.[0]) setSubjectId(d.subjects[0].id);
      }
      if (resSec.ok) {
        const d = await resSec.json();
        setSections(d.sections || []);
        if (d.sections?.[0]) setSectionId(d.sections[0].id);
      }
      if (resFac.ok) {
        const d = await resFac.json();
        setFaculty(d.faculty || []);
        if (d.faculty?.[0]) setFacultyId(d.faculty[0].id);
      }
      if (resTerms.ok) {
        const d = await resTerms.json();
        setTerms(d.terms || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/schedules?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const termId = terms[0]?.id;
    if (!termId) {
      setError("No active academic term found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          sectionId,
          facultyId,
          termId,
          dayOfWeek,
          startTime,
          endTime,
          room,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create schedule");

      setIsAddOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Class Timetable & Schedules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly BSIT class sessions, classroom allocations, and faculty assignments
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Schedule</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Faculty Instructor</th>
                <th className="py-3.5 px-4">Day</th>
                <th className="py-3.5 px-4">Time Window</th>
                <th className="py-3.5 px-4">Classroom</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {s.subject.code}
                    </span>
                    <p className="text-[11px] text-slate-400">{s.subject.name}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {s.section.name}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {s.faculty.user.name}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-maroon-700 dark:text-maroon-400">
                    {s.dayOfWeek}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {s.startTime} – {s.endTime}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{s.room}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Assign Class Schedule
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="pt-4 space-y-3 text-xs">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} — {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Section</label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Faculty</label>
                  <select
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Day</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Classroom / Laboratory</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. ComLab 1 (3rd Floor)"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-maroon-700 text-white rounded-xl font-semibold">
                  {loading ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Schedule Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Remove Class Schedule?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove the schedule for <strong className="text-slate-800 dark:text-slate-200">{deleteTarget.subject.code}</strong> ({deleteTarget.section.name}) on {deleteTarget.dayOfWeek} ({deleteTarget.startTime} - {deleteTarget.endTime})?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSchedule}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Remove Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

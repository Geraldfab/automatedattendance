"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus, X, Trash2 } from "lucide-react";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [units, setUnits] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await fetch("/api/admin/subjects", { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setSubjects(d.subjects || []);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/subjects?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchSubjects();
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
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, description, units: Number(units) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create subject");
      setCode("");
      setName("");
      setDescription("");
      setIsAddOpen(false);
      fetchSubjects();
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
            BSIT Subject Curriculum
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Core information technology courses, units, and academic assignments
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold shadow-sm shadow-maroon-900/10"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-maroon-700 dark:text-maroon-400 bg-maroon-50 dark:bg-maroon-950/40 px-2.5 py-1 rounded-xl">
                  {sub.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {sub.units} Units
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {sub.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                {sub.description || "BSIT Curriculum Major Subject."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{sub._count?.schedules || 0} Scheduled Classes</span>
              <button
                onClick={() => setDeleteTarget(sub)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Remove Subject"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Create BSIT Subject
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="pt-4 space-y-3 text-xs">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Subject Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. IT308"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Subject Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Information Assurance and Security"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Units</label>
                <input
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  min={1}
                  max={6}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief course description..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-maroon-700 text-white rounded-xl font-semibold">
                  {loading ? "Saving..." : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Remove Subject from Curriculum?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">{deleteTarget.code}</strong> — {deleteTarget.name}? All class schedules and enrollments for this subject will be removed.
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
                onClick={handleDeleteSubject}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Remove Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

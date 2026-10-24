"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, X, Trash2 } from "lucide-react";

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState("");
  const [yearLevel, setYearLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const res = await fetch("/api/admin/sections", { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setSections(d.sections || []);
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/sections?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchSections();
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
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, yearLevel: Number(yearLevel), program: "BSIT" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create section");
      setName("");
      setIsAddOpen(false);
      fetchSections();
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
            BSIT Class Sections
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section clusters, year levels, and student enrollments
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Section</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">
                BSIT Program
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-maroon-50 text-maroon-700 dark:bg-maroon-950 dark:text-maroon-300">
                Year {sec.yearLevel}
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {sec.name}
            </h3>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{sec._count?.students || 0} Students</span>
              <div className="flex items-center gap-2">
                <span>{sec._count?.schedules || 0} Classes</span>
                <button
                  onClick={() => setDeleteTarget(sec)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove Section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add BSIT Section
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="pt-4 space-y-3 text-xs">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Section Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. BSIT 2-B"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Year Level</label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-maroon-700 text-white rounded-xl font-semibold">
                  {loading ? "Saving..." : "Add Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Remove Section?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">{deleteTarget.name}</strong> (Year {deleteTarget.yearLevel})? Enrolled students will be marked as unassigned.
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
                onClick={handleDeleteSection}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Remove Section"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, UserPlus, Download, X, Mail, Trash2 } from "lucide-react";
import { downloadCSV } from "@/lib/utils";

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [facultyIdNumber, setFacultyIdNumber] = useState("");
  const [department, setDepartment] = useState("BSIT Department");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await fetch("/api/admin/faculty", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setFaculty(d.faculty || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/faculty?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchFaculty();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, facultyIdNumber, department }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create faculty");

      setName("");
      setEmail("");
      setFacultyIdNumber("");
      setIsAddOpen(false);
      fetchFaculty();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleExportCSV = () => {
    const rows = faculty.map((f) => ({
      FacultyID: f.facultyIdNumber,
      Name: f.user.name,
      Email: f.user.email,
      Department: f.department,
      Status: f.accountStatus,
      AssignedSchedules: f._count.schedules,
      SessionsCreated: f._count.createdSessions,
    }));
    downloadCSV("TCCI_BSIT_Faculty.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            BSIT Faculty Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic instructors, class assignments, and attendance authority
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-semibold transition-colors shadow-sm shadow-maroon-900/10"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Faculty Member</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Faculty ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Institutional Email</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Schedules</th>
                <th className="py-3.5 px-4">Sessions Held</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {faculty.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                    {f.facultyIdNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {f.user.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{f.user.email}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{f.department}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {f._count.schedules} classes
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                    {f._count.createdSessions}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(f)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove Faculty Member"
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

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Faculty Member
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="pt-4 space-y-3 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prof. Aris Dela Cruz, MSIT"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. prof.delacruz@tcci.edu.ph"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Faculty ID Number</label>
                <input
                  type="text"
                  value={facultyIdNumber}
                  onChange={(e) => setFacultyIdNumber(e.target.value)}
                  placeholder="e.g. FAC-BSIT-015"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-maroon-700 hover:bg-maroon-800 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : "Add Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Faculty Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Remove Faculty Member?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">{deleteTarget.user.name}</strong> ({deleteTarget.facultyIdNumber})? Their scheduled classes and account will be deleted.
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
                onClick={handleDeleteFaculty}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Remove Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

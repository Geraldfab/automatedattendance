"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Shield,
  GraduationCap,
  UserCheck,
  ArrowRight,
  AlertCircle,
  QrCode,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "ADMINISTRATOR",
      label: "Admin Portal",
      email: "admin@tcci.edu.ph",
      pass: "Admin123!",
      icon: Shield,
      desc: "Full system control, users & audit",
      color: "border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20",
    },
    {
      role: "FACULTY",
      label: "Faculty Portal",
      email: "prof.santos@tcci.edu.ph",
      pass: "Faculty123!",
      icon: GraduationCap,
      desc: "Class QR generator, reports & live check-in",
      color: "border-maroon-200 dark:border-maroon-900 bg-maroon-50/50 dark:bg-maroon-950/20",
    },
    {
      role: "STUDENT",
      label: "Student Portal",
      email: "student1@tcci.edu.ph",
      pass: "Student123!",
      icon: UserCheck,
      desc: "QR scanner, attendance stats & timetable",
      color: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20",
    },
  ];

  const fillDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      const role = data.user.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "FACULTY") router.push("/faculty");
      else router.push("/student");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-maroon-950/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* College Header Header */}
        <div className="p-8 text-center bg-gradient-to-b from-maroon-900 to-maroon-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/10 shadow-inner">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Torres Capitol College Inc.</h2>
          <p className="text-xs text-rose-200/80 uppercase font-semibold tracking-wider mt-1">
            BSIT Automated Attendance System
          </p>
        </div>

        {/* Demo Account Quick Pickers */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Demonstration Account:</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`p-2.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${acc.color}`}
                >
                  <Icon className="w-4 h-4 mb-1.5 text-slate-700 dark:text-slate-300" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {acc.label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">1-Click Fill</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Institutional Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@tcci.edu.ph"
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold transition-all shadow-md shadow-maroon-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center text-[11px] text-slate-400">
            Torres Capitol College Inc. &bull; Academic Year 2024–2025
          </div>
        </form>
      </motion.div>
    </div>
  );
}

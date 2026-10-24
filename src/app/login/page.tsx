"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
      desc: "Full system governance",
    },
    {
      role: "FACULTY",
      label: "Faculty Portal",
      email: "prof.santos@tcci.edu.ph",
      pass: "Faculty123!",
      icon: GraduationCap,
      desc: "QR launch & attendance",
    },
    {
      role: "STUDENT",
      label: "Student Portal",
      email: "student1@tcci.edu.ph",
      pass: "Student123!",
      icon: UserCheck,
      desc: "QR scanner & history",
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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#171717]">
      {/* Background Campus Building with Subtle Charcoal Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/tcc-building.jpg"
          alt="Torres Capitol College Campus"
          fill
          priority
          className="object-cover object-center scale-105 filter brightness-[0.25] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/80 to-[#171717]/70" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#202020] border border-[#454545] rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* College Header with Logo */}
        <div className="p-7 text-center bg-[#252525] border-b border-[#383838] relative">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#171717] border border-[#454545] shadow-md mb-3">
            <Image
              src="/images/tcc-logo.png"
              alt="Torres Capitol College Crest"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-[#F5F5F5]">
            Torres Capitol College Inc.
          </h2>
          <p className="text-xs font-semibold text-[#E6B5C2] uppercase tracking-wider mt-1">
            BSIT Automated Attendance System
          </p>
          <p className="text-[10px] text-[#A6A6A6] uppercase tracking-widest mt-0.5">
            Domine Dirige Nos
          </p>
        </div>

        {/* Demo Account Quick Pickers */}
        <div className="p-5 border-b border-[#383838] bg-[#202020]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#A6A6A6] mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E6B5C2]" />
            <span>Select Demonstration Account:</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isSelected = email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-150 ${
                    isSelected
                      ? "bg-[#352329] border-[#762D3D] text-[#F5F5F5]"
                      : "bg-[#252525] border-[#454545] text-[#A6A6A6] hover:border-[#626262] hover:text-[#F5F5F5]"
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-[#E6B5C2]" : "text-[#A6A6A6]"}`} />
                  <p className="text-xs font-bold truncate">
                    {acc.label}
                  </p>
                  <p className="text-[9px] opacity-75 truncate">1-Click Fill</p>
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
              className="p-3 bg-[#4A2020]/50 border border-[#C05656]/60 rounded-xl text-xs text-[#F19393] flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C05656]" />
              <span>{error}</span>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
              Institutional Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@tcci.edu.ph"
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D] transition-colors"
              />
            </div>
          </div>

          {/* Primary Burgundy Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-[#F5F5F5] text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
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

          {/* New Student Registration Link */}
          <div className="pt-3 text-center text-xs text-[#A6A6A6] border-t border-[#454545]/60">
            <span>New BSIT Student? </span>
            <Link
              href="/signup"
              className="text-[#F5F5F5] hover:text-white font-semibold underline underline-offset-4"
            >
              Register / Create Account
            </Link>
          </div>

          <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-[#858585]">
            <span>Torres Capitol College Inc.</span>
            <span>&bull;</span>
            <span>Academic Year 2024–2025</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

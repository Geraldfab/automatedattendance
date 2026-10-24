"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  IdCard,
  GraduationCap,
  Layers,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function StudentSignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [yearLevel, setYearLevel] = useState(1);
  const [sectionId, setSectionId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/sections", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setSections(d.sections || []);
      }
    } catch {
      // Non-blocking
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          studentIdNumber: studentIdNumber.trim().toUpperCase(),
          yearLevel: Number(yearLevel),
          sectionId: sectionId || null,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete registration.");
      }

      // Successful registration - redirect to student portal
      router.push("/student");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
          className="object-cover object-center scale-105 filter brightness-[0.22] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/85 to-[#171717]/75" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg z-10 my-8"
      >
        <div className="p-6 sm:p-8 bg-[#202020] rounded-3xl border border-[#454545] shadow-2xl space-y-6">
          {/* Institutional Header with TCC Crest */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-2.5 rounded-2xl bg-[#171717] border border-[#454545] shadow-md mb-1">
              <Image
                src="/images/tcc-logo.png"
                alt="Torres Capitol College Crest"
                width={52}
                height={52}
                priority
                className="object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5]">
              BSIT Student Registration
            </h1>
            <p className="text-xs text-[#A6A6A6] font-medium">
              Torres Capitol College Inc. &bull; Automated Attendance System
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 bg-[#FDF0F0] dark:bg-[#4A2020]/60 border border-[#C05656]/50 rounded-xl flex items-center gap-2.5 text-xs text-[#C05656] dark:text-[#F19393]"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignup} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Juan Carlos M. Cruz"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
                />
              </div>
            </div>

            {/* Email & Student ID Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@tcci.edu.ph"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
                  Student ID Number
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    placeholder="TCCI-2024-0123"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] font-mono uppercase placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
                  />
                </div>
              </div>
            </div>

            {/* Year Level & Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
                  Year Level
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
                  Assigned Section
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
                  >
                    <option value="">Unassigned / To Be Advised</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} (Year {sec.yearLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858585] hover:text-[#F5F5F5]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A6A6A6] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#454545] bg-[#252525] text-[#F5F5F5] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#762D3D] focus:border-[#762D3D]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#762D3D] hover:bg-[#8A394B] active:bg-[#622333] text-[#F5F5F5] font-bold text-xs shadow-md shadow-[#762D3D]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? "Creating Student Account..." : "Complete Registration"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 text-center text-xs text-[#A6A6A6] border-t border-[#454545]/60">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="text-[#F5F5F5] hover:text-white font-semibold underline underline-offset-4"
            >
              Sign in to Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

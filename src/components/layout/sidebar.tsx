"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  ClipboardCheck,
  BarChart3,
  Settings,
  History,
  QrCode,
  Bell,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "ADMIN" | "FACULTY" | "STUDENT";
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Faculty", href: "/admin/faculty", icon: GraduationCap },
    { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
    { label: "Sections", href: "/admin/sections", icon: Layers },
    { label: "Schedules", href: "/admin/schedules", icon: Calendar },
    { label: "Attendance Records", href: "/admin/records", icon: ClipboardCheck },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
  ];

  const facultyLinks = [
    { label: "Dashboard", href: "/faculty", icon: LayoutDashboard },
    { label: "My Classes", href: "/faculty/classes", icon: BookOpen },
    { label: "Launch Attendance", href: "/faculty/session/create", icon: QrCode },
    { label: "Attendance Records", href: "/faculty/records", icon: ClipboardCheck },
    { label: "Class Reports", href: "/faculty/reports", icon: BarChart3 },
  ];

  const studentLinks = [
    { label: "My Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Scan QR Attendance", href: "/student/scan", icon: QrCode },
    { label: "Enrolled Subjects", href: "/student/subjects", icon: BookOpen },
    { label: "Attendance History", href: "/student/history", icon: Clock },
    { label: "Class Timetable", href: "/student/schedule", icon: Calendar },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
  ];

  const links =
    role === "ADMIN" ? adminLinks : role === "FACULTY" ? facultyLinks : studentLinks;

  return (
    <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-screen sticky top-0 z-30">
      {/* College & Department Branding */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            TC
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight truncate">
              Torres Capitol College
            </h1>
            <p className="text-[11px] font-medium text-maroon-700 dark:text-maroon-400 uppercase tracking-wider truncate">
              BSIT Attendance System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {role} Portal
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-maroon-700 text-white shadow-sm shadow-maroon-900/10 dark:bg-maroon-800 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  )}
                />
                <span>{link.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </Link>
          );
        })}
      </div>

      {/* Security & Data Privacy Footer Note */}
      <div className="p-3 mx-3 mb-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">RA 10173 Protected</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
          TORRES CAPITOL COLLEGE INC.
        </p>
      </div>
    </aside>
  );
}

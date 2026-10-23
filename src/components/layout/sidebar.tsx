"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  ChevronLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShell } from "./dashboard-shell";

interface SidebarProps {
  role: "ADMIN" | "FACULTY" | "STUDENT";
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useShell();

  const adminLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Attendance Records", href: "/admin/records", icon: ClipboardCheck },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Faculty", href: "/admin/faculty", icon: GraduationCap },
    { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
    { label: "Sections", href: "/admin/sections", icon: Layers },
    { label: "Schedules", href: "/admin/schedules", icon: Calendar },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  const facultyLinks = [
    { label: "Dashboard", href: "/faculty", icon: LayoutDashboard },
    { label: "Launch Attendance", href: "/faculty/session/create", icon: QrCode },
    { label: "Class Management", href: "/faculty/classes", icon: BookOpen },
    { label: "Attendance Records", href: "/faculty/records", icon: ClipboardCheck },
    { label: "Reports & Analytics", href: "/faculty/reports", icon: BarChart3 },
  ];

  const studentLinks = [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Scan Attendance", href: "/student/scan", icon: QrCode },
    { label: "Attendance History", href: "/student/history", icon: Clock },
    { label: "Enrolled Subjects", href: "/student/subjects", icon: BookOpen },
    { label: "Class Timetable", href: "/student/schedule", icon: Calendar },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
  ];

  const links =
    role === "ADMIN" ? adminLinks : role === "FACULTY" ? facultyLinks : studentLinks;

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen flex flex-col shrink-0",
          "bg-[#FAFAFA] dark:bg-[#202020] border-r border-[#E0E0E0] dark:border-[#383838]",
          "transition-all duration-200 ease-in-out",
          // Width for desktop collapsed vs expanded
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile drawer translate
          isMobileOpen
            ? "translate-x-0 w-72 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-10 h-10 rounded-xl bg-[#171717] border border-[#454545] shadow-sm flex items-center justify-center shrink-0 p-1">
              <Image
                src="/images/tcc-logo.png"
                alt="Torres Capitol College Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden min-w-0">
                <h1 className="font-bold text-xs sm:text-sm tracking-tight text-[#252525] dark:text-[#F5F5F5] truncate leading-tight">
                  Torres Capitol College
                </h1>
                <p className="text-[10px] font-semibold text-[#762D3D] dark:text-[#E6B5C2] uppercase tracking-wider truncate">
                  Automated Attendance System
                </p>
                <p className="text-[9px] text-[#626262] dark:text-[#A6A6A6] uppercase tracking-widest truncate">
                  BSIT Department
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-lg text-[#626262] dark:text-[#A6A6A6] hover:bg-[#E8E8E8] dark:hover:bg-[#252525] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#626262] dark:text-[#A6A6A6]">
              {role} Navigation
            </div>
          )}

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (isMobileOpen) closeMobile();
                }}
                title={isCollapsed && !isMobileOpen ? link.label : undefined}
                className={cn(
                  "flex items-center rounded-xl text-xs font-medium transition-all duration-150 group",
                  isCollapsed && !isMobileOpen
                    ? "justify-center px-0 py-3"
                    : "justify-between px-3 py-2.5",
                  isActive
                    ? "bg-[#F8EAEF] text-[#762D3D] dark:bg-[#352329] dark:text-[#F5F5F5] font-semibold border-l-4 border-[#762D3D] shadow-sm"
                    : "text-[#626262] dark:text-[#A6A6A6] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] hover:text-[#252525] dark:hover:text-[#F5F5F5]"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-[#762D3D] dark:text-[#E6B5C2]"
                        : "text-[#626262] dark:text-[#A6A6A6] group-hover:text-[#252525] dark:group-hover:text-[#F5F5F5]"
                    )}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{link.label}</span>
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#762D3D] dark:text-[#E6B5C2] opacity-80" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer: Institutional Security Note & Collapse Toggle */}
        <div className="p-3 border-t border-[#E0E0E0] dark:border-[#333333] space-y-2">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-2.5 bg-[#F0F0F0] dark:bg-[#252525] rounded-xl border border-[#E0E0E0] dark:border-[#383838] flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-[#D4D4D4] dark:border-[#454545] bg-white flex items-center justify-center p-0.5">
                <Image
                  src="/images/bsit-logo.png"
                  alt="BSIT Department"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#252525] dark:text-[#F5F5F5]">
                  <ShieldCheck className="w-3 h-3 text-[#2F855A] shrink-0" />
                  <span className="truncate">RA 10173 Protected</span>
                </div>
                <p className="text-[9px] text-[#626262] dark:text-[#A6A6A6] truncate">
                  Torres Capitol College Inc.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="RA 10173 Protected">
              <ShieldCheck className="w-4 h-4 text-[#2F855A]" />
            </div>
          )}

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="w-full hidden lg:flex items-center justify-center gap-2 py-2 text-[11px] font-medium text-[#626262] dark:text-[#A6A6A6] hover:text-[#252525] dark:hover:text-[#F5F5F5] hover:bg-[#EAEAEA] dark:hover:bg-[#252525] rounded-xl transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

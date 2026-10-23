"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

interface ShellContextType {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used within DashboardShell");
  }
  return ctx;
}

interface DashboardShellProps {
  children: React.ReactNode;
  role: "ADMIN" | "FACULTY" | "STUDENT";
  user: {
    name: string;
    email: string;
    role: string;
    studentIdNumber?: string;
    facultyIdNumber?: string;
  };
}

export function DashboardShell({ children, role, user }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <ShellContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleCollapse,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobile,
        closeMobile,
      }}
    >
      <div className="min-h-screen flex bg-[#F0F0F0] dark:bg-[#171717] text-[#252525] dark:text-[#F5F5F5] transition-colors duration-200">
        {/* Responsive Sidebar (Desktop Fixed/Collapsible + Mobile Drawer) */}
        <Sidebar role={role} userName={user.name} userEmail={user.email} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-200">
          <TopNav user={user} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
            {children}
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

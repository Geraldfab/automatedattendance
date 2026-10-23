import React from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED" | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const norm = status.toUpperCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
    lg: "px-3 py-1.5 text-sm font-semibold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  if (norm === "PRESENT") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
          sizeClasses[size],
          className
        )}
      >
        <CheckCircle2 className={iconSizes[size]} aria-hidden="true" />
        <span>Present</span>
      </span>
    );
  }

  if (norm === "LATE") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
          sizeClasses[size],
          className
        )}
      >
        <Clock className={iconSizes[size]} aria-hidden="true" />
        <span>Late</span>
      </span>
    );
  }

  if (norm === "ABSENT") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
          sizeClasses[size],
          className
        )}
      >
        <XCircle className={iconSizes[size]} aria-hidden="true" />
        <span>Absent</span>
      </span>
    );
  }

  if (norm === "EXCUSED") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
          sizeClasses[size],
          className
        )}
      >
        <AlertCircle className={iconSizes[size]} aria-hidden="true" />
        <span>Excused</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        sizeClasses[size],
        className
      )}
    >
      <span>{status}</span>
    </span>
  );
}

import React from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED" | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const norm = status ? status.toUpperCase() : "PENDING";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
    lg: "px-3 py-1.5 text-sm font-semibold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  // Present: muted green #2F855A
  if (norm === "PRESENT") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium border transition-colors",
          "bg-[#EBF5EE] text-[#2F855A] border-[#2F855A]/30 dark:bg-[#1C3E2B]/50 dark:text-[#72C899] dark:border-[#2F855A]/60",
          sizeClasses[size],
          className
        )}
      >
        <CheckCircle2 className={cn(iconSizes[size], "text-[#2F855A] dark:text-[#72C899]")} aria-hidden="true" />
        <span>Present</span>
      </span>
    );
  }

  // Late: muted amber #B7791F
  if (norm === "LATE") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium border transition-colors",
          "bg-[#FEF7E6] text-[#B7791F] border-[#B7791F]/30 dark:bg-[#483212]/50 dark:text-[#E7B567] dark:border-[#B7791F]/60",
          sizeClasses[size],
          className
        )}
      >
        <Clock className={cn(iconSizes[size], "text-[#B7791F] dark:text-[#E7B567]")} aria-hidden="true" />
        <span>Late</span>
      </span>
    );
  }

  // Absent: muted red #C05656
  if (norm === "ABSENT") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium border transition-colors",
          "bg-[#FDF0F0] text-[#C05656] border-[#C05656]/30 dark:bg-[#4A2020]/50 dark:text-[#F19393] dark:border-[#C05656]/60",
          sizeClasses[size],
          className
        )}
      >
        <XCircle className={cn(iconSizes[size], "text-[#C05656] dark:text-[#F19393]")} aria-hidden="true" />
        <span>Absent</span>
      </span>
    );
  }

  // Excused: muted blue #4A78A8
  if (norm === "EXCUSED") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium border transition-colors",
          "bg-[#EBF3FB] text-[#4A78A8] border-[#4A78A8]/30 dark:bg-[#1E334A]/50 dark:text-[#8BB2DD] dark:border-[#4A78A8]/60",
          sizeClasses[size],
          className
        )}
      >
        <AlertCircle className={cn(iconSizes[size], "text-[#4A78A8] dark:text-[#8BB2DD]")} aria-hidden="true" />
        <span>Excused</span>
      </span>
    );
  }

  // Neutral or pending: gray #858585
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border transition-colors",
        "bg-[#F0F0F0] text-[#626262] border-[#D4D4D4] dark:bg-[#252525] dark:text-[#A6A6A6] dark:border-[#454545]",
        sizeClasses[size],
        className
      )}
    >
      <HelpCircle className={cn(iconSizes[size], "text-[#858585]")} aria-hidden="true" />
      <span>{status || "Pending"}</span>
    </span>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  colorScheme?: "maroon" | "burgundy" | "emerald" | "amber" | "rose" | "blue" | "slate" | "charcoal";
  index?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  colorScheme = "charcoal",
  index = 0,
}: StatCardProps) {
  const colorMap = {
    burgundy: "bg-[#F8EAEF] text-[#762D3D] dark:bg-[#352329] dark:text-[#E6B5C2] border border-[#762D3D]/20 dark:border-[#762D3D]/40",
    maroon: "bg-[#F8EAEF] text-[#762D3D] dark:bg-[#352329] dark:text-[#E6B5C2] border border-[#762D3D]/20 dark:border-[#762D3D]/40",
    emerald: "bg-[#EBF5EE] text-[#2F855A] dark:bg-[#1C3E2B]/60 dark:text-[#72C899] border border-[#2F855A]/20 dark:border-[#2F855A]/40",
    amber: "bg-[#FEF7E6] text-[#B7791F] dark:bg-[#483212]/60 dark:text-[#E7B567] border border-[#B7791F]/20 dark:border-[#B7791F]/40",
    rose: "bg-[#FDF0F0] text-[#C05656] dark:bg-[#4A2020]/60 dark:text-[#F19393] border border-[#C05656]/20 dark:border-[#C05656]/40",
    blue: "bg-[#EBF3FB] text-[#4A78A8] dark:bg-[#1E334A]/60 dark:text-[#8BB2DD] border border-[#4A78A8]/20 dark:border-[#4A78A8]/40",
    slate: "bg-[#F0F0F0] text-[#626262] dark:bg-[#252525] dark:text-[#A6A6A6] border border-[#E0E0E0] dark:border-[#454545]",
    charcoal: "bg-[#F0F0F0] text-[#252525] dark:bg-[#252525] dark:text-[#F5F5F5] border border-[#E0E0E0] dark:border-[#454545]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] bg-[#FAFAFA] dark:bg-[#202020] shadow-sm relative overflow-hidden transition-colors"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#626262] dark:text-[#A6A6A6]">
          {title}
        </p>
        <div className={cn("p-2 rounded-xl flex items-center justify-center", colorMap[colorScheme])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-[#252525] dark:text-[#F5F5F5]">
          {value}
        </h3>
        {trend && (
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full border",
              trendPositive
                ? "text-[#2F855A] bg-[#EBF5EE] border-[#2F855A]/30 dark:bg-[#1C3E2B]/50 dark:text-[#72C899] dark:border-[#2F855A]/40"
                : "text-[#C05656] bg-[#FDF0F0] border-[#C05656]/30 dark:bg-[#4A2020]/50 dark:text-[#F19393] dark:border-[#C05656]/40"
            )}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1.5 text-xs text-[#626262] dark:text-[#A6A6A6] truncate">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

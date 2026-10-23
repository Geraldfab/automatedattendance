"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface AttendanceChartProps {
  data: {
    date: string;
    present: number;
    late: number;
    absent: number;
  }[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading attendance analytics...</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              color: "#fff",
              borderRadius: "0.75rem",
              border: "none",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="present"
            name="Present"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPresent)"
          />
          <Area
            type="monotone"
            dataKey="late"
            name="Late"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLate)"
          />
          <Area
            type="monotone"
            dataKey="absent"
            name="Absent"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAbsent)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SubjectComparisonChartProps {
  data: {
    subjectCode: string;
    attendanceRate: number;
  }[];
}

export function SubjectComparisonChart({ data }: SubjectComparisonChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading subject rates...</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis
            dataKey="subjectCode"
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              color: "#fff",
              borderRadius: "0.75rem",
              border: "none",
              fontSize: "12px",
            }}
            formatter={(val: any) => [`${val}%`, "Attendance Rate"]}
          />
          <Bar
            dataKey="attendanceRate"
            fill="#8b1e3f"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

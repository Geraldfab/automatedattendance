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
              <stop offset="5%" stopColor="#2F855A" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2F855A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B7791F" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#B7791F" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C05656" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#C05656" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.12} stroke="#454545" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#858585"
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#858585"
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#202020",
              color: "#F5F5F5",
              borderRadius: "0.75rem",
              border: "1px solid #454545",
              fontSize: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
          />
          <Area
            type="monotone"
            dataKey="present"
            name="Present"
            stroke="#2F855A"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPresent)"
          />
          <Area
            type="monotone"
            dataKey="late"
            name="Late"
            stroke="#B7791F"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLate)"
          />
          <Area
            type="monotone"
            dataKey="absent"
            name="Absent"
            stroke="#C05656"
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
          <CartesianGrid strokeDasharray="3 3" opacity={0.12} stroke="#454545" />
          <XAxis
            dataKey="subjectCode"
            tick={{ fontSize: 11 }}
            stroke="#858585"
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            stroke="#858585"
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#202020",
              color: "#F5F5F5",
              borderRadius: "0.75rem",
              border: "1px solid #454545",
              fontSize: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
            formatter={(val: any) => [`${val}%`, "Attendance Rate"]}
          />
          <Bar
            dataKey="attendanceRate"
            fill="#762D3D"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import type { SqlDialect } from "@/types/graph";

const ENGINE_OPTIONS: { value: SqlDialect | "auto"; label: string }[] = [
  { value: "auto", label: "自动识别" },
  { value: "mysql", label: "MySQL" },
  { value: "presto", label: "Presto" },
  { value: "hive", label: "Hive" },
  { value: "spark", label: "Spark" },
  { value: "pg", label: "PostgreSQL" },
];

interface Props {
  value: SqlDialect | "auto";
  onChange: (v: SqlDialect | "auto") => void;
  disabled?: boolean;
}

export default function EngineSelector({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SqlDialect | "auto")}
      disabled={disabled}
      className="px-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm text-gray-700 font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 transition-colors"
    >
      {ENGINE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useState, useCallback } from "react";
import type { SqlDialect } from "@/types/graph";
import EngineSelector from "./EngineSelector";

interface Props {
  onAnalyze: (sql: string, engine: SqlDialect | "auto") => void;
  disabled?: boolean;
}

export default function SqlInputPanel({ onAnalyze, disabled }: Props) {
  const [sql, setSql] = useState("");
  const [engine, setEngine] = useState<SqlDialect | "auto">("auto");

  const handleAnalyze = useCallback(() => {
    const trimmed = sql.trim();
    if (!trimmed) return;
    onAnalyze(trimmed, engine);
  }, [sql, engine, onAnalyze]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleAnalyze();
      }
    },
    [handleAnalyze]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <EngineSelector value={engine} onChange={setEngine} disabled={disabled} />
        <span className="text-xs text-gray-300">⌘↵ 分析</span>
      </div>
      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="粘贴 SQL 代码..."
        rows={12}
        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 focus:bg-white disabled:opacity-50 transition-colors placeholder:text-gray-300"
      />
      <button
        onClick={handleAnalyze}
        disabled={disabled || !sql.trim()}
        className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-[0.99]"
      >
        {disabled ? "分析中..." : "分析 SQL"}
      </button>
    </div>
  );
}

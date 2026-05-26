"use client";

import type { ProgressStep } from "@/types/api";

const STEP_LABELS: Record<ProgressStep, string> = {
  summary: "正在解析 SQL 结构...",
  graph: "正在构建知识图谱...",
  details: "正在生成节点详情...",
};

interface Props {
  percent: number;
  step: ProgressStep;
}

export default function ProgressBar({ percent, step }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">{STEP_LABELS[step]}</span>
        <span className="text-sm text-gray-300 tabular-nums">{Math.round(percent)}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

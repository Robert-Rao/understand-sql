"use client";

import type { Module1Summary } from "@/types/analysis";

interface Props {
  summary: Module1Summary;
}

export default function SummaryBanner({ summary }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-3">{summary.title}</h2>
      <div className="space-y-2.5 text-sm">
        <div className="flex gap-2">
          <span className="text-gray-400 flex-shrink-0 font-medium">目的</span>
          <span className="text-gray-700">{summary.businessPurpose}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-400 flex-shrink-0 font-medium">逻辑</span>
          <span className="text-gray-700">{summary.coreLogic}</span>
        </div>
      </div>
    </div>
  );
}

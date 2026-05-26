"use client";

import { useState } from "react";
import type { Module4LogicBreakdown, JoinExplanation, FilterExplanation, ExecutionStep, DialectFeature } from "@/types/analysis";

interface Props {
  breakdown: Module4LogicBreakdown;
}

function AccordionSection({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

export default function LogicBreakdown({ breakdown }: Props) {
  return (
    <div className="space-y-2.5">
      <AccordionSection title={`数据关联逻辑（${breakdown.joins.length} 个 JOIN）`}>
        {breakdown.joins.length === 0 ? (
          <p className="text-sm text-gray-400">无关联逻辑</p>
        ) : (
          <ul className="space-y-2">
            {breakdown.joins.map((j, i) => (
              <JoinItem key={i} join={j} />
            ))}
          </ul>
        )}
      </AccordionSection>

      <AccordionSection title={`筛选条件（${breakdown.filters.length} 个条件）`}>
        {breakdown.filters.length === 0 ? (
          <p className="text-sm text-gray-400">无筛选条件</p>
        ) : (
          <ul className="space-y-2">
            {breakdown.filters.map((f, i) => (
              <FilterItem key={i} filter={f} />
            ))}
          </ul>
        )}
      </AccordionSection>

      <AccordionSection title="执行优先级">
        <ol className="space-y-3">
          {breakdown.executionPriority.map((step) => (
            <ExecItem key={step.order} step={step} />
          ))}
        </ol>
      </AccordionSection>

      {breakdown.dialectFeatures.length > 0 && (
        <AccordionSection title={`引擎 & 函数学习（${breakdown.dialectFeatures.length} 项）`}>
          <ul className="space-y-2">
            {breakdown.dialectFeatures.map((f, i) => (
              <DialectItem key={i} feature={f} />
            ))}
          </ul>
        </AccordionSection>
      )}
    </div>
  );
}

function JoinItem({ join }: { join: JoinExplanation }) {
  return (
    <li className="text-sm bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-mono text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg">{join.joinType}</span>
        <span className="font-medium text-gray-800">{join.tables.join(" ↔ ")}</span>
      </div>
      <code className="block text-xs text-gray-500 font-mono mb-1">{join.condition}</code>
      <p className="text-gray-600 text-xs leading-relaxed">{join.explanation}</p>
    </li>
  );
}

function FilterItem({ filter }: { filter: FilterExplanation }) {
  return (
    <li className="text-sm bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-mono text-xs font-semibold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-lg">{filter.location}</span>
      </div>
      <code className="block text-xs text-gray-700 font-mono mb-1">{filter.condition}</code>
      <p className="text-gray-600 text-xs leading-relaxed">{filter.explanation}</p>
    </li>
  );
}

function ExecItem({ step }: { step: ExecutionStep }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">
        {step.order}
      </span>
      <div className="flex-1 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-medium text-gray-800">{step.operation}</p>
        <p className="text-gray-500 text-xs mt-1 leading-relaxed">{step.description}</p>
        <p className="text-xs text-gray-400 mt-2">
          输入: {step.inputs.join(", ")} → 输出: {step.outputs.join(", ")}
        </p>
      </div>
    </li>
  );
}

function DialectItem({ feature: f }: { feature: DialectFeature }) {
  return (
    <li className="text-sm bg-amber-50/50 border border-amber-200/40 rounded-2xl p-4">
      <p className="font-semibold text-amber-700 text-sm mb-1">{f.feature}</p>
      <p className="text-gray-600 text-xs leading-relaxed mb-1.5">{f.explanation}</p>
      {f.standardEquivalent && (
        <p className="text-xs text-gray-400">
          标准等价写法: <code className="text-gray-500 font-mono">{f.standardEquivalent}</code>
        </p>
      )}
    </li>
  );
}

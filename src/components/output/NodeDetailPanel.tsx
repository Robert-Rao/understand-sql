"use client";

import type { Module3NodeDetail } from "@/types/analysis";

interface Props {
  detail: Module3NodeDetail | null;
}

export default function NodeDetailPanel({ detail }: Props) {
  if (!detail) {
    return (
      <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-8">
        <p className="text-sm text-gray-300">点击图谱中的节点查看详情</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* 节点头部 */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">节点摘要</p>
          <p className="text-sm text-gray-800 leading-relaxed">{detail.nodeSummary}</p>
        </div>

        {/* 关联关系 */}
        {detail.relatedNodes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              关联关系 ({detail.relatedNodes.length})
            </p>
            <div className="space-y-1.5">
              {detail.relatedNodes.map((r) => (
                <div
                  key={r.nodeId}
                  className="flex items-center gap-2.5 text-sm text-gray-700 py-1.5 px-3 bg-gray-50 rounded-xl"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {r.relationship}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 全局导览 */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">全局导览</p>
          <p className="text-sm text-gray-700 leading-relaxed">{detail.globalContext}</p>
        </div>

        {/* 函数教学 */}
        {detail.teaching && (
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-amber-200/40 flex items-center justify-between">
              <p className="text-sm font-semibold text-amber-700">函数专项教学</p>
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-200/60 text-amber-700 font-medium">
                {detail.teaching.difficulty === "basic" ? "基础" : detail.teaching.difficulty === "intermediate" ? "进阶" : "高级"}
              </span>
            </div>

            <div className="px-5 py-4 space-y-4 text-sm">
              <div>
                <p className="font-medium text-amber-800 text-xs uppercase tracking-wider mb-1">标准语法</p>
                <code className="block px-3 py-2 bg-white rounded-xl text-xs text-gray-800 font-mono">{detail.teaching.standardSyntax}</code>
              </div>

              <div>
                <p className="font-medium text-amber-800 text-xs uppercase tracking-wider mb-1">参数说明</p>
                <ul className="space-y-1">
                  {detail.teaching.parameters.map((p) => (
                    <li key={p.name} className="text-gray-700 pl-3 border-l-2 border-amber-200">
                      <code className="text-xs font-semibold">{p.name}</code>
                      <span className="text-gray-400 ml-1">({p.type})</span>
                      {p.required && <span className="text-red-400 text-xs ml-1">必填</span>}
                      <span className="block text-gray-500 text-xs mt-0.5">{p.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium text-amber-800 text-xs uppercase tracking-wider mb-1">适用场景</p>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {detail.teaching.useCases.map((uc, i) => (
                    <li key={i} className="text-xs">{uc}</li>
                  ))}
                </ul>
              </div>

              {detail.teaching.examples.map((ex, i) => (
                <div key={i}>
                  <p className="font-medium text-amber-800 text-xs uppercase tracking-wider mb-1">示例: {ex.title}</p>
                  <pre className="p-3 bg-white rounded-xl text-xs overflow-x-auto font-mono text-gray-800">{ex.sql}</pre>
                  <p className="mt-1 text-xs text-gray-500">{ex.explanation}</p>
                </div>
              ))}

              {detail.teaching.pitfalls.length > 0 && (
                <div>
                  <p className="font-medium text-amber-800 text-xs uppercase tracking-wider mb-1">易错点</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                    {detail.teaching.pitfalls.map((p, i) => (
                      <li key={i} className="text-xs">{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

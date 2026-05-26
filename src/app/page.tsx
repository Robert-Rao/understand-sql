"use client";

import { useAnalysis } from "@/hooks/useAnalysis";
import { useNodeDetail } from "@/hooks/useNodeDetail";
import SqlInputPanel from "@/components/input/SqlInputPanel";
import SummaryBanner from "@/components/output/SummaryBanner";
import KnowledgeGraph from "@/components/output/KnowledgeGraph";
import NodeDetailPanel from "@/components/output/NodeDetailPanel";
import LogicBreakdown from "@/components/output/LogicBreakdown";
import ProgressBar from "@/components/common/ProgressBar";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SkeletonSummary, SkeletonGraph, SkeletonDetailPanel, SkeletonBreakdown } from "@/components/common/Skeleton";

export default function Home() {
  const { state, startAnalysis, selectNode, reset } = useAnalysis();

  // During analysis, use partial result for incremental display; after complete, use final result
  const isAnalyzing = state.status === "analyzing";
  const isComplete = state.status === "complete";
  const data = isComplete ? state.result : state.partialResult;

  const nodeDetail = useNodeDetail(
    isComplete ? state.result : null,
    state.selectedNodeId
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F2F2F7]">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Understand SQL</h1>
              <p className="text-sm text-gray-400 mt-0.5">知识图谱可视化</p>
            </div>
            {isComplete && (
              <button
                onClick={reset}
                className="px-5 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                新分析
              </button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Input Card */}
          <section>
            <SqlInputPanel
              onAnalyze={startAnalysis}
              disabled={isAnalyzing}
            />
          </section>

          {/* Progress Bar */}
          {isAnalyzing && (
            <section className="px-1">
              <ProgressBar percent={state.progressPercent} step={state.currentStep} />
            </section>
          )}

          {/* Error */}
          {state.status === "error" && (
            <section className="bg-[#FFF0F0] border border-red-200/50 rounded-2xl p-5">
              <p className="text-red-700 font-medium text-sm">分析失败</p>
              <p className="text-red-600/80 text-sm mt-1">{state.error}</p>
            </section>
          )}

          {/* Results area — always visible during/after analysis */}
          {(isAnalyzing || isComplete) && (
            <div className="space-y-5">
              {/* 一. 业务逻辑分析 */}
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-2.5">一. 业务逻辑分析</h2>
                {data?.module1 ? (
                  <SummaryBanner summary={data.module1} />
                ) : (
                  <SkeletonSummary />
                )}
              </section>

              {/* 二. 分析图谱 */}
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-2.5">二. 分析图谱</h2>
                <div className="flex gap-5">
                <div className="flex-1 min-w-0">
                  {data?.module2 ? (
                    <KnowledgeGraph
                      graph={data.module2}
                      selectedNodeId={state.selectedNodeId}
                      onNodeSelect={selectNode}
                    />
                  ) : (
                    <SkeletonGraph />
                  )}
                </div>
                <div className="w-[360px] flex-shrink-0">
                  {isComplete ? (
                    <NodeDetailPanel detail={nodeDetail} />
                  ) : (
                    <SkeletonDetailPanel />
                  )}
                </div>
              </div>
              </section>

              {/* 三. 逻辑拆解 & 函数学习 */}
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-2.5">三. 逻辑拆解 & 函数学习</h2>
                {isComplete && state.result?.module4 ? (
                  <LogicBreakdown breakdown={state.result.module4} />
                ) : (
                  <SkeletonBreakdown />
                )}
              </section>
            </div>
          )}

          {/* Empty state */}
          {state.status === "idle" && (
            <div className="text-center py-24">
              <p className="text-lg font-medium text-gray-300">输入 SQL 开始分析</p>
              <p className="text-sm text-gray-300/70 mt-1.5">支持 MySQL / Presto / Hive / Spark / PostgreSQL</p>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

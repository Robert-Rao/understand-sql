"use client";

import type { Module2Graph } from "@/types/analysis";
import GraphCanvas from "@/components/graph/GraphCanvas";
import GraphLegend from "@/components/graph/GraphLegend";

interface Props {
  graph: Module2Graph;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

export default function KnowledgeGraph({ graph, selectedNodeId, onNodeSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <GraphLegend />
          <span className="text-xs text-gray-300 flex-shrink-0 tabular-nums">
            {graph.graphData.metadata.tableCount} 表 · {graph.graphData.metadata.columnCount} 字段
          </span>
        </div>
      </div>
      <div className="p-2">
        <GraphCanvas
          graphData={graph.graphData}
          selectedNodeId={selectedNodeId}
          onNodeSelect={onNodeSelect}
        />
      </div>
    </div>
  );
}

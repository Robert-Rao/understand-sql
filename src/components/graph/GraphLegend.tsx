"use client";

const LEGEND_ITEMS = [
  { type: "table", label: "数据表", shape: "rect", color: "#4F46E5", bg: "#EEF2FF" },
  { type: "column", label: "字段", shape: "ellipse", color: "#0891B2", bg: "#ECFEFF" },
  { type: "function", label: "SQL函数", shape: "diamond", color: "#D97706", bg: "#FFFBEB" },
];

const EDGE_ITEMS = [
  { type: "join", label: "JOIN 关联", color: "#EF4444", style: "dashed" },
  { type: "uses", label: "查询使用", color: "#3B82F6", style: "solid" },
  { type: "compute_depends", label: "计算依赖", color: "#F59E0B", style: "dotted" },
  { type: "filter_depends", label: "筛选依赖", color: "#10B981", style: "dash-dot" },
];

export default function GraphLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      {/* Node types */}
      {LEGEND_ITEMS.map((item) => (
        <div key={item.type} className="flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-3 rounded-sm border"
            style={{ backgroundColor: item.bg, borderColor: item.color }}
          />
          <span className="text-gray-600">{item.label}</span>
        </div>
      ))}

      <span className="text-gray-300">|</span>

      {/* Edge types */}
      {EDGE_ITEMS.map((item) => (
        <div key={item.type} className="flex items-center gap-1.5">
          <svg width="24" height="10">
            <line
              x1="0" y1="5" x2="20" y2="5"
              stroke={item.color}
              strokeWidth={2}
              strokeDasharray={item.style === "dashed" ? "4,2" : item.style === "dotted" ? "1,3" : item.style === "dash-dot" ? "4,2,1,2" : ""}
            />
            <polygon points="18,2 24,5 18,8" fill={item.color} />
          </svg>
          <span className="text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

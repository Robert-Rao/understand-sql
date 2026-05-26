import type { GraphData, GraphNode } from "@/types/graph";

export function graphDataToElements(graphData: GraphData) {
  const elements: cytoscape.ElementDefinition[] = [];

  for (const node of graphData.nodes) {
    elements.push({
      data: {
        id: node.id,
        label: getNodeLabel(node),
        nodeType: node.type,
        name: node.name,
        summary: node.summary ?? "",
        module: "module" in node ? node.module : "",
      },
      classes: node.type,
    });
  }

  for (const edge of graphData.edges) {
    elements.push({
      data: {
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        label: edge.label ?? "",
        edgeType: edge.type,
        description: edge.description,
        executionOrder: edge.executionOrder,
      },
      classes: edge.type,
    });
  }

  return elements;
}

function getNodeLabel(node: GraphNode): string {
  if (node.type === "table") return node.alias ? `${node.name} (${node.alias})` : node.name;
  if (node.type === "column") return node.name;
  return node.name;
}

export const GRAPH_STYLESHEET = [
  // ===== TABLE NODES =====
  {
    selector: "node.table",
    style: {
      shape: "round-rectangle",
      width: 140,
      height: 50,
      "background-color": "#EEF2FF",
      "border-color": "#4F46E5",
      "border-width": 2,
      label: "data(label)",
      "font-size": 12,
      "font-weight": "bold",
      color: "#1E1B4B",
      "text-valign": "center",
      "text-halign": "center",
      "padding-top": 4,
      "padding-left": 8,
      "padding-right": 8,
    },
  },
  // CTE / subquery tables
  {
    selector: "node.table[source='cte'], node.table[source='subquery']",
    style: {
      "border-style": "dashed",
      "background-color": "#F5F3FF",
      "border-color": "#7C3AED",
    },
  },
  // ===== COLUMN NODES =====
  {
    selector: "node.column",
    style: {
      shape: "ellipse",
      width: 100,
      height: 36,
      "background-color": "#ECFEFF",
      "border-color": "#0891B2",
      "border-width": 1.5,
      label: "data(label)",
      "font-size": 10,
      color: "#164E63",
      "text-valign": "center",
      "text-halign": "center",
    },
  },
  // ===== FUNCTION NODES =====
  {
    selector: "node.function",
    style: {
      shape: "diamond",
      width: 110,
      height: 45,
      "background-color": "#FFFBEB",
      "border-color": "#D97706",
      "border-width": 2,
      label: "data(label)",
      "font-size": 11,
      "font-weight": "bold",
      color: "#78350F",
      "text-valign": "center",
      "text-halign": "center",
    },
  },
  // ===== EDGES =====
  {
    selector: "edge.contains",
    style: {
      "line-color": "#D1D5DB",
      "target-arrow-color": "#D1D5DB",
      "target-arrow-shape": "none",
      width: 1,
      "line-style": "solid",
    },
  },
  {
    selector: "edge.join",
    style: {
      "line-color": "#EF4444",
      "target-arrow-color": "#EF4444",
      "target-arrow-shape": "triangle",
      width: 2,
      "line-style": "dashed",
      "arrow-scale": 1.2,
      label: "data(label)",
      "font-size": 9,
      color: "#991B1B",
      "text-rotation": "autorotate",
    },
  },
  {
    selector: "edge.uses",
    style: {
      "line-color": "#3B82F6",
      "target-arrow-color": "#3B82F6",
      "target-arrow-shape": "triangle",
      width: 2,
      "line-style": "solid",
      "arrow-scale": 1,
    },
  },
  {
    selector: "edge.compute_depends",
    style: {
      "line-color": "#F59E0B",
      "target-arrow-color": "#F59E0B",
      "target-arrow-shape": "triangle",
      width: 2,
      "line-style": "dotted",
      "arrow-scale": 1,
    },
  },
  {
    selector: "edge.filter_depends",
    style: {
      "line-color": "#10B981",
      "target-arrow-color": "#10B981",
      "target-arrow-shape": "triangle",
      width: 2,
      "line-style": "dash-dot",
      "arrow-scale": 1,
    },
  },
  // ===== SELECTED =====
  {
    selector: "node:selected",
    style: {
      "border-width": 3,
      "border-color": "#4F46E5",
      "background-color": "#C7D2FE",
    },
  },
  // ===== HOVER HIGHLIGHT =====
  {
    selector: "node.hover",
    style: {
      "border-width": 3,
      "border-color": "#6366F1",
      "overlay-opacity": 0.1,
      "overlay-color": "#6366F1",
    },
  },
  {
    selector: "node.dimmed",
    style: {
      opacity: 0.25,
    },
  },
  {
    selector: "edge.dimmed",
    style: {
      opacity: 0.15,
    },
  },
];

export const LAYOUT_OPTIONS = {
  dagre: {
    name: "dagre" as const,
    rankDir: "LR",
    nodeSep: 60,
    edgeSep: 40,
    rankSep: 120,
    spacingFactor: 1.2,
    animate: true,
    animationDuration: 400,
  },
  breadthfirst: {
    name: "breadthfirst" as const,
    directed: true,
    spacingFactor: 1.2,
    animate: true,
    animationDuration: 400,
  },
};

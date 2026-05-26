"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscapeLib, { type Core } from "cytoscape";
import dagre from "cytoscape-dagre";
import type { GraphData } from "@/types/graph";
import { graphDataToElements, GRAPH_STYLESHEET, LAYOUT_OPTIONS } from "@/lib/cytoscape-utils";

cytoscapeLib.use(dagre);

interface Props {
  graphData: GraphData;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

export default function GraphCanvas({ graphData, selectedNodeId, onNodeSelect }: Props) {
  const cyRef = useRef<Core | null>(null);
  const [layoutName, setLayoutName] = useState<"dagre" | "breadthfirst">("dagre");
  const elements = graphDataToElements(graphData);

  const handleCyReady = useCallback((cy: Core) => {
    cyRef.current = cy;

    // Click: select node
    cy.on("tap", "node", (evt) => {
      const nodeId = evt.target.id();
      onNodeSelect(nodeId);
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        onNodeSelect(null);
      }
    });

    // Hover: highlight neighbors
    cy.on("mouseover", "node", (evt) => {
      const node = evt.target;
      const neighbors = node.closedNeighborhood();
      cy.elements().difference(neighbors).addClass("dimmed");
      node.addClass("hover");
    });

    cy.on("mouseout", "node", () => {
      cy.elements().removeClass("dimmed hover");
    });

    // Run layout
    void runLayout(cy, layoutName);
  }, [onNodeSelect, layoutName]);

  // Update selection when selectedNodeId changes externally
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().unselect();
    if (selectedNodeId) {
      const node = cy.$id(selectedNodeId);
      if (node.length > 0) {
        node.select();
      }
    }
  }, [selectedNodeId]);

  // Re-layout on data change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    void runLayout(cy, layoutName);
  }, [graphData, layoutName]);

  const handleFit = useCallback(() => {
    cyRef.current?.fit(undefined, 50);
  }, []);

  const handleZoomIn = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  }, []);

  const toggleLayout = useCallback(() => {
    setLayoutName((prev) => (prev === "dagre" ? "breadthfirst" : "dagre"));
  }, []);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gray-50/50 rounded-xl overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={GRAPH_STYLESHEET}
        style={{ width: "100%", height: "100%", minHeight: "600px" }}
        cy={handleCyReady}
        layout={LAYOUT_OPTIONS[layoutName]}
        wheelSensitivity={0.3}
        autoungrabify={false}
        autounselectify={false}
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-3 left-3 flex gap-1">
        <ControlButton onClick={handleZoomIn} title="放大">+</ControlButton>
        <ControlButton onClick={handleZoomOut} title="缩小">−</ControlButton>
        <ControlButton onClick={handleFit} title="适应窗口">⊡</ControlButton>
        <ControlButton onClick={toggleLayout} title={`切换布局 (${layoutName === "dagre" ? "层级" : "力导向"})`}>
          ⇄
        </ControlButton>
      </div>

      {/* Stats */}
      <div className="absolute top-3 right-3 text-xs text-gray-400 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
        {graphData.nodes.length} 节点 · {graphData.edges.length} 边
      </div>
    </div>
  );
}

function ControlButton({
  onClick, title, children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl text-sm text-gray-500 hover:bg-white hover:border-gray-300 shadow-sm transition-all active:scale-95"
    >
      {children}
    </button>
  );
}

function runLayout(cy: Core, name: "dagre" | "breadthfirst"): Promise<void> {
  if (cy.nodes().length === 0) return Promise.resolve();
  const layout = cy.layout(LAYOUT_OPTIONS[name]);
  return new Promise((resolve) => {
    layout.one("layoutstop", () => resolve());
    layout.run();
  });
}

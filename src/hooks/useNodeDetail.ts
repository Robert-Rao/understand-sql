"use client";

import { useMemo } from "react";
import type { AnalysisResult, Module3NodeDetail } from "@/types/analysis";

export function useNodeDetail(
  result: AnalysisResult | null,
  selectedNodeId: string | null
): Module3NodeDetail | null {
  return useMemo(() => {
    if (!result || !selectedNodeId) return null;
    return result.module3.find((d) => d.nodeId === selectedNodeId) ?? null;
  }, [result, selectedNodeId]);
}

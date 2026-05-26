"use client";

import { useCallback } from "react";
import { useAnalysisContext } from "@/context/AnalysisContext";
import type { SqlDialect } from "@/types/graph";
import type { StreamEvent } from "@/types/api";

export function useAnalysis() {
  const { state, dispatch } = useAnalysisContext();

  const startAnalysis = useCallback(
    async (sql: string, engine: SqlDialect | "auto") => {
      dispatch({ type: "SET_INPUT", sql, engine });
      dispatch({ type: "START_ANALYSIS" });

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql, engine }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "分析请求失败" }));
          dispatch({ type: "ERROR", message: err.error ?? `HTTP ${response.status}` });
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          dispatch({ type: "ERROR", message: "无法读取响应流" });
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: StreamEvent = JSON.parse(line.slice(6));
                handleStreamEvent(event, dispatch);
              } catch {
                // skip malformed lines
              }
            }
          }
        }
      } catch (err) {
        dispatch({
          type: "ERROR",
          message: err instanceof Error ? err.message : "分析过程发生未知错误",
        });
      }
    },
    [dispatch]
  );

  const selectNode = useCallback(
    (nodeId: string | null) => {
      dispatch({ type: "SELECT_NODE", nodeId });
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch({ type: "SET_INPUT", sql: "", engine: "auto" });
    dispatch({ type: "COMPLETE", result: null as never });
  }, [dispatch]);

  return { state, startAnalysis, selectNode, reset };
}

function handleStreamEvent(
  event: StreamEvent,
  dispatch: ReturnType<typeof useAnalysisContext>["dispatch"]
) {
  switch (event.type) {
    case "progress":
      dispatch({ type: "SET_PROGRESS", percent: event.percent, step: event.step });
      break;

    case "partial":
      dispatch({ type: "SET_PARTIAL", module: event.module, data: event.data });
      break;

    case "complete":
      dispatch({ type: "COMPLETE", result: event.result });
      break;

    case "error":
      if (event.recoverable) {
        dispatch({ type: "ADD_WARNING", warning: event.message });
      } else {
        dispatch({ type: "ERROR", message: event.message });
      }
      break;
  }
}

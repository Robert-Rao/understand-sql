"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { AnalysisResult, Module1Summary, Module2Graph } from "@/types/analysis";
import type { SqlDialect } from "@/types/graph";
import type { ProgressStep } from "@/types/api";

interface AnalysisState {
  sql: string;
  engine: SqlDialect | "auto";
  status: "idle" | "analyzing" | "complete" | "error";
  progressPercent: number;
  currentStep: ProgressStep;
  /** Accumulated partial modules while analyzing (for skeleton → content transition) */
  partialResult: Partial<AnalysisResult>;
  result: AnalysisResult | null;
  error: string | null;
  warnings: string[];
  selectedNodeId: string | null;
}

type Action =
  | { type: "SET_INPUT"; sql: string; engine: SqlDialect | "auto" }
  | { type: "START_ANALYSIS" }
  | { type: "SET_PROGRESS"; percent: number; step: ProgressStep }
  | { type: "SET_PARTIAL"; module: "module1" | "module2"; data: Module1Summary | Module2Graph }
  | { type: "COMPLETE"; result: AnalysisResult }
  | { type: "ERROR"; message: string }
  | { type: "ADD_WARNING"; warning: string }
  | { type: "SELECT_NODE"; nodeId: string | null };

const initialState: AnalysisState = {
  sql: "",
  engine: "auto",
  status: "idle",
  progressPercent: 0,
  currentStep: "summary",
  partialResult: {},
  result: null,
  error: null,
  warnings: [],
  selectedNodeId: null,
};

function reducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, sql: action.sql, engine: action.engine, error: null };

    case "START_ANALYSIS":
      return {
        ...state,
        status: "analyzing",
        progressPercent: 0,
        currentStep: "summary",
        partialResult: {},
        result: null,
        error: null,
        warnings: [],
        selectedNodeId: null,
      };

    case "SET_PROGRESS":
      return { ...state, progressPercent: action.percent, currentStep: action.step };

    case "SET_PARTIAL":
      return {
        ...state,
        partialResult: { ...state.partialResult, [action.module]: action.data },
      };

    case "COMPLETE":
      return {
        ...state,
        status: "complete",
        result: action.result,
        partialResult: {},
      };

    case "ERROR":
      return { ...state, status: "error", error: action.message };

    case "ADD_WARNING":
      return { ...state, warnings: [...state.warnings, action.warning] };

    case "SELECT_NODE":
      return { ...state, selectedNodeId: action.nodeId };

    default:
      return state;
  }
}

const AnalysisContext = createContext<{
  state: AnalysisState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysisContext must be used within AnalysisProvider");
  return ctx;
}

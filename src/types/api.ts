import type { AnalysisResult, Module1Summary, Module2Graph } from "./analysis";
import type { SqlDialect } from "./graph";

export interface AnalyzeRequest {
  sql: string;
  engine: SqlDialect | "auto";
}

export type ProgressStep = "summary" | "graph" | "details";

export type StreamEvent =
  | { type: "progress"; percent: number; step: ProgressStep }
  | { type: "partial"; module: "module1" | "module2"; data: Module1Summary | Module2Graph }
  | { type: "complete"; result: AnalysisResult }
  | { type: "error"; agent: string; message: string; recoverable: boolean };

export interface AnalyzeResponse {
  success: boolean;
  result: AnalysisResult | null;
  error: string | null;
  warnings: string[];
}

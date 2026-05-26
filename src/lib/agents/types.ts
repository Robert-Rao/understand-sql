import type { z } from "zod";
import type {
  detectorOutputSchema,
  nodeAnalyzerOutputSchema,
  relationBuilderOutputSchema,
  reviewerOutputSchema,
  domainAnalyzerOutputSchema,
  tourTeacherOutputSchema,
} from "@/lib/deepseek/schemas";
import type { SqlDialect, GraphData } from "@/types/graph";
import type { Module1Summary, Module3NodeDetail, Module4LogicBreakdown } from "@/types/analysis";

// ===== Agent 1: sql-detector =====
export interface DetectorInput {
  rawSql: string;
  declaredEngine: SqlDialect | "auto";
}
export type DetectorOutput = z.infer<typeof detectorOutputSchema>;

// ===== Agent 2: sql-node-analyzer =====
export interface NodeAnalyzerInput {
  cleanedSql: string;
  dialect: SqlDialect;
}
export type NodeAnalyzerOutput = z.infer<typeof nodeAnalyzerOutputSchema>;

// ===== Agent 3: sql-relation-builder =====
export interface RelationBuilderInput {
  nodes: NodeAnalyzerOutput;
  cleanedSql: string;
  dialect: SqlDialect;
}
export type RelationBuilderOutput = z.infer<typeof relationBuilderOutputSchema>;

// ===== Agent 4: graph-reviewer =====
export interface ReviewerInput {
  originalSql: string;
  dialect: SqlDialect;
  graph: GraphData;
}
export type ReviewerOutput = z.infer<typeof reviewerOutputSchema>;

// ===== Agent 5: sql-domain-analyzer =====
export interface DomainAnalyzerInput {
  sql: string;
  dialect: SqlDialect;
  nodes: NodeAnalyzerOutput;
}
export type DomainAnalyzerOutput = z.infer<typeof domainAnalyzerOutputSchema>;

// ===== Agent 6: sql-tour-teacher =====
export interface TourTeacherInput {
  graph: GraphData;
  domainOutput: DomainAnalyzerOutput;
  originalSql: string;
  dialect: SqlDialect;
}
export type TourTeacherOutput = z.infer<typeof tourTeacherOutputSchema>;

// ===== Pipeline =====
export interface PipelineResult {
  success: boolean;
  result: {
    module1: Module1Summary;
    module2: { graphData: GraphData };
    module3: Module3NodeDetail[];
    module4: Module4LogicBreakdown;
  } | null;
  error: string | null;
  warnings: string[];
}

import type { GraphData, FunctionTeaching, EdgeType } from "./graph";

// ===== 模块1：一句话极简总览 =====
export interface Module1Summary {
  title: string;
  businessPurpose: string;
  dataSources: string[];
  coreLogic: string;
  finalOutput: string;
}

// ===== 模块2：交互式知识图谱 =====
export interface Module2Graph {
  graphData: GraphData;
}

// ===== 模块3：全节点点击详情 =====
export interface Module3NodeDetail {
  nodeId: string;
  nodeSummary: string;
  relatedNodes: {
    nodeId: string;
    relationship: string;
    edgeType: EdgeType;
  }[];
  globalContext: string;
  teaching: FunctionTeaching | null;
}

// ===== 模块4：SQL核心逻辑拆解 =====
export interface Module4LogicBreakdown {
  joins: JoinExplanation[];
  filters: FilterExplanation[];
  aggregations: AggregationExplanation[];
  executionPriority: ExecutionStep[];
  dialectFeatures: DialectFeature[];
}

export interface JoinExplanation {
  tables: string[];
  joinType: string;
  condition: string;
  explanation: string;
}

export interface FilterExplanation {
  condition: string;
  location: "WHERE" | "HAVING" | "ON" | "QUALIFY";
  explanation: string;
  filterType: "equality" | "range" | "in" | "like" | "null_check" | "composite" | "other";
}

export interface AggregationExplanation {
  groupByColumns: string[];
  aggregateFunctions: string[];
  explanation: string;
}

export interface ExecutionStep {
  order: number;
  operation: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export interface DialectFeature {
  feature: string;
  explanation: string;
  standardEquivalent: string | null;
}

// ===== 完整分析结果 =====
export interface AnalysisResult {
  module1: Module1Summary;
  module2: Module2Graph;
  module3: Module3NodeDetail[];
  module4: Module4LogicBreakdown;
}

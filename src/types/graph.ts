// ===== 节点类型 =====
export type NodeType = "table" | "column" | "function";
export type SqlDialect = "mysql" | "presto" | "hive" | "spark" | "pg";

export interface TableNode {
  id: string;
  type: "table";
  name: string;
  alias: string | null;
  schema: string | null;
  source: "physical" | "cte" | "subquery" | "temp";
  summary: string;
  module: string;
  dialectHints: string[];
}

export interface ColumnNode {
  id: string;
  type: "column";
  name: string;
  tableId: string;
  dataType: string | null;
  summary: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  module: string;
}

export interface FunctionNode {
  id: string;
  type: "function";
  name: string;
  normalizedName: string;
  category: "aggregate" | "window" | "scalar" | "string" | "date" | "conditional" | "type_cast" | "other";
  summary: string;
  dialect: SqlDialect;
  isDialectSpecific: boolean;
  module: string;
  teaching: FunctionTeaching | null;
}

export interface FunctionTeaching {
  standardSyntax: string;
  parameters: ParameterDef[];
  useCases: string[];
  examples: CodeExample[];
  pitfalls: string[];
  difficulty: "basic" | "intermediate" | "advanced";
}

export interface ParameterDef {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface CodeExample {
  title: string;
  sql: string;
  explanation: string;
}

export type GraphNode = TableNode | ColumnNode | FunctionNode;

// ===== 关系类型 =====
export type EdgeType =
  | "contains"
  | "join"
  | "uses"
  | "compute_depends"
  | "filter_depends";

export interface GraphEdge {
  id: string;
  type: EdgeType;
  sourceId: string;
  targetId: string;
  label: string | null;
  description: string;
  executionOrder: number | null;
}

// ===== 图谱结构 =====
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    dialect: SqlDialect;
    statementTypes: string[];
    tableCount: number;
    columnCount: number;
    functionCount: number;
    cteCount: number;
    subqueryCount: number;
  };
}

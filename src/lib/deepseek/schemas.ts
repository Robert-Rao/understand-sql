import { z } from "zod";

// ===== 通用 =====
const dialectSchema = z.enum(["mysql", "presto", "hive", "spark", "pg"]);

// ===== Agent 1: sql-detector =====
export const detectorOutputSchema = z.object({
  isValid: z.boolean(),
  errorMessage: z.string().nullable(),
  detectedDialect: dialectSchema,
  cleanedSql: z.string(),
  statementTypes: z.array(z.string()),
  preprocessingNotes: z.array(z.string()),
});

// ===== Agent 2: sql-node-analyzer =====
const rawTableDefSchema = z.object({
  name: z.string(),
  alias: z.string().nullable(),
  schema: z.string().nullable(),
  source: z.enum(["physical", "cte", "subquery", "temp"]),
  summary: z.string(),
  module: z.string(),
});

const rawColumnDefSchema = z.object({
  name: z.string(),
  tableName: z.string(),
  dataType: z.string().nullable(),
  summary: z.string(),
  isPrimaryKey: z.boolean(),
  isForeignKey: z.boolean(),
  usedIn: z.enum(["SELECT", "WHERE", "JOIN", "GROUP_BY", "HAVING", "ORDER_BY", "OTHER"]),
  module: z.string(),
});

const rawFunctionDefSchema = z.object({
  name: z.string(),
  normalizedName: z.string(),
  category: z.enum(["aggregate", "window", "scalar", "string", "date", "conditional", "type_cast", "other"]),
  summary: z.string(),
  isDialectSpecific: z.boolean(),
  module: z.string(),
});

export const nodeAnalyzerOutputSchema = z.object({
  tables: z.array(rawTableDefSchema),
  columns: z.array(rawColumnDefSchema),
  functions: z.array(rawFunctionDefSchema),
  metadata: z.object({
    cteNames: z.array(z.string()),
    subqueryAliases: z.array(z.string()),
  }),
});

// ===== Agent 3: sql-relation-builder =====
const rawEdgeDefSchema = z.object({
  type: z.enum(["contains", "join", "uses", "compute_depends", "filter_depends"]),
  sourceLabel: z.string(),
  targetLabel: z.string(),
  label: z.string().nullable(),
  description: z.string(),
  executionOrder: z.number().nullable(),
});

const executionStepSchema = z.object({
  order: z.number(),
  operation: z.string(),
  description: z.string(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
});

export const relationBuilderOutputSchema = z.object({
  edges: z.array(rawEdgeDefSchema),
  executionFlow: z.array(executionStepSchema),
});

// ===== Agent 4: graph-reviewer =====
const reviewIssueSchema = z.object({
  severity: z.enum(["error", "warning"]),
  category: z.enum(["missing_node", "missing_edge", "wrong_type", "dialect_mismatch", "format"]),
  description: z.string(),
  suggestedFix: z.string().nullable(),
});

export const reviewerOutputSchema = z.object({
  isValid: z.boolean(),
  issues: z.array(reviewIssueSchema),
  summary: z.string(),
});

// ===== Agent 5: sql-domain-analyzer =====
export const domainAnalyzerOutputSchema = z.object({
  summary: z.object({
    title: z.string(),
    businessPurpose: z.string(),
    dataSources: z.array(z.string()),
    coreLogic: z.string(),
    finalOutput: z.string(),
  }),
  logicBreakdown: z.object({
    joins: z.array(z.object({
      tables: z.array(z.string()),
      joinType: z.string(),
      condition: z.string(),
      explanation: z.string(),
    })),
    filters: z.array(z.object({
      condition: z.string(),
      location: z.enum(["WHERE", "HAVING", "ON", "QUALIFY"]),
      explanation: z.string(),
      filterType: z.enum(["equality", "range", "in", "like", "null_check", "composite", "other"]),
    })),
    aggregations: z.array(z.object({
      groupByColumns: z.array(z.string()),
      aggregateFunctions: z.array(z.string()),
      explanation: z.string(),
    })),
    executionPriority: z.array(executionStepSchema),
    dialectFeatures: z.array(z.object({
      feature: z.string(),
      explanation: z.string(),
      standardEquivalent: z.string().nullable(),
    })),
  }),
  nodeBusinessContext: z.record(z.string(), z.string()),
});

// ===== Agent 6: sql-tour-teacher =====
const functionTeachingSchema = z.object({
  standardSyntax: z.string(),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    description: z.string(),
  })),
  useCases: z.array(z.string()),
  examples: z.array(z.object({
    title: z.string(),
    sql: z.string(),
    explanation: z.string(),
  })),
  pitfalls: z.array(z.string()),
  difficulty: z.enum(["basic", "intermediate", "advanced"]),
});

const nodeDetailSchema = z.object({
  nodeId: z.string(),
  nodeSummary: z.string(),
  relatedNodes: z.array(z.object({
    nodeId: z.string(),
    relationship: z.string(),
    edgeType: z.enum(["contains", "join", "uses", "compute_depends", "filter_depends"]),
  })),
  globalContext: z.string(),
  teaching: functionTeachingSchema.nullable(),
});

export const tourTeacherOutputSchema = z.object({
  nodeDetails: z.array(nodeDetailSchema),
});

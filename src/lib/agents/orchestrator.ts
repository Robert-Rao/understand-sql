import { runDetector } from "./sql-detector";
import { runNodeAnalyzer } from "./sql-node-analyzer";
import { runRelationBuilder } from "./sql-relation-builder";
import { runDomainAnalyzer } from "./sql-domain-analyzer";
import { runReviewer } from "./graph-reviewer";
import { runTourTeacher } from "./sql-tour-teacher";
import type {
  PipelineResult,
  DetectorOutput,
  NodeAnalyzerOutput,
  RelationBuilderOutput,
  DomainAnalyzerOutput,
  ReviewerOutput,
  TourTeacherOutput,
} from "./types";
import type {
  SqlDialect,
  GraphData,
  GraphNode,
  GraphEdge,
  TableNode,
  ColumnNode,
  FunctionNode,
} from "@/types/graph";
import type { Module1Summary, Module3NodeDetail, Module4LogicBreakdown } from "@/types/analysis";

export type PipelineEvent =
  | { type: "progress"; percent: number; step: "summary" | "graph" | "details" }
  | { type: "partial"; module: "module1"; data: Module1Summary }
  | { type: "partial"; module: "module2"; data: GraphData };

type ProgressCallback = (event: PipelineEvent) => Promise<void>;

export async function runPipeline(
  sql: string,
  engine: SqlDialect | "auto",
  onProgress: ProgressCallback
): Promise<PipelineResult> {
  const warnings: string[] = [];

  // ===== Step 1: sql-detector (0–15%) =====
  await onProgress({ type: "progress", percent: 5, step: "summary" });

  let detectorOutput: DetectorOutput;
  try {
    detectorOutput = await runDetector({ rawSql: sql, declaredEngine: engine });
  } catch (err) {
    return { success: false, result: null, error: `SQL检测失败: ${err instanceof Error ? err.message : err}`, warnings };
  }

  if (!detectorOutput.isValid) {
    return { success: false, result: null, error: detectorOutput.errorMessage ?? "输入不是有效的SQL语句", warnings };
  }

  const dialect = detectorOutput.detectedDialect;
  await onProgress({ type: "progress", percent: 15, step: "summary" });

  // ===== Step 2: sql-node-analyzer (15–30%) =====
  let nodeOutput: NodeAnalyzerOutput;
  try {
    nodeOutput = await runNodeAnalyzer({ cleanedSql: detectorOutput.cleanedSql, dialect });
  } catch (err) {
    return { success: false, result: null, error: `节点提取失败: ${err instanceof Error ? err.message : err}`, warnings };
  }

  await onProgress({ type: "progress", percent: 30, step: "summary" });

  // ===== Step 3+4 (并行): sql-relation-builder + sql-domain-analyzer (30–55%) =====
  const [relationResult, domainResult] = await Promise.allSettled([
    runRelationBuilder({ nodes: nodeOutput, cleanedSql: detectorOutput.cleanedSql, dialect }),
    runDomainAnalyzer({ sql: detectorOutput.cleanedSql, dialect, nodes: nodeOutput }),
  ]);

  let relationOutput: RelationBuilderOutput;
  let domainOutput: DomainAnalyzerOutput;

  if (relationResult.status === "rejected") {
    return { success: false, result: null, error: `关系构建失败: ${relationResult.reason}`, warnings };
  }
  relationOutput = relationResult.value;

  if (domainResult.status === "rejected") {
    warnings.push(`业务分析失败: ${domainResult.reason}`);
    domainOutput = createFallbackDomainOutput(nodeOutput, dialect);
  } else {
    domainOutput = domainResult.value;
  }

  // ===== Assemble graph =====
  const graph = assembleGraph(nodeOutput, relationOutput, dialect, detectorOutput.statementTypes);

  // Send partial: summary (module1) + graph (module2) as soon as domain-analyzer is done
  await onProgress({ type: "partial", module: "module1", data: domainOutput.summary });
  await onProgress({ type: "partial", module: "module2", data: graph });
  await onProgress({ type: "progress", percent: 55, step: "graph" });

  // ===== Step 5: graph-reviewer (55–75%) =====
  let reviewerOutput: ReviewerOutput;
  try {
    reviewerOutput = await runReviewer({ originalSql: detectorOutput.cleanedSql, dialect, graph });
  } catch (err) {
    warnings.push(`图谱校验失败: ${err}`);
    reviewerOutput = { isValid: true, issues: [], summary: "校验跳过（服务错误）" };
  }

  if (!reviewerOutput.isValid) {
    warnings.push(`图谱存在问题: ${reviewerOutput.issues.filter((i) => i.severity === "error").map((i) => i.description).join("; ")}`);
  }
  await onProgress({ type: "progress", percent: 75, step: "details" });

  // ===== Step 6: sql-tour-teacher (75–95%) =====
  let tourOutput: TourTeacherOutput;
  try {
    tourOutput = await runTourTeacher({ graph, domainOutput, originalSql: detectorOutput.cleanedSql, dialect });
  } catch (err) {
    warnings.push(`教学内容生成失败: ${err}`);
    tourOutput = { nodeDetails: createFallbackNodeDetails(graph, domainOutput) };
  }

  await onProgress({ type: "progress", percent: 95, step: "details" });

  // ===== Assemble final result =====
  await onProgress({ type: "progress", percent: 100, step: "details" });
  return {
    success: true,
    result: {
      module1: domainOutput.summary,
      module2: { graphData: graph },
      module3: tourOutput.nodeDetails,
      module4: domainOutput.logicBreakdown,
    },
    error: null,
    warnings,
  };
}

// ===== Graph Assembly =====

function assembleGraph(
  nodeOutput: NodeAnalyzerOutput,
  relationOutput: RelationBuilderOutput,
  dialect: SqlDialect,
  statementTypes: string[]
): GraphData {
  // Build nodes with normalized IDs
  const tables = buildTableNodes(nodeOutput, dialect);
  const columns = buildColumnNodes(nodeOutput);
  const functions = buildFunctionNodes(nodeOutput, dialect);

  // Build label → ID lookup
  const labelToId = buildLabelMap(tables, columns, functions);

  // Build edges
  const allNodes = [...tables, ...columns, ...functions];
  const edges = buildEdges(relationOutput, labelToId, allNodes);

  return {
    nodes: allNodes,
    edges,
    metadata: {
      dialect,
      statementTypes,
      tableCount: tables.length,
      columnCount: columns.length,
      functionCount: functions.length,
      cteCount: nodeOutput.metadata.cteNames.length,
      subqueryCount: nodeOutput.metadata.subqueryAliases.length,
    },
  };
}

function buildTableNodes(output: NodeAnalyzerOutput, dialect: SqlDialect): TableNode[] {
  return output.tables.map((t) => ({
    id: `table:${t.alias ?? t.name}`,
    type: "table" as const,
    name: t.name,
    alias: t.alias,
    schema: t.schema,
    source: t.source,
    summary: t.summary,
    module: t.module,
    dialectHints: dialect ? [] : [],
  }));
}

function buildColumnNodes(output: NodeAnalyzerOutput): ColumnNode[] {
  const seen = new Set<string>();
  return output.columns
    .filter((c) => {
      const id = `column:${c.tableName}.${c.name}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((c) => ({
      id: `column:${c.tableName}.${c.name}`,
      type: "column" as const,
      name: c.name,
      tableId: `table:${c.tableName}`,
      dataType: c.dataType,
      summary: c.summary,
      isPrimaryKey: c.isPrimaryKey,
      isForeignKey: c.isForeignKey,
      module: c.module,
    }));
}

function buildFunctionNodes(output: NodeAnalyzerOutput, dialect: SqlDialect): FunctionNode[] {
  const nameCounts = new Map<string, number>();
  return output.functions.map((f) => {
    const count = nameCounts.get(f.normalizedName) ?? 0;
    nameCounts.set(f.normalizedName, count + 1);
    const suffix = count > 0 ? `_${count + 1}` : "";
    return {
      id: `function:${f.normalizedName}${suffix}`,
      type: "function" as const,
      name: f.name,
      normalizedName: f.normalizedName,
      category: f.category,
      summary: f.summary,
      dialect,
      isDialectSpecific: f.isDialectSpecific,
      module: f.module,
      teaching: null,
    };
  });
}

function buildLabelMap(
  tables: TableNode[],
  columns: ColumnNode[],
  functions: FunctionNode[]
): Map<string, string> {
  const map = new Map<string, string>();

  for (const t of tables) {
    map.set(t.name.toLowerCase(), t.id);
    if (t.alias) map.set(t.alias.toLowerCase(), t.id);
    map.set(`${t.name} (${t.alias})`.toLowerCase(), t.id);
  }

  for (const c of columns) {
    const colName = c.id.replace("column:", "");
    map.set(colName.toLowerCase(), c.id);
    map.set(c.name.toLowerCase(), c.id);
  }

  for (const f of functions) {
    map.set(f.name.toLowerCase(), f.id);
    map.set(f.normalizedName.toLowerCase(), f.id);
  }

  return map;
}

function buildEdges(
  relationOutput: RelationBuilderOutput,
  labelToId: Map<string, string>,
  graphNodes: GraphNode[]
): GraphEdge[] {
  const validIds = new Set(graphNodes.map((n) => n.id));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const raw of relationOutput.edges) {
    const sourceId = resolveNodeId(raw.sourceLabel, labelToId, validIds);
    const targetId = resolveNodeId(raw.targetLabel, labelToId, validIds);

    if (!sourceId || !targetId) continue;

    const edgeId = `edge:${sourceId}.${raw.type}.${targetId}`;
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);

    edges.push({
      id: edgeId,
      type: raw.type,
      sourceId,
      targetId,
      label: raw.label,
      description: raw.description,
      executionOrder: raw.executionOrder,
    });
  }

  return edges;
}

function resolveNodeId(
  label: string,
  labelToId: Map<string, string>,
  validIds: Set<string>
): string | null {
  const key = label.toLowerCase();

  // Direct match in label map
  const mapped = labelToId.get(key);
  if (mapped) return mapped;

  // Try column:<table>.<name> pattern
  const colId = `column:${label}`;
  if (validIds.has(colId)) return colId;

  // Try table:<name> pattern
  const tableId = `table:${label}`;
  if (validIds.has(tableId)) return tableId;

  // Try function:<name> pattern
  const funcId = `function:${label}`;
  if (validIds.has(funcId)) return funcId;

  return null;
}

// ===== Fallback helpers =====

function createFallbackDomainOutput(
  nodeOutput: NodeAnalyzerOutput,
  dialect: SqlDialect
): DomainAnalyzerOutput {
  return {
    summary: {
      title: "SQL 查询分析",
      businessPurpose: "业务分析暂不可用",
      dataSources: nodeOutput.tables.map((t) => t.name),
      coreLogic: "分析生成失败，请重试",
      finalOutput: "查询结果集",
    },
    logicBreakdown: {
      joins: [],
      filters: [],
      aggregations: [],
      executionPriority: [],
      dialectFeatures: [{ feature: `${dialect} 方言`, explanation: "使用该引擎的SQL方言语法", standardEquivalent: null }],
    },
    nodeBusinessContext: {},
  };
}

function createFallbackNodeDetails(
  graph: GraphData,
  domainOutput: DomainAnalyzerOutput
): Module3NodeDetail[] {
  return graph.nodes.map((node) => ({
    nodeId: node.id,
    nodeSummary: node.type === "table" && "summary" in node ? node.summary :
                 node.type === "column" && "summary" in node ? node.summary :
                 node.summary,
    relatedNodes: graph.edges
      .filter((e) => e.sourceId === node.id || e.targetId === node.id)
      .map((e) => ({
        nodeId: e.sourceId === node.id ? e.targetId : e.sourceId,
        relationship: e.description,
        edgeType: e.type,
      })),
    globalContext: domainOutput.nodeBusinessContext[node.id] ?? `${node.name} 是查询中的${node.type === "table" ? "数据表" : node.type === "column" ? "字段" : "函数"}`,
    teaching: null,
  }));
}

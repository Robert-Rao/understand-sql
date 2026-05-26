import { structuredAgentCall } from "@/lib/deepseek/client";
import { tourTeacherOutputSchema } from "@/lib/deepseek/schemas";
import { TOUR_TEACHER_PROMPT } from "./prompts";
import type { TourTeacherInput, TourTeacherOutput } from "./types";

export async function runTourTeacher(
  input: TourTeacherInput
): Promise<TourTeacherOutput> {
  const graphSummary = [
    `【SQL 方言】${input.dialect}`,
    `【原始 SQL】`,
    input.originalSql,
    ``,
    `【图谱节点 (${input.graph.nodes.length} 个)】`,
    ...input.graph.nodes.map((n) => {
      const base = `  - [${n.type}] id=${n.id} name=${n.name}`;
      if (n.type === "table") return base + ` source=${n.source} summary="${n.summary}"`;
      if (n.type === "column") return base + ` table=${n.tableId} summary="${n.summary}"`;
      return base + ` category=${n.category} isDialectSpecific=${n.isDialectSpecific} summary="${n.summary}"`;
    }),
    ``,
    `【图谱关系 (${input.graph.edges.length} 条)】`,
    ...input.graph.edges.map((e) => `  - [${e.type}] ${e.sourceId} → ${e.targetId}: ${e.description}`),
    ``,
    `【业务上下文 (部分节点)】`,
    ...Object.entries(input.domainOutput.nodeBusinessContext).slice(0, 10).map(
      ([id, ctx]) => `  - ${id}: ${ctx}`
    ),
    ``,
    `请为以上每个节点生成交互学习内容。`,
  ].join("\n");

  return structuredAgentCall<TourTeacherOutput>(
    TOUR_TEACHER_PROMPT,
    graphSummary,
    "sql-tour-teacher",
    1,
    16384
  );
}

import { structuredAgentCall } from "@/lib/deepseek/client";
import { reviewerOutputSchema } from "@/lib/deepseek/schemas";
import { REVIEWER_PROMPT } from "./prompts";
import type { ReviewerInput, ReviewerOutput } from "./types";

export async function runReviewer(input: ReviewerInput): Promise<ReviewerOutput> {
  const graphSummary = [
    `【SQL 方言】${input.dialect}`,
    `【原始 SQL】`,
    input.originalSql,
    ``,
    `【图谱概要】`,
    `节点 ${input.graph.nodes.length} 个:`,
    ...input.graph.nodes.map((n) => `  - [${n.type}] ${n.id}: ${n.name}`),
    `关系 ${input.graph.edges.length} 条:`,
    ...input.graph.edges.map((e) => `  - [${e.type}] ${e.sourceId} → ${e.targetId}: ${e.description}`),
    ``,
    `请审核以上图谱是否完整准确，是否有遗漏或错误。`,
  ].join("\n");

  return structuredAgentCall<ReviewerOutput>(
    REVIEWER_PROMPT,
    graphSummary,
    "graph-reviewer",
    1,
    2048
  );
}

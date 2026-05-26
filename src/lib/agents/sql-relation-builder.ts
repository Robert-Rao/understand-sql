import { structuredAgentCall } from "@/lib/deepseek/client";
import { relationBuilderOutputSchema } from "@/lib/deepseek/schemas";
import { RELATION_BUILDER_PROMPT } from "./prompts";
import type { RelationBuilderInput, RelationBuilderOutput } from "./types";

export async function runRelationBuilder(
  input: RelationBuilderInput
): Promise<RelationBuilderOutput> {
  const nodesSummary = [
    `【已抽取的节点】`,
    `表 (${input.nodes.tables.length} 个):`,
    ...input.nodes.tables.map((t) => `  - ${t.name}${t.alias ? ` (别名: ${t.alias})` : ""} [${t.source}] ${t.module}`),
    ``,
    `字段 (${input.nodes.columns.length} 个):`,
    ...input.nodes.columns.map((c) => `  - ${c.tableName}.${c.name} [${c.usedIn}]`),
    ``,
    `函数 (${input.nodes.functions.length} 个):`,
    ...input.nodes.functions.map((f) => `  - ${f.name} [${f.category}]`),
    ``,
    `【原始 SQL】`,
    input.cleanedSql,
    ``,
    `【方言】${input.dialect}`,
    ``,
    `请基于以上节点和 SQL，构建所有节点之间的五种关系(contains/join/uses/compute_depends/filter_depends)，并梳理执行流。`,
  ].join("\n");

  return structuredAgentCall<RelationBuilderOutput>(
    RELATION_BUILDER_PROMPT,
    nodesSummary,
    "sql-relation-builder"
  );
}

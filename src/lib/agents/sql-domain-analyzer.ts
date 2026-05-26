import { structuredAgentCall } from "@/lib/deepseek/client";
import { domainAnalyzerOutputSchema } from "@/lib/deepseek/schemas";
import { DOMAIN_ANALYZER_PROMPT } from "./prompts";
import type { DomainAnalyzerInput, DomainAnalyzerOutput } from "./types";

export async function runDomainAnalyzer(
  input: DomainAnalyzerInput
): Promise<DomainAnalyzerOutput> {
  const nodesSummary = [
    `【SQL 方言】${input.dialect}`,
    `【原始 SQL】`,
    input.sql,
    ``,
    `【已抽取节点摘要】`,
    `表: ${input.nodes.tables.map((t) => t.name).join(", ")}`,
    `字段: ${input.nodes.columns.map((c) => `${c.tableName}.${c.name}`).join(", ")}`,
    `函数: ${input.nodes.functions.map((f) => f.name).join(", ")}`,
    ``,
    `请将上面的 SQL 翻译成产品经理能读懂的中文业务解释。`,
  ].join("\n");

  return structuredAgentCall<DomainAnalyzerOutput>(
    DOMAIN_ANALYZER_PROMPT,
    nodesSummary,
    "sql-domain-analyzer",
    1,
    4096
  );
}

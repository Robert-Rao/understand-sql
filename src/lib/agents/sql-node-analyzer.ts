import { structuredAgentCall } from "@/lib/deepseek/client";
import { nodeAnalyzerOutputSchema } from "@/lib/deepseek/schemas";
import { NODE_ANALYZER_PROMPT } from "./prompts";
import type { NodeAnalyzerInput, NodeAnalyzerOutput } from "./types";

export async function runNodeAnalyzer(input: NodeAnalyzerInput): Promise<NodeAnalyzerOutput> {
  const userMessage = [
    `【SQL 方言】${input.dialect}`,
    `【清洗后的 SQL】`,
    input.cleanedSql,
    ``,
    `请穷举抽取以上 SQL 中的所有表、字段和函数节点。特别注意 WHERE、JOIN ON、HAVING 等子句中的字段和函数。`,
  ].join("\n");

  const result = await structuredAgentCall<NodeAnalyzerOutput>(
    NODE_ANALYZER_PROMPT,
    userMessage,
    "sql-node-analyzer"
  );

  return result;
}

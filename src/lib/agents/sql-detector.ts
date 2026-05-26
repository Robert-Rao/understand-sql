import { structuredAgentCall } from "@/lib/deepseek/client";
import { detectorOutputSchema } from "@/lib/deepseek/schemas";
import { DETECTOR_PROMPT } from "./prompts";
import type { DetectorInput, DetectorOutput } from "./types";

export async function runDetector(input: DetectorInput): Promise<DetectorOutput> {
  const userMessage = [
    `【用户声明的引擎】${input.declaredEngine}`,
    `【SQL 代码】`,
    input.rawSql,
  ].join("\n");

  const result = await structuredAgentCall<DetectorOutput>(
    DETECTOR_PROMPT,
    userMessage,
    "sql-detector",
    1,
    2048
  );

  return result;
}

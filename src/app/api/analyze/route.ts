import { NextRequest } from "next/server";
import { runPipeline } from "@/lib/agents/orchestrator";
import type { PipelineEvent } from "@/lib/agents/orchestrator";
import type { StreamEvent } from "@/types/api";
import type { SqlDialect } from "@/types/graph";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ sql: "", engine: "auto" }));
  const { sql, engine } = body as { sql: string; engine: SqlDialect | "auto" };

  if (!sql || !sql.trim()) {
    return Response.json({ success: false, error: "SQL 不能为空" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const result = await runPipeline(sql.trim(), engine, async (event: PipelineEvent) => {
          switch (event.type) {
            case "progress":
              send({ type: "progress", percent: event.percent, step: event.step });
              break;
            case "partial":
              if (event.module === "module1") {
                send({ type: "partial", module: "module1", data: event.data });
              } else {
                // Wrap GraphData in Module2Graph structure
                send({ type: "partial", module: "module2", data: { graphData: event.data } });
              }
              break;
          }
        });

        if (result.success && result.result) {
          send({ type: "complete", result: result.result });
        } else {
          send({
            type: "error",
            agent: "orchestrator",
            message: result.error ?? "分析失败",
            recoverable: false,
          });
        }
      } catch (err) {
        send({
          type: "error",
          agent: "orchestrator",
          message: err instanceof Error ? err.message : "分析过程发生未知错误",
          recoverable: false,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

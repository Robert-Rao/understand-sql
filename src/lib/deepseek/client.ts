import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "sk-placeholder",
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
});

const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export async function structuredAgentCall<T>(
  systemPrompt: string,
  userMessage: string,
  outputName: string,
  retries = 1,
  initialMaxTokens = 16384
): Promise<T> {
  let lastError: Error | null = null;
  let maxTokens = initialMaxTokens;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    try {
      console.log(`[${outputName}] 开始调用 (maxTokens=${maxTokens})...`);
      const start = Date.now();

      const response = await openai.chat.completions.create(
        {
          model: MODEL,
          temperature: 0,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        },
        { signal: controller.signal }
      );

      clearTimeout(timer);
      console.log(`[${outputName}] 完成，耗时 ${Date.now() - start}ms`);

      const rawText = response.choices[0]?.message?.content;
      if (!rawText) {
        throw new Error("DeepSeek 返回空响应");
      }

      // Strip markdown code fences if present
      let text = rawText.trim();
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }

      return JSON.parse(text) as T;
    } catch (err) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));

      if (err instanceof Error && err.name === "AbortError") {
        console.error(`[${outputName}] 请求超时 (30s)`);
        if (attempt < retries) {
          console.warn(`[${outputName}] 超时重试 (${attempt + 1}/${retries})`);
          continue;
        }
        throw new Error(`Agent ${outputName} 请求超时（已重试 ${retries} 次）`);
      }

      if (lastError instanceof SyntaxError) {
        const msg = lastError.message;
        if (/Unterminated string|Unexpected end of JSON|position \d+/.test(msg) && attempt < retries) {
          maxTokens = Math.min(maxTokens * 2, 65536);
          console.warn(`[${outputName}] JSON 被截断，增加 max_tokens 至 ${maxTokens} 重试...`);
          continue;
        }
        throw new Error(`Agent ${outputName} 返回了无效的 JSON: ${msg}`);
      }

      if (attempt < retries) {
        console.warn(`[${outputName}] 调用失败，重试中 (${attempt + 1}/${retries}):`, lastError.message);
      }
    }
  }

  throw new Error(`Agent ${outputName} 调用失败（已重试 ${retries} 次）: ${lastError?.message}`);
}

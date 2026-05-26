# sql-domain-analyzer（业务解析层）

## 职责
业务语义转化 Agent，负责将技术 SQL 逻辑翻译成通俗业务语言，适配弱 SQL 能力用户理解。

## 输入
```typescript
{
  sql: string;
  dialect: SqlDialect;
  nodes: NodeAnalyzerOutput;
}
```

## 输出
```typescript
{
  summary: Module1Summary;          // 一句话总览+业务解读
  logicBreakdown: Module4LogicBreakdown; // 逻辑拆解
  nodeBusinessContext: Record<string, string>; // 节点→业务说明
}
```

## Prompt 设计要点
1. **一句话总览**：< 50 字，涵盖业务目的、数据来源、计算逻辑、最终产出
2. **通俗语言**：避免技术术语，用类比（如"就像把订单表和客户表通过客户ID拼在一起"）
3. **JOIN 解读**：每个 JOIN 的作用和原因（为什么左连接而不是内连接？）
4. **筛选解读**：过滤了什么、为什么这么过滤
5. **聚合解读**：按什么维度分组、计算什么指标
6. **方言特性说明**：如 Presto 的三层目录、Hive 的分区特性、PG 的 :: 转换

## 错误处理
- API 调用失败 → 降级：使用 fallback output（基础摘要+空逻辑拆解）

## 与 sql-relation-builder 并行
二者均依赖 sql-node-analyzer 的输出，但相互独立：
- domain-analyzer 关注业务语义（"这段 SQL 在做什么"）
- relation-builder 关注结构关系（"什么连接什么"）

## 文件位置
`src/lib/agents/sql-domain-analyzer.ts` | `src/lib/agents/prompts.ts` (DOMAIN_ANALYZER_PROMPT)

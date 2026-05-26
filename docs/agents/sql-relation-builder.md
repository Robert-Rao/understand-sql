# sql-relation-builder（关系构建层）

## 职责
图谱逻辑构建核心 Agent，负责搭建所有节点关联关系，将零散节点串联为完整数据逻辑网络。

## 输入
```typescript
{
  nodes: NodeAnalyzerOutput;  // Agent 2 的输出
  cleanedSql: string;         // 原始 SQL
  dialect: SqlDialect;
}
```

## 输出
```typescript
{
  edges: RawEdgeDef[];        // 五种关系的边
  executionFlow: ExecutionStep[]; // SQL 执行优先级顺序
}
```

## 五种关系类型
| 关系 | 方向 | 示例 |
|------|------|------|
| contains | 表→字段 | orders → order_id |
| join | 表→表 | orders ↔ customers |
| uses | 节点→字段 | SELECT 中引用的字段 |
| compute_depends | 函数/计算字段→输入 | SUM(amount) → amount |
| filter_depends | 条件→字段 | WHERE created_at > ... → created_at |

## Prompt 设计要点
1. **每个字段必须有 contains 边**：指向所属表
2. **每对 JOIN 创建 join 边**：标明 JOIN 类型和条件
3. **函数输入参数创建 compute_depends**：如 `COALESCE(a,b)` → a, b
4. **WHERE/HAVING/ON/QUALIFY 创建 filter_depends**
5. **执行流梳理**：按 FROM→JOIN→WHERE→GROUP BY→HAVING→SELECT→ORDER BY→LIMIT 输出

## sourceLabel / targetLabel 格式
- 表：`"orders (o)"` 或 `"orders"`
- 字段：`"orders.order_id"`
- 函数：`"SUM(amount)"`

Orchestrator 中的 `assembleGraph()` 负责将这些 label 映射为标准化 node ID。

## 文件位置
`src/lib/agents/sql-relation-builder.ts` | `src/lib/agents/prompts.ts` (RELATION_BUILDER_PROMPT)

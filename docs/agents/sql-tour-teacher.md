# sql-tour-teacher（后续教学层）

## 职责
产品差异化核心 Agent，负责节点交互解析与 SQL 函数教学，兼顾可视化体验与学习能力。

## 输入
```typescript
{
  graph: GraphData;           // 完整图谱
  domainOutput: DomainAnalyzerOutput; // 业务背景
  originalSql: string;
  dialect: SqlDialect;
}
```

## 输出
```typescript
{
  nodeDetails: Module3NodeDetail[]; // 每个节点一个详情
}
```

每个节点详情包含：
- **nodeSummary**：一句话摘要
- **relatedNodes**：直接连接的节点及关系说明
- **globalContext**：该节点在整个 SQL 中的角色
- **teaching**：仅函数节点，包含专项教学内容

## 函数教学内容
| 维度 | 说明 |
|------|------|
| standardSyntax | 标准语法格式 |
| parameters | 参数名、类型、是否必填、描述 |
| useCases | 2-3 个实际业务场景 |
| examples | 1-2 个代码示例 |
| pitfalls | 2-3 个易错点 |
| difficulty | basic / intermediate / advanced |

## 难度判定
- **basic**: SUM, COUNT, AVG, COALESCE, DATE_FORMAT
- **intermediate**: ROW_NUMBER, RANK, LAG, DATE_TRUNC, CAST
- **advanced**: LATERAL VIEW EXPLODE, 复杂窗口帧, 方言专有奇函数

## 语言风格
- 友好教学语气，"为什么要用"而非"语法是什么"
- 关联实际业务场景

## 错误处理
- API 调用失败 → 降级：使用基础详情（无 teaching 字段）

## 文件位置
`src/lib/agents/sql-tour-teacher.ts` | `src/lib/agents/prompts.ts` (TOUR_TEACHER_PROMPT)

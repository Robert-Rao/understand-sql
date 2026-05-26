# graph-reviewer（图表复查层）

## 职责
图谱质量兜底校验 Agent，负责全方位核查节点、关系的完整性与准确性，统一图谱规范。

## 输入
```typescript
{
  originalSql: string;
  dialect: SqlDialect;
  graph: GraphData;  // 已组装的图谱数据
}
```

## 输出
```typescript
{
  isValid: boolean;
  issues: ReviewIssue[];   // 发现的问题列表
  summary: string;         // 中文审核结论
}
```

## 检查维度
1. **节点完整性**：SQL 中的每张表、每个字段、每个函数是否都在图谱中？
2. **关系完整性**：是否有遗漏的关联？是否有孤立节点？
3. **类型正确性**：节点分类是否正确？方言专属标注是否准确？
4. **方言适配**：该方言的特殊语法是否正确处理？

## 常见遗漏检查清单
- CTE 中定义的表和字段是否在 nodes 中？
- 子查询中的表和字段是否抽取？
- WHERE/JOIN ON/HAVING 中的函数和字段是否标记？
- 窗口函数的 PARTITION BY/ORDER BY 字段是否标记为 uses？
- CASE WHEN 中的条件和结果字段是否都提取？
- 聚合函数内部的字段是否有 compute_depends 边？

## 错误处理
- API 调用失败 → 降级：使用未校验图谱 + warnings
- isValid=false → 记录 issues 为 warnings，仍返回图谱

## 文件位置
`src/lib/agents/graph-reviewer.ts` | `src/lib/agents/prompts.ts` (REVIEWER_PROMPT)

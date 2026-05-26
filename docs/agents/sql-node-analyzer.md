# sql-node-analyzer（节点生成层）

## 职责
图谱核心数据生产 Agent，负责全域抽取 SQL 有效元素，生成标准化知识图谱基础节点。

## 输入
```typescript
{ cleanedSql: string; dialect: SqlDialect }
```

## 输出
```typescript
{
  tables: RawTableDef[];     // 表节点（物理表/CTE/子查询衍生表/临时表）
  columns: RawColumnDef[];   // 字段节点（含 usedIn 标识所在子句）
  functions: RawFunctionDef[]; // 函数节点（含分类和方言专属标注）
  metadata: {
    cteNames: string[];      // CTE 名称列表
    subqueryAliases: string[]; // 子查询别名列表
  }
}
```

## Prompt 设计要点
1. **穷举所有节点**：不遗漏任何表、字段、函数
2. **字段溯源**：标注字段出现在哪个子句（SELECT/WHERE/JOIN/GROUP BY 等）
3. **函数分类**：聚合/窗口/标量/字符串/日期/条件/类型转换/其他
4. **方言专属标注**：识别引擎特有的函数（如 Presto 的 `APPROX_DISTINCT`）
5. **模块归属**：将每个节点标记所属模块（主查询 / CTE:xxx / 子查询:xxx）
6. **易遗漏检查**：WHERE/JOIN ON/HAVING 中的字段和函数极易遗漏

## 函数分类规则
| 分类 | 示例 |
|------|------|
| aggregate | SUM, COUNT, AVG, MAX, MIN, GROUP_CONCAT |
| window | ROW_NUMBER, RANK, LAG, LEAD（必须有 OVER()） |
| scalar | ROUND, ABS, CEIL, FLOOR |
| string | CONCAT, SUBSTRING, UPPER, LOWER, TRIM |
| date | DATE_SUB, DATE_ADD, DATE_TRUNC, DATE_FORMAT |
| conditional | COALESCE, IFNULL, NULLIF, CASE WHEN |
| type_cast | CAST, CONVERT, :: 语法 |
| other | 无法归类的其他函数 |

## 文件位置
`src/lib/agents/sql-node-analyzer.ts` | `src/lib/agents/prompts.ts` (NODE_ANALYZER_PROMPT)

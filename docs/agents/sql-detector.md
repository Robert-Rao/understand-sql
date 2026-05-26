# sql-detector（初步识别层）

## 职责
项目入口前置 Agent，负责 SQL 内容识别、语法校验、代码预处理，是所有解析的基础。

## 输入
```typescript
{ rawSql: string; declaredEngine: "mysql" | "presto" | "hive" | "spark" | "pg" | "auto" }
```

## 输出
```typescript
{
  isValid: boolean;              // 是否为有效 SQL
  errorMessage: string | null;   // 中文错误说明
  detectedDialect: SqlDialect;   // 识别到的方言
  cleanedSql: string;            // 清洗后的 SQL
  statementTypes: string[];      // SELECT, INSERT, CREATE TABLE AS 等
  preprocessingNotes: string[];  // 预处理日志
}
```

## Prompt 设计要点
1. **校验优先**：先判断输入是否有效 SQL，拦截乱码、自然语言、其他编程语言
2. **方言特征识别**：通过关键词匹配识别方言
   - MySQL: `DATE_SUB`, `NOW()`, `IFNULL`, backtick
   - Presto: `QUALIFY`, `APPROX_DISTINCT`, 三层目录
   - Hive: `LATERAL VIEW EXPLODE`, `PARTITION()`, `GET_JSON_OBJECT`
   - Spark: `DISTRIBUTE BY`, `CLUSTER BY`
   - PG: `::` 转换, `ILIKE`, `RETURNING`
3. **清洗不修改逻辑**：只移除注释、压缩空格、统一分号
4. **声明 vs 实际矛盾**：若用户声明的引擎与代码特征矛盾，在 preprocessingNotes 标注

## 错误处理
- isValid=false → 管道立即终止，返回中文错误
- API 调用失败 → 重试 1 次，仍失败则管道终止

## 文件位置
`src/lib/agents/sql-detector.ts` | `src/lib/agents/prompts.ts` (DETECTOR_PROMPT)

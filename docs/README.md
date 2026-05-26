# Understand-SQL 总体设计

## 产品定位
一款**专业可视化 SQL 交互式知识图谱解析工具**，专属解析 MySQL / Presto / Hive / Spark / PostgreSQL 方言。

## 目标用户
SQL 能力薄弱的产品同学——无需逐行读代码，通过交互式图谱即可理解 SQL 的数据来源、关联逻辑和计算规则。

## 产品输出（4 模块）

1. **一句话极简总览** — 通俗总结核心业务目的、数据来源、计算逻辑、最终产出
2. **交互式知识图谱** — 三类节点（数据表/字段/SQL函数）+ 五种关系（包含/JOIN关联/查询使用/计算依赖/筛选依赖）
3. **全节点点击详情** — 每个节点可点击查看摘要、关联关系、全局导览；函数节点额外输出专项教学
4. **SQL 核心逻辑拆解** — 数据关联、筛选条件、聚合分组、执行优先级、引擎专属特性

## 技术架构

### 前端
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Cytoscape.js + dagre (知识图谱渲染，左到右层级布局)
- SSE 接收实时分析进度

### 后端
- Next.js API Route (单端点 POST /api/analyze)
- DeepSeek API (deepseek-chat 模型，OpenAI 兼容 SDK)
- Zod 校验所有 Agent 输出
- 6 Agent 串行管道（其中 2 步并行）

### 数据流
```
用户输入 → POST /api/analyze
→ sql-detector (校验+方言识别)
→ sql-node-analyzer (节点抽取)
→ sql-relation-builder (关系构建) ┬ 并行
→ sql-domain-analyzer (业务翻译) ┘
→ graph-reviewer (质量校验)
→ sql-tour-teacher (交互教学)
→ 组装 AnalysisResult → SSE 返回前端 → 渲染
```

## 部署
Vercel（原生支持 Next.js + SSE）

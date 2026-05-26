# Understand-SQL 项目指南

## 项目概要
SQL 知识图谱可视化网站。用户输入 SQL 引擎 + SQL 代码，系统通过 6 个 AI Agent（DeepSeek）协作解析，生成可交互的知识图谱。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + Cytoscape.js (图谱可视化) + dagre (层级布局)
- DeepSeek API (OpenAI 兼容 SDK) + Zod (结构化输出校验)
- SSE 流式传输

## 项目结构
```
src/
├── app/api/analyze/route.ts    # 单 API 端点 (POST, SSE)
├── app/page.tsx / layout.tsx   # 主页面 + 根布局
├── lib/
│   ├── agents/                 # 6 个 Agent + 编排器 + prompts
│   ├── deepseek/               # DeepSeek 客户端封装 + Zod schemas
│   ├── cytoscape-utils.ts      # 图谱样式 + 数据映射
│   └── sample-sqls.ts          # 示例 SQL 预设
├── components/                 # UI 组件
│   ├── input/                  # SqlInputPanel + EngineSelector
│   ├── output/                 # SummaryBanner, KnowledgeGraph, NodeDetailPanel, LogicBreakdown
│   ├── graph/                  # GraphCanvas (Cytoscape), GraphLegend
│   └── common/                 # ProgressIndicator, ErrorBoundary
├── context/AnalysisContext.tsx # 全局状态管理 (useReducer)
├── hooks/                      # useAnalysis, useNodeDetail
└── types/                      # graph.ts, analysis.ts, api.ts
docs/                           # 项目文档
```

## 开发命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
```

## 环境变量 (.env.local)
```
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

## Agent 编排
```
sql-detector → sql-node-analyzer → sql-relation-builder ┬ (并行)
                                   sql-domain-analyzer  ┘
→ graph-reviewer → sql-tour-teacher
```
全部通过 SSE 流式返回进度。

## 关键文件
- `src/lib/agents/prompts.ts` — 6 个 Agent 的 System Prompt，决定输出质量
- `src/lib/agents/orchestrator.ts` — Pipeline 编排 + 图谱组装
- `src/lib/deepseek/schemas.ts` — 所有 Zod 校验 schema
- `src/components/graph/GraphCanvas.tsx` — Cytoscape.js 图谱渲染
- `src/types/graph.ts` — 核心数据模型

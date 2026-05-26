# 架构设计：Agent 编排与数据流

## Agent Pipeline

```
sql-detector ──▶ sql-node-analyzer ──▶ sql-relation-builder ┬ (并行)
              (校验+方言)  (节点抽取)   sql-domain-analyzer  ┘ (关系构建+业务翻译)
                                          │
                                          ▼
                                   graph-reviewer ──▶ sql-tour-teacher ──▶ 组装结果
                                   (图谱校验)          (交互教学)
```

## 总耗时估算
每个 Agent 调用 DeepSeek API 约 2-5 秒。步骤 3+4 并行执行，5 步串行总计约 10-20 秒。

## 渐进式交付策略
为改善用户体验，管道采用增量推送，避免长时间白屏：

| 进度 | 事件 step | 阶段说明 |
|------|-----------|---------|
| 0-30% | `summary` | 解析 SQL 结构，提取节点 |
| 30-55% | `summary` | 并行执行关系构建 + 业务翻译 |
| **55%** | — | `partial module1`(概览) + `partial module2`(图谱)，前端即刻渲染 |
| 55-75% | `graph` | 图谱质量校验 |
| 75-100% | `details` | 生成节点详情 + 函数教学 |
| **100%** | `complete` | 包含 module3(节点详情) + module4(逻辑拆解) |

前端策略：
- 分析开始时，4 个模块区域同时显示**骨架屏**（脉动灰色占位块）
- `partial` 事件到达后，对应模块骨架屏替换为真实内容
- 用户体验：~3s 看到概览+图谱，~6s 看到全部内容

## 图谱组装流程
1. Agent 2 输出原始节点 (RawTableDef, RawColumnDef, RawFunctionDef)
2. Agent 3 输出原始边 (使用 label 而非 ID)
3. Orchestrator 中的 `assembleGraph()` 函数负责：
   - 为节点生成标准化 ID (table:xxx, column:xxx, function:xxx)
   - 构建 label→ID 映射表
   - 将 RawEdgeDef 的 sourceLabel/targetLabel 匹配到实际的 node ID
   - 跳过引用不存在节点的边（容错处理）
   - 去重边、生成最终 GraphData

## SSE 事件流
```
event: progress    → { type: "progress", percent: number, step: "summary"|"graph"|"details" }
event: partial     → { type: "partial", module: "module1"|"module2", data: Module1Summary|Module2Graph }
event: complete    → { type: "complete", result: AnalysisResult }
event: error       → { type: "error", agent: string, message: string, recoverable: boolean }
```

## 错误处理策略
- **sql-detector 失败** → 致命错误，终止管道，返回错误
- **sql-node-analyzer 失败** → 致命错误
- **sql-relation-builder 失败** → 致命错误
- **sql-domain-analyzer 失败** → 可恢复，使用降级方案（fallback output）
- **graph-reviewer 失败** → 可恢复，使用未校验图谱 + 警告
- **sql-tour-teacher 失败** → 可恢复，使用基础详情（无教学）+ 警告

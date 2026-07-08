# 更新日志

> 说明：本文件记录**工作区内部**的项目演进（异兽学院 / 阴间考编等）。
> 下方「openclaw-workspace 公开框架」段记录**本仓库（对外开源模板）**自身的迭代。

## openclaw-workspace 公开框架（仓库级更新）

### 2026-07-09（Observer Agent 自动审查冲刺 · 本地，未推送）
- 新增 **Observer Agent** `scripts/ci/observer.mjs`：纯函数、零密钥的自动化 PR/改动审查器，堵住四类风险：
  - 禁入库路径守卫（`.env` / `config/openclaw.json` / 个人数据目录如 `novel/` `gbrain/` `workspace/memory/` 等）
  - 明文密钥扫描（常见前缀 `ghp_` / `sk-` / `AKIA` / JWT + 高熵串；误报控制：跳过 `.example` 模板与占位符行）
  - 语法门禁（对每个 `.js/.mjs/.cjs` 跑 `node --check`）
  - 智能体契约路径安全（拒绝越界 / 指向禁改文件）
- 新增 `tests/observer.test.mjs`（11 个测试）：覆盖四类规则的正例/反例与 `runReview` 集成
- 接入：`Makefile`/`dev.sh` 新增 `observer` 命令；`.githooks/pre-commit` 提交前串接 observer；新增 `.github/workflows/observer.yml`（PR 时自动审，仅仓库文件、未推送）
- 测试总量从 34 → **45**（smoke 8 + validate-config 4 + edge-cases 14 + scaffold 8 + observer 11），全绿
- `ROADMAP.md`：Observer Agent（Next→Done）；`CHANGELOG`/`README`/`AGENTS.md` 同步

### 2026-07-09（CI硬化 + 开发体验冲刺 · 本地，未推送）
- **CI 硬化**：`node-check.yml` 从仅语法检查升级为跑完整 `make healthcheck`（语法 + 配置校验 + 全量测试），CI 与本地质量门完全一致，坏测试的 PR 不再能过关
- 新增 **预提交钩子**：`.githooks/pre-commit`（提交前本地跑 healthcheck）+ `scripts/install-hooks.sh` 一键安装，`Makefile`/`dev.sh` 新增 `install-hooks` 命令
- 新增 **脚手架脚本** `scripts/scaffold.mjs`：一条命令从模板生成新技能（`examples/<slug>/SKILL.md`+`run.mjs`）或新智能体（`examples/agent-<slug>.md`），降低贡献门槛
- 新增 `tests/scaffold.test.mjs`（8 个测试）：覆盖 kebab 归一化、skill/agent 文件生成、非法类型/空名/空 slug 拒绝、路径安全
- 测试总量从 26 → **34**（smoke 8 + validate-config 4 + edge-cases 14 + scaffold 8），全绿
- `ROADMAP.md`：标记 scaffolder（Next→Done）、pre-commit hook（Later→Done）；`CHANGELOG`/`README` 同步

### 2026-07-09（专业度成熟冲刺 · 本地，未推送）
- 新增 `.editorconfig`：统一编码风格（UTF-8、2空格缩进、LF换行），跨编辑器一致
- 新增 `CODE_OF_CONDUCT.md`：Contributor Covenant 2.1 行为准则，专业开源项目标配
- 新增 `.github/dependabot.yml`：GitHub Actions 依赖每周自动安全更新
- 新增 `tests/edge-cases.test.mjs`（14 个测试）：覆盖空输入、null byte、深层路径逃逸、多文件 payload、无 fence 原始 JSON、垃圾文本等边界场景
- `scripts/agent/respond.mjs` 鲁棒性增强：
  - `callLLM()` 加超时控制（默认 120s，可通过 `LLM_TIMEOUT_MS` 覆盖）
  - 瞬态故障自动重试（`LLM_RETRIES` 次，覆盖 ECONNRESET/ECONNREFUSED）
  - LLM 响应体大小上限 2MB（防 OOM）
  - `parseFiles()` 改进错误诊断：区分空输入 / 非法 JSON / 非 array 类型，附带原始内容片段
  - `safePath()` 新增 null byte 检测（安全加固）
- `docs/ARCHITECTURE.md` 重写：去品牌化、新增系统架构图 + 自主智能体管线流程图 + CI 质量门表格 + 可观测性说明
- 测试总量从 12 → **26**（smoke 8 + validate-config 4 + edge-cases 14），全绿通过
- `ROADMAP.md` 标记本轮所有完成项

### 2026-07-09（质量冲刺 · 本地，未推送）
- 新增 `QUICKSTART.md`：5 分钟从零跑起（本地零密钥 + 框架部署两种路径）
- 新增 `scripts/ci/validate-config.mjs` + `tests/validate-config.test.mjs`：配置优先（config-first）质量门禁，校验发布版 `.env.example` 与 `config/openclaw.json.example` 形态
- 新增 `examples/`：`sample-skill/`（通用技能模板，含可运行 `run.mjs`）+ `agent-task-sample.md`（展示智能体契约格式）
- `scripts/agent/respond.mjs`：增加轻量运行日志 `.agent-runs/*.jsonl`（可观测性种子，非致命，已 gitignore），贯穿任务/写文件/校验/提交/错误节点
- `Makefile` / `scripts/dev.sh` / `scripts/dev.ps1`：新增 `validate` 与 `healthcheck`（check+validate+test 一气呵成）命令
- `AGENTS.md` / `README.md` / `ROADMAP.md` / `CHANGELOG.md`：接新内容与入口
- 设计依据：调研生产级 agent 框架标杆（配置校验、评估/可观测性、示例模板、快速上手）

### 2026-07-08（自主迭代 · 本地）
- 新增 `scripts/ci/check-syntax.mjs`：统一的 `node --check` 扫描（CI / `make check` / 测试共用）
- 新增 `tests/smoke.test.mjs`：覆盖真实导出逻辑（`safePath` / `parseFiles` / 语法扫描）的功能冒烟测试
- `scripts/agent/respond.mjs`：导出 `safePath` / `parseFiles` 并加主模块守卫，使测试可安全导入；`node` 调用改用 `process.execPath`
- 新增契约式交互规范 `docs/AGENT_CONTRACT.md`（任务格式 / 改动 JSON / 路径安全 / 反馈契约）
- 新增开发者命令入口：`Makefile` + `scripts/dev.sh` + `scripts/dev.ps1`（`check` / `test` / `run-agent` / `install`）
- 新增 `SECURITY.md`、`ROADMAP.md`
- `AGENTS.md` / `README.md`：补充测试、契约、路线图、徽章与「自主智能体（本地零密钥）」说明
- 设计依据：全网调研多智能体最佳实践（契约式交互、Router/Observer、共享记忆、增量灰度、强仓库文档结构）

### 2026-07-08（早期）
- 去个人化改造：零硬编码路径、`.example` 模板、`.gitignore` 排除本地数据
- 双语 README + 仓库设为 Template
- `AGENTS.md` / `CLAUDE.md` / `CONTRIBUTING.md` + PR / Issue 模板
- GitHub Actions：`node-check`（语法）+ `agent-respond`（自动开 PR）
- 本地免密钥模式（指向本机 Ollama）

## 2026-07-08

### 项目转向
- 异兽学院v1-v4全部废弃
- 新项目：阴间考编 v1.2（黑色幽默女频漫剧向小说）
- 世界观v1.2完成（58609字节）
- 第1-7章正文完成（累计30435字）
- EP01-03漫剧分镜完成

### 系统升级
- Token优化8项全落地（contextPruning/maxConcurrent/心跳/Skills精简等）
- 团队扩至9人（新增多媒体制作人+商业化策略师）
- 自进化三路闭环（auto-heal/creation-feedback/skill-discovery）
- gbrain知识库激活（7个核心page）
- 仪表盘升级至11面板
- workspace从45→8核心文件

## 2026-07-06 ~ 07-07

### 异兽学院链（已废弃）
- v1-v4世界观全部废弃
- 第1-3章旧版废弃
- 10→9 Agent团队重组
- 协议v2.3落地
- 抖音收藏三路调研（270→144条AI相关）

## 2026-06-28 ~ 07-05

### 基础设施建设
- 10 Agent团队基础搭建
- 经验池v2.0
- 记忆系统（compose-context.js）
- 仪表盘搭建
- Headroom+RTK+codegraph安装
- cron从并行改串行
- 系统健康度85→92/100

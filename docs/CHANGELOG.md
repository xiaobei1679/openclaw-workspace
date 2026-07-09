# 更新日志

> 说明：本文件记录**工作区内部**的项目演进（异兽学院 / 阴间考编等）。
> 下方「openclaw-workspace 公开框架」段记录**本仓库（对外开源模板）**自身的迭代。

## openclaw-workspace 公开框架（仓库级更新）

### 2026-07-09（采集信息→框架改进中立桥梁 · 特性级 · 本地，未推送）
- 新增 **「采集信息 → 框架改进」桥梁** `scripts/evolve/ingest.mjs`：把中立采集到的洞察（小说/漫剧/音乐/独立游戏调研等）解析→分类→产出**框架级**改进提案，补上"审核员消费采集信息→作用到项目"缺失的那半环（特性级，零依赖）：
  - `parseInsight()`：容错解析 H1 标题 + `<!-- insight-meta -->` 块（tags/source）+ 正文
  - `classifyInsight()`：按标签/关键词归类到 prompt-template / agent-role / skill / qa-heuristic / doc / other
  - `toProposal()`：产出结构化提案（id / 类别 / 建议落点 / 动作），落点均为去项目化的框架路径（如 `examples/agents/<id>.md`、`examples/<id>/SKILL.md`）
  - `ingestDir()` / `renderProposal()`：批量摄入 + 中立 Markdown 卡片渲染；CLI `node scripts/evolve/ingest.mjs [dir] [--write]`，默认输入 `./insights`（可经 `OPENCLAW_INSIGHTS_DIR` 覆盖）
  - 设计原则：**只蒸馏可复用框架改进，绝不写入任何具体项目内容**——中立身份
- 新增 `tests/ingest.test.mjs`（11 测试）：覆盖 slug 归一化、meta 解析、标签/关键词分类、提案形态、agent-role→agents 路径、批量摄入、缺目录报错
- 接入：`Makefile` / `scripts/dev.sh` 新增 `evolve` 命令（列出现有提案）
- 调研依据：用户明确架构——"审核员审核收集的信息直接作用到项目"；本桥梁将"采集到的信息"与"框架改进"解耦，使审核员（reviewer.mjs / 人工）只需对**提案**做采纳判定，而非对原始项目数据做处理
- `ROADMAP.md`：采集信息→框架改进桥梁（Done）；Next 新增"闭环采集→审核员→应用"（默认洞察源接 `AI创作日报/`）

### 2026-07-09（Agent 角色预设库 · 特性级 · 本地，未推送）
- 完成 **ROADMAP Later「More out-of-the-box agent roles」**：新增**零依赖、可验证的智能体角色预设库**，降低贡献门槛（克隆预设填充即可，无需从零设计角色）：
  - `examples/agents/*.md`：6 个开箱即用角色预设（reviewer / writer / memory-keeper / researcher / coder / qa），每个用统一契约（`<!-- role-meta -->` 元数据块 + 正文系统提示）描述，中文在前
  - `scripts/agent/roles.mjs`：零依赖加载器，导出 `parseMeta` / `validateRole` / `loadRole` / `loadRoles` / `getRole`，可校验 id 格式、必填字段、重复 id，CLI `node scripts/agent/roles.mjs [dir]` 输出 JSON 清单
  - `tests/roles.test.mjs`（8 测试）：覆盖元数据解析、必填校验、id 格式、单文件加载、缺块无效、真实预设全绿且 id 唯一、getRole 命中/未命中
  - 接入：`Makefile` / `scripts/dev.sh` 新增 `roles` 命令（列出现有预设）
- 调研依据：Anthropic《Building Effective Agents》六大可组合模式（reviewer↔evaluator-optimizer、coder↔orchestrator-workers、researcher↔parallelization）；CrewAI 的 Role+Task+Crew 角色抽象；多框架对比文（CrewAI 角色扮演 / LangGraph 状态机 / AutoGen 对话）显示"角色预设"是降低编排门槛的通用做法
- `ROADMAP.md`：More out-of-the-box agent roles（Later→Done）

### 2026-07-09（i18n docs：docs/ 中英双语化 · 本地，未推送）
- 完成 **ROADMAP Next「i18n docs」**：把对外文档统一为「中文在前、英文在后」的单文件双语（文档级，低风险高价值）：
  - `docs/ARCHITECTURE.md` 改写：新增完整中文翻译段（系统总览 / 自主智能体管线 / 智能体团队 / 脚本系统 / CI 质量门 / 记忆层级 / 可观测性），英文原文保留在后；ASCII 架构图语言无关，中英共用
  - 新增 `docs/README.md` 双语索引：说明 i18n 约定并列出全部对外文档（AGENT_CONTRACT / ARCHITECTURE / CHANGELOG）与根目录入口，提升可导航性
  - `AGENTS.md`「See also」新增指向 `docs/README.md` 文档中心
- 调研依据：OSS 文档 i18n 最佳实践——中小型项目用「单文件双语（同文件中文段+英文段）」优于多语言分目录（i18next 文档、JavaGuide 国际化指南）；本仓库 `AGENT_CONTRACT.md` 已采用此约定，本次统一补齐 `ARCHITECTURE.md` 并建索引；参考 crewAI 等框架的清晰文档结构（项目布局 + 开发循环 + 结构化输出）
- 质量门影响：纯 Markdown 改动，不触及任何 `.js/.mjs` 质量门脚本与 `scripts/eval/`；`node --check` / `validate-config` / `tests` / `observer` 不受影响
- `ROADMAP.md`：i18n docs（Next→Done）

### 2026-07-09（Eval 评估支柱 + 修复 Reviewer 缺失模块 · 本地，未推送）
- 新增 **Eval 评估工具** `scripts/eval/eval.mjs`：把"评估支柱"做成零依赖、可 CI 门禁的**回归 + 漂移监控**工具（特性级）：
  - 第 1 层（确定性，常驻 CI、零密钥）：对仓库既有纯函数 agent（router / observer / scaffold）的固定输入断言"不变量"——确定性、契约形态、禁路径守卫、密钥扫描正负例、slug 归一化；任一失败即红
  - 第 2 层（LLM-as-judge，可选门）：仅当配置 `EVAL_LLM_BASE_URL` 才跑，对样例 agent 输出按 rubric 打 1-5 分；CI 不配则不跑、绝不阻塞
  - 漂移监控：`--baseline` 快照各用例产物 → `scripts/eval/.eval-baseline.json`（已 gitignore）；`--compare` 与基线比（token Jaccard 作为语义相似度代理），相似度 <0.98 即告警
- 新增 `tests/eval.test.mjs`（11 个测试）：覆盖全部确定性用例 + similarity 同输入=1 + compareBaseline 无漂移/有漂移
- **修复既有缺陷**：`scripts/ci/reviewer.mjs` 此前被 `tests/reviewer.test.mjs` 引用却从未创建，导致测试套件长期 4 个失败；本次补建该"Reviewer Agent"（聚合 syntax / config / observer / tests 得出结构化判定 `runReviewer / verdict / formatReport / runCheck`），套件恢复全绿（75/75）
- 接入：`Makefile` 新增 `eval` 与 `reviewer` 目标并加入 `healthcheck`；`.github/workflows/node-check.yml` 在测试后增加 `node scripts/eval/eval.mjs`；`.gitignore` 忽略基线快照
- 调研依据：Anthropic《Demystifying evals for AI agents》(2026-01) 确定性断言与概率性断言并重；Google 多智能体评估 codelab 自动化回归管线；attest-framework 把确定性断言作为一等公民；zylos Agent-native CI 用 Shadow Mode 做漂移监控
- 测试套件恢复全绿（**75/75**，此前 4 个长期失败）

### 2026-07-09（Router Agent 任务路由冲刺 · 本地，未推送）
- 新增 **Router Agent** `scripts/agent/router.mjs`：纯函数、零密钥的**确定性任务规划/路由**器，无需 LLM：
  - `classifyIntent()` / `scoreIntent()`：识别主导意图（research / coding / writing / review / data， fallback general），并给出置信度（high/medium/low）
  - `decompose()`：按句末标点与步骤连接词（并 / 然后 / 另外 / and then…）把任务拆成子步骤
  - `route()`：把每个子句路由到注册表（`DEFAULT_REGISTRY`）中的专家 agent，输出结构化计划（task / intent / primaryAgent / subtasks / confidence / fallback / truncated）
  - `resolveAgent()`：无对应专家时回落到 generalist，保证永远有路由结果
- 新增 `tests/router.test.mjs`（14 个测试）：覆盖五类意图正/反例、general 回落、decompose 拆分、resolveAgent 专家选择、route 计划形态、多步路由、空任务抛错、自定义注册表、超长任务截断、确定性（同输入同输出）
- 接入：`Makefile` 新增 `router`（`$(NODE) scripts/agent/router.mjs $(ARGS)`）；`scripts/dev.sh` 新增 `router)` case；`ROADMAP.md` Router Agent（Next→Done）
- 测试总量从 45 → **59**（smoke 8 + validate-config 4 + edge-cases 14 + scaffold 8 + observer 11 + router 14），全绿
- 设计依据：多智能体框架的 Router/Observer 分工——Observer 守门（安全/质量），Router 分活（把一个任务派给对的专家），二者皆为零密钥确定性逻辑，可离线运行

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

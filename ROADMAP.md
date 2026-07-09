# Roadmap — openclaw-workspace

> Living backlog. The recurring "auto-improve" automation (see `AGENTS.md`) pulls from
> here and the web to make this repo stronger over time. The 30-minute auto-iteration
> automation pushes `origin/main` only after the Reviewer specialist (`scripts/ci/reviewer.mjs`)
> returns PASS — no human confirmation required, but the gate is mandatory.

## Done ✅
- Turnkey de-personalization (zero hardcoded paths, `.example` templates, `.gitignore` for local data)
- Bilingual README + repo set as **Template**
- `AGENTS.md` / `CLAUDE.md` / `CONTRIBUTING.md` + PR & issue templates
- GitHub Actions: `node-check` (syntax) + `agent-respond` (autonomous PRs)
- Local, **zero-key** agent mode via Ollama
- Functional smoke tests (`tests/smoke.test.mjs`) + `scripts/ci/check-syntax.mjs`
- Contract-based agent interaction spec (`docs/AGENT_CONTRACT.md`)
- Unified dev commands (`Makefile`, `scripts/dev.sh`, `scripts/dev.ps1`)
- `SECURITY.md`
- Examples gallery (`examples/`): copy-paste skill template + sample agent task
- Config validation gate (`scripts/ci/validate-config.mjs` + `tests/validate-config.test.mjs`) — config-first quality gate
- Lightweight run tracing (`scripts/agent/respond.mjs` → `.agent-runs/*.jsonl`) — production-grade observability seed
- `QUICKSTART.md` + `make healthcheck` (check + validate + test in one pass)
- **`.editorconfig`** — consistent coding style across editors (OSS standard)
- **`CODE_OF_CONDUCT.md`** — Contributor Covenant 2.1
- **`.github/dependabot.yml`** — automatic security updates for GitHub Actions
- **Edge-case test suite** (`tests/edge-cases.test.mjs`, 14 tests) — null bytes, empty inputs, deep escapes, multi-file payloads, non-standard fences
- **LLM call hardening**: timeout (120s default), retry on transient errors, response size cap (2 MB), improved parse error diagnostics
- **Null-byte path rejection** in `safePath()` (security hardening)
- **Architecture diagrams** in `docs/ARCHITECTURE.md`: system overview + autonomous pipeline flow
- **Skill/agent scaffolder** (`scripts/scaffold.mjs` + `tests/scaffold.test.mjs`) — one-command starter skill/agent from template; lowers contribution friction
- **Pre-commit hook** (`.githooks/pre-commit` + `scripts/install-hooks.sh`, `make install-hooks`) — runs the local healthcheck before each commit
- **CI hardening**: `node-check.yml` now runs the full `make healthcheck` (syntax + config + tests), not just `node --check` — a PR that breaks tests can no longer pass CI
- **Observer Agent** (`scripts/ci/observer.mjs` + `tests/observer.test.mjs`) — automated change/PR reviewer: protected-path guard, secret scan, syntax gate, agent-contract path safety; wired into `make observer`, the pre-commit hook, and `.github/workflows/observer.yml`
- **Router Agent** (`scripts/agent/router.mjs` + `tests/router.test.mjs`) — deterministic task planner/router: classifies intent (research/coding/writing/review/data), decomposes a task into clauses, and routes each to a specialist agent from a configurable registry; backed by `make router` / `scripts/dev.sh router` and importable by an LLM-driven agent
- **Eval harness** (`scripts/eval/eval.mjs` + `tests/eval.test.mjs`) — the "evaluation pillar": zero-dep, CI-gated deterministic regression over the repo's pure agents (router/observer/scaffold), with an optional LLM-as-judge layer (gated by `EVAL_LLM_BASE_URL`) and `--baseline`/`--compare` drift monitoring; wired into `make eval` / `healthcheck` and `node-check.yml`
- **Reviewer Agent (专员审核)** (`scripts/ci/reviewer.mjs` + `tests/reviewer.test.mjs`) — local full-tree review gate that aggregates syntax + config + observer + tests into one structured PASS/FAIL verdict (`runReviewer` / `verdict` / `formatReport` / `runCheck`); the engine behind `make reviewer` and the gate that lets the 30-minute automation auto-push `origin/main` only on PASS
- **Drift monitoring** — delivered inside the Eval harness via `--baseline` / `--compare` (token-overlap similarity as a zero-dep semantic-similarity proxy, flags drift < 0.98)
- **i18n docs** — `docs/` is now consistently bilingual (Chinese first, English after): `ARCHITECTURE.md` rewritten with a full Chinese translation (system overview / autonomous pipeline / agent team / script system / CI gates / memory layers / observability), plus a new `docs/README.md` index that states the bilingual convention and links every public doc; `AGENTS.md` "See also" now points to the docs index
- **Agent role presets** (`examples/agents/*.md` + `scripts/agent/roles.mjs` + `tests/roles.test.mjs`) — a zero-dep, verified library of reusable role definitions (reviewer / writer / memory-keeper / researcher / coder / qa / **security-auditor**) with a structured loader (`loadRole` / `loadRoles` / `getRole` / `validateRole`) and a `make roles` / `dev.sh roles` listing command; lowers contribution friction by cloning a preset instead of designing a role from scratch
- **「采集信息 → 框架改进」中立桥梁** (`scripts/evolve/ingest.mjs` + `tests/ingest.test.mjs`) — 把中立采集到的洞察（小说/漫剧/音乐/独立游戏调研等）解析→分类→产出**框架级**改进提案（prompt-template / agent-role / skill / qa-heuristic / doc）；纯函数、零依赖、CLI `make evolve`；补上"审核员消费采集信息→作用到项目"缺失的那半环
- **闭环「采集 → 审核员 → 应用」**：把 `make evolve` 默认洞察源指向中立示例 `examples/insights/`，并落实 qa-heuristic 提案的真实落点——新增零依赖 `workspace/.learnings/scripts/style-engine.mjs`（文风自检：识别客套开场 / AI 腔过渡词 / 空泛夸张词 / 过长句 / 被动滥用 / 段落重复起句，输出 0-100 评分 + 结构化问题清单），配 `tests/style-engine.test.mjs`（8 测试）。至此"审核员审核收集的信息直接作用到项目"端到端跑通：采集（中立示例）→ `make evolve` 蒸馏提案 → 审核员门禁 → 落为框架改进
- **轻量框架状态仪表盘**（特性级，零依赖）：新增 `scripts/dashboard.mjs`——扫描仓库框架级状态（Agent 预设 / 配置角色 / 测试数 / 脚本数 / 文档数 / 路线图进度 / 质量门禁健康）并生成**单文件、纯静态、可离线打开**的 `dashboard/index.html`（自包含内联 CSS，无任何 CDN/外链）。完全去个人化（不复用旧 `dashboard-data.js` 的个人项目统计），配套 `tests/dashboard.test.mjs`（13 测试，含解析/计数/HTML 确定性/HTML 注入转义），`Makefile`/`dev.sh`/`dev.ps1` 新增 `dashboard` 命令，`.dashboard/` 加入 `.gitignore`（生成物不入库）
- **Adapter 层（LLM 多厂商统一）**（特性级，零依赖）：新增 `scripts/llm/adapter.mjs`——把"同一套 agent 脚本在 OpenAI / DeepSeek / Qwen(DashScope) / Moonshot(Kimi) / SiliconFlow / Ollama 上统一运行"做成薄适配层；`normalizeProviderName`/`resolveProvider`/`buildConfig`/`chatCompletionsUrl`/`buildHeaders`/`normalizeMessages`/`parseCompletion`/`createClient` 纯函数可单测，`buildConfig` 优先级（显式 baseUrl 覆盖 provider 默认值）与旧 `LLM_BASE_URL/LLM_MODEL/LLM_API_KEY` 流程**行为完全等价**。已接入 `respond.mjs`（仅多一行 import、`LLM_PROVIDER` 驱动，未设置时回退 OpenAI 默认），配套 `tests/adapter.test.mjs`（15 测试）、`make llm-adapter`/`dev.sh llm-adapter`/`dev.ps1 llm-adapter`、`examples/llm-providers.md` 示例、`QUICKSTART.md` 与 `.env.example` 文档同步
- **Release workflow**（tags → changelog → GitHub Release）（特性级，零依赖配套）：新增 `.github/workflows/release.yml`——**仅当人类手动推送语义化 tag（如 `v1.0.0`）或手动 `workflow_dispatch` 时触发**，使用 GitHub 自动注入的 `GITHUB_TOKEN`（无需任何用户密钥），先跑完整 healthcheck 再创建 Release；本地每小时自动化工位绝不打 tag，永不触发此流程。配套零依赖 `scripts/release/notes.mjs`（解析 `CHANGELOG.md` 的「openclaw-workspace 公开框架」段、剥离内部「本地，未推送」标记、生成发布说明）+ `tests/release-notes.test.mjs`；`Makefile`/`dev.sh`/`dev.ps1` 新增 `release-notes`；顺带补齐 Windows 侧 `dev.ps1`（此前落后于 `dev.sh`/`Makefile`：缺 `install-hooks`/`observer`/`router`/`reviewer`/`roles`/`evolve`，本次一并补齐）
- **离线端到端冒烟（agent 管线契约路径，无需真实 LLM）**（特性级，零依赖）：给 `scripts/agent/respond.mjs` 的 `callLLM` 加可注入 `fetch` 缝（与 adapter 对称）；新增 `runAgentOffline({ task, fetchImpl })` 导出——离线、无磁盘写入、不碰 git 地跑通"任务 → 提示词 → LLM(假) → parseFiles → safePath 校验"全契约路径，配 `tests/respond.test.mjs`（15 测试，Tier-1 stub fake）。沙箱无法做"真实 Ollama 端到端"，本项是等价离线验证，也让"自主迭代自动化工位"无需密钥即可证明管线契约有效
- **Agent 本地提交路径可离线验证（可注入 git 后端缝）**（特性级，零依赖）：`scripts/agent/respond.mjs` 的本地提交逻辑抽取为 `commitLocally({ title, now, git })` 纯函数——默认走真实 `defaultGit`（`execSync` 包裹），行为与原内联实现**完全等价**；与 `callLLM` 的 `opts.fetch`、`adapter` 的 `createClient` 同一套"依赖注入缝"理念。智能体的 git 工具调用（`checkout -B` / `add -A` / 固定 bot 身份 commit 且 pipe stdout）现可经注入假后端做**离线契约测试**（呼应 tianpan.co《three-layer CI for agents》的"工具契约测试"），配套 `tests/respond.test.mjs` 断言精确命令序列
- **环境预检 `doctor` 命令**（特性级，零依赖）：新增 `scripts/doctor.mjs`——本仓库核心是「开箱即跑（turnkey）」，但 `make healthcheck` 只验代码层；`doctor` 补上**环境就绪层**：7 项检查（Node>=18 / git / shell(bash|pwsh) / `.env` 或模板 / `config/openclaw.json` 或模板 / LLM 后端就绪 / 五大质量门禁脚本存在性），纯函数 + 可注入 IO 边界离线可单测；退出码仅当 error 级失败时非 0、warn 级仅提示不阻断（分级同 npm doctor）。配套 `tests/doctor.test.mjs`（20 测试），`Makefile`/`dev.sh`/`dev.ps1` 新增 `doctor`，`QUICKSTART.md`/`AGENTS.md` 同步「doctor 验环境、healthcheck 验代码」互补说明

## In progress 🚧
- End-to-end verification of the local agent with a **real** local LLM (Ollama `qwen2.5-coder:3b`)

## Next 🔜 (high value, low risk)
- **可选：接入真实中立采集源**：把每日中立创作素材分析（`AI创作日报/`）设为一次性 `OPENCLAW_INSIGHTS_DIR` 来源，经 `make evolve` 蒸馏为框架提案；只提取框架级改进、绝不写入项目内容（中立原则）
- **显式 Evaluator-Optimizer 精炼循环**：把 `reviewer` 评估反馈做成「评估→带着反馈重新生成提案→再评估」闭环（Anthropic 第 5 种 workflow）；保留「FAIL 绝不提交」铁律（来源：外部调研 1.1）
- **`.learnings/` write-path 规范 + temporal 分层**：`make evolve` ingest 阶段加过滤/去重/打元数据；`LEARNINGS.md` 按 working/episodic/semantic/procedural 分层；零依赖（借 arXiv 2026 三维记忆分类，来源：外部调研 1.2）
- **权限阶梯配置（per-tool deny/ask/allow）**：在 `observer` 之外加基础设施级权限（Agent Security 2026 第六层栈，来源：外部调研 1.3）
- **eval harness 加 span-attached 评估 + 框架自测基准**：借 LLM 可观测 2026（来源：外部调研 1.4）
- **anti-over-engineering 原则**：写入 `AGENTS.md`/`ROADMAP`（Anthropic 简单性第一原则：能单次调用解决就别上 agent）
- **调研存档已就绪**：`docs/research/2026-07-09-external-research.md` + `examples/insights/`（memory-write-path / evaluator-optimizer-loop / permission-ladder），供自动化工位经 `make evolve` 蒸馏（来源：外部调研）

## Later 💡

## How to contribute a roadmap item
Open an issue with the `agent-task` label (or comment `/agent`), or just send a PR that
edits this file. The autonomous agent can pick up well-scoped items on its own.

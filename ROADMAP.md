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
- **Agent role presets** (`examples/agents/*.md` + `scripts/agent/roles.mjs` + `tests/roles.test.mjs`) — a zero-dep, verified library of reusable role definitions (reviewer / writer / memory-keeper / researcher / coder / qa) with a structured loader (`loadRole` / `loadRoles` / `getRole` / `validateRole`) and a `make roles` / `dev.sh roles` listing command; lowers contribution friction by cloning a preset instead of designing a role from scratch
- **「采集信息 → 框架改进」中立桥梁** (`scripts/evolve/ingest.mjs` + `tests/ingest.test.mjs`) — 把中立采集到的洞察（小说/漫剧/音乐/独立游戏调研等）解析→分类→产出**框架级**改进提案（prompt-template / agent-role / skill / qa-heuristic / doc）；纯函数、零依赖、CLI `make evolve`；补上"审核员消费采集信息→作用到项目"缺失的那半环
- **闭环「采集 → 审核员 → 应用」**：把 `make evolve` 默认洞察源指向中立示例 `examples/insights/`，并落实 qa-heuristic 提案的真实落点——新增零依赖 `workspace/.learnings/scripts/style-engine.mjs`（文风自检：识别客套开场 / AI 腔过渡词 / 空泛夸张词 / 过长句 / 被动滥用 / 段落重复起句，输出 0-100 评分 + 结构化问题清单），配 `tests/style-engine.test.mjs`（8 测试）。至此"审核员审核收集的信息直接作用到项目"端到端跑通：采集（中立示例）→ `make evolve` 蒸馏提案 → 审核员门禁 → 落为框架改进
- **轻量框架状态仪表盘**（特性级，零依赖）：新增 `scripts/dashboard.mjs`——扫描仓库框架级状态（Agent 预设 / 配置角色 / 测试数 / 脚本数 / 文档数 / 路线图进度 / 质量门禁健康）并生成**单文件、纯静态、可离线打开**的 `dashboard/index.html`（自包含内联 CSS，无任何 CDN/外链）。完全去个人化（不复用旧 `dashboard-data.js` 的个人项目统计），配套 `tests/dashboard.test.mjs`（13 测试，含解析/计数/HTML 确定性/HTML 注入转义），`Makefile`/`dev.sh`/`dev.ps1` 新增 `dashboard` 命令，`.dashboard/` 加入 `.gitignore`（生成物不入库）

## In progress 🚧
- End-to-end verification of the local agent with a **real** local LLM (Ollama `qwen2.5-coder:3b`)

## Next 🔜 (high value, low risk)
- **可选：接入真实中立采集源**：把每日中立创作素材分析（`AI创作日报/`）设为一次性 `OPENCLAW_INSIGHTS_DIR` 来源，经 `make evolve` 蒸馏为框架提案；只提取框架级改进、绝不写入项目内容（中立原则）
- **Adapter 层**：让同一套 agent 脚本在 OpenAI / DeepSeek / Qwen / Ollama 上统一运行

## Later 💡
- Release workflow (tags → changelog → GitHub Release)
- Adapter layer so the same agent scripts run on OpenAI / DeepSeek / Qwen / Ollama uniformly

## How to contribute a roadmap item
Open an issue with the `agent-task` label (or comment `/agent`), or just send a PR that
edits this file. The autonomous agent can pick up well-scoped items on its own.

# AGENTS.md — Instructions for AI Agents

This repository is a **turnkey OpenClaw multi-agent workspace**. Any AI agent
(Codex, Claude Code, Copilot, another OpenClaw instance, etc.) can clone it,
configure it via environment variables, and run/contribute without editing code.

## What this repo is
- A reusable OpenClaw agent workspace: `config/openclaw.json.example` defines 9
  generic agents (reviewer / writer / memory-keeper / …). Real `config/openclaw.json`
  is gitignored — never commit it.
- Core code lives in `workspace/.learnings/scripts/` (~30 Node.js ops/analysis scripts).
- Paths and secrets are **100% environment-variable driven** (zero hardcoded paths).

## Repository layout (key paths)
| Path | Purpose |
|------|---------|
| `config/openclaw.json.example` | Agent config template (edit this, not the real file) |
| `.env.example` → `.env` | All paths/tokens via env vars |
| `workspace/.learnings/scripts/` | The ~30 Node.js scripts (core code) |
| `workspace/.learnings/scripts/lib/common.js` | Shared path/CJK/atomic-write helpers — reuse these |
| `workspace/USER.md.example` | User profile template |
| `deploy/install.ps1` · `deploy/install.sh` | One-shot deploy (auto-creates empty dirs) |
| `workspace/tools/` | Auxiliary tool scripts |

## Local setup / verification
```bash
cp .env.example .env                      # fill QCLAW_PROJECT_DIR etc. as needed
bash deploy/install.sh                    # or: powershell -ExecutionPolicy Bypass deploy/install.ps1
node --check workspace/.learnings/scripts/*.js   # syntax check (CI runs this too)
```

## Contribution flow
1. Fork / branch → make your change.
2. **Run `node --check` on every script you touched** and ensure it passes.
3. Open a PR → the `Node Syntax Check` GitHub Action runs automatically and **must be green** to merge.

## Hard rules (violations get blocked by CI or review)
- ❌ **No hardcoded absolute paths** (especially `C:\Users\Administrator`, `/Users/...`).
  Always use env vars (`QCLAW_PROJECT_DIR` etc.) or `os.homedir()` + `path.join()`.
- ❌ **No personal data**: `novel/`, `gbrain/`, `workspace/memory/`, `workspace/USER.md`
  are gitignored — never `git add -f` them.
- ❌ **No secrets**: `config/openclaw.json`, `.env` are gitignored. Change the `.example` files instead.
- ✅ Every `.js` must pass `node --check`.
- ✅ JS comments use `//` — **never `#`** (only `#!` shebang is allowed, else `node --check` fails).
- ✅ **Cross-platform**: no `2>nul`, `where`, `findstr`. Use Node APIs or `process.platform` branches.
- ✅ When editing `.ps1` (PowerShell 5.1 compat): no ternary `? :` (use `if/else`); file must be UTF-8 **with BOM**.
- ✅ Reuse helpers from `workspace/.learnings/scripts/lib/common.js` (paths, atomic write, CJK count).

## Path conventions (reuse, don't reinvent)
- Project output dir: `process.env.QCLAW_PROJECT_DIR` (default `项目产出`)
- Hotspot dir: `process.env.QCLAW_HOT_DIR`
- Knowledge dir: `process.env.QCLAW_KNOWLEDGE_DIR`
Defaults/parsing live in `workspace/.learnings/scripts/lib/common.js`.

> Note: the public repo ships **empty framework only** — `gbrain/` (66 MB knowledge base)
> and user novels stay local and are not published. Deploy scripts create empty dirs so it runs.

## Autonomous agent pipeline (optional)
This repo includes a GitHub Action (`.github/workflows/agent-respond.yml`) that lets an
AI agent manage issues autonomously:
- Open an issue labeled `agent-task`, **or** comment `/agent` on any issue.
- The `Agent Responder` reads this `AGENTS.md`, asks an LLM to produce changes,
  runs `node --check` on all scripts, and **opens a PR for human review** (it never merges).
- Activation requires a repo secret **`LLM_API_KEY`** (OpenAI-compatible; set `LLM_BASE_URL`
  / `LLM_MODEL` to point at cheaper endpoints). Without it, the workflow only posts a
  "how to enable" comment.

---
# 中文说明（详细版）
本仓库是开箱即用的 OpenClaw 多智能体工作区。任何智能体 clone 后按下方配置即可运行与贡献。

**结构**：核心代码在 `workspace/.learnings/scripts/`（约 30 个 Node 脚本）；`config/openclaw.json.example` 是 9 个通用 agent 模板（真实 `config/openclaw.json` 已 gitignore，勿提交）；所有路径/令牌走环境变量，零硬编码。

**流程**：开分支改代码 → 本地 `node --check` 全过 → 开 PR，GitHub Actions（`Node Syntax Check`）自动校验，必须全绿才合并。

**硬规则**：禁硬编码绝对路径（`C:\Users\...`/`/Users/...`）；禁提交个人数据（novel/、gbrain/、memory/、USER.md）与密钥（config/openclaw.json、.env）；`.js` 须过 `node --check`；JS 注释用 `//` 不用 `#`；跨平台（禁 `2>nul`/`where`/`findstr`）；改 `.ps1` 用 `if/else` 且带 UTF-8 BOM；复用 `lib/common.js` 的约定。

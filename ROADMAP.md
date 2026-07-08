# Roadmap — openclaw-workspace

> Living backlog. The recurring "auto-improve" automation (see `AGENTS.md`) pulls from
> here and the web to make this repo stronger over time. Local-first; nothing is pushed
> to GitHub unless a human decides to.

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
- **Reviewer Agent** (`scripts/ci/reviewer.mjs` + `tests/reviewer.test.mjs`) — local full-tree review gate that aggregates syntax + config + observer + tests into one structured verdict (`runReviewer` / `verdict` / `formatReport` / `runCheck`); the engine behind `make reviewer`
- **Drift monitoring** — delivered inside the Eval harness via `--baseline` / `--compare` (token-overlap similarity as a zero-dep semantic-similarity proxy, flags drift < 0.98)

## In progress 🚧
- End-to-end verification of the local agent with a **real** local LLM (Ollama `qwen2.5-coder:3b`)

## Next 🔜 (high value, low risk)
- **i18n docs**: translate `docs/` into both Chinese and English sections

## Later 💡
- Lightweight web dashboard for workspace state (reuse `dashboard-data.js` concept)
- Release workflow (tags → changelog → GitHub Release)
- Adapter layer so the same agent scripts run on OpenAI / DeepSeek / Qwen / Ollama uniformly
- More out-of-the-box agent roles (reviewer / writer / memory-keeper presets)

## How to contribute a roadmap item
Open an issue with the `agent-task` label (or comment `/agent`), or just send a PR that
edits this file. The autonomous agent can pick up well-scoped items on its own.

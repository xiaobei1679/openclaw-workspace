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

## In progress 🚧
- End-to-end verification of the local agent with a **real** local LLM (Ollama `qwen2.5-coder:3b`)

## Next 🔜 (high value, low risk)
- **Eval harness**: LLM-as-judge regression tests over agent outputs, CI-gated (the "evaluation" pillar)
- **Skill/agent scaffolder**: `scripts/scaffold` that generates a new agent/skill from a template (lowers contribution friction)
- **Router Agent**: a planner that decomposes a task and routes to specialist agents
- **Observer Agent**: automatically review PRs for rule violations (paths, secrets, `node --check`)
- **Drift monitoring**: shadow-mode comparison of agent outputs (semantic similarity + schema check)
- **i18n docs**: translate `docs/` into both Chinese and English sections

## Later 💡
- Lightweight web dashboard for workspace state (reuse `dashboard-data.js` concept)
- `dependabot` + release workflow (tags → changelog → GitHub Release)
- Pre-commit hook that runs `node --check` + smoke tests locally
- Adapter layer so the same agent scripts run on OpenAI / DeepSeek / Qwen / Ollama uniformly
- More out-of-the-box agent roles (reviewer / writer / memory-keeper presets)

## How to contribute a roadmap item
Open an issue with the `agent-task` label (or comment `/agent`), or just send a PR that
edits this file. The autonomous agent can pick up well-scoped items on its own.

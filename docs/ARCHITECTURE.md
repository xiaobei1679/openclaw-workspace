# Architecture — openclaw-workspace

## System overview

```
┌─────────────────────────────────────────────────────┐
│                   User / Trigger                     │
│         (CLI / Issue / Cron / Agent Task)            │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              OpenClaw Gateway                        │
│           (config/openclaw.json)                     │
│     Route → Auth → Agent dispatch → Tools            │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌───────────┐ ┌─────────┐ ┌──────────────┐
│  Main     │ │  Team   │ │ Autonomous   │
│  Agent    │ │  CLI    │ │  Pipeline    │
│           │ │         │ │ (respond.mjs)│
└─────┬─────┘ └────┬─────┘ └──────┬───────┘
      │            │              │
      ▼            ▼              ▼
┌─────────────────────────────────────────────────────┐
│                  Workspace Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │ Identity  │ │ Memory   │ │ Tool / Script      │  │
│  │ SOUL.md   │ │ MEMORY.md│ │ .learnings/        │  │
│  │ AGENTS.md │ │ memory/  │ │ skills/  tools/    │  │
│  └──────────┘ └──────────┘ └────────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│                Output Layer                          │
│      project/   knowledge/   dashboard/             │
└─────────────────────────────────────────────────────┘
```

## Autonomous agent pipeline

```
Trigger (issue label / comment / local env)
    │
    ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ 1. Load task │──▶│ 2. Call LLM   │──▶│ 3. Parse     │
│ (getTask)    │    │ (callLLM)     │    │ (parseFiles) │
└─────────────┘    └──────────────┘    └──────┬──────┘
                                               │
                    ┌──────────────┐            ▼
                    │ 6. Commit /  │    ┌─────────────┐
                    │    PR        │◀───│ 4. Write +   │
                    │              │    │ node --check  │
                    └──────────────┘    └─────────────┘
                           ▲                 │
                           │                 ▼
                    ┌──────────────┐   ┌─────────────┐
                    │ 5. Trace log │   │ .agent-runs/ │
                    │ (.jsonl)     │   │  run-*.jsonl │
                    └──────────────┘   └─────────────┘
```

**Modes:**
- **Local** (`AGENT_LOCAL=1`): reads task file → edits working tree → `node --check` → commits to local branch. Zero key with Ollama.
- **Cloud** (GitHub Actions): issue webhook → LLM → PR via `gh`. Never auto-merges.

## Agent team

| Role | Responsibility | Status |
|------|---------------|--------|
| main | Orchestration | active |
| writer | Content creation | active |
| architect | World-building / setting maintenance | active |
| tech-producer | Video pipeline / game prototypes | active |
| reviewer | Quality audit | on-demand |
| multimedia | Comics / music / visuals | on-demand |
| strategist | Monetization / ops | dormant |
| qa | System diagnostics | dormant |
| memory-keeper | Knowledge-base curation | dormant |

## Script system

| Script | Function | Trigger |
|--------|----------|---------|
| team-cli.js | Unified entry (10 subcommands) | Manual |
| auto-heal.js | 6-category broken-link detection + fix | Heartbeat |
| experience-pool.js | Experience push + expiry sweep | Heartbeat |
| creation-feedback.js | Post-creation feedback recording | After creation |
| skill-discovery.js | Skill discovery + validation | Weekly |
| skill-evolution.js | Skill self-evolution | Heartbeat |
| hotspot-consumer.js | Daily hotspot → action list | Daily |
| knowledge-loop.js | Hotspot → knowledge base | Post-hotspot |
| pace-diagnose.js | Pacing / rhythm diagnosis | After creation |
| style-engine.js | AI-tone detection | After creation |
| dashboard-data.js | Dashboard data aggregation | Heartbeat |
| cron-templates.js | Cron template registry | Manual |

## CI / Quality gates

| Gate | Tool | What it checks |
|------|------|----------------|
| Syntax | `node --check` (all tracked scripts) | No JS syntax errors |
| Config | `validate-config.mjs` | `.env.example` vars + JSON schema |
| Smoke | `tests/smoke.test.mjs` | `safePath`, `parseFiles`, `checkAll` |
| Edge cases | `tests/edge-cases.test.mjs` | Boundary inputs, null bytes, empty payloads |
| Config shape | `tests/validate-config.test.mjs` | Template well-formedness |

Run all: `make healthcheck` or `bash scripts/dev.sh healthcheck`

## Memory layers

1. **Short-term**: Current session context
2. **Mid-term**: `memory/` directory (output reports, logs)
3. **Long-term**: `MEMORY.md` rules + vector store (gbrain)
4. **Evolutionary**: `experience-pool.js` + `skill-evolution.js`

## Observability

Agent runs produce append-only JSONL traces in `.agent-runs/run-<ts>.jsonl`:
- `task` — what was requested
- `llm_retry` — transient failure retry
- `files_written` — which files changed
- `check_pass` / `check_failed` — syntax gate result
- `committed` / `pr_created` — outcome
- `error` — crash info (non-fatal)

These are **gitignored** and never pushed to remote. They exist purely for local debugging.

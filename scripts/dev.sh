#!/usr/bin/env bash
# openclaw-workspace dev helper (Git Bash / Linux / macOS).
# Usage: ./scripts/dev.sh <command>
set -euo pipefail
NODE_BIN="${NODE:-node}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

case "${1:-help}" in
  check)
    "$NODE_BIN" scripts/ci/check-syntax.mjs
    ;;
  test)
    "$NODE_BIN" --test tests/*.test.mjs
    ;;
  validate)
    "$NODE_BIN" scripts/ci/validate-config.mjs
    ;;
  healthcheck)
    "$NODE_BIN" scripts/ci/check-syntax.mjs
    "$NODE_BIN" scripts/ci/validate-config.mjs
    "$NODE_BIN" --test tests/*.test.mjs
    ;;
  run-agent)
    AGENT_LOCAL=1 \
    AGENT_TASK_FILE="${AGENT_TASK_FILE:-scripts/agent/task.example.md}" \
    LLM_BASE_URL="${LLM_BASE_URL:-http://127.0.0.1:11434/v1}" \
    "$NODE_BIN" scripts/agent/respond.mjs
    ;;
  install)
    cp -n .env.example .env 2>/dev/null || true
    ./deploy/install.sh
    ;;
  *)
    echo "Usage: dev.sh {check|test|validate|healthcheck|run-agent|install}"
    exit 1
    ;;
esac

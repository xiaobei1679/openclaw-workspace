# openclaw-workspace — developer commands
# Windows users: use scripts/dev.ps1 (no make needed)
# *nix users: use scripts/dev.sh or this Makefile

.PHONY: check test validate healthcheck run-agent install verify review install-hooks observer help

check:   ## Syntax-check every tracked script
	$(NODE) scripts/ci/check-syntax.mjs

test:    ## Run functional smoke tests (node:test)
	$(NODE) --test tests/*.test.mjs

validate: ## Validate published template configs (config-first gate)
	$(NODE) scripts/ci/validate-config.mjs

healthcheck: ## Run check + validate + test together
	$(NODE) scripts/ci/check-syntax.mjs
	$(NODE) scripts/ci/validate-config.mjs
	$(NODE) --test tests/*.test.mjs

run-agent: ## Run the autonomous agent locally (keyless with Ollama)
	AGENT_LOCAL=1 AGENT_TASK_FILE=scripts/agent/task.example.md LLM_BASE_URL=http://127.0.0.1:11434/v1 $(NODE) scripts/agent/respond.mjs

install: ## Copy .env.example -> .env and run deploy
	cp -n .env.example .env 2>/dev/null || true
	./deploy/install.sh

verify:  ## Run deploy verification
	./deploy/verify.ps1

review:  ## Daily review gate: show unpushed changes + run healthcheck
	bash scripts/dev.sh review

install-hooks: ## Enable local pre-commit hook (syntax + config + tests)
	bash scripts/install-hooks.sh

observer: ## Review current changes for rule violations (paths/secrets/syntax/contract)
	$(NODE) scripts/ci/observer.mjs --diff

help:    ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  %-10s %s\n", $$1, $$2}'

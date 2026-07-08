# openclaw-workspace dev helper (Windows PowerShell 5.1+).
# Usage: .\scripts\dev.ps1 <command>
# PowerShell 5.1 compatible: no ternary operator; ASCII-only to avoid encoding issues.
$ErrorActionPreference = 'Stop'
$Node = if ($env:NODE) { $env:NODE } else { 'node' }
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $Root

switch ($args[0]) {
  'check' {
    & $Node scripts/ci/check-syntax.mjs
  }
  'test' {
    $files = Get-ChildItem -Path tests -Filter *.test.mjs -Recurse
    if ($files.Count -eq 0) { Write-Host 'no tests found'; exit 0 }
    & $Node --test $files.FullName
  }
  'run-agent' {
    $env:AGENT_LOCAL = '1'
    if (-not $env:AGENT_TASK_FILE) {
      $env:AGENT_TASK_FILE = 'scripts/agent/task.example.md'
    }
    if (-not $env:LLM_BASE_URL) {
      $env:LLM_BASE_URL = 'http://127.0.0.1:11434/v1'
    }
    & $Node scripts/agent/respond.mjs
  }
  'install' {
    if (-not (Test-Path '.env')) {
      Copy-Item .env.example .env
    }
    & ./deploy/install.sh
  }
  default {
    Write-Host 'Usage: dev.ps1 {check|test|run-agent|install}'
    exit 1
  }
}

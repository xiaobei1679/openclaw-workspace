// scripts/agent/respond.mjs
// Autonomous agent responder for openclaw-workspace.
// Triggered by GitHub Actions on issue/issue_comment events.
// Reads AGENTS.md, asks an OpenAI-compatible LLM to produce file changes,
// applies them, runs `node --check` on all scripts, and opens a PR (never merges).
//
// Required env (provided by the workflow):
//   GITHUB_TOKEN   - auto-provided by Actions (needs issues/contents/pull-requests write)
//   EVENT_PATH     - path to the webhook payload JSON
//   REPO           - owner/name
//   LLM_API_KEY    - user-supplied secret (OpenAI-compatible)
//   LLM_BASE_URL   - optional, default https://api.openai.com/v1
//   LLM_MODEL      - optional, default gpt-4o-mini

import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { resolve, relative, isAbsolute } from 'node:path';

const REPO_ROOT = process.cwd();
const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO;
const EVENT_PATH = process.env.EVENT_PATH;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';
const FORBIDDEN = new Set(['config/openclaw.json', '.env', 'config/openclaw.json.example'.replace('.example', '')]);

let ISSUE_NUMBER = '';

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' });
}

function comment(body) {
  if (!ISSUE_NUMBER) return;
  const tmp = resolve(REPO_ROOT, '.agent-comment.tmp');
  writeFileSync(tmp, body);
  try {
    gh(['issue', 'comment', String(ISSUE_NUMBER), '--body-file', tmp]);
  } catch (e) {
    console.error('comment failed:', e.message);
  } finally {
    rmSync(tmp, { force: true });
  }
}

function loadPayload() {
  if (!EVENT_PATH) throw new Error('EVENT_PATH missing');
  return JSON.parse(readFileSync(EVENT_PATH, 'utf8'));
}

// Decide whether this event should trigger the agent.
function determineTrigger(payload) {
  const issue = payload.issue;
  if (!issue || issue.pull_request) return null; // skip PRs
  if (payload.action === 'opened') {
    const labels = (issue.labels || []).map((l) => l.name);
    if (labels.includes('agent-task')) return issue;
  }
  if (payload.action === 'created' && payload.comment) {
    const body = payload.comment.body || '';
    if (body.includes('/agent')) {
      // Avoid reacting to our own (or any bot's) comments -> no loops.
      if (payload.comment.user && payload.comment.user.type === 'Bot') return null;
      return issue;
    }
  }
  return null;
}

async function callLLM(system, user) {
  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LLM_API_KEY}` },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseFiles(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const raw = (m ? m[1] : text).trim();
  const obj = JSON.parse(raw);
  if (obj && obj.error) throw new Error('LLM refused: ' + obj.error);
  if (!Array.isArray(obj)) throw new Error('expected JSON array of files');
  return obj;
}

function safePath(p) {
  if (!p || isAbsolute(p) || p.includes('..')) throw new Error('invalid path: ' + p);
  const full = resolve(REPO_ROOT, p);
  const rel = relative(REPO_ROOT, full);
  if (rel.startsWith('..') || rel === '') throw new Error('path escapes repo: ' + p);
  const norm = p.replace(/\\/g, '/');
  if (FORBIDDEN.has(norm)) throw new Error('forbidden path: ' + p);
  return full;
}

function nodeCheck(paths) {
  for (const f of paths) {
    if (/\.(js|mjs|cjs)$/i.test(f)) {
      try {
        execFileSync('node', ['--check', f], { stdio: 'pipe' });
      } catch (e) {
        throw new Error(`node --check failed on ${f}:\n${e.stderr || e.message}`);
      }
    }
  }
}

async function main() {
  const payload = loadPayload();
  const issue = determineTrigger(payload);
  if (!issue) {
    console.log('No agent trigger. Exiting.');
    return;
  }
  ISSUE_NUMBER = issue.number;

  if (!LLM_API_KEY) {
    comment(
      `🤖 **Agent Responder 已就绪，但未配置 LLM 密钥。**\n\n` +
      `仓库管理员需在 **Settings → Secrets and variables → Actions** 添加：\n` +
      `- \`LLM_API_KEY\`（必填，OpenAI 兼容）\n` +
      `- \`LLM_BASE_URL\`（可选，默认 https://api.openai.com/v1 ；可指向 DeepSeek / 通义等廉价端点）\n` +
      `- \`LLM_MODEL\`（可选，默认 gpt-4o-mini）\n\n` +
      `配置后，在任意 issue 评论 \`/agent\` 或给 issue 打 \`agent-task\` 标签，我就会读 AGENTS.md 自动改代码并开 PR 供人工审核。\n\n` +
      `（本评论由 Agent Responder 自动发出）`
    );
    return;
  }

  const tree = execSync('git ls-files', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .join('\n');
  const agentsMd = existsSync('AGENTS.md') ? readFileSync('AGENTS.md', 'utf8') : '';

  const system =
    `You are an autonomous coding agent for the openclaw-workspace repository.\n` +
    `Follow these repo rules strictly (from AGENTS.md):\n` +
    `- NEVER hardcode absolute paths; use env vars / os.homedir().\n` +
    `- NEVER edit or commit secrets (config/openclaw.json, .env) or personal data.\n` +
    `- Every .js must pass 'node --check'; use // comments, never #.\n` +
    `- Keep scripts cross-platform (no 2>nul / where / findstr).\n` +
    `- Reuse helpers in workspace/.learnings/scripts/lib/common.js.\n` +
    `You may ONLY edit files that already exist in the repo (or add new files under existing directories).\n` +
    `NEVER edit config/openclaw.json or .env.\n` +
    `Output ONLY a fenced \`\`\`json code block containing a JSON array of objects:\n` +
    `  [{"path": "relative/path", "content": "<full new file content>"}]\n` +
    `Include ONLY files you changed. If you cannot safely complete the task, output {"error":"reason"}.`;

  const user =
    `Repository file tree:\n${tree}\n\n` +
    `AGENTS.md:\n${agentsMd}\n\n` +
    `TASK (issue #${issue.number}):\nTitle: ${issue.title}\n\nBody:\n${issue.body || '(empty)'}\n\n` +
    `Produce the changes now.`;

  comment(
    `🤖 收到，正在根据 AGENTS.md 分析任务 #${issue.number} 并生成改动…（将开 PR 供人工审核，不会自动合并）`
  );

  let text;
  try {
    text = await callLLM(system, user);
  } catch (e) {
    comment(`⚠️ 调用 LLM 失败：${e.message}`);
    return;
  }

  let files;
  try {
    files = parseFiles(text);
  } catch (e) {
    comment(
      `⚠️ 无法解析智能体输出：${e.message}\n\n原始输出：\n\`\`\`\n${text.slice(0, 2000)}\n\`\`\``
    );
    return;
  }

  const changed = [];
  for (const f of files) {
    const full = safePath(f.path);
    writeFileSync(full, f.content);
    changed.push(f.path);
  }

  const tracked = execSync('git ls-files', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  try {
    nodeCheck([...tracked, ...changed]);
  } catch (e) {
    comment(`⚠️ 改动未通过 node --check，已中止开 PR：\n\`\`\`\n${e.message}\n\`\`\``);
    return;
  }

  const branch = `agent/issue-${issue.number}`;
  execSync(`git checkout -B ${branch}`);
  execSync('git add -A');
  execSync(`git -c user.name="agent-bot" -c user.email="agent@noreply.github.com" commit -m "agent: address #${issue.number}"`, {
    stdio: 'pipe',
  });
  execSync(`git push origin ${branch}`);
  const prUrl = gh([
    'pr',
    'create',
    '--head',
    branch,
    '--base',
    'main',
    '--title',
    `agent: #${issue.number} ${issue.title}`.slice(0, 60),
    '--body',
    `Auto-generated by Agent Responder for #${issue.number}.\n\nCloses #${issue.number}`,
  ]).trim();

  comment(`✅ 已生成改动并通过 node --check，开 PR：${prUrl}（请人工审核后合并）`);
}

main().catch((e) => {
  console.error('Agent error:', e);
  try {
    comment(`⚠️ 智能体执行出错：${e.message}`);
  } catch {}
  process.exit(0); // never fail the workflow run hard
});

// tests/respond.test.mjs
// Contract + offline end-to-end tests for scripts/agent/respond.mjs.
//
// These are Tier-1 "stub fakes" (per Tian Pan, "Dependency Injection for AI:
// Mocking Model Calls Without Losing Test Fidelity", 2026-04-16): they do NOT
// hit a real LLM, but the fake fetch ASSERTS the real request contract — the
// exact endpoint URL, the auth header presence, and the request body shape —
// so a green test still predicts production behavior instead of lying about it.
//
// This mirrors tests/adapter-client.test.mjs (the adapter's network layer) and
// additionally proves the autonomous AGENT PIPELINE is offline-verifiable via
// runAgentOffline(): task → prompts → LLM(fake) → parseFiles → safePath, with no
// disk writes and no git — the offline equivalent of the Ollama end-to-end check.
//
// No network calls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { callLLM, runAgentOffline, parseFiles } from '../scripts/agent/respond.mjs';
import { chatCompletionsUrl } from '../scripts/llm/adapter.mjs';

// Build a fake `fetch` that records the request and returns a controllable
// Response-like object (ok / status / headers.get / json / text).
function makeFakeFetch(opts = {}) {
  const {
    calls = [],
    content = 'hello from fake',
    ok = true,
    status = 200,
    contentLength = 0,
    failFirst = 0,
  } = opts;
  let attempts = 0;
  const fakeFetch = async function (url, init) {
    calls.push({ url, init });
    if (failFirst > 0 && attempts < failFirst) {
      attempts += 1;
      const err = new Error('simulated transient network error');
      err.cause = { code: 'ECONNRESET' };
      throw err;
    }
    attempts += 1;
    const body = { choices: [{ message: { content } }] };
    return {
      ok,
      status,
      headers: {
        get: (k) =>
          String(k).toLowerCase() === 'content-length'
            ? String(contentLength)
            : null,
      },
      async json() {
        return body;
      },
      async text() {
        return JSON.stringify(body);
      },
    };
  };
  fakeFetch.calls = calls;
  return fakeFetch;
}

// A config override so we can assert the auth-header contract with/without a key.
function cfg(over = {}) {
  return {
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    apiKey: '',
    isLocal: false,
    ...over,
  };
}

test('callLLM: injected fetch is used instead of global fetch', async () => {
  const calls = [];
  const fake = makeFakeFetch({ calls });
  const out = await callLLM('sys', 'usr', { fetch: fake, config: cfg() });
  assert.equal(out, 'hello from fake');
  assert.equal(calls.length, 1, 'fake fetch should have been called exactly once');
});

test('callLLM: hits the exact chat/completions endpoint (contract)', async () => {
  const calls = [];
  const fake = makeFakeFetch({ calls });
  await callLLM('s', 'u', { fetch: fake, config: cfg({ baseUrl: 'https://api.deepseek.com/v1' }) });
  assert.equal(calls[0].url, 'https://api.deepseek.com/v1/chat/completions');
  assert.equal(calls[0].init.method, 'POST');
  // Endpoint helper agrees with what was actually called.
  assert.equal(calls[0].url, chatCompletionsUrl('https://api.deepseek.com/v1'));
});

test('callLLM: Bearer auth header added only when a key is present', async () => {
  // With key → Authorization present.
  const withKey = makeFakeFetch({ calls: [] });
  await callLLM('s', 'u', { fetch: withKey, config: cfg({ apiKey: 'sk-test-123' }) });
  assert.equal(withKey.calls[0].init.headers.Authorization, 'Bearer sk-test-123');
  assert.equal(withKey.calls[0].init.headers['Content-Type'], 'application/json');

  // Local Ollama (no key) → no Authorization header at all.
  const noKey = makeFakeFetch({ calls: [] });
  await callLLM('s', 'u', { fetch: noKey, config: cfg({ apiKey: '' }) });
  assert.equal(noKey.calls[0].init.headers.Authorization, undefined);
  assert.equal(noKey.calls[0].init.headers['Content-Type'], 'application/json');
});

test('callLLM: request body carries model, temperature 0.2, and normalized messages', async () => {
  const calls = [];
  const fake = makeFakeFetch({ calls });
  await callLLM('SYSTEM PROMPT', 'USER INPUT', {
    fetch: fake,
    config: cfg({ model: 'gpt-4o-mini' }),
  });
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.model, 'gpt-4o-mini');
  assert.equal(body.temperature, 0.2);
  assert.deepEqual(body.messages, [
    { role: 'system', content: 'SYSTEM PROMPT' },
    { role: 'user', content: 'USER INPUT' },
  ]);
});

test('callLLM: parses assistant content from a real-shaped response', async () => {
  const fake = makeFakeFetch({ content: '```json\n[{"path":"x"}]\n```' });
  const out = await callLLM('s', 'u', { fetch: fake, config: cfg() });
  assert.equal(out, '```json\n[{"path":"x"}]\n```');
});

test('callLLM: non-ok HTTP status throws with status in message', async () => {
  const fake = makeFakeFetch({ ok: false, status: 401, content: 'invalid key' });
  await assert.rejects(
    () => callLLM('s', 'u', { fetch: fake, config: cfg({ apiKey: 'sk-test-123' }) }),
    /LLM HTTP 401/
  );
});

test('callLLM: response larger than 2 MB is rejected', async () => {
  const fake = makeFakeFetch({ contentLength: 3 * 1024 * 1024 });
  await assert.rejects(
    () => callLLM('s', 'u', { fetch: fake, config: cfg({ apiKey: 'sk-test-123' }) }),
    /too large/
  );
});

test('callLLM: retries transient errors then succeeds (plumbing)', async () => {
  const calls = [];
  const fake = makeFakeFetch({ calls, failFirst: 1 });
  const out = await callLLM('s', 'u', { fetch: fake, config: cfg({ apiKey: 'sk-test-123' }) });
  assert.equal(out, 'hello from fake');
  assert.equal(calls.length, 2, 'should have retried once then succeeded');
  assert.equal(calls[0].url, calls[1].url, 'retry hits the same endpoint');
});

test('callLLM: exhausted retries re-throws the last error', async () => {
  const calls = [];
  // failFirst beyond available retries (LLM_RETRIES default = 1 → at most 2 attempts).
  const fake = makeFakeFetch({ calls, failFirst: 5 });
  await assert.rejects(
    () => callLLM('s', 'u', { fetch: fake, config: cfg({ apiKey: 'sk-test-123' }) }),
    /transient/
  );
  assert.equal(calls.length, 2, 'should have stopped after retries exhausted');
});

// ---------------------------------------------------------------------------
// Offline end-to-end smoke of the agent pipeline (runAgentOffline).
// ---------------------------------------------------------------------------

test('runAgentOffline: parses a fake LLM JSON response into validated in-repo files', async () => {
  const fake = makeFakeFetch({
    content:
      '```json\n' +
      '[{"path":"scripts/agent/_probe_tmp.mjs","content":"// probe"}]\n' +
      '```',
  });
  const { files, resolved } = await runAgentOffline({
    task: { title: 'add probe', body: 'add a probe file', local: true },
    fetchImpl: fake,
  });
  assert.equal(files.length, 1);
  assert.equal(files[0].path, 'scripts/agent/_probe_tmp.mjs');
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0].path, 'scripts/agent/_probe_tmp.mjs');
  // safePath produced a repo-absolute path that ends with the relative one.
  assert.ok(
    resolved[0].full.replace(/\\/g, '/').endsWith('scripts/agent/_probe_tmp.mjs'),
    'resolved.full should be the repo-absolute path'
  );
});

test('runAgentOffline: rejects an escape-path change (safePath guard end-to-end)', async () => {
  const fake = makeFakeFetch({
    content: '```json\n' + '[{"path":"../escape.js","content":"x"}]\n' + '```',
  });
  await assert.rejects(
    () =>
      runAgentOffline({
        task: { title: 'escape', body: 'try to escape', local: true },
        fetchImpl: fake,
      }),
    /escape|invalid path/
  );
});

test('runAgentOffline: rejects forbidden secret-file change (contract end-to-end)', async () => {
  const fake = makeFakeFetch({
    content: '```json\n' + '[{"path":".env","content":"SECRET=1"}]\n' + '```',
  });
  await assert.rejects(
    () =>
      runAgentOffline({
        task: { title: 'secret', body: 'try to edit .env', local: true },
        fetchImpl: fake,
      }),
    /forbidden path/
  );
});

test('runAgentOffline: empty/blank LLM output fails the parse contract', async () => {
  const fake = makeFakeFetch({ content: '' });
  await assert.rejects(
    () =>
      runAgentOffline({
        task: { title: 'blank', body: 'blank output', local: true },
        fetchImpl: fake,
      }),
    /empty or blank/
  );
});

test('runAgentOffline: an explicit LLM refusal propagates as an error', async () => {
  const fake = makeFakeFetch({ content: '```json\n{"error":"unsafe task"}\n```' });
  await assert.rejects(
    () =>
      runAgentOffline({
        task: { title: 'refuse', body: 'should be refused', local: true },
        fetchImpl: fake,
      }),
    /LLM refused/
  );
});

// Sanity: parseFiles is still importable and behaves as the agent contract expects.
test('parseFiles: fenced JSON array round-trips unchanged', () => {
  const files = parseFiles('```json\n[{"path":"README.md","content":"x"}]\n```');
  assert.deepEqual(files, [{ path: 'README.md', content: 'x' }]);
});

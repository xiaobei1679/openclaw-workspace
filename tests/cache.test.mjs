// tests/cache.test.mjs — tests for scripts/llm/cache.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalRequest, cacheKey, lookup, store, withCache, stats } from '../scripts/llm/cache.mjs';

// In-memory fs shim so the cache is fully offline-testable (no real disk).
function memfs() {
  const files = new Map();
  return {
    existsSync: (p) => files.has(p),
    readFileSync: (p) => {
      if (!files.has(p)) throw new Error('ENOENT');
      return files.get(p);
    },
    writeFileSync: (p, c) => {
      files.set(p, String(c));
    },
    mkdirSync: () => {},
    _files: files,
  };
}

const LEDGER = '/mem/llm-cache.json';

test('canonicalRequest normalizes to {role,content} and lowercases provider/model', () => {
  const req = canonicalRequest([{ role: 'User', content: '  hi  ' }], { provider: 'OpenAI', model: 'GPT-4O' });
  assert.deepEqual(req, {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: undefined,
    maxTokens: undefined,
    topP: undefined,
    messages: [{ role: 'user', content: 'hi' }],
  });
});

test('cacheKey is deterministic and identical for equivalent requests', () => {
  const a = [{ role: 'user', content: 'hello' }];
  const b = [{ role: 'user', content: 'hello' }];
  assert.equal(cacheKey(a, { model: 'gpt-4o' }), cacheKey(b, { model: 'gpt-4o' }));
});

test('cacheKey differs by model, temperature, and message content', () => {
  const m = [{ role: 'user', content: 'x' }];
  const k1 = cacheKey(m, { model: 'gpt-4o' });
  const k2 = cacheKey(m, { model: 'gpt-4o-mini' });
  const k3 = cacheKey(m, { model: 'gpt-4o', temperature: 0.2 });
  const k4 = cacheKey(m, { model: 'gpt-4o', temperature: 0.8 });
  const k5 = cacheKey([{ role: 'user', content: 'y' }], { model: 'gpt-4o' });
  const all = new Set([k1, k2, k3, k4, k5]);
  assert.equal(all.size, 5);
});

test('lookup miss then store then lookup hit round-trips the value', () => {
  const m = [{ role: 'user', content: 'ping' }];
  const opts = { ledgerPath: LEDGER, fs: memfs(), model: 'gpt-4o' };
  assert.equal(lookup(m, opts).hit, false);
  store(m, { completion: 'pong' }, opts);
  const hit = lookup(m, opts);
  assert.equal(hit.hit, true);
  assert.deepEqual(hit.value, { completion: 'pong' });
  assert.equal(hit.meta.hits, 0);
});

test('withCache invokes callLLM once, then serves hit from cache', async () => {
  const m = [{ role: 'user', content: 'repeat' }];
  const opts = { ledgerPath: LEDGER, fs: memfs(), model: 'gpt-4o' };
  let calls = 0;
  const callLLM = async () => {
    calls += 1;
    return { completion: 'cached-or-not' };
  };
  const cached = withCache(callLLM, opts);
  const r1 = await cached(m, {});
  assert.equal(r1.cached, false);
  assert.equal(calls, 1);
  const r2 = await cached(m, {});
  assert.equal(r2.cached, true);
  assert.equal(calls, 1); // second call did NOT hit the LLM
  assert.deepEqual(r2.response, { completion: 'cached-or-not' });
});

test('stats reports entry count and accumulated hits', async () => {
  const fs = memfs();
  const opts = { ledgerPath: LEDGER, fs, model: 'gpt-4o' };
  store([{ role: 'user', content: 'a' }], '1', opts);
  store([{ role: 'user', content: 'b' }], '2', opts);
  const cached = withCache(async () => 'x', opts);
  await cached([{ role: 'user', content: 'a' }], {}); // hit -> bump
  await cached([{ role: 'user', content: 'a' }], {}); // hit -> bump
  await cached([{ role: 'user', content: 'b' }], {}); // hit -> bump
  const s = stats(LEDGER, fs);
  assert.equal(s.entries, 2);
  assert.equal(s.totalHits, 3);
});

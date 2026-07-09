// tests/circuit-breaker.test.mjs — tests for scripts/llm/circuit-breaker.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBreaker, withBreaker, CircuitOpenError, STATE } from '../scripts/llm/circuit-breaker.mjs';

// Mutable injectable clock.
function clock() {
  const c = { t: 0 };
  return { now: () => c.t, advance: (ms) => (c.t += ms) };
}

test('starts CLOSED and stays CLOSED on success', async () => {
  const b = createBreaker({ now: clock().now });
  assert.equal(b.state, STATE.CLOSED);
  assert.equal(await b.exec(async () => 'ok'), 'ok');
  assert.equal(b.state, STATE.CLOSED);
});

test('trips OPEN after failureThreshold consecutive failures', async () => {
  const c = clock();
  const b = createBreaker({ failureThreshold: 2, cooldownMs: 100, now: c.now });
  await assert.rejects(() => b.exec(async () => { throw new Error('x'); }));
  await assert.rejects(() => b.exec(async () => { throw new Error('x'); }));
  assert.equal(b.state, STATE.OPEN);
});

test('while OPEN and before cooldown, exec throws CircuitOpenError without calling fn', async () => {
  const c = clock();
  const b = createBreaker({ failureThreshold: 1, cooldownMs: 100, now: c.now });
  await assert.rejects(() => b.exec(async () => { throw new Error('x'); }));
  let called = 0;
  await assert.rejects(() => b.exec(async () => { called++; throw new Error('x'); }), CircuitOpenError);
  assert.equal(called, 0);
  assert.equal(b.state, STATE.OPEN);
});

test('after cooldown, probes in HALF_OPEN and closes after successThreshold successes', async () => {
  const c = clock();
  const b = createBreaker({ failureThreshold: 2, cooldownMs: 100, successThreshold: 2, now: c.now });
  await assert.rejects(() => b.exec(async () => { throw new Error('x'); }));
  await assert.rejects(() => b.exec(async () => { throw new Error('x'); }));
  assert.equal(b.state, STATE.OPEN);
  c.advance(200); // past cooldown
  assert.equal(await b.exec(async () => 'a'), 'a');
  assert.equal(b.state, STATE.HALF_OPEN);
  assert.equal(await b.exec(async () => 'b'), 'b');
  assert.equal(b.state, STATE.CLOSED);
});

test('a failure in HALF_OPEN re-opens the breaker', async () => {
  const c = clock();
  const b = createBreaker({ failureThreshold: 1, cooldownMs: 100, successThreshold: 2, now: c.now });
  await assert.rejects(() => b.exec(async () => { throw new Error('x'); }));
  c.advance(200);
  assert.equal(await b.exec(async () => 'a'), 'a'); // half-open probe ok
  assert.equal(b.state, STATE.HALF_OPEN);
  await assert.rejects(() => b.exec(async () => { throw new Error('y'); }));
  assert.equal(b.state, STATE.OPEN);
});

test('a success in CLOSED heals accumulated failures', async () => {
  const c = clock();
  const b = createBreaker({ failureThreshold: 3, cooldownMs: 100, now: c.now });
  await assert.rejects(() => b.exec(async () => { throw new Error('x'); }));
  await assert.rejects(() => b.exec(async () => { throw new Error('x'); }));
  assert.equal(b.failures, 2);
  assert.equal(await b.exec(async () => 'ok'), 'ok');
  assert.equal(b.failures, 0);
  assert.equal(b.state, STATE.CLOSED);
});

test('withBreaker routes calls through the breaker', async () => {
  const c = clock();
  const b = createBreaker({ failureThreshold: 1, cooldownMs: 100, now: c.now });
  const ok = withBreaker(b, (x) => x * 2);
  assert.equal(await ok(21), 42);
  assert.equal(b.state, STATE.CLOSED);
  const bad = withBreaker(b, () => {
    throw new Error('boom');
  });
  await assert.rejects(() => bad(1)); // throws -> trips open
  assert.equal(b.state, STATE.OPEN);
});

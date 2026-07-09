# LLM 弹性与缓存（Resilience & Caching）

> 两份零依赖基础设施模块，配套 `scripts/llm/cost.mjs`（成本追踪）与 `respond.mjs` 既有的「超时 + 瞬态重试」，把"跑 LLM 更省、更稳"做成可机器化复用的能力。全部零依赖、纯函数可单测、可离线。

## 1. LLM 响应缓存（prompt caching）— `scripts/llm/cache.mjs`

**解决什么**：相同 `(provider, model, 温度/采样, messages)` 请求必然得到相同补全，因此把响应按请求哈希缓存，跳过重复 LLM 调用 → 降本 + 降延迟。

**核心 API（纯函数）**

| 函数 | 作用 |
| --- | --- |
| `canonicalRequest(messages, opts)` | 把请求归整为稳定结构（role 小写、content 去首尾空格、采样参数归一） |
| `cacheKey(messages, opts)` | 上述结构的 SHA-256，作为缓存键 |
| `lookup(messages, opts)` | 查缓存，返回 `{ hit, key, value, meta }` |
| `store(messages, value, opts)` | 写缓存，返回 key |
| `withCache(callLLM, cacheOpts)` | 包裹 `callLLM`，命中则直接返回、未命中才调用并落库，返回 `{ response, cached, key }` |
| `stats(ledgerPath)` | `{ entries, totalHits }` |

- `opts.ledgerPath`：账本文件路径，默认 `.cache/llm-cache.json`（已在 `.gitignore` 忽略，生成物不入库）。
- `opts.fs`：可注入的内存 fs（测试用），默认 `node:fs`。
- 缓存仅当 `provider/model/温度/采样/messages` **完全一致**才命中（归一化后），不同采样参数视为不同请求。

**CLI**
```
node scripts/llm/cache.mjs --messages '[{"role":"user","content":"hi"}]' --model gpt-4o-mini
node scripts/llm/cache.mjs --stats
# 或经 make / dev：
make llm-cache --messages '...' --model gpt-4o-mini
```

**接入 `respond.mjs`（示例，可选）**
```js
import { withCache } from '../../scripts/llm/cache.mjs';
const cachedCall = withCache(
  (messages, opts) => callLLM(messages, opts),          // 复用既有 callLLM
  { ledgerPath: '.cache/llm-cache.json', model: LLM.model }
);
const { response, cached } = await cachedCall(promptMessages, {});
```

## 2. 熔断器（Circuit Breaker）— `scripts/llm/circuit-breaker.mjs`

**解决什么**：`respond.mjs` 已有「瞬态错误重试」，但重试只对偶发抖动有效；当某个 provider 持续故障，反复重试会放大失败、浪费配额。熔断器在连续失败达到阈值后**直接拒绝**调用，冷却后放行一次探针，成功阈值达成再闭合——避免对故障 provider 的"雷鸣羊群"。

**核心 API（纯逻辑，可注入时钟）**

| 函数 | 作用 |
| --- | --- |
| `createBreaker({ failureThreshold, cooldownMs, successThreshold, now })` | 创建熔断器，返回 `{ exec, state, failures, snapshot, reset }` |
| `breaker.exec(fn)` | 经状态机执行 `fn`；OPEN 且未冷却时抛 `CircuitOpenError`（不调用 fn） |
| `withBreaker(breaker, fn)` | 把任意函数包成经熔断器的调用 |

状态机：`CLOSED`（正常）→ 连续 `failureThreshold` 次失败 → `OPEN`（拒绝）→ 冷却 `cooldownMs` 后放行一次探针 → `HALF_OPEN` → 连续 `successThreshold` 次成功 → 回到 `CLOSED`；`HALF_OPEN` 中失败立即重新 `OPEN`。

**CLI（状态机演示，无真实等待）**
```
node scripts/llm/circuit-breaker.mjs --demo
# 或：make circuit-breaker --demo
```

**接入 `respond.mjs`（示例，可选）**
```js
import { createBreaker, withBreaker } from '../../scripts/llm/circuit-breaker.mjs';
const breaker = createBreaker({ failureThreshold: 3, cooldownMs: 5000, successThreshold: 2 });
const guardedCall = withBreaker(breaker, (messages, opts) => callLLM(messages, opts));
```

## 3. 组合：缓存 + 熔断 + 重试

三者正交、可叠加：

- **缓存**在最外层：命中则不进入网络层（最快、最省）。
- **熔断**在缓存之后、重试之前：provider 持续故障时直接短路。
- **重试**（已有）在最内层：单次瞬态抖动自动恢复。

```js
const breaker = createBreaker({ failureThreshold: 3, cooldownMs: 5000, successThreshold: 2 });
const cachedCall = withCache(
  withBreaker(breaker, (m, o) => callLLM(m, o)),
  { ledgerPath: '.cache/llm-cache.json', model: LLM.model }
);
```

## 4. 调研依据（GitHub / 技术站点，2026-07-09 第二轮）

- **Prompt caching**：`messkan/prompt-cache`（宣称降本至 80%）、`karthyick/prompt-cache`（装饰器式语义缓存）；设计文 `yuanchaofa.com`《Agent 系统中的 Prompt Caching 设计》、`xirain.github.io`《LLM Agent Prompt Cache 深入浅出》——一致结论：Agent 比 Chatbot 更需要缓存，请求布局/工具管理影响缓存命中。
- **Circuit breaker**：`rheatkhs/yves-circuit-breaker`（明确"零依赖、纯逻辑、框架无关"）、`ayushedith/retryify`（retry/backoff/timeout/breaker/inflight-dedup 一体）；`dev.to` wallacefreitas / young_gao 的 CLOSED/OPEN/HALF_OPEN 状态机实现。
- 二者均满足本仓库"零依赖 Node ESM"硬规则：纯函数 + 可注入边界（fs / 时钟），离线可单测。

> 设计取舍：缓存与熔断都**未自动改写 `respond.mjs` 生产路径**（保持默认行为不变），仅作为可 import 的库 + 文档示例提供，避免触碰既有离线契约测试。需要默认启用时，按第 1/2 节示例接入即可。

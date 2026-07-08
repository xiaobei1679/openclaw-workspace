# 快速上手 · Quickstart

5 分钟从零跑起这个多智能体工作区。**本地、零密钥亦可**。

---

## 方式一：本地直接运行智能体（推荐，零密钥）

1. 准备一个 LLM 端点（任选其一）：
   - **本地零成本**：安装 [Ollama](https://ollama.com) 后运行 `ollama serve`（默认 `http://127.0.0.1:11434/v1`）
   - 或任意 OpenAI 兼容端点（DeepSeek / 通义 / Moonshot 等，可用其免费额度）
2. （可选）配置环境变量：`cp .env.example .env` 然后按需填写；脚本都有合理默认值，不填也能跑。
3. 运行智能体——它会**读任务 → 调 LLM → 改代码 → 跑校验 → 提交到本地分支**供你审核：
   ```bash
   AGENT_LOCAL=1 \
   AGENT_TASK_FILE=scripts/agent/task.example.md \
   LLM_BASE_URL=http://127.0.0.1:11434/v1 \
   node scripts/agent/respond.mjs
   ```
   - 本地 Ollama 指向 `127.0.0.1` / `localhost` 时**不需要 `LLM_API_KEY`**。
   - 用付费/免费托管模型时，加 `LLM_API_KEY=...` 与 `LLM_MODEL=...`（默认 `gpt-4o-mini`）。

---

## 方式二：作为框架部署（给自己或他人用）

```bash
cp .env.example .env
bash deploy/install.sh            # Windows: powershell -ExecutionPolicy Bypass deploy/install.ps1
```

部署脚本会：备份已有配置 → 复制工作区 → 复制配置模板 → 创建项目目录 → 运行校验确认成功。

---

## 验证一切正常

```bash
make check       # 或 node scripts/ci/check-syntax.mjs      —— 扫描所有脚本 node --check
make test        # 或 node --test tests/*.test.mjs          —— 功能冒烟测试
make validate    # 或 node scripts/ci/validate-config.mjs   —— 校验发布版配置模板
```

---

## 让智能体自动管理仓库（可选）

- **云端**：在仓库 Settings → Secrets 加 `LLM_API_KEY`，然后开 issue 打 `agent-task` 标签或评论 `/agent`，智能体会自动改代码并开 PR 等你审核（绝不自动合并）。
- **本地**：见方式一。

---

## 下一步看哪里

| 你想… | 看这个文件 |
| --- | --- |
| 了解智能体该怎么干活 | `AGENTS.md` |
| 看系统架构 | `docs/ARCHITECTURE.md` |
| 看智能体协作契约 | `docs/AGENT_CONTRACT.md` |
| 看路线图 / 待办 | `ROADMAP.md` |
| 抄一个示例技能 | `examples/sample-skill/` |
| 抄一个任务格式 | `examples/agent-task-sample.md` |
| 安全与漏洞上报 | `SECURITY.md` |

> 本仓库是**公开框架**：`gbrain/`（知识库）、`novel/`（创作）等个人数据不随仓库发布；clone 后配置 `.env` 即可运行，相关目录由部署脚本按需自动创建。

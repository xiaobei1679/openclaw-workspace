# 更新日志

> 说明：本文件记录**工作区内部**的项目演进（异兽学院 / 阴间考编等）。
> 下方「openclaw-workspace 公开框架」段记录**本仓库（对外开源模板）**自身的迭代。

## openclaw-workspace 公开框架（仓库级更新）

### 2026-07-08（自主迭代 · 本地）
- 新增 `scripts/ci/check-syntax.mjs`：统一的 `node --check` 扫描（CI / `make check` / 测试共用）
- 新增 `tests/smoke.test.mjs`：覆盖真实导出逻辑（`safePath` / `parseFiles` / 语法扫描）的功能冒烟测试
- `scripts/agent/respond.mjs`：导出 `safePath` / `parseFiles` 并加主模块守卫，使测试可安全导入；`node` 调用改用 `process.execPath`
- 新增契约式交互规范 `docs/AGENT_CONTRACT.md`（任务格式 / 改动 JSON / 路径安全 / 反馈契约）
- 新增开发者命令入口：`Makefile` + `scripts/dev.sh` + `scripts/dev.ps1`（`check` / `test` / `run-agent` / `install`）
- 新增 `SECURITY.md`、`ROADMAP.md`
- `AGENTS.md` / `README.md`：补充测试、契约、路线图、徽章与「自主智能体（本地零密钥）」说明
- 设计依据：全网调研多智能体最佳实践（契约式交互、Router/Observer、共享记忆、增量灰度、强仓库文档结构）

### 2026-07-08（早期）
- 去个人化改造：零硬编码路径、`.example` 模板、`.gitignore` 排除本地数据
- 双语 README + 仓库设为 Template
- `AGENTS.md` / `CLAUDE.md` / `CONTRIBUTING.md` + PR / Issue 模板
- GitHub Actions：`node-check`（语法）+ `agent-respond`（自动开 PR）
- 本地免密钥模式（指向本机 Ollama）

## 2026-07-08

### 项目转向
- 异兽学院v1-v4全部废弃
- 新项目：阴间考编 v1.2（黑色幽默女频漫剧向小说）
- 世界观v1.2完成（58609字节）
- 第1-7章正文完成（累计30435字）
- EP01-03漫剧分镜完成

### 系统升级
- Token优化8项全落地（contextPruning/maxConcurrent/心跳/Skills精简等）
- 团队扩至9人（新增多媒体制作人+商业化策略师）
- 自进化三路闭环（auto-heal/creation-feedback/skill-discovery）
- gbrain知识库激活（7个核心page）
- 仪表盘升级至11面板
- workspace从45→8核心文件

## 2026-07-06 ~ 07-07

### 异兽学院链（已废弃）
- v1-v4世界观全部废弃
- 第1-3章旧版废弃
- 10→9 Agent团队重组
- 协议v2.3落地
- 抖音收藏三路调研（270→144条AI相关）

## 2026-06-28 ~ 07-05

### 基础设施建设
- 10 Agent团队基础搭建
- 经验池v2.0
- 记忆系统（compose-context.js）
- 仪表盘搭建
- Headroom+RTK+codegraph安装
- cron从并行改串行
- 系统健康度85→92/100

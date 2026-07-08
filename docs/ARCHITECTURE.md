# QClaw Agent 系统架构

## 整体结构

```
用户指令
    ↓
OpenClaw Gateway (openclaw.json)
    ↓
Main Agent (workspace/)
    ├── 人设层：SOUL.md → IDENTITY.md → AGENTS.md
    ├── 记忆层：MEMORY.md (12铁律) → MEMORY-*.md → memory/ → gbrain
    ├── 工具层：TOOLS.md → skills/ → tools/ → .learnings/scripts/
    ├── 执行层：HEARTBEAT.md (cron) → team-cli.js → 9 Agents
    └── 产出层：novel/ → dashboard/
```

## Agent团队 (9人)

| Agent | 职责 | 状态 |
|-------|------|------|
| main | 主控 | 活跃 |
| 小说创作专家 | 正文创作 | 活跃 |
| 世界观架构师 | 设定维护 | 活跃 |
| 技术制作人 | 视频管线/游戏原型 | 活跃 |
| 审核专员 | 质量审核 | 按需 |
| 多媒体制作人 | 漫剧/歌曲/美术 | 按需 |
| 商业化策略师 | 变现/运营 | 休眠 |
| 质量诊断官 | 系统诊断 | 休眠 |
| 记忆管家 | 知识库维护 | 休眠 |

## 脚本系统

| 脚本 | 功能 | 触发方式 |
|------|------|----------|
| team-cli.js | 统一入口(10个子命令) | 手动 |
| auto-heal.js | 6类断链检测+修复 | 心跳 |
| experience-pool.js | 经验推送+过期 | 心跳 |
| creation-feedback.js | 创作经验记录 | 创作后 |
| skill-discovery.js | 技能发现+验证 | 每周日 |
| skill-evolution.js | 技能进化 | 心跳 |
| hotspot-consumer.js | 热点消费 | 每日 |
| knowledge-loop.js | 知识闭环 | 热点后 |
| pace-diagnose.js | 节奏诊断 | 创作后 |
| style-engine.js | AI腔检测 | 创作后 |
| dashboard-data.js | 仪表盘数据 | 心跳 |
| cron-templates.js | Cron模板 | 手动 |

## Cron任务 (7个)

> 说明：cron 由 `cron-templates.js` 注册，并未在 `openclaw.json` 中静态定义（配置文件中无 `cron` 段）。如需启用，运行 `cron-templates.js create` 后由 OpenClaw 运行时接管。

| 任务 | 时间 | 说明 |
|------|------|------|
| 心跳 | 每2h | 自愈+经验+技能+仪表盘 |
| 热点收集 | 08:00 | 32维信息收集 |
| 热点消费 | 09:00 | 行动转化 |
| 学习会 | 09:00轮转 | 团队学习 |
| 每日启发 | 00:04 | 自省四问 |
| 瓶颈检测 | 06:00 | 创作瓶颈预警 |
| 知识闭环 | 热点后 | gbrain入库 |

## 记忆层级

1. **短期**：当前会话上下文
2. **中期**：memory/ 目录（产出报告、日志）
3. **长期**：MEMORY.md（12铁律）+ gbrain（知识库）
4. **进化**：experience-pool.js + skill-evolution.js

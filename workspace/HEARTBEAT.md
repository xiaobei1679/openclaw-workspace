# Heartbeat Tasks

## 🔴 第0步：创作真空检查
- 最近24h有L0正文产出 → 继续
- 仅L1辅助 → 准真空，连续3次才冻结
- 零产出 → 第1次标记，第2次冻结基建，第3次通知用户

## 🟡 第1步：消费昨日热点
- 读 `桌面\每日热点\qclawYYYYMMDD\团队学习简报_*.md` + `今日行动_*.md`（昨天）
- 执行率<50% → 自动执行TOP1未完成行动
- 无热点数据 → 跳过

## 🟢 第2步：自愈+学习闭环
- `auto-heal.js` — 6类断链检测+修复
- `experience-pool.js push-all` — 推送pending经验
- `experience-pool.js expire` — 清理过期（每天1次）
- `skill-evolution.js apply-all` — 应用低风险提案
- `kbi-tracker.json` → ROI≥80自动应用
- `ERRORS.md` → 同类≥2次 → 生成修复→写入MEMORY
- 输出：`自愈结果：修复X项，跳过Y项，待用户关注Z项`（仅Z>0时通知）

## 🔵 第3步：创作反馈（仅有小说产出时）
- record：有新章节 → 记录创作经验
- patterns：检测跨章节重复 → ≥2次升级为创作规则
- 质检：`qc-novel.js`

## 🟣 第4步：健康检查
- `health-observer.js alerts active` — 活动告警必须处理
- 每周日：`health-observer.js team`

## 🟠 第5步：仪表盘数据更新
- `dashboard-data.js`（失败不阻塞）

## ⚪ 第6步：每日启发提取
- 从本轮心跳提取1条启发 → `每日启发\启发_YYYYMMDD.md`

## 📅 条件触发（每周日/每5章）
- 每周日：技能发现 `skill-discovery.js scan` + **消费5条pending**（verify→integrate/reject）+ Agent绩效周报
- 每5章：复盘会（字数/AI腔/爽点/重复/角色/经验/策略）
- 模板：`.learnings/scripts/retrospective-template.md`

## 🔁 经验池激活（每次心跳）
- 检查经验池：`experience-pool.js list` 中 `pushed` 数量
- 若有Agent产出但未record经验 → 自动record基础经验
- 来源不限于创作：技术/审核/诊断/世界观也记录
- 每条经验附 agent + category + confidence

---
## 📊 状态栏（2026-07-08 05:10更新）
- **创作真空**：✅ 正常（第1章3717字07-08产出）
- **热点消费**：⚠️ cron连续4次rate_limit
- **经验池**：5条pushed+1条forgotten（需激活）
- **Skill进化**：4个pattern全applied
- **Skill发现**：76条pending（每周日消费5条）
- **创作反馈**：✅ 三步打通（0条记录待激活）
- **Agent团队**：9个活跃
- **Agent人设**：✅ SOUL.md+AGENTS.md已创建（9/9）
- **Agent信箱**：✅ v2.0（9人全映射）
- **协议**：✅ v2.3
- **Token优化**：✅ 8项全执行
- **Skills精简**：✅ 子Agent从139→82个
- **项目方向**：阴间考编（原异兽学院v1-v4全废弃）
- **世界观**：v1.2（3处冲突已修复）
- **正文产出**：第1章3717字 ✅ + 第2章4552字 ✅（80分）
- **七魂碎片**：✅ 23.5KB分布方案完成

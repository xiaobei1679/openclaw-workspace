# 发布与每日审查流程（RELEASING）

本仓库采用 **「本地持续迭代 + 人工审查门禁 + 推送」** 的协作模式：
自动化工位每小时在本地做改进并提交；**人类每天检查一次，确认无误后再推送到 GitHub。**

> 原则：**永远不要无人工确认就推送到公开仓库。** 本地可以随便改、随便提交，
> 但 `git push` 必须人来拍板。

---

## 每日审查（1 条命令）

```bash
make review          # 或： bash scripts/dev.sh review
```

它会输出：
1. **未推送的 commit 列表**（`origin/main..HEAD`）
2. **文件改动汇总**（`git diff --stat`）
3. **健康检查**：语法 + 配置校验 + 全量测试

全部通过且改动看起来合理 → 你就可以推送了。

---

## 推送（人工确认后）

```bash
# 先最后看一眼完整 diff（可选）
git diff origin/main...HEAD

# 确认没问题，推送到 main
git push origin main
```

推送后建议顺手在 GitHub 上：
- 看一眼 Actions 是否全绿（`node-check.yml`）
- 写一条 Release（可选）：`git tag vX.Y.Z && git push origin vX.Y.Z`

---

## 自动化上下文

- 自动化工位：`automation-1783526614419`（每小时触发）
- 它只做**本地提交**，绝不 `git push`
- 如果某次迭代引入了问题，本地测试会失败、自动化会跳过提交；你 review 时也能 `git log` 看到

---

## 回滚（万一推送后发现问题）

```bash
# 查看推送历史
git log --oneline -20

# 回退到某个安全 commit（注意：会改写历史，仅在你自己分支或确认影响小时用）
git revert <bad-commit-sha>
git push origin main
```

---

## 审查清单（Checklist）

推送前确认：
- [ ] `make review` 全绿（语法 / 配置 / 测试）
- [ ] 改动不包含密钥（`.env`、`config/openclaw.json` 被 gitignore，不会被提交）
- [ ] 改动不包含个人数据（`novel/`、`gbrain/`、`workspace/memory/` 等已 gitignore）
- [ ] CHANGELOG.md 已记录本轮改动
- [ ] README / ROADMAP 引用与新文件一致

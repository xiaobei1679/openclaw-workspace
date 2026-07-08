# 发布与审查流程（RELEASING）

本仓库采用 **「本地持续迭代 + 专员自动审核 + 审核通过即推送」** 的协作模式：
自动化工位每 30 分钟在本地做一轮改进；**专员审核（`scripts/ci/reviewer.mjs`）全绿后自动
`git push origin main`**——无需人工确认。人类仍保留随时 review / 回滚的权利。

> 原则：**只有专员审核 PASS 才允许推送。** 任何未过门禁的改动都不会被推送；
> 推送永远走 `git push origin main`，绝不 force-push、绝不推非 main 分支。

---

## 专员审核（审核专员 = 自动化审查器）

```bash
make reviewer          # 或： bash scripts/dev.sh reviewer
# 机器可读结果（给自动化工位解析）：
node scripts/ci/reviewer.mjs --json
```

它跑四项确定性、零密钥检查，全过才给 PASS：
1. **syntax-check** — 每个脚本过 `node --check`
2. **config-validate** — 发布的模板配置合法
3. **functional-tests** — `node --test tests/*.test.mjs` 全绿
4. **observer-gate** — 无禁入库路径 / 明文密钥 / 坏语法 / 契约越界

退出码 0 = PASS（可推送），1 = FAIL（禁止推送，并列出未过项）。

---

## 推送（由自动化工位自动完成）

自动化工位（`automation-1783526614419`，每 30 分钟）每次运行：
1. 做一轮特性级改进并本地提交；
2. 运行 `node scripts/ci/reviewer.mjs`；
3. **PASS → `git push origin main`**；FAIL → 不提交、不推送，仅报告未过项。

你（人类）也可以手动走同一套流程：

```bash
# 最后看一眼完整 diff（可选）
git diff origin/main...HEAD
# 确认专员已 PASS，推送到 main
git push origin main
```

推送后顺手在 GitHub 看一眼 Actions（`node-check.yml`）是否全绿。

---

## 自动化上下文

- 自动化工位：`automation-1783526614419`（每 30 分钟触发）
- 它做本地改进，**专员审核 PASS 后自动 `git push origin main`**
- 质量门禁脚本（`scripts/ci/reviewer.mjs`、`observer.mjs`、`check-syntax.mjs`、
  `validate-config.mjs`、`scripts/eval/`）是审核专员本身，**自动化只调用、不改写**

---

## 回滚（万一推送后发现问题）

```bash
git log --oneline -20
git revert <bad-commit-sha>
git push origin main
```

---

## 审查清单（Checklist，给专员 / 人工复核参考）

推送前（专员已自动核对，这里供人工抽查）：
- [ ] `make reviewer` 全绿（语法 / 配置 / 测试 / observer）
- [ ] 改动不包含密钥（`.env`、`config/openclaw.json` 被 gitignore）
- [ ] 改动不包含个人数据（`novel/`、`gbrain/`、`workspace/memory/` 等已 gitignore）
- [ ] CHANGELOG.md 已记录本轮改动
- [ ] README / ROADMAP 引用与新文件一致

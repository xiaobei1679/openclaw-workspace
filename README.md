# QClaw Agent Workspace

> 一套**开箱即用的个人 AI Agent 工作环境**：知识、技能、约束、记忆、脚本系统与项目产出一体化。
> 任何人 clone / 解压后，配置几个环境变量即可直接运行——**无需改任何代码**。

---

## ✨ 特性

- **9 个 Agent** 团队协作（小说创作 / 审核 / 视觉 / 开发 / 音乐 / 运营 / 数据分析…），配置即 `config/openclaw.json`
- **脚本系统**（`.learnings/scripts/`）：团队管理、经验池、自愈、创作反馈、技能自进化、热点消费、知识闭环、节奏/文风质检
- **跨平台**：Windows / macOS / Linux 均可用，所有路径走 `os.homedir()` + 环境变量，**不再写死任何用户名或机器**
- **密钥安全**：所有 token / guid 均为环境变量占位符，仓库不含任何明文密钥
- **一键部署**：`deploy/` 下 PowerShell / Bash 脚本自动复制并校验

---

## 🚀 三步上手

### 前置条件
1. 已安装并可用 **OpenClaw**（>= 对应版本）
2. 本机有 **Node.js**（脚本为 Node 脚本，部署脚本会调用）
3. （可选）`gbrain` CLI，用于知识库向量检索；没有则退化为全文检索

### 第 1 步：获取仓库
```bash
git clone <本仓库地址> qclaw
cd qclaw
# 或：直接解压 release 包
```

### 第 2 步：配置环境变量（关键）
复制模板并按需填写：
```bash
cp .env.example .env        # 然后编辑 .env，填入你的 token / 路径
```
或直接在系统/Shell 环境变量中设置。需要填的只有两类：
- **鉴权**：`QCLAW_GATEWAY_TOKEN`、`WECHAT_ACCESS_TOKEN` / `WECHAT_GUID` / `WECHAT_USER_ID` / `QCLAW_WECHAT_WS_URL`（接企业微信通道才需要）
- **路径**（均可留空，留空时自动回退到当前用户目录）：`QCLAW_USER_DATA_DIR`、`QCLAW_PROJECT_DIR`、`QCLAW_HOT_DIR`、`QCLAW_KNOWLEDGE_DIR`

> 不知道填什么？全部留空也能跑——脚本会在你当前用户的 `Desktop/QClaw产出文件`、`Desktop/每日热点` 等位置自动建目录。
> 变量完整说明见 [`QCLAW_PROJECT_DIR` 等](#环境变量一览) 与 `.env.example`。

### 第 3 步：运行部署
**Windows**
```powershell
./deploy/install.ps1
```
**macOS / Linux**
```bash
chmod +x deploy/install.sh
./deploy/install.sh
```
部署脚本会：备份已有配置 → 复制 `workspace/` → 复制 `config/openclaw.json`（已先备份旧配置，防丢密钥）→ 复制 `gbrain/` → 复制小说产出到你的项目目录。最后运行 `./deploy/verify.ps1`（Win）或检查对应目录（Mac/Linux）确认部署成功，然后**重启 OpenClaw**。

---

## 📁 仓库结构

```
qclaw/
├── README.md                 # 本文件
├── .env.example              # 环境变量模板（复制为 .env 填写）
├── .gitignore
├── deploy/                   # 部署/校验脚本
│   ├── install.ps1           # Windows 一键部署
│   ├── install.sh            # macOS/Linux 一键部署
│   └── verify.ps1            # 部署验证（带退出码，供 CI 使用）
├── config/
│   ├── openclaw.json         # ⚠️ 含密钥占位符，已被 .gitignore 忽略，勿提交
│   └── openclaw.json.example # ✅ 提交到仓库的模板，别人直接用
├── workspace/                # Agent 工作空间（核心）
│   ├── MEMORY.md / MEMORY-RULES.md / HEARTBEAT.md  # 记忆与规则
│   ├── .learnings/           # 脚本系统 + 学习规则（框架，随仓库发布）
│   │   ├── scripts/          # 全部 Node 脚本
│   │   └── lib/common.js     # 公共库（路径/原子读写/字数统计，统一从这里取）
│   ├── tools/                # 工具参考与脚本（框架，随仓库发布）
│   ├── memory/               # 产出报告 + 日志（⚠️ 本地数据，已 .gitignore，不发布）
│   ├── skills/               # 技能定义
│   ├── USER.md.example       # 用户画像模板（复制为 USER.md 填写）
│   └── ...（其余 _协作基础设施_/共享池/山海巨兽录_产出 等均为本地数据，已 gitignore）
├── novel/                    # ⚠️ 本地数据：原作者小说产出，已 .gitignore，不随仓库发布
├── gbrain/                   # ⚠️ 本地数据：个人知识库，已 .gitignore，不随仓库发布
└── docs/                     # 架构 / Agent 团队 / 更新日志
```

> **关于本地数据**：`novel/`、`gbrain/`、`workspace/memory/` 以及各类共享池/协作基础设施目录
> 是项目所有者本人的真实产物（含个人路径），已被 `.gitignore` 排除，**不会进入公开仓库**。
> 任何人 clone 后拿到的是纯框架；部署脚本 `deploy/install.ps1` 会自动创建这些空目录，框架即可运行。

---

## 🧩 核心系统（脚本入口）

| 系统 | 入口脚本 | 说明 |
|------|----------|------|
| 团队管理 | `team-cli.js` | 多 Agent 统一管理 |
| 经验池 | `experience-pool.js` | 自动推送 + 过期巡检 |
| 自愈 | `auto-heal.js` | 断链检测（check 纯只读 / fix 才写入） |
| 创作反馈 | `creation-feedback.js` | record→push→patterns |
| 技能进化 | `skill-evolution.js` | scan→propose→apply-all（**仅低风险自动应用**） |
| 技能发现 | `skill-discovery.js` | 扫描知识库发现可集成工具 |
| 热点消费 | `hotspot-consumer.js` | 每日热点 → 行动清单 |
| 知识闭环 | `knowledge-loop.js` | 热点 → gbrain → 行动 |
| 质检 | `pace-diagnose.js` + `style-engine.js` | 字数 / AI 腔 / 节奏诊断 |

---

## 🌱 换成你自己的项目

公开仓库**不含**任何示例内容（`novel/`、`gbrain/`、`workspace/memory/` 等均已 `.gitignore`）。
你拿到的就是一套空框架。要真正"开箱即用"，你只需：

1. 把你的小说/项目产出放进 `QCLAW_PROJECT_DIR` 指向的目录（默认 `桌面/QClaw产出文件`），或直接设该环境变量指向你已有的目录
2. 把 `workspace/USER.md.example` 复制为 `workspace/USER.md` 并填写你自己的画像
3. 在 `config/openclaw.json.example` 基础上调整 Agent 团队（角色、模型路由）后，另存为 `config/openclaw.json`

脚本不在乎项目叫什么名字——它只认 `QCLAW_PROJECT_DIR` 指向的目录。

---

## 🔧 环境变量一览

| 变量 | 作用 | 默认（留空时） |
|------|------|----------------|
| `QCLAW_GATEWAY_TOKEN` | 网关鉴权 token | 必填（否则网关连不上） |
| `WECHAT_ACCESS_TOKEN` / `WECHAT_GUID` / `WECHAT_USER_ID` | 企业微信通道凭证 | 接微信才需填 |
| `QCLAW_WECHAT_WS_URL` | 企业微信 WS 地址 | 接微信才需填 |
| `QCLAW_USER_DATA_DIR` | OpenClaw 用户数据根（如 `~/.qclaw`） | `<HOME>/.qclaw` |
| `QCLAW_PROJECT_DIR` | 你的项目产出根目录 | `<HOME>/Desktop/QClaw产出文件` |
| `QCLAW_HOT_DIR` | 每日热点目录 | `<HOME>/Desktop/每日热点` |
| `QCLAW_KNOWLEDGE_DIR` | 知识库目录（skill-discovery 扫描） | `<PROJECT_DIR>/知识库` |
| `OPENAI_API_KEY` | gbrain embedding 用的 Key | 无则退化为全文检索 |

> 完整说明与获取方式见 `.env.example`。

---

## ⚠️ 安全须知

- `config/openclaw.json` **已被 `.gitignore` 忽略**，请务必用环境变量注入密钥，**不要提交明文 token**。
- 泄露的 token 必须在对应平台后台**手动轮换**——改配置无法撤销已泄露的凭证。
- 派生/修改后若对外分发，请遵守所用组件的许可证（见各文件头）。

---

## 🐛 常见问题

**Q：部署后 OpenClaw 连不上网关？**
A：检查 `QCLAW_GATEWAY_TOKEN` 是否已设置且正确；确认 `config/openclaw.json` 已就位（`verify.ps1` 会检查）。

**Q：脚本报找不到目录？**
A：首次运行目录本就不存在属正常；脚本大多有 `fs.existsSync` 守卫不会崩溃。要指定自己的目录，设 `QCLAW_PROJECT_DIR` / `QCLAW_HOT_DIR`。

**Q：企业微信通道用不了？**
A：需填 `WECHAT_*` 与 `QCLAW_WECHAT_WS_URL` 四个变量，并确保通道已启用。

**Q：macOS/Linux 下某些命令报错？**
A：所有 Windows 专用命令（`findstr` / `where` / `2>nul`）已在脚本中按平台分流，若仍报错请提交 issue 并附环境信息。

---

## 📜 License

模板仓库，供个人/团队开箱即用。具体许可证以各文件头标注及所用 OpenClaw 组件许可证为准；对外分发请保留相应开源许可声明。

# WordSprout

WordSprout 是一个面向 1-6 年级小学生的英语单词学习项目，核心目标是把“教材同步、科学记忆、低龄友好、家长可见”落成一个可演示、可继续开发的课程项目。

当前仓库同时包含两部分内容：

- 项目文档：产品设计、研究分析、开发步骤、决策历史
- 静态演示：`WordSprout-demo/` 下的前端原型，可用于课堂演示和 GitHub Pages 发布
- Flashcard 演示：`flashcard-demo/` 下的独立 SRS 学习卡应用

## 仓库内容

| 路径 | 说明 |
| --- | --- |
| `design.md` | 项目正式设计文档 |
| `QA_History.md` | 关键问题与方案决策历史 |
| `step-1.md` ~ `step-8.md` | 从初始化到 MVP 的执行步骤 |
| `WordSprout小学生英语记单词开发.md` | 项目整体说明 |
| `WordSprout项目实施方案.md` | 实施方案整理稿 |
| `英语单词记忆APP综合分析与小学生选型指南.md` | 竞品与选型研究 |
| `WordSprout-demo/` | 可直接运行的静态 demo |
| `flashcard-demo/` | 独立的 Flashcard SRS 演示应用 |
| `.github/workflows/pages.yml` | GitHub Pages 自动部署配置 |

## 项目目标

第一版 MVP 聚焦以下能力：

1. 教材与单元选择
2. 今日学习任务入口
3. 五步学习流：看、听、说、写、用
4. 基于 SRS 的复习调度
5. 每日学习上限与完成页
6. 家长基础查看页

第一版明确不做原生 App、复杂后台、支付系统和重商业化功能。

## Demo 预览

静态演示目录是 `WordSprout-demo/`，包含：

- `index.html`
- `styles.css`
- `app.js`
- `server.js`

本地运行方式：

```bash
cd WordSprout-demo
node server.js
```

默认访问地址：

```text
http://127.0.0.1:4173
```

如果仓库的 GitHub Pages 已成功发布，在线地址将是：

```text
https://bizika0811.github.io/smith/
```

## Flashcard Demo

`flashcard-demo/` 是基于 `Flashcard开发功能_优化版.md` 落地的独立单页应用，当前已包含：

- 卡片正反面展示
- Again / Hard / Good / Easy 评分与队列调度
- 快捷键操作
- 浏览器本地持久化
- 自定义单词导入与自动分组
- 导出为单文件 HTML

本地运行方式：

```bash
cd flashcard-demo
node server.js
```

也可以直接打开 `flashcard-demo/index.html` 预览。

## 推荐阅读顺序

如果你要继续开发：

1. `design.md`
2. `QA_History.md`
3. `step-1.md` 到 `step-8.md`

如果你要做课程汇报或项目说明：

1. `README.md`
2. `design.md`
3. `英语单词记忆APP综合分析与小学生选型指南.md`

## 当前状态

仓库目前已经具备从“研究与设计”过渡到“实际开发”的基础条件：

- 有问题定义和研究依据
- 有产品边界和 MVP 范围
- 有页面与流程设计
- 有分步骤执行方案
- 有可展示的静态 demo

下一步应按 `step-1.md` 到 `step-8.md` 顺序推进，把当前文档方案逐步落成真实工程。

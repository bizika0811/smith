# step-2：词库与教材结构设计

## 目标

根据 `design.md` 的数据模型和教材同步要求，建立第一版可用的核心数据结构，包括教材版本、教材单元、单词、资源、学习进度等实体；同时准备最小演示数据。

## 输入

- `design.md`
- `step-1.md` 完成后的项目基础工程

## 输出

- 后端数据结构定义
- 数据库 schema 或模型定义文件
- 样例种子数据
- 与教材/单元/单词相关的基础查询接口

## 不做内容

- 不实现完整复习算法
- 不实现发音评测逻辑
- 不实现家长统计
- 不引入多教材海量数据
- 不接入云存储

## 需要覆盖的实体

1. `textbookEdition`
2. `textbookUnit`
3. `word`
4. `wordDefinition`
5. `wordResource`
6. `userWordProgress`
7. `learningSession`
8. `dailyPlan`

## 实现要求

1. 如果已接数据库，优先建立正式 schema；如果数据库尚未就绪，可先用本地 mock/JSON/内存仓储实现同样的数据结构，但字段名必须与 `design.md` 基本一致。
2. 至少准备：
   - 1 套教材
   - 1 个年级
   - 1 个学期
   - 2-4 个单元
   - 每个单元 5-10 个样例单词
3. 每个单词至少包含：
   - 单词拼写
   - 音标
   - 中文释义
   - 至少 1 条音频或图片资源占位
4. 新建以下基础接口：
   - `GET /api/textbooks`
   - `GET /api/textbooks/:id/units`
   - `GET /api/units/:id/words`
5. 返回结构要稳定、可供前端直接消费，避免前后字段风格不统一。

## 校验方式

1. 查询教材列表能返回至少 1 套教材。
2. 查询该教材下单元列表能返回 2-4 个单元。
3. 查询某单元单词列表能返回样例单词。
4. 所有字段结构与 `design.md` 不明显冲突。

建议校验：

```text
GET /api/textbooks
GET /api/textbooks/:id/units
GET /api/units/:id/words
```

## 完成标准

- 教材、单元、单词三层链路打通
- 样例数据足够支撑前端演示
- 后续学习页可以基于这些接口直接开始开发

## 给 Codex 的执行提示词

```text
请执行 step-2.md。基于 design.md 建立 WordSprout 的教材、单元、单词和基础学习数据结构，并准备最小演示数据。完成后按接口进行校验，说明用了真实数据库还是 mock 数据，并列出关键文件。
```

# step-1：项目初始化与基础工程搭建

## 目标

基于 `design.md` 初始化 WordSprout 项目基础工程，搭建前后端目录结构、开发脚手架、基础依赖和最小可运行页面，为后续所有步骤提供稳定起点。

## 输入

- `design.md`
- 当前 WordSprout 项目根目录（如为空则从零初始化）

## 输出

- 项目根目录基础结构
- 前端 React + TypeScript + Vite 工程
- 后端 Node.js + Hono 工程
- 根目录基础说明文档
- 可运行的首页占位页
- 可运行的后端健康检查接口

## 不做内容

- 不实现教材、单元、单词业务逻辑
- 不实现数据库真实表结构
- 不实现登录注册
- 不实现学习流和复习流
- 不实现家长页

## 建议目录结构

```text
WordSprout/
  README.md
  design.md
  frontend/
  backend/
  docs/
  assets/
```

前端内部建议结构：

```text
frontend/
  src/
    app/
    components/
    pages/
    routes/
    stores/
    services/
    styles/
    types/
```

后端内部建议结构：

```text
backend/
  src/
    app/
    routes/
    modules/
    lib/
    types/
```

## 实现要求

1. 如果项目为空，使用 `npm` 初始化前后端工程；如果已有工程，优先沿用现有结构，不重复搭架子。
2. 前端至少完成：
   - React + TypeScript + Vite
   - 路由基础能力
   - 全局样式入口
   - 首页占位页
3. 后端至少完成：
   - Hono 服务启动
   - `/api/health` 健康检查接口
4. 根目录 `README.md` 如不存在则创建最小版，说明如何启动前后端。
5. 首页占位页需要体现：
   - 项目名称 `WordSprout`
   - 一句定位说明
   - 后续页面入口占位
6. 所有代码文件使用 UTF-8，命名清晰，不加入与当前设计无关的模板残留页面。

## 校验方式

1. 安装依赖成功。
2. 前端启动成功。
3. 后端启动成功。
4. 打开前端首页可以看到 `WordSprout` 占位页面。
5. 访问 `/api/health` 能返回 200 和简单 JSON。

建议校验命令：

```text
前端：npm run dev
后端：npm run dev
接口：GET /api/health
```

## 完成标准

- 项目目录结构清晰
- 前后端都能单独启动
- 首页与健康检查接口可访问
- 后续步骤所需的目录和基础依赖已经具备

## 给 Codex 的执行提示词

```text
请执行 step-1.md。根据 design.md 初始化 WordSprout 的前后端工程，搭建 React + TypeScript + Vite 前端和 Node.js + Hono 后端。完成后按校验方式自动检查，并说明修改了哪些文件、是否能启动、还缺什么。
```

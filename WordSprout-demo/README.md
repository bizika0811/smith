# WordSprout Demo

这是根据 `D:\博士课程\010出版数据分析与应用\WordSprout-docs` 落地的一个可运行前端原型，目标是把文档阶段的 WordSprout 变成可视化操作页面。

## 当前能力

- 首页 `/`
- 教材选择页 `/learn/select`
- 今日任务页 `/learn/today`
- 五步学习流 `/learn/session/:unitId`
- 复习页 `/review`
- 完成页 `/done`
- 家长页 `/parent`

## 运行方式

在当前目录执行：

```bash
node server.js
```

然后访问：

```text
http://127.0.0.1:4173
```

也可以用：

```bash
npm start
```

## 原型说明

- 使用纯静态 HTML/CSS/JS 实现，不依赖额外安装。
- 数据来自本地 mock，适合课程演示和下一步前后端正式开发。
- 学习记录保存在浏览器 `localStorage`，刷新后仍会保留。
- 拼写、语境题、复习评分会真实影响正确率、薄弱词和家长页摘要。
- 口语步骤当前为降级实现，正式版应接真实录音能力。

## 主要文件

- `index.html`
- `styles.css`
- `app.js`
- `server.js`

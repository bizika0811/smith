# 美国-伊朗局势日报

本项目会抓取世界主流媒体与智库公开 RSS 源中与美国-伊朗局势相关的内容，生成一个静态网页：

- 页面文件：`dist/index.html`
- 数据文件：`dist/data/latest.json`
- 构建命令：`node scripts/build.mjs`
- 计划任务执行器：`powershell -ExecutionPolicy Bypass -File scripts/run-build.ps1`
- 定时任务注册：`powershell -ExecutionPolicy Bypass -File scripts/register-task.ps1`

当前默认源：

- Reuters
- AP News
- BBC News
- Al Jazeera
- Foreign Affairs
- Brookings
- CSIS
- Carnegie Endowment

说明：

- 相关性通过关键词过滤，适合做每日聚合看板。
- 某些源如果临时不可访问，会在页面中显示抓取失败，不影响其他源。

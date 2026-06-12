# US-Iran Monitor

hello git

This project builds a static daily monitor page for US-Iran developments by aggregating reachable public media and think tank feeds, then generating a briefing-style webpage and data snapshot.

Key outputs:

- `dist/index.html`
- `dist/data/latest.json`

Key commands:

- `node scripts/build.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts/run-build.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts/register-task.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts/export-docx.ps1`

Current workflow:

- fetches reachable RSS/feed sources
- filters for US-Iran-relevant items
- generates a Chinese briefing block with conclusions, risks, and watchpoints
- rebuilds daily at 10:00 through Windows Task Scheduler
- can export project files into a `.docx` document
